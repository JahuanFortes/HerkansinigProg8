import express from "express";
import { callAssistant, updateChatHistory } from "./chat.js";

const app = express();
app.use(express.json());
app.use(express.static("client"));

//#region GET
app.get("/", (req, res) => {
  res.sendFile("client/index.html", { root: "." });
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
    for await (const chunk of await callAssistant(message, user)) {
      res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      assistantMessage += chunk.content;
    }

    res.write("data: [DONE]\n\n");
    res.end();

    await updateChatHistory(user, assistantMessage);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
//#endregion POST

app.listen(3000, () => console.log(`Server on http://localhost:3000/`));
