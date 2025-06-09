import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IAIHelper';

const tools: IMCPTool[] = [
  {
    name: 'getStructuredUnreadMessages',
    description: `Get the user's unread messages in a structured format like the following:
-- For each room with unread messages: --
  In {roomName} - roomId: {roomId}:
  -- For each message in {roomName} --
    At {date}, {sender} said {mention ? 'with mention' : ''}: {message}
`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
