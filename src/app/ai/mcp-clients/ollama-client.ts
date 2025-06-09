import { Ollama } from 'ollama';

import {
  IMCPClient,
  IMCPTool,
  isErrorResponse,
  isFunctionCallResponse,
  MCPResponse,
  IMessageData,
} from '../mcp-models';
import { McpServer } from '../mcp-server/mcp-server';

import { logger } from '../../../common/logger';
import { initMcpServer } from '../mcp-server';

const systemInstructions = `You are Michel, a friendly AI assistant embedded inside a messaging application.
Your role is to help users by automating tasks they could normally do manually.
You are helpful, efficient, and respond clearly.
`;

enum Role {
  USER = 'user', // Us
  ASSISTANT = 'assistant', // The model
  SYSTEM = 'system', // System instructions (from us)
  TOOL = 'tool', // Tools calls results
}

interface IMessage {
  role: Role;
  content?: string; // Optional for ASSISTANT tools calls
  // TODO - Separate the below properties in a separate interface
  tool_name?: string; // Optional, if Role is TOOL or ASSISTANT
  tool_arguments?: string; // Optional, If Role is TOOL or ASSISTANT
}

/**
 * This is the MCP client, it will be responsible for
 * - create the Ollama chat agent
 * - calling the "MCP server" (implementing the LocalMCPServerInterface) to discover the tools
 * - register the tools to the agent
 * - orchestrate all the queries to and responses from the ollama agent (where the model runs)
 */
export class OllamaMCPClient implements IMCPClient {
  private modelName;
  private tools: any[] = [];
  private agent: any = null;

  // TODO - Add a maximum size
  private history: IMessage[] = [];

  // TODO - This could come from a config somewhere? SDA Settings?
  constructor(modelName: string = 'llama3.2:latest') {
    this.modelName = modelName;
    this.agent = new Ollama({
      host: 'http://localhost:11434',
    });
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

      this.tools = localToolsResponse.tools.map((tool: IMCPTool) => ({
        type: 'function',
        function: tool,
      }));

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
    try {
      // Add the new user message
      if (!this.history.length) {
        this.history.push({
          role: Role.SYSTEM,
          content: systemInstructions,
        });
      }
      this.history.push({
        role: Role.USER,
        content: userInput,
      });
      const response = await this.agent.chat({
        model: this.modelName,
        messages: this.history,
        tools: this.tools,
        options: {
          temperature: 0, // Make responses more deterministic
        },
      });
      return this.handleInnerToolCalling(response);
    } catch (error) {
      logger.error('Error generating response:', error);
      throw error;
    }
  }

  public async monitorIncomingMessages(_data: IMessageData): Promise<string> {
    logger.error('Not implemented for local ollama clients');
    return '';
  }

  /**
   * Handles inner function calls
   * @param response The initial response from the model
   * @returns The final response, after all tool calls, as string
   */
  private async handleInnerToolCalling(response: any): Promise<string> {
    if (response.message.tool_calls) {
      for (const toolCall of response.message.tool_calls) {
        this.history.push({
          role: Role.ASSISTANT,
          tool_name: toolCall.function.name,
          tool_arguments: toolCall.function.arguments,
        });
        const output = await this.callMCPFunction(
          toolCall.function.name,
          toolCall.function.arguments,
        );
        const toolResponseContent = JSON.stringify(output);
        this.history.push({
          role: Role.TOOL,
          content: toolResponseContent,
          tool_name: toolCall.function.name,
          tool_arguments: toolCall.function.arguments,
        });
      }
      const innerResponse = await this.agent.chat({
        model: this.modelName,
        messages: this.history,
        options: {
          temperature: 0,
        },
      });
      return this.handleInnerToolCalling(innerResponse);
    }
    const finalResponse = response.message.content;
    this.history.push({
      role: Role.ASSISTANT,
      content: finalResponse,
    });
    return finalResponse;
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
}

// export const mcpClient = new MCPClient();
// mcpClient.initialize();
