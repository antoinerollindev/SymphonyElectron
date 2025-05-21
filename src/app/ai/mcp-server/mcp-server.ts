import {
  IMCPDiscoveryResponse,
  IMCPFunctionCallRequest,
  IMCPTool,
  MCPResponse,
} from '../mcp-models';

import { logger } from '../../../common/logger';

// LocalMCPServerInterface
// In MCP - it should be done over stdio or SSE but as we're running in the same environment, we keep the JSON like responses but get rid of protocols
export interface ILocalMCPServerInterface {
  discoverTools: () => IMCPDiscoveryResponse;
  executeFunctionCall: (
    request: IMCPFunctionCallRequest,
  ) => Promise<MCPResponse>;
}

export class MCPServer implements ILocalMCPServerInterface {
  private tools: Record<string, IMCPTool> = {};
  private handlers: Record<
    string,
    (parameters: Record<string, any>) => Promise<any>
  > = {};

  /**
   * registerTool
   * @param tool
   * @param handler
   */
  public registerTool(
    tool: IMCPTool,
    handler: (parameters: Record<string, any>) => Promise<any>,
  ) {
    const toolName = tool.name;
    if (this.tools[toolName]) {
      logger.error(
        `Tool with name ${toolName} already exists. The previous tool will be replaced.`,
      );
    }
    this.tools[tool.name] = tool;
    this.handlers[tool.name] = handler;
  }

  /**
   * Discover the tools
   * @returns
   */
  public discoverTools() {
    return this.handleDiscoveryRequest();
  }

  /**
   * Execute function call
   * @param request
   * @returns
   */
  public executeFunctionCall(
    request: IMCPFunctionCallRequest,
  ): Promise<MCPResponse> {
    return this.handleFunctionCallRequest(request);
  }

  /**
   * handleDiscoveryRequest
   * @returns
   */
  private handleDiscoveryRequest(): IMCPDiscoveryResponse {
    logger.info('Handling discovery request');
    return {
      type: 'discovery_response',
      version: '1.0',
      tools: Object.values(this.tools),
    };
  }

  /**
   * handleFunctionCallRequest
   * @param request
   * @returns
   */
  private async handleFunctionCallRequest(
    request: IMCPFunctionCallRequest,
  ): Promise<MCPResponse> {
    const { functionName, parameters } = request;
    logger.info(`Handling function call: ${functionName}`, parameters);

    const handler = this.handlers[functionName];
    if (!handler) {
      return {
        type: 'error',
        error: `Unknown function: ${functionName}`,
      };
    }

    try {
      const result = await handler(parameters);

      return {
        type: 'function_call_response',
        functionName,
        result,
      };
    } catch (error) {
      return {
        type: 'error',
        error: `Error executing function ${functionName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const McpServer = new MCPServer();
