import express from "express";
import {
  callAssistant,
  clearChatHistory,
  getChatHistory,
  updateChatHistory,
} from "./chat.js";

const app = express();
app.use(express.json());
app.use(express.static("client"));

//#region GET
app.get("/", (req, res) => {
  res.sendFile("client/index.html", { root: "." });
});

app.get("/chat-history/:user", (req, res) => {
  const user = req.params.user;
  const chatHistory = getChatHistory(user);
  res.json(chatHistory);
});
//#endregion GET

//#region POST
app.post("/chat", async (req, res) => {
  const { message, user } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    let assistantMessage = "";
    let tokensUsed = 0;

    for await (const chunk of await callAssistant(message, user)) {
      res.write(
        `data: ${JSON.stringify({ content: chunk.content, tokens: chunk?.usage_metadata?.total_tokens })}\n\n`,
      );

      assistantMessage += chunk.content;
      tokensUsed = chunk?.usage_metadata?.total_tokens || tokensUsed;
    }

    res.write("data: [DONE]\n\n");
    res.end();

    await updateChatHistory(user, assistantMessage, tokensUsed);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
//#endregion POST

//#region DELETE
app.delete("/chat-history/:user", (req, res) => {
  const user = req.params.user;
  clearChatHistory(user);
  res.status(200).json({ message: "Chat history cleared." });
});
//#endregion DELETE

app.listen(3000, () => console.log(`Server on http://localhost:3000/`));
