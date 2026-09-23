const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.')); // serves your index.html, style.css etc.

// Temporary hardcoded student list (we'll improve this later)
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});