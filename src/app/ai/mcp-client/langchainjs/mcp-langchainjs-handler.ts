import {
  DynamicStructuredTool,
  StructuredToolInterface,
  tool,
} from '@langchain/core/tools';
import { ChatOllama } from '@langchain/ollama';

import {
  IMCPTool,
  isErrorResponse,
  isFunctionCallResponse,
  MCPResponse,
} from '../../mcp-models';
import { McpServer } from '../../mcp-server/mcp-server';

import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { logger } from '../../../../common/logger';
import { initMcpServer } from '../../mcp-server';

import { createCustomLangChainAgent } from './langchain-agent';

// const INITIAL_PROMPT = `You are SDAI, a friendly AI assistant embedded inside Symphony messaging.

// Symphony messaging is a secure external workplace messaging markets can rely on.
// It enables its users to supercharge their messaging-based financial workflows by providing internal and external messaging, powerful automations, and constant connectivity – securely and without sacrificing compliance.
// Symphony messaging notably provides the following features:
// - chat with one person in an IM (instant message)
// - chat with multiple people in a group chat
// - chat with people in a room
// - chat with external people
// - install extension applications that can be opened in Symphony messaging as a moddule (embedded as an iframe)
// - tabs/workspaces with grids so multiple chats/modules can be displayed side by side
// `;

/**
 * This is the MCP client, it will be responsible for
 * - create the Ollama chat agent
 * - calling the "MCP server" (implementing the LocalMCPServerInterface) to discover the tools
 * - register the tools to the agent
 * - orchestrate all the queries to and responses from the ollama agent (where the model runs)
 */
export class MCPLangchainClient {
  private model: ChatOllama;
  private tools: DynamicStructuredTool[] = [];
  private agent: any = null;
  private threadId: string;

  // TODO - This could come from a config somewhere? SDA Settings?
  constructor(modelName: string = 'qwen3:8b') {
    this.model = new ChatOllama({
      // Local ollama url
      baseUrl: 'http://localhost:11434',
      model: modelName,
      verbose: true,
    });
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
      return responseMessage.content;
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
   * Setup the LangGraph workflow with discovered tools
   */
  private async setupAgent(): Promise<void> {
    let test = true;
    test = !true;
    if (test) {
      this.agent = await createCustomLangChainAgent(this.model, this.tools);
      return;
    }

    const memorySaver = new MemorySaver();
    this.agent = await createReactAgent({
      llm: this.model,
      tools: this.tools,
      checkpointer: memorySaver,
      prompt: `You are a friendly AI assistant embedded inside a messaging application.
Your role is to help users by automating tasks they could normally do manually.
You are helpful, efficient, and respond clearly.

You have access to multiple tools. Whenever you can respond to a user's request thanks to tools, please do use that tool.
You will have 2 type of tools:
- Tools that provide information that can be used to respond
- Tools that perform actions (open, show) that won't necessarily contain data, but will perform an action in the messaging application. In this case please refrain to call multiple times
the same actions repeatedly to answer a single user request.

Sometimes you might need multiple tools to solve a problem. If so respond. Always wait a tool has responded before calling a new tool.

Always clarify if you're unsure about the user’s intent.
Always reply as Michel would: warm, competent, and concise.`,
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

      logger.info(
        `[${functionName}] called with parameters: ${JSON.stringify(
          parameters,
        )}.\nResponse was ${JSON.stringify(mcpResponse)}`,
      );

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
}

export const mcpLangchainClient = new MCPLangchainClient();
mcpLangchainClient.initialize();
