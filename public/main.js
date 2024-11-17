const socket = new WebSocket(`wss://${window.location.host}`);

const clientsTotal = document.getElementById("clients-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

const feedbackElement = document.getElementById("feedback");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case "clients-total":
      clientsTotal.innerText = `Пользователей в чате: ${message.data}`;
      break;

    case "chat-message":
      addMessageToUI(false, message.data);
      break;

    case "feedback":
      feedbackElement.innerHTML = message.data;
      break;
  }
});

function sendMessage() {
  if (messageInput.value === "") return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.send(
    JSON.stringify({
      type: "message",
      data,
    })
  );

  addMessageToUI(true, data);
  messageInput.value = "";
}

function addMessageToUI(isOwnMessage, data) {
  const element = ` 
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
          <p class="message">
          <span>${data.name} -- ${moment(data.dateTime).fromNow()}</span>
            ${data.message}
          </p>
        </li>`;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener("focus", () => {
  socket.send(
    JSON.stringify({
      type: "feedback",
      data: `<b>${nameInput.value}</b> <i>печатает..</i>`,
    })
  );
});

messageInput.addEventListener("keypress", () => {
  socket.send(
    JSON.stringify({
      type: "feedback",
      data: `<b>${nameInput.value}</b> <i>печатает..</i>`,
    })
  );
});

messageInput.addEventListener("blur", () => {
  socket.send(
    JSON.stringify({
      type: "feedback",
      data: "",
    })
  );
});
