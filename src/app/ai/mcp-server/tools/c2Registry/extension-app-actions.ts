import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IExtensionAppService';

const tools: IMCPTool[] = [
  {
    name: 'openSymChartChart',
    description:
      'Opens a Symphony module in the current workspace with a chart about the ticker.',
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
    name: 'openSymChartFundamentalData',
    description:
      'Opens a Symphony module in the current workspace with a fundamental data view about the ticker.',
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
      'Opens a Symphony module in the current workspace displaying a directory with a filter on people interested in the ticker.',
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

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
