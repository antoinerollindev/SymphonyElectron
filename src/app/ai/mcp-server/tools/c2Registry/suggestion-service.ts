import { IMCPTool, IRegistryServiceTools } from '../../../mcp-models';

const symbol = 'SuggestionService';

const tools: IMCPTool[] = [
  {
    name: 'showTickerWorkspaceCreationSuggestion',
    description: `Displays a notification in Symphony to suggest the user to open a workspace related to a ticker. The workspace will contain the ticker chart, buyer/seller interested in the ticker and prepare a blast message.
    The notification has an Accept button. If the user clicks on it, the workspace will be created.
    All parameters are required.
    This tool should be called if the user receives a message containing a ticker code and #hot`,
    parameters: {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          description: `parameters for the notification and the resulting workspace creation`,
          properties: {
            title: {
              type: 'string',
              description: `Title of the notification (maximum 30 characters).`,
            },
            ticker: {
              type: 'string',
              description: `The ticker code (4 characters) for which to create the workspace`,
            },
            content: {
              type: 'string',
              description: `The notification content. Give the user the reason (why the ticker looks hot or by default because the ticker is hot) why we are prompting this suggestion. Also ask him whether he wants the workspace to be created. Maximum 100 character. E.g. "GOOG is going up. Do you want to open a workspace for GOOG?"`,
            },
            workspaceTitle: {
              type: 'string',
              description: `The title of the workspace to be created. E.g. {ticker} info`,
            },
            message: {
              type: 'string',
              description: `The message that will be sent to people that are interested in the ticker.`,
            },
          },
        },
      },
      required: ['options'],
    },
  },
];

export const registryTools: IRegistryServiceTools = {
  symbol,
  tools,
};
