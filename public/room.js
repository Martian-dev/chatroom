const socket = io();
      
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const roomID = location.pathname.split("/")[1];

function getUserName() {
  return document.cookie.split(";").find((row) => row.startsWith("user="))?.split("=")[1];
}

function appendMessage(msg) {
  const item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

const username = getUserName();

appendMessage("You Joined.");
socket.emit('new-user', roomID, username);

socket.on("chat-message", (res) => {
  appendMessage(`${res.username}: ${res.message}`);
});

socket.on('user-connected', name => {
  appendMessage(`${name} Joined.`);
});

socket.on("user-disconnected", name => {
  appendMessage(`${name} Left.`);
})

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("send-chat-message", roomID, input.value);
    appendMessage(`You: ${input.value}`);
    input.value = "";
  }
});