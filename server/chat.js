import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { AzureChatOpenAI } from "@langchain/openai";
import { SYSTEM_PROMPT } from "./system_prompt.js";

// model setup met temperature voor goede balans
const model = new AzureChatOpenAI({
  temperature: 0.4,
});

// initialiseren van de chat history per user
const userChatHistory = new Map();

// Chat functie
export async function callAssistant(user, message) {
  // checken of de user al een chat history heeft, zo niet initialiseren we een lege array
  if (!userChatHistory.has(user)) {
    userChatHistory.set(user, []);
  }

  // de chat history van de user ophalen
  const messages = userChatHistory.get(user);

  // de user message toevoegen aan de chat history en opslaan
  messages.push({ role: "user", content: message });
  userChatHistory.set(user, messages);

  // model callen met system prompt en de chat history van de user
  return await model.invoke([
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

// updated chat history functie die de assistant message en tokens used opslaat aan het einde
export async function updateChatHistory(user, assistantMessage, tokensUsed) {
  // checken of de user al een chat history heeft, zo niet initialiseren we een lege array
  if (!userChatHistory.has(user)) {
    userChatHistory.set(user, []);
  }

  // de chat history van de user ophalen
  const messages = userChatHistory.get(user);

  // de assistant message toevoegen aan de chat history en opslaan
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
