// import { OllamaMCPClient } from "./mcp-clients/ollama-client";
// export const mcpClient = new OllamaMCPClient();

import { LangchainMCPClient } from './mcp-clients/langchain-ollama-client';
export const mcpClient = new LangchainMCPClient();

mcpClient.initialize();
