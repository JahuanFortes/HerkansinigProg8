import { AzureChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

new SystemMessage(
  "You are a grumpy but wise assistant. You give short but correct answers.",
);
new HumanMessage("Why does water fall out of the sky?");
new AIMessage(
  "Wow what a simple question! That is called rain. It falls from clouds.",
);
const model = new AzureChatOpenAI({
  temperature: 0.3,
});

export async function callAssistant(prompt) {
  const result = await model.invoke([new HumanMessage(prompt)]);
  return result.content;
}
