import {
  DynamicStructuredTool,
  StructuredToolInterface,
  tool,
} from '@langchain/core/tools';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOllama } from '@langchain/ollama';

import {
  isFunctionCallResponse,
  isErrorResponse,
  MCPResponse,
  MCPTool,
} from './mcp-models';
import { McpServer } from './mcp-server';

import { logger } from '../../common/logger';

/**
 * This is the MCP client, it will be responsible for
 * - create the Ollama chat agent
 * - calling the "MCP server" (implementing the LocalMCPServerInterface) to discover the tools
 * - register the tools to the agent
 * - orchestrate all the queries to and responses from the ollama agent (where the model runs)
 */
export class MCPClient {
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
   * Convert MCP tools to LangChain StructuredTools
   */
  private async createLangChainTools(
    mcpTools: MCPTool[],
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
    const agentCheckpointer = new MemorySaver();
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
      checkpointSaver: agentCheckpointer,
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
      console.error(`Error calling MCP function ${functionName}:`, error);
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
      console.error('Error generating response:', error);
      throw error;
    }
  }
}
