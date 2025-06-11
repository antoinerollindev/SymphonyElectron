import { IMCPTool } from '../../../mcp-models';

// https://fdc3.finos.org/docs/api/ref/DesktopAgent
const tools: IMCPTool[] = [
  {
    name: 'raiseIntent',
    description: `Raises a given intent to the FDC3 desktop agent with the given context data.
    In the FDC3 (Financial Desktop Connectivity and Collaboration Consortium) standard, raiseIntent is a core part of its intents API.
    It enables interoperability between desktop applications by allowing an app to request that another app perform a specific action, without needing to know the details of the target app.
    The result of this function is an object containing information about the FDC3 application that handled the intent.
    Examples:
    - Raise "ViewChart" intent with context { type: "fdc3.instrument", id: { ticker: "AAPL" } } - This will open a chart for the given ticker in the default charting application
    - Raise "AddNote" intent with context { type: "fdc3.note", id: { noteId: "note-id", content: "My note content", from: "John Doe" } } - This will create or update a note with the given content (use the main note content word for the noteId if you want to create a new note, use an existing noteId if you want to edit an existing note) - from is optional and correspond to the source of the note creation (message sender name or chat name), use undefined if not known.
    - Raise "RemoveNote" intent with context { type: "fdc3.note", id: { noteId: "note-id" } } - This will remove the note with the given noteId`,
    parameters: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          description:
            'The intent to raise (available intents are: ViewChart, AddNote, RemoveNote)',
        },
        context: {
          type: 'object',
          description: 'The context data to pass with the intent',
        },
        target: {
          type: 'object',
          description:
            'Optional object containing an "appId" string property (use { appId: "hackathon-fdc3-note-app" } for AddNote and RemoveNote intents, otherwise use undefined)',
        },
      },
      required: ['intent', 'context', 'target'],
    },
  },
  {
    name: 'getInfo',
    description: `Retrieves information about the FDC3 Desktop Agent implementation, including the supported version of the FDC3 specification, the name of the provider of the implementation, its own version number, details of whether optional API features are implemented and the metadata of the calling application according to the desktop agent.`,
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];
export { tools };
