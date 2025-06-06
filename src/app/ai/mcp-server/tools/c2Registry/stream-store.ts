import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IStreamStore';

const tools: IMCPTool[] = [
  {
    name: 'searchRooms',
    description: `Returns the information of the chats matching the given terms (name, etc.).`,
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
  {
    name: 'removeMemberFromConversation',
    description: `Removes the given user from the given chat (requires user id and chat id).
    This tool returns undefined even if it worked.`,
    parameters: {
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          description: 'The id of the chat to add the users to.',
        },
        userId: {
          type: 'string',
          description: 'The user id to remove from the chat.',
        },
      },
      required: ['streamId', 'userId'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
