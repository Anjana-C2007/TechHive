 const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

 const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

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
  console.log('A user connected');

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg); // send to everyone, including sender
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});