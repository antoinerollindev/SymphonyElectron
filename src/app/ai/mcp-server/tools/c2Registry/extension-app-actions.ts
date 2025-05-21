import { MCPTool, RegistryServiceTools } from '../../../mcp-models';

const symbol = 'IExtensionAppService';

const tools: MCPTool[] = [
  {
    name: 'openTradingViewChart',
    description: 'Opens TradingView chart view about the ticker',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Ticker symbol',
        },
      },
      required: ['ticker'],
    },
  },
  {
    name: 'openTradingViewFundamentalData',
    description: 'Opens TradingView fundamental data view about the ticker',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Ticker symbol',
        },
      },
      required: ['ticker'],
    },
  },
  {
    name: 'openDirectoryFromTicker',
    description:
      'Opens a directory with a filter on people interested in the ticker. Requires confirmation prompt',
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Ticker symbol',
        },
      },
      required: ['ticker'],
    },
  },
];

export const registryTools: RegistryServiceTools = {
  symbol,
  tools,
};
