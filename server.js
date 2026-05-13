const path = require("path");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function sendHtml(name) {
  return (req, res) => {
    res.sendFile(path.join(__dirname, name));
  };
}

/** Clean URLs → static HTML (before POST handlers; static above already skips missing files via next()). */
app.get("/signup", sendHtml("signup.html"));
app.get("/login", sendHtml("login.html"));
app.get("/availability", sendHtml("availability.html"));
app.get("/schedule", sendHtml("schedule.html"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "BetsyZoeOlive2006",
  database: "pickup_ball"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to pickup_ball database");
});

app.post("/signup", async (req, res) => {
  const { fullname, username, email, phone, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length > 0) {
        return res.json({ success: false, message: "User Name already exists, please try again." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (fullname, username, email, phone, password) VALUES (?, ?, ?, ?, ?)",
        [fullname, username, email, phone, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: "Database error" });

          res.json({ success: true, message: "Welcome to Pickup Ball!" });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.json({ success: false, message: "Incorrect Password, please try again." });
      }

      const user = results[0];
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        return res.json({ success: false, message: "Incorrect Password, please try again." });
      }

      res.json({ success: true, message: "Login successful!" });
    }
  );
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});