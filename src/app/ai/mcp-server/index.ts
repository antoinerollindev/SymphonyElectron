import { c2RegistryHandler } from '../../c2-registry.handler';
import { McpServer } from './mcp-server';
import * as c2RegistryTools from './tools/c2Registry';
import * as commonTools from './tools/common';

export const initMcpServer = () => {
  Object.values(commonTools).forEach((toolAndHandler) => {
    McpServer.registerTool(toolAndHandler.tool, toolAndHandler.handler);
  });

  Object.values(c2RegistryTools).forEach((registryTools) => {
    const symbol = registryTools.symbol;
    registryTools.tools.forEach((tool) => {
      const { methodName: toolMethodName, ...mcpTool } = tool;
      const methodName = toolMethodName || tool.name;
      const orderedParameterNames = Array.from(
        Object.keys(mcpTool.parameters.properties),
      );

      const handler = async (params: Record<string, any> = {}) => {
        return c2RegistryHandler.callRegistry(
          symbol,
          methodName as string,
          orderedParameterNames.map((key) => params[key]),
        );
      };

      McpServer.registerTool(mcpTool, handler);
    });
  });
};
