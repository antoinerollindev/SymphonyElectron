import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'IChatCreationService';

const createRoomParams = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'The user id',
          },
        },
        required: ['id'],
      },
      description:
        'The user ids to create the chat room with (default value: empty array)',
    },
    roomName: {
      type: 'string',
      description:
        'The name of the chat room to create (default value: empty string)',
    },
    roomSettings: {
      type: 'object',
      description: `The settings of the chat room to create (default value: empty object). Here is the list of available settings:
        - public (true/false)
        - external (true/false)
        - multilateral (true/false - only for external chats)
        - allowHistoryBrowsing (true/false)
        - allowMessageCopy (true/false)
        - allowSendMessages (true/false)
        - allowAddUser (true/false)
        - allowReactions (true/false)
        - discoverable (true/false)
        - message (string)`,
    },
  },
  required: ['users', 'roomName', 'roomSettings'],
};

const tools: IMCPTool[] = [
  // Uncomment to create rooms with no user confirmation - (╯°□°)╯︵ ʎʇǝɟɐs
  // {
  //   name: 'createChatRoom',
  //   description: `Creates the chat room with the provided users and room name, and using the provided settings. Requires confirmation prompt.`,
  //   parameters: createRoomParams,
  // },
  {
    name: 'displayCreateChatRoomPanel',
    description: `Displays the chat room creation panel pre-filled with the provided users and room name, and using the provided settings. Users can only be specified by their id attribute which can .`,
    parameters: createRoomParams,
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
