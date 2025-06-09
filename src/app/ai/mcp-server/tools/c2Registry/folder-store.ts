import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IFolderStore';

const tools: IMCPTool[] = [
  {
    name: 'addFolder',
    description: `Creates a new chat folder.`,
    parameters: {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          description: `The object defining the chat folder to create, containing the following properties:
          - name: the string label of the chat folder
          - id: the string folder identifier (value should be the folder name converted to camelcase)`,
        },
      },
      required: ['options'],
    },
  },
  {
    name: 'removeFolder',
    description: `Removes a chat folder by its id.`,
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: `The id of the chat folder to remove (provided during chat folder creation).`,
        },
      },
      required: ['folderId'],
    },
  },
  {
    name: 'moveTo',
    description: `Adds a chat to a chat folder.`,
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: `The id of the chat folder to add the chat to.`,
        },
        chat: {
          type: 'object',
          description: `Object defining the chat to add to the folder, containing the following properties:
          - id: the chat id to add to the target folder
          - type: value is always "stream"`,
        },
      },
      required: ['folderId', 'chat'],
    },
  },
  {
    name: 'removeFromFolder',
    description: `Removes a chat from a chat folder.`,
    parameters: {
      type: 'object',
      properties: {
        chatId: {
          type: 'string',
          description: `The id of the chat to remove from the target folder.`,
        },
        folderId: {
          type: 'string',
          description: `The id of the chat folder to add the chat to.`,
        },
      },
      required: ['folderId', 'chatId'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
