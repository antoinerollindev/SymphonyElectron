import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IApplicationsService';

const tools: IMCPTool[] = [
  {
    name: 'getApplicationsV2',
    description: `Returns the information of the installed Symphony applications (result includes the application id, name and description).`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'openApp',
    description: `Opens the application with the given id (requires the application id).`,
    parameters: {
      type: 'object',
      properties: {
        appId: {
          type: 'string',
          description: 'The id of the application to open',
        },
      },
      required: ['appId'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
