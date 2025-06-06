// import { OllamaMCPClient } from "./mcp-clients/ollama-client";
// export const mcpClient = new OllamaMCPClient();

import {
  LangchainMCPClient,
  langchainModel,
} from './mcp-clients/langchain-client';
export const mcpClient = new LangchainMCPClient(langchainModel.GEMINI);

mcpClient.initialize();
