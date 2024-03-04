import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import crypto from "crypto";
// import session from "express-session";
import cookieSession from "cookie-session";
import dotenv from "dotenv";

dotenv.config();

const app = new express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
  type: ['application/json', 'text/plain']
}));
app.use(cookieSession({
  name: "session",
  secret: process.env.SESSION_SECRET,
}));

const rooms = {};

app.get('/',
  (req, res, next) => {
  if (!req.session.user) {
    req.session.user = `Player${Math.floor(1000 + Math.random() * 8999)}`;
    return next();
  }
  return next();
  },
  (req, res) => {
    res.cookie("user", req.session.user);
    res.sendFile(join(__dirname, 'homepage.html'));
});

app.post('/usernameUpdate', (req, res) => {
  req.session.user = req.body.username;
  res.clearCookie("user");
  res.cookie("user", req.session.user);
  res.send();
});

app.get('/create-room', (req, res) => {
  const roomID = crypto.randomBytes(4).toString('hex');
   if (rooms[roomID] != null) {
    console.log(rooms);
    return;
  }
  rooms[roomID] = { users: {} };
  res.redirect(roomID);
});

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/');
  }
  res.sendFile(join(__dirname, 'index.html'));
  
});

const users = {};

// io.on("connection", (socket) => {
//   // socket.on("chat message", (msg) => {
//   //   io.emit("chat message", msg);

//   // });
//   socket.on("new-room-id", (roomID) => {
//     socket.join(roomID);
//     io.to(roomID).emit("DONE", "hoi from room");
//   });
// });

server.listen('3000', () => {
  console.log("server running at http://localhost:3000");
});
