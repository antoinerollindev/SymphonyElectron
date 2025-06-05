import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'ICanvas';

const tools: IMCPTool[] = [
  {
    name: 'createWorkspace',
    description: `Create a new workspace and switch to that workspace`,
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the workspace to create',
        },
      },
      required: ['name'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
