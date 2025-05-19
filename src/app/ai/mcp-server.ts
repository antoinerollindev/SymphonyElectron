import {
  IMCPFunctionCallRequest,
  IMCPDiscoveryResponse,
  MCPTool,
  MCPResponse,
} from './mcp-models';

import { logger } from '../../common/logger';

// LocalMCPServerInterface
// In MCP - it should be done over stdio or SSE but as we're running in the same environment, we keep the JSON like responses but get rid of protocols
export interface LocalMCPServerInterface {
  discoverTools: () => IMCPDiscoveryResponse;
  executeFunctionCall: (
    request: IMCPFunctionCallRequest,
  ) => Promise<MCPResponse>;
}

export class MCPServer implements LocalMCPServerInterface {
  private tools: MCPTool[];

  constructor() {
    this.tools = this.defineTools();
  }

  private defineTools(): MCPTool[] {
    return [
      {
        name: 'echo',
        description: 'Echoes back the provided message',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to echo back',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'getWeather',
        description: 'Get the current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city or location to get weather for',
            },
          },
          required: ['location'],
        },
      },
    ];
  }

  private handleDiscoveryRequest(): IMCPDiscoveryResponse {
    logger.info('Handling discovery request');
    return {
      type: 'discovery_response',
      version: '1.0',
      tools: this.tools,
    };
  }

  private async handleFunctionCallRequest(
    request: IMCPFunctionCallRequest,
  ): Promise<MCPResponse> {
    const { functionName, parameters } = request;
    logger.info(`Handling function call: ${functionName}`, parameters);

    try {
      let result;
      switch (functionName) {
        case 'echo':
          result = this.echoFunction(parameters);
          break;
        case 'getWeather':
          result = await this.weatherFunction(parameters);
          break;
        default:
          return {
            type: 'error',
            error: `Unknown function: ${functionName}`,
          };
      }

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

  private echoFunction(parameters: any): any {
    // Simple echo function that returns whatever is sent
    const message = parameters?.message || '';
    logger.info(`Echo function called with: ${message}`);
    return { message };
  }

  private async weatherFunction(parameters: any): Promise<any> {
    // Demo weather function - in a real implementation you'd use a weather API
    // This is a mock implementation
    const location = parameters?.location || 'Unknown';
    logger.info(`Weather function called for location: ${location}`);

    // Mock weather data
    const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
    const randomCondition =
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const temperature = Math.floor(Math.random() * 30) + 5; // Random temp between 5 and 35°C

    return {
      location,
      condition: randomCondition,
      temperature: `${temperature}°C`,
      humidity: `${Math.floor(Math.random() * 60) + 30}%`,
      timestamp: new Date().toISOString(),
    };
  }

  public discoverTools() {
    return this.handleDiscoveryRequest();
  }

  public executeFunctionCall(
    request: IMCPFunctionCallRequest,
  ): Promise<MCPResponse> {
    return this.handleFunctionCallRequest(request);
  }
}

export const McpServer = new MCPServer();
