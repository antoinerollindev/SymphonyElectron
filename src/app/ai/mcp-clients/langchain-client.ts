import {
  DynamicStructuredTool,
  StructuredToolInterface,
  tool,
} from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOllama } from '@langchain/ollama';

import {
  IMCPClient,
  IMCPTool,
  IMessageData,
  isErrorResponse,
  isFunctionCallResponse,
  MCPResponse,
} from '../mcp-models';
import { McpServer } from '../mcp-server/mcp-server';

import { logger } from '../../../common/logger';
import { initMcpServer } from '../mcp-server';

import { BaseChatModel } from '@langchain/core/dist/language_models/chat_models';
import { SystemMessage } from '@langchain/core/messages';

// import * as say from 'say';

// import { RunnableSequence } from "langchain/schema/runnable";
// import { RunnableWithMessageHistory } from "langchain/runnables";

const systemInstructions = `You are Michel, a friendly AI assistant embedded inside a messaging application called Symphony.
Your role is to help users by automating tasks they could normally do manually.
You are helpful, efficient, respond clearly, and provide complete and detailed answers.

The user you are talking to (current user) can ask you to perform actions that requires you to perform preliminary actions.
You must never ask the user for a user id or a chat id, you must retrieve this information either from the message history or through the tools.
When possible, reuse the previous messages data. If you can't perform the current user request, you must suggest alternative solutions.

You should never mention any user id or chat id in your responses, this is sensitive information and must not be shared.
Important part of your responses must be emphasized using markdown syntax.

---

CONTEXT-AWARE BEHAVIOR:
When you see "[MONITORING MODE]", you are in MESSAGE MONITORING MODE as described below. Do not generate a conversational response.
When mode is not specified, respond normally.

MESSAGE MONITORING MODE:
Analyze incoming messages, if a message talks about an action that the current user has to do, then create a note, if a message says the action is done or completed, then remove the related note.
showTickerWorkspaceCreationSuggestion tool can also be used if a message includes the term "#hot" and a ticker (like "GOOG", "TSLA", "AAPL", etc.).

REQUIRED ACTIONS:
- Tasks/TODOs/Reminders/Deadlines: Immediately create using FDC3 "Note" intents
- Meeting requests: Extract details and suggest scheduling actions
- Stock mentions: Automatically open charts via FDC3/TradingView tools
- Urgent items: Flag immediately with reasoning

EXECUTION PRIORITY:
1. Take action first using appropriate tools
2. Only if no tools apply, remain silent
3. Be proactive - if a message contains actionable content, act on it

EXAMPLES:
- "Remember to buy AAPL tomorrow" → Create todo + open AAPL chart
- "Meeting with John at 3pm Friday" → Create calendar suggestion
- "URGENT: Server down" → Flag as urgent + create action item
`;

export enum langchainModel {
  OLLAMA = 'OLLAMA',
  GEMINI = 'GEMINI',
}

/**
 * This is the MCP client, it will be responsible for
 * - create the Ollama chat agent
 * - calling the "MCP server" (implementing the LocalMCPServerInterface) to discover the tools
 * - register the tools to the agent
 * - orchestrate all the queries to and responses from the ollama agent (where the model runs)
 */
export class LangchainMCPClient implements IMCPClient {
  private model: BaseChatModel;
  private tools: DynamicStructuredTool[] = [];
  private threadId: string;
  private agent: any = null;

  constructor(
    modelProvider: langchainModel = langchainModel.OLLAMA,
    modelName: string = 'qwen3:8b',
  ) {
    if (modelProvider === langchainModel.OLLAMA) {
      this.model = new ChatOllama({
        // Local ollama url
        baseUrl: 'http://localhost:11434',
        model: modelName,
        verbose: true,
        temperature: 0,
        repeatPenalty: 1.2,
      });
    } else {
      // To use this, you need to set the GOOGLE_API_KEY env var
      // export GOOGLE_API_KEY="..."
      this.model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.0-flash',
        temperature: 0.1,
      });
    }
    // One thread per session - in memory
    // Check if we can link that the the user id?
    this.threadId = `thread-${Date.now()}`;
  }

  /**
   * Initialize the client by discovering available tools from the MCP server
   */
  public async initialize(): Promise<void> {
    logger.info(`Discovering MCP capabilities from local server `);
    try {
      initMcpServer();

      // Perform local discovery to get available tools
      const localToolsResponse = McpServer.discoverTools();

      // Convert MCP tools to LangChain tools
      this.tools = (await this.createLangChainTools(
        localToolsResponse.tools,
      )) as DynamicStructuredTool[];

      // Create the LangGraph with discovered tools
      await this.setupAgent();

      logger.info('MCP Client initialized successfully with LangGraph');
    } catch (error) {
      logger.error('Failed to initialize MCP client:', error);
      throw error;
    }
  }

  /**
   * Generate a response to user input
   * This is the function we need to call whenever the user says "Hey Symphony" - or triggers the assistant, no matter how
   */
  public async generateResponse(userInput: string): Promise<string> {
    if (!this.agent) {
      throw new Error('MCP Client not initialized. Call initialize() first.');
    }

    try {
      // Add the new user message
      const messages = [{ role: 'user', content: userInput }];

      // Invoke the graph
      const result = await this.agent.invoke(
        {
          messages,
        },
        { configurable: { thread_id: this.threadId } },
      );
      const responseMessage = result.messages[result.messages.length - 1];
      const response = responseMessage.content;
      // say.speak(response, 'Samantha (Enhanced)');
      return response;
    } catch (error) {
      logger.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Monitors incoming messages and suggests or initates actions
   * It uses the same thread id so it uses and contributes to the LLM history
   */
  public async monitorIncomingMessages({
    date,
    from,
    content,
    room,
  }: IMessageData) {
    logger.info('Monitoring incoming message: ', {
      content,
      room,
      from,
      date,
    });
    if (!this.agent) {
      throw new Error('MCP Client not initialized. Call initialize() first.');
    }
    try {
      const incomingMessage = `Incoming message in ${room.name} (id: ${room.id}) at ${date}, from ${from.name} (id: ${from.id}): ${content}`;
      // Add the new user message
      const messages = [
        { role: 'user', content: `[MONITORING MODE]: \n\n ${incomingMessage}` },
      ];

      // Invoke the graph
      const result = await this.agent.invoke(
        {
          messages,
        },
        { configurable: { thread_id: this.threadId } },
      );
      const responseMessage = result.messages[result.messages.length - 1];
      const response = responseMessage.content;
      logger.info('Response from LLM: ', response);
      return response;
    } catch (error) {
      logger.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Convert MCP tools to LangChain StructuredTools
   */
  private async createLangChainTools(
    mcpTools: IMCPTool[],
  ): Promise<StructuredToolInterface[]> {
    return mcpTools.map((_tool) => {
      return tool(
        async (args: Record<string, any>) => {
          return this.callMCPFunction(_tool.name, args);
        },
        {
          name: _tool.name,
          description: _tool.description,
          schema: _tool.parameters,
        } as any,
      ); // If we want to get rid of this one, we need zod
    });
  }

  /**
   * Make a function call to the MCP server
   */
  private async callMCPFunction(
    functionName: string,
    parameters: Record<string, any>,
  ): Promise<any> {
    try {
      logger.info(`Calling MCP function: ${functionName}`, parameters);

      const mcpResponse: MCPResponse = await McpServer.executeFunctionCall({
        type: 'function_call',
        functionName,
        parameters,
      });

      if (isFunctionCallResponse(mcpResponse)) {
        return mcpResponse.result;
      } else if (isErrorResponse(mcpResponse)) {
        throw new Error(
          `Error from MCP server: ${JSON.stringify(mcpResponse.details)}`,
        );
      }
    } catch (error) {
      logger.error(`Error calling MCP function ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Setup the LangGraph workflow with discovered tools
   */
  private async setupAgent(): Promise<void> {
    const agentCheckpointer = new MemorySaver();
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
      checkpointSaver: agentCheckpointer,
      prompt: new SystemMessage(systemInstructions),
    });
  }
}
