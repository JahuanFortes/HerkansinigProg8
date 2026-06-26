import express from "express";
import {
  callAssistant,
  clearChatHistory,
  getChatHistory,
  updateChatHistory,
} from "./chat.js";

// Express server setup
const app = express();
app.use(express.json());
app.use(express.static("client"));

//#region GET
// Main page
app.get("/", (req, res) => {
  res.sendFile("client/index.html", { root: "." });
});

// History per user
app.get("/chat-history/:user", (req, res) => {
  const user = req.params.user;
  const chatHistory = getChatHistory(user);
  res.json(chatHistory);
});
//#endregion GET

//#region POST

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message, user } = req.body;

  try {
    const response = await callAssistant(user, message);

    let assistantMessage = response.content;
    let tokensUsed = response?.usage_metadata?.total_tokens || 0;

    res.json({ message: assistantMessage, tokens: tokensUsed });

    // chat history updaten met het volledige assistant message en tokens used
    await updateChatHistory(user, assistantMessage, tokensUsed);
  } catch (error) {
    res.status(500).json({ error: "Error processing the request." });
  }
});
//#endregion POST

//#region DELETE
// delete chat history per user endpoint
app.delete("/chat-history/:user", (req, res) => {
  const user = req.params.user;
  clearChatHistory(user);
  res.status(200).json({ message: "Chat history cleared." });
});
//#endregion DELETE

app.listen(3000, () => console.log(`Server on http://localhost:3000/`));
