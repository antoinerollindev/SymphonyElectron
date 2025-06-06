import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IPrepareMessageService';

const tools: IMCPTool[] = [
  {
    name: 'sendMessage',
    description: `Sends a given message to the provided recipients (chats or users).
    If the response is an empty object or an empty array, it means the sending of the message failed or the current user cancelled the action.`,
    parameters: {
      type: 'object',
      properties: {
        payload: {
          type: 'object',
          description: `Object containing the following properties:
          - message: an object containing a 'text' property being an object containing a 'text/markdown' property being the markdown version of the message to send (string).
          - emails: the target user emails to send the message to (array of string - default value is empty array)
          - userIds: the target user ids to send the message to (array of string - default value is empty array)
          - streamIds: the target chat ids to send the message to (array of string - default value is empty array)
          - blast: determines if the message is sent as individual messages to each recipient (true), or creates a group message (false) (boolean - default value is true)
          - allowRooms: whether chat room are allowed as message destination (boolean - default value is true)`,
        },
      },
      required: ['payload'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
