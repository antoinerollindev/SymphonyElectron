import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IUserStore';

const tools: IMCPTool[] = [
  {
    name: 'getMyInfo',
    description: `Returns the information relative to the current user (me).`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'findUserByEmail',
    description: `Returns the user matching the given email address (result contains all the information of the user matching the provided email, including the user id).`,
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
    description: `Returns the users matching the given name (result contains all the information of the users matching the provided name, including the user id and email).`,
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
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
