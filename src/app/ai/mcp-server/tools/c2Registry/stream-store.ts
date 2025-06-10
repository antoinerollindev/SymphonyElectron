import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IStreamStore';

const tools: IMCPTool[] = [
  {
    name: 'searchRooms',
    description: `Returns the information of the chats matching the given terms (name, etc.) - result contains all the information of the chats matching the query, including the chat id.`,
    parameters: {
      type: 'object',
      properties: {
        roomQuery: {
          type: 'object',
          description: `The room query object containing the following properties:
            - query: a string query property which corresponds to the search terms
            - members: optional array of user ids, so that the search returns only chats that include these users (default value is undefined)`,
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
    name: 'getStreams',
    description: `Returns the information of the chats that the current user is a member of, including the chat id, the name, the user ids of the members and the chat type ('IM' for individual chat, 'ROOM' for chat room).`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
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
  {
    name: 'getStreamMembers',
    description: `Returns the list of users in the given chat (requires chat id).`,
    parameters: {
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          description: 'The id of chat to retrieve the members from.',
        },
      },
      required: ['streamId'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
