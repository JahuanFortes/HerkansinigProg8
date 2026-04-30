import { AzureChatOpenAI } from "@langchain/openai";
import express from "express";
import cors from "cors";
import { callAssistant } from "./chat.js";

const app = express();
app.use(express.json());
app.use(express.static("client"));
//#region GET
app.get("/", (req, res) => {
  res.sendFile("client/index.html", { root: "." });
});

app.get("/result", (req, res) => {
  res.json({ response: `Hello world` });
});
//#endregion GET

//#region POST
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const response = await callAssistant(message);
  res.json({ response });
});
//#endregion POST

app.listen(3000, () => console.log(`Server on http://localhost:3000/`));
