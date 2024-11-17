const socket = new WebSocket(`ws://${window.location.host}`);

const clientsTotal = document.getElementById("clients-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const feedbackElement = document.getElementById("feedback");

const modal = document.getElementById("modal");
const modalNameInput = document.getElementById("modal-name-input");
const modalSubmit = document.getElementById("modal-submit");

window.addEventListener("load", () => {
  modal.style.display = "flex";
});

modalSubmit.addEventListener("click", () => {
  const userName = modalNameInput.value.trim();
  if (userName) {
    nameInput.value = userName;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "set-name",
          data: { name: userName },
        })
      );
    }
    modal.style.display = "none";
  } else {
    alert('Пожалуйста, введите имя');
  }
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case "welcome":
      addMessageToUI(false, {
        name: "Система",
        message: message.data,
        dateTime: new Date(),
      });
      break;

    case "user-left":
      addMessageToUI(false, {
        name: "Система",
        message: message.data,
        dateTime: new Date(),
      });
      break;

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
  console.log("WebSocket соединение установлено");
});

socket.addEventListener("open", (event) => {
  console.log("WebSocket соединение установлено");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

socket.addEventListener("close", (event) => {
  console.log("WebSocket соединение закрыто");
});

function sendMessage() {
  if (messageInput.value === "") return;

  if (socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not open");
    return;
  }

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
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "feedback",
        data: `<b>${nameInput.value}</b> <i>печатает..</i>`,
      })
    );
  }
});

messageInput.addEventListener("keypress", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "feedback",
        data: `<b>${nameInput.value}</b> <i>печатает..</i>`,
      })
    );
  }
});

messageInput.addEventListener("blur", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "feedback",
        data: "",
      })
    );
  }
});

nameInput.addEventListener("blur", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "set-name",
        data: { name: nameInput.value || "Гость" },
      })
    );
  }
});