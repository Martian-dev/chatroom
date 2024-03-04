const socket = io();

const joinRoomForm = document.getElementById("join-room");
const usernameField = document.getElementById("username");
const invalidRoomID = document.getElementById("invalid-room-id");

usernameField.username.value = document.cookie.split(";").find((row) => row.startsWith("user="))?.split("=")[1];

usernameField.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch("/usernameUpdate", {
    method: "POST",
    body: JSON.stringify({
      username: usernameField.username.value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then(() => {
    usernameField.username.value = document.cookie.split(";").find((row) => row.startsWith("user="))?.split("=")[1];
  });
});

joinRoomForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const joinRoomID = document.getElementById("join-room-id");

  if (!(joinRoomID.value == "")) {
    window.location.href = joinRoomID.value;
    joinRoomID.value = "";
  } else {
    joinRoomID.value = "";
    invalidRoomID.style.display = "block";
    invalidRoomID.innerText = "enter a valid room id";
  }
});

