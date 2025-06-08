import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IUserStore';

const tools: IMCPTool[] = [
  {
    name: 'getMyInfo',
    description: `Returns the information relative to the current user (the user who's talking to you).`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'findUserByEmail',
    description: `Returns the user matching the given email address (result contains all the information of the user matching the provided email, including the user id - the presence property is not reliable).`,
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'The email of the target user to find.',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'findUserByName',
    description: `Returns the users matching the given name (result contains all the information of the users matching the provided name, including the user id and email - the presence property is not reliable).
    When multiple users match the provided name, use the first matching user being active, not deleted and not cross-pod.`,
    parameters: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
          description: 'The name of the target user to find.',
        },
      },
      required: ['value'],
    },
  },
  {
    name: 'searchUsers',
    description: `Searches for users based on query string and various filters. Returns a list of users matching the search criteria.`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query string to match against user information (id, name, email, etc.).',
        },
        maxResults: {
          type: 'number',
          description:
            'Maximum number of results to return (default value is 10).',
        },
        peopleFilters: {
          type: 'object',
          description: `Filters to apply to the search including the following properties:
          - firstName (string, filter by first name),
          - lastName (string, filter by last name),
          - email (string, filter by email address),
          - company (string, filter by company name),
          - location (string, filter by location)`,
        },
        offset: {
          type: 'number',
          description: 'Offset for result pagination (default value is 0).',
        },
        accountTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['NORMAL', 'SYSTEM'],
          },
          description: `Array of account types to filter by (default value is undefined). Accepted array item values are 'NORMAL' for human users or 'SYSTEM' for bots.`,
        },
      },
      required: [
        'query',
        'maxResults',
        'peopleFilters',
        'offset',
        'accountTypes',
      ],
    },
  },
  {
    name: 'getTopContacts',
    description: `Returns the list of users who the current user (the user who's talking to you) is most likely to interact with (top contacts are 'recent' or 'frequent' contacts/users - result contains all the users information, including the user id and email - the presence property is not reliable).`,
    parameters: {
      type: 'object',
      properties: {
        maxNumberResults: {
          type: 'number',
          description: 'The number of results to return (value is always 10).',
        },
        includeExternalUsers: {
          type: 'boolean',
          description:
            'Whether to include external users in the results (default value is false).',
        },
      },
      required: ['maxNumberResults', 'includeExternalUsers'],
    },
  },
  {
    name: 'addUsersToStream',
    description: `Adds the given users to given chat (requires user ids and chat id).
    This tool returns undefined even if it worked.`,
    parameters: {
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          description: 'The id of the chat to add the users to.',
        },
        userIds: {
          type: 'array',
          description: 'The array of user ids to add to the chat.',
          items: {
            type: 'string',
          },
        },
      },
      required: ['streamId', 'userIds'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
