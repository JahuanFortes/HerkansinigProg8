import express from "express";
import { callAssistant } from "./chat.js";

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
  const { messages } = req.body;
  const response = await callAssistant(messages);
  res.json({ response });
});
//#endregion POST

app.listen(3000, () => console.log(`Server on http://localhost:3000/`));
