export interface IMCPToolParameters {
  type: string;
  properties: Record<string, any>;
  required: string[];
}

export interface IMCPTool {
  name: string;
  description: string;
  parameters: IMCPToolParameters;
}

export interface IMCPDiscoveryRequest {
  type: 'discovery';
}

export interface IMCPFunctionCallRequest {
  type: 'function_call';
  functionName: string;
  parameters: Record<string, any>;
}

export type MCPRequest = IMCPDiscoveryRequest | IMCPFunctionCallRequest;

export interface IMCPDiscoveryResponse {
  type: 'discovery_response';
  version: string;
  tools: IMCPTool[];
}

export interface IMCPFunctionCallResponse {
  type: 'function_call_response';
  functionName: string;
  result: any;
}

export interface IMCPErrorResponse {
  type: 'error';
  error: string;
  details?: any;
}

export type MCPResponse =
  | IMCPDiscoveryResponse
  | IMCPFunctionCallResponse
  | IMCPErrorResponse;

export const isDiscoveryResponse = (
  r: MCPResponse,
): r is IMCPDiscoveryResponse => r.type === 'discovery_response';
export const isFunctionCallResponse = (
  r: MCPResponse,
): r is IMCPFunctionCallResponse => r.type === 'function_call_response';
export const isErrorResponse = (r: MCPResponse): r is IMCPErrorResponse =>
  r.type === 'error';

export interface IRegistryServiceTool extends IMCPTool {
  // method name in the registry's service. Defaults to tool name if it's not provided
  methodName?: string;
}

export interface IRegistryServiceTools {
  symbol: string;
  tools: IRegistryServiceTool[];
}

export interface IToolAndHandler {
  tool: IMCPTool;
  handler: (parameters: Record<string, any>) => any;
}

export interface IMCPClient {
  initialize(): Promise<void>;
  generateResponse(userInput: string): Promise<string>;
}
