 const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// ---------- Saved chat history ----------
const DATA_FILE = path.join(__dirname, 'data.json');
let data = { messages: {} };

try {
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!data.messages) data.messages = {};
  }
} catch (err) {
  console.error('Could not read data file:', err.message);
}

function saveData() {
  fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
    if (err) console.error('Could not save data:', err.message);
  });
}

function validChannel(channel) {
  return typeof channel === 'string' && /^[A-Za-z0-9 -]{1,50}$/.test(channel);
}

function getHistory(channel) {
  return Object.prototype.hasOwnProperty.call(data.messages, channel) ? data.messages[channel] : [];
}

// ---------- Middleware ----------
app.use(express.json());

// Don't let the browser download server code or saved data
app.use((req, res, next) => {
  if (/^\/(data\.json|server\.js|package(-lock)?\.json|node_modules|\.git)/.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

app.use(express.static('.'));

// ---------- Demo accounts (test data only) ----------
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

// ---------- Real-time chat ----------
io.on('connection', (socket) => {
  socket.on('join', (channel) => {
    if (!validChannel(channel)) return;
    socket.join(channel);
    // Send the saved messages to the person who just joined
    socket.emit('history', getHistory(channel));
  });

  socket.on('message', ({ channel, user, text }) => {
    if (!validChannel(channel) || typeof text !== 'string') return;

    const clean = text.trim().slice(0, 500);
    if (!clean) return;

    const msg = { user: String(user || 'Guest'), text: clean, time: new Date().toISOString() };

    if (!Object.prototype.hasOwnProperty.call(data.messages, channel)) {
      data.messages[channel] = [];
    }
    data.messages[channel].push(msg);
    if (data.messages[channel].length > 200) data.messages[channel].shift(); // keep last 200

    saveData();
    io.to(channel).emit('message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});