const express = require("express");
const path = require("path");
const { WebSocketServer } = require("ws");

const app = express();
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на ${PORT}`);
});

app.use(express.static(path.join(__dirname, "public")));

const wss = new WebSocketServer({ server });

let socketsConnected = new Set();

wss.on("connection", (ws) => {
  const socketId = Date.now() + Math.random();
  console.log("Socket connected:", socketId);

  socketsConnected.add(socketId);

  broadcastMessage({
    type: "clients-total",
    data: socketsConnected.size,
  });

  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "message":
        broadcastMessage({
          type: "chat-message",
          data: parsedMessage.data,
        }, ws);
        break;

      case "feedback":
        broadcastMessage({
          type: "feedback",
          data: parsedMessage.data,
        }, ws);
        break;
    }
  });

  ws.on("close", () => {
    console.log("Socket disconnected:", socketId);
    socketsConnected.delete(socketId);

    broadcastMessage({
      type: "clients-total",
      data: socketsConnected.size,
    });
  });
});

function broadcastMessage(message, excludeSocket) {
  wss.clients.forEach((client) => {
    if (client !== excludeSocket && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
