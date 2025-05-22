import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IChatService';

const tools: IMCPTool[] = [
  {
    name: 'openChat',
    description: `Opens the chat having the given id.`,
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The id of the chat to open.',
        },
        name: {
          type: 'string',
          description:
            'The name of the module to open (value is always undefined).',
        },
        itemType: {
          type: 'string',
          description: 'The type of the module to open (value is always 0).',
        },
        chatOptions: {
          type: 'object',
          description: `The open chat options (default value: undefined). Here is the list of available options:
          - openMode (0 to open as a pinned module, 2 to open in a new tab, 3 to open a pinned tab, 4 to open next to the currently opened chats, 6 to open in a popout window)
          `,
        },
      },
      required: ['id', 'name', 'itemType', 'chatOptions'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
