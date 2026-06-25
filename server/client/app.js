let USER_ID = null;

const DELAY = 5000;
const START_DELAY = 1000;
const RESPONSE_DELAY = 25;
const START_MESSAGE = `Hey you.

I'm here. So, what's going on in your head today?

You can talk to me about anything—plans, problems, random thoughts, or even stuff you don't fully understand yet. If it helps, I might ask you a few questions too. Don't worry, I'm not grilling you—just trying to actually understand you properly.

So go on. What are we dealing with?`;

const SUBMIT_BUTTON = document.getElementById("submit");
const INPUT_FIELD = document.getElementById("inputMessage");
const CHAT_CONTAINER = document.getElementById("chat");
const CLEAR_BUTTON = document.getElementById("clearButton");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomString = (length = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const appendMessage = (messageElement) => {
  CHAT_CONTAINER.appendChild(messageElement);
};

const createMessageElement = (message, type) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", type);
  messageElement.innerHTML = message;
  return messageElement;
};

const startMessage = () => {
  const startMessage = createMessageElement("Thinking...", "thinking");
  SUBMIT_BUTTON.disabled = true;
  appendMessage(startMessage);
  USER_ID = randomString(16);

  setTimeout(function () {
    startMessage.classList.remove("thinking");
    startMessage.classList.add("received");
    startMessage.innerHTML = sanitizeAndParseMarkdown(START_MESSAGE);
    SUBMIT_BUTTON.disabled = false;
  }, START_DELAY);
};

const fetchAiResponse = async (message, user) => {
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user }),
  });
  return response.body.getReader();
};

const sanitizeAndParseMarkdown = (text) => {
  const sanitizedText = DOMPurify.sanitize(text);
  return marked.parse(sanitizedText);
};

const handleUserInput = () => {
  const userMessage = INPUT_FIELD.value.trim();

  const sentMessage = createMessageElement(userMessage, "sent");
  appendMessage(sentMessage);

  INPUT_FIELD.value = "";

  return userMessage;
};

const handleResponseEnd = () => {
  SUBMIT_BUTTON.textContent = "Cooldown...";
  setTimeout(function () {
    SUBMIT_BUTTON.disabled = false;
    SUBMIT_BUTTON.textContent = "Send";
  }, DELAY);
};

const handleAiResponse = async (message) => {
  const responseMessage = createMessageElement("Thinking...", "thinking");
  appendMessage(responseMessage);

  try {
    const aiResponseReader = await fetchAiResponse(message, USER_ID);
    const decoder = new TextDecoder();
    let messageContent = "";

    while (true) {
      const { done, value } = await aiResponseReader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          const parsed = JSON.parse(data);

          messageContent += parsed.content;

          responseMessage.innerHTML = sanitizeAndParseMarkdown(messageContent);

          await delay(RESPONSE_DELAY);
        }
      }
    }

    responseMessage.classList.remove("thinking");
    responseMessage.classList.add("received");
  } catch (error) {
    CHAT_CONTAINER.removeChild(responseMessage);

    const errorMessage = createMessageElement(
      "Error: Unable to get a response from the AI.",
      "error",
    );
    appendMessage(errorMessage);

    console.error("Error fetching AI response:", error);
  }
};

const onSubmit = async (e) => {
  e.preventDefault();
  SUBMIT_BUTTON.disabled = true;
  SUBMIT_BUTTON.textContent = "Sending...";
  CLEAR_BUTTON.classList.remove("hidden");

  const message = handleUserInput();

  await handleAiResponse(message);

  handleResponseEnd();
};

const onClear = (e) => {
  CHAT_CONTAINER.innerHTML = "";
  CLEAR_BUTTON.classList.add("hidden");
  startMessage();
};

SUBMIT_BUTTON.addEventListener("click", onSubmit);

CLEAR_BUTTON.addEventListener("click", onClear);

window.addEventListener("load", () => {
  startMessage();
});
