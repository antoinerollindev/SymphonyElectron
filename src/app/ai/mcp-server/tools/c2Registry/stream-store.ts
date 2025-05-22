import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IStreamStore';

const tools: IMCPTool[] = [
  {
    name: 'searchRooms',
    description: `Returns the chats matching the given terms.`,
    parameters: {
      type: 'object',
      properties: {
        roomQuery: {
          type: 'object',
          description:
            'The room query object containing a string query property which corresponds to the search terms (result contains all the information of the chats matching the query, including the chat id).',
        },
        maxResults: {
          type: 'number',
          description:
            'The maximum number of retrieved chats matching the query (value is always 20).',
        },
      },
      required: ['roomQuery', 'maxResults'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
