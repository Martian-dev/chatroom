import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = new express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname), 'homepage.html');
});

io.on("connection", (socket) => {
  // socket.on("new-room-id", (roomID) => {
  //   console.log(roomID);
  // });
  console.log(socket.id);
});

server.listen('3000', () => {
  console.log("server running at http://localhost:3000");
});
