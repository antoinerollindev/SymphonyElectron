import { logger } from '../../../../../common/logger';
import { IToolAndHandler } from '../../../mcp-models';

const tool = {
  name: 'getWeather',
  description: 'Get the current weather for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city or location to get weather for',
      },
    },
    required: ['location'],
  },
};

/**
 * handler for the tool
 * @param parameters
 * @returns
 */
const handler = async (parameters: any) => {
  // Demo weather function - in a real implementation you'd use a weather API
  // This is a mock implementation
  const location = parameters?.location || 'Unknown';
  logger.info(`Weather function called for location: ${location}`);

  // Mock weather data
  const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
  const randomCondition =
    weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const temperature = Math.floor(Math.random() * 30) + 5; // Random temp between 5 and 35°C

  return {
    location,
    condition: randomCondition,
    temperature: `${temperature}°C`,
    humidity: `${Math.floor(Math.random() * 60) + 30}%`,
    timestamp: new Date().toISOString(),
  };
};

export const toolAndHandler: IToolAndHandler = {
  tool,
  handler,
};
