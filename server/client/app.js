const MESSAGES = [];

const DELAY = 5000;

const SUBMIT_BUTTON = document.getElementById("submit");
const INPUT_FIELD = document.getElementById("inputMessage");
const CHAT_CONTAINER = document.getElementById("chat");

const appendMessage = (messageElement) => {
  CHAT_CONTAINER.appendChild(messageElement);
};

const createMessageElement = (message, type) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", type);
  messageElement.innerHTML = message;
  return messageElement;
};

const fetchAiResponse = async (messages) => {
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json();
  return data.response;
};

const sanitizeAndParseMarkdown = (text) => {
  const sanitizedText = DOMPurify.sanitize(text);
  return marked.parse(sanitizedText);
};

SUBMIT_BUTTON.addEventListener("click", async function (e) {
  e.preventDefault();
  SUBMIT_BUTTON.disabled = true;
  SUBMIT_BUTTON.textContent = "Sending...";

  const userMessage = INPUT_FIELD.value.trim();

  const sentMessage = createMessageElement(userMessage, "sent");
  appendMessage(sentMessage);

  MESSAGES.push({ role: "user", content: userMessage });

  INPUT_FIELD.value = "";

  const thinkingMessage = createMessageElement("Thinking...", "thinking");
  appendMessage(thinkingMessage);

  try {
    const responseAI = await fetchAiResponse(MESSAGES);
    const receivedMessage = createMessageElement(
      sanitizeAndParseMarkdown(responseAI),
      "received",
    );

    MESSAGES.push({ role: "assistant", content: responseAI });

    CHAT_CONTAINER.removeChild(thinkingMessage);
    appendMessage(receivedMessage);
  } catch (error) {
    const errorMessage = createMessageElement(
      "Error: Unable to get a response from the AI.",
      "error",
    );

    CHAT_CONTAINER.removeChild(thinkingMessage);
    appendMessage(errorMessage);
  }

  SUBMIT_BUTTON.textContent = "Cooldown...";

  setTimeout(function () {
    SUBMIT_BUTTON.disabled = false;
    SUBMIT_BUTTON.textContent = "Send";
  }, DELAY);
});
