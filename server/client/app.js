const MESSAGES = [];

const DELAY = 5000;
const RESPONSE_DELAY = 25;

const SUBMIT_BUTTON = document.getElementById("submit");
const INPUT_FIELD = document.getElementById("inputMessage");
const CHAT_CONTAINER = document.getElementById("chat");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  MESSAGES.push({ role: "user", content: userMessage });

  INPUT_FIELD.value = "";
};

const handleResponseEnd = () => {
  SUBMIT_BUTTON.textContent = "Cooldown...";
  setTimeout(function () {
    SUBMIT_BUTTON.disabled = false;
    SUBMIT_BUTTON.textContent = "Send";
  }, DELAY);
};

const handleAiResponse = async (messages) => {
  const responseMessage = createMessageElement("Thinking...", "thinking");
  appendMessage(responseMessage);

  try {
    const aiResponseReader = await fetchAiResponse(MESSAGES);
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

    MESSAGES.push({ role: "assistant", content: messageContent });

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

  handleUserInput();

  await handleAiResponse(MESSAGES);

  handleResponseEnd();
};

SUBMIT_BUTTON.addEventListener("click", onSubmit);
