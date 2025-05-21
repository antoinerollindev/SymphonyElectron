import { logger } from '../../../../../common/logger';
import { ToolAndHandler } from '../../../mcp-models';

const tool = {
  name: 'echo',
  description: 'Echoes back the provided message',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to echo back',
      },
    },
    required: ['message'],
  },
};

function handler(parameters: any): any {
  // Simple echo function that returns whatever is sent
  const message = parameters?.message || '';
  logger.info(`Echo function called with: ${message}`);
  return { message };
}

export const toolAndHandler: ToolAndHandler = {
  tool,
  handler,
};
