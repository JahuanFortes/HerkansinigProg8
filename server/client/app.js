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
  messageElement.textContent = message;
  return messageElement;
};

const fetchAiResponse = async (message) => {
  const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  return data.response;
};

SUBMIT_BUTTON.addEventListener("click", async function (e) {
  e.preventDefault();
  SUBMIT_BUTTON.disabled = true;
  SUBMIT_BUTTON.textContent = "Sending...";

  const userMessage = INPUT_FIELD.value.trim();

  const sentMessage = createMessageElement(userMessage, "sent");
  appendMessage(sentMessage);

  INPUT_FIELD.value = "";

  try {
    const responseAI = await fetchAiResponse(userMessage);
    const receivedMessage = createMessageElement(responseAI, "received");

    appendMessage(receivedMessage);
  } catch (error) {
    const errorMessage = createMessageElement(
      "Error: Unable to get a response from the AI.",
      "error",
    );

    appendMessage(errorMessage);
  }

  SUBMIT_BUTTON.textContent = "Send";

  setTimeout(function () {
    SUBMIT_BUTTON.disabled = false;
  }, DELAY);
});
