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

  // Handlers voor het streamen van het ai antwoord
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // variabelen zetten omdat de stream per stukje data verzend
    let assistantMessage = "";
    let tokensUsed = 0;

    for await (const chunk of await callAssistant(user, message)) {
      res.write(
        `data: ${JSON.stringify({ content: chunk.content, tokens: chunk?.usage_metadata?.total_tokens })}\n\n`,
      );

      // elke chunk toevoegen aan de message
      assistantMessage += chunk.content;

      // tokens data komt laatste chunk binnen
      tokensUsed = chunk?.usage_metadata?.total_tokens || tokensUsed;
    }

    // einde van de stream
    res.write("data: [DONE]\n\n");
    res.end();

    // chat history updaten met het volledige assistant message en tokens used
    await updateChatHistory(user, assistantMessage, tokensUsed);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
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
