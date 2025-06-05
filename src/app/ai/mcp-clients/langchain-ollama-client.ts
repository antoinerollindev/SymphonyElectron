import {
  DynamicStructuredTool,
  StructuredToolInterface,
  tool,
} from '@langchain/core/tools';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOllama } from '@langchain/ollama';

import {
  IMCPClient,
  IMCPTool,
  isErrorResponse,
  isFunctionCallResponse,
  MCPResponse,
} from '../mcp-models';
import { McpServer } from '../mcp-server/mcp-server';

import { logger } from '../../../common/logger';
import { initMcpServer } from '../mcp-server';

import { SystemMessage } from '@langchain/core/messages';

// import { RunnableSequence } from "langchain/schema/runnable";
// import { RunnableWithMessageHistory } from "langchain/runnables";

const systemInstructions = `You are Michel, a friendly AI assistant embedded inside a messaging application.
Your role is to help users by automating tasks they could normally do manually.
You are helpful, efficient, and respond clearly.
`;

/**
 * This is the MCP client, it will be responsible for
 * - create the Ollama chat agent
 * - calling the "MCP server" (implementing the LocalMCPServerInterface) to discover the tools
 * - register the tools to the agent
 * - orchestrate all the queries to and responses from the ollama agent (where the model runs)
 */
export class LangchainMCPClient implements IMCPClient {
  private model: ChatOllama;
  private tools: DynamicStructuredTool[] = [];
  private threadId: string;

  // private modelName;
  // private tools: any[] = [];
  private agent: any = null;

  // TODO - Add a maximum size
  // private history: IMessage[] = [];

  // TODO - This could come from a config somewhere? SDA Settings?
  constructor(modelName: string = 'qwen3:8b') {
    this.model = new ChatOllama({
      // Local ollama url
      baseUrl: 'http://localhost:11434',
      model: modelName,
      verbose: true,
      temperature: 0,
      repeatPenalty: 1.2,
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
