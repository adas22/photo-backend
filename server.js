const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadsPath = path.join(__dirname, "uploads");
const dbPath = path.join(uploadsPath, "data.json");

if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "[]");

app.post("/upload", upload.single("photo"), async (req, res) => {
  const { name, quote } = req.body;
  const timestamp = Date.now();
  const filename = `${timestamp}.jpg`;
  const filepath = path.join("uploads", filename);

  await sharp(req.file.buffer)
    .resize({ width: 1280, height: 720, fit: "cover" })
    .jpeg({ quality: 70 })
    .toFile(filepath);

  const entry = { name, quote, photo: filename, time: timestamp };
  const db = JSON.parse(fs.readFileSync(dbPath));
  db.push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(db));
  res.status(200).send("Uploaded");
});

app.get("/entries", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  res.json(db);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});