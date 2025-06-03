import { c2RegistryHandler } from '../../c2-registry-handler';
import { fdc3Handler } from '../../fdc3-handler';
import { McpServer } from './mcp-server';
import * as c2RegistryTools from './tools/c2Registry';
import * as commonTools from './tools/common';
import { fdc3DesktopAgentTools } from './tools/fdc3';

export const initMcpServer = () => {
  // Common tools
  Object.values(commonTools).forEach((toolAndHandler) => {
    McpServer.registerTool(toolAndHandler.tool, toolAndHandler.handler);
  });

  // C2 registry tools
  Object.values(c2RegistryTools).forEach((registryTools) => {
    const symbol = registryTools.symbol;
    registryTools.tools.forEach((tool) => {
      const { methodName: toolMethodName, ...mcpTool } = tool;
      const methodName = toolMethodName || tool.name;
      const orderedParameterNames = Array.from(
        Object.keys(mcpTool.parameters.properties),
      );

      const handler = async (params: Record<string, any> = {}) =>
        c2RegistryHandler.callRegistry(
          symbol,
          methodName as string,
          orderedParameterNames.map((key) => params[key]),
        );

      McpServer.registerTool(mcpTool, handler);
    });
  });

  // FDC3 tools
  Object.values(fdc3DesktopAgentTools).forEach((tool) => {
    const orderedParameterNames = Array.from(
      Object.keys(tool.parameters.properties),
    );

    const handler = async (params: Record<string, any> = {}) =>
      fdc3Handler.callDesktopAgent(
        tool.name,
        orderedParameterNames.map((key) => params[key]),
      );

    McpServer.registerTool(tool, handler);
  });
};
