let USER_ID_KEY = "chat_user_id";

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

const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

const clearUserId = () => {
  localStorage.removeItem(USER_ID_KEY);
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

const initNewChat = () => {
  const startMessage = createMessageElement("Thinking...", "thinking");
  SUBMIT_BUTTON.disabled = true;
  appendMessage(startMessage);

  setTimeout(function () {
    startMessage.classList.remove("thinking");
    startMessage.classList.add("received");
    startMessage.innerHTML = sanitizeAndParseMarkdown(START_MESSAGE);
    SUBMIT_BUTTON.disabled = false;
  }, START_DELAY);
};

const fetchAiResponse = async (user_id, message) => {
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user: user_id }),
  });
  return response.body.getReader();
};

const getChatHistory = async (user_id) => {
  const response = await fetch(`/chat-history/${user_id}`);
  if (!response.ok) {
    const errorMessage = createMessageElement(
      "Error: Unable to fetch chat history.",
      "error",
    );
    appendMessage(errorMessage);
  }

  return response.json();
};

const clearChatHistory = async (user_id) => {
  const response = await fetch(`/chat-history/${user_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorMessage = createMessageElement(
      "Error: Unable to clear chat history.",
      "error",
    );
    appendMessage(errorMessage);
  }
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
  SUBMIT_BUTTON.disabled = true;
  SUBMIT_BUTTON.textContent = "Cooldown...";
  setTimeout(function () {
    SUBMIT_BUTTON.disabled = false;
    SUBMIT_BUTTON.textContent = "Send";
  }, DELAY);
};

const handleAiResponse = async (user_id, message) => {
  const responseMessage = createMessageElement("Thinking...", "thinking");
  appendMessage(responseMessage);

  try {
    const aiResponseReader = await fetchAiResponse(user_id, message);
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

const renderChatHistory = (chatHistory) => {
  const startMessage = createMessageElement(
    sanitizeAndParseMarkdown(START_MESSAGE),
    "received",
  );
  appendMessage(startMessage);

  for (const msg of chatHistory) {
    const type = msg.role === "user" ? "sent" : "received";
    const messageElement = createMessageElement(
      sanitizeAndParseMarkdown(msg.content),
      type,
    );
    appendMessage(messageElement);
  }

  CLEAR_BUTTON.classList.remove("hidden");
};

const onSubmit = async (e) => {
  e.preventDefault();
  SUBMIT_BUTTON.disabled = true;
  SUBMIT_BUTTON.textContent = "Sending...";
  CLEAR_BUTTON.classList.remove("hidden");

  const user_id = getUserId();
  const message = handleUserInput();

  await handleAiResponse(user_id, message);

  handleResponseEnd();
};

const onClear = (e) => {
  CHAT_CONTAINER.innerHTML = "";
  CLEAR_BUTTON.classList.add("hidden");

  const user_id = getUserId();
  clearChatHistory();
  clearUserId();

  initNewChat();
};

const onLoad = async () => {
  const user_id = getUserId();

  const chatHistory = await getChatHistory(user_id);
  if (chatHistory && chatHistory.length > 0) {
    renderChatHistory(chatHistory);
    return;
  }

  initNewChat();
};

SUBMIT_BUTTON.addEventListener("click", onSubmit);

CLEAR_BUTTON.addEventListener("click", onClear);

window.addEventListener("load", onLoad);
