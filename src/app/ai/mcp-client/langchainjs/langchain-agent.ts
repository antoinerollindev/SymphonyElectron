// agent.ts

// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.OPENAI_API_KEY = 'sk-...';
process.env.TAVILY_API_KEY = 'tvly-...';

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

let threadId: number = 0;

export const createCustomLangChainAgent = async (
  model: BaseChatModel,
  tools: any[],
) => {
  threadId++;
  const toolNode = new ToolNode(tools);

  model.bindTools?.(tools);

  // Define the function that determines whether to continue or not
  const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return '__end__';
  };

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages, {
      configurable: { thread_id: threadId },
    });

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
  };

  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addEdge('__start__', 'agent') // __start__ is a special name for the entrypoint
    .addNode('tools', toolNode)
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', shouldContinue);

  // Finally, we compile it into a LangChain Runnable.
  const agent = workflow.compile();
  return agent;
};
