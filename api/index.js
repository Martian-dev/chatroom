import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';
import { Server } from 'socket.io';
import crypto from "crypto";
import session from "express-session";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

dotenv.config();

const app = new express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url)) + "/..";

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((IDs, [roomID, userDat]) => {
    if (userDat.users[socket.id] != null) IDs.push(roomID)
    return IDs;
  }, [])
}

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
  type: ['application/json', 'text/plain']
}));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
}));
app.use(cookieParser());

const rooms = {};

app.get('/',
  (req, res, next) => {
    if (!req.session.user) {
      if (!req.cookies.user) {
        req.session.user = `Player${Math.floor(1000 + Math.random() * 8999)}`;
        return next();
      }
      req.session.user = req.cookies.user;
    }
  return next();
  },
  (req, res) => {
    res.cookie("user", req.session.user);
    res.sendFile(join(normalize(__dirname), 'homepage.html'));
});

app.post('/usernameUpdate', (req, res) => {
  req.session.user = req.body.username;
  res.clearCookie("user");
  res.cookie("user", req.session.user);
  res.send();
});

app.get('/create-room', (req, res) => {
  let roomID = crypto.randomBytes(4).toString('hex');
  if (rooms[roomID] != null) {
    roomID = crypto.randomBytes(4).toString('hex');
  }
  rooms[roomID] = { users: {} };
  res.redirect(roomID);
});

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/');
  }

  res.sendFile(join(normalize(__dirname), 'chatroom.html'));
  
});

io.on("connection", (socket) => {
  socket.on('new-user', (roomID, name) => {
    socket.join(roomID);
    rooms[roomID].users[socket.id] = name;
    socket.broadcast.to(roomID).emit('user-connected', name);
  });
  socket.on("send-chat-message", (roomID, msg) => {
    socket.broadcast.to(roomID).emit("chat-message", { message: msg, username: rooms[roomID].users[socket.id] });

  });
  socket.on("disconnect", () => {
    getUserRooms(socket).forEach(roomID => {
      socket.broadcast.to(roomID).emit("user-disconnected", rooms[roomID].users[socket.id]);
      delete rooms[roomID].users[socket.id];
    });
  });
});

server.listen('3000', () => {
  console.log("server running at http://localhost:3000");
});
