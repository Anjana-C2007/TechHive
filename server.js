const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

// Demo accounts (test data only)
const students = [
  { regno: "22CS001", password: "test123" },
  { regno: "22CS002", password: "pass456" }
];

app.post('/login', (req, res) => {
  const { regno, password } = req.body;
  const student = students.find(s => s.regno === regno && s.password === password);
  if (student) {
    res.json({ success: true, message: "Login successful!" });
  } else {
    res.json({ success: false, message: "Invalid registration number or password." });
  }
});

io.on('connection', (socket) => {
  // Join a channel room
  socket.on('join', (channel) => {
    socket.join(channel);
  });

  // Send a message to everyone in that channel (including the sender)
  socket.on('message', ({ channel, user, text }) => {
    if (!channel || !text) return;
    io.to(channel).emit('message', { user, text });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});