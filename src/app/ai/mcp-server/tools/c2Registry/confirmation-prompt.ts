import {
  IRegistryServiceTool,
  IRegistryServiceTools,
} from '../../../mcp-models';

const symbol = 'IConfirmationPromptService';

const tools: IRegistryServiceTool[] = [
  {
    name: 'promptConfirmation',
    description: `For any tool that requires confirmation (by default, it's not required), promptConfirmation should be called first to determine whether the model should call the tool.
    If the user specifically says the no confirmation is required, then there is no need to call promptConfirmation`,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description:
            'The text to prompt the user with. This needs to be formatted with human language that the user should be able to understand.',
        },
        tool: {
          type: 'string',
          description: 'The name of the tool to call',
        },
        arguments: {
          type: 'object',
          description: 'The parameters to pass to the tool',
        },
      },
      required: ['text', 'tool', 'arguments'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
