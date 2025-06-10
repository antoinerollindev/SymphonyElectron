import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IStreetLinxService';

const tools: IMCPTool[] = [
  {
    name: 'getUsersFromTicker',
    description: `Returns a list of users interested in the provided ticker (result includes user ids, names and email addresses).`,
    parameters: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: `The ticker symbol to get users for.`,
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
