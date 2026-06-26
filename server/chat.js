import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AzureChatOpenAI } from "@langchain/openai";

import { SYSTEM_PROMPT } from "./system_prompt.js";

const model = new AzureChatOpenAI({
  temperature: 0.4,
});

const userChatHistory = new Map();

export async function callAssistant(message, user) {
  if (!userChatHistory.has(user)) {
    userChatHistory.set(user, []);
  }

  const messages = userChatHistory.get(user);
  messages.push({ role: "user", content: message });
  userChatHistory.set(user, messages);

  return await model.stream([
    SYSTEM_PROMPT,
    ...messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
    }),
  ]);
}

export async function updateChatHistory(user, assistantMessage, tokensUsed) {
  if (!userChatHistory.has(user)) {
    userChatHistory.set(user, []);
  }

  const messages = userChatHistory.get(user);
  messages.push({
    role: "assistant",
    content: assistantMessage,
    tokens: tokensUsed,
  });
  userChatHistory.set(user, messages);
}

export function getChatHistory(user) {
  return userChatHistory.get(user) || [];
}

export function clearChatHistory(user) {
  userChatHistory.delete(user);
}
