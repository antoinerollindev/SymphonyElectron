import { RegistryServiceTool, RegistryServiceTools } from '../../../mcp-models';

const symbol = 'IConfirmationPromptService';

const tools: RegistryServiceTool[] = [
  {
    name: 'promptConfirmation',
    description: `Prompts user for confirmation. The user will respond with a boolean (true if user confirms, false otherwise). 
    For any tool that requires confirmation (by default, it's not required), promptConfirmation should be called first to ask the user whether he is ok
    for the model to perform an action with the human readable parameters he expects to use to call the tool.
    If the user confirms (result of the prompt is true). The tool can be called without further confirmation prompts for a given initial request.
    If the user doesn't confirm (result of the prompt is false). The tool is not called and the promptConfirmation can be called again with another suggestion (at most twice for the same initial request)`,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to prompt the user with',
        },
      },
      required: ['text'],
    },
  },
];

export const registryTools: RegistryServiceTools = {
  symbol,
  tools,
};
