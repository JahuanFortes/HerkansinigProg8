import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { AzureChatOpenAI } from "@langchain/openai";

const SYSTEM_MESSAGE = new SystemMessage(
  "You are a grumpy but wise assistant. You give short but correct answers.",
);

const model = new AzureChatOpenAI({
  temperature: 0.3,
});

export async function callAssistant(messages) {
  const result = await model.invoke([
    SYSTEM_MESSAGE,
    ...messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
    }),
  ]);

  return result.content;
}
