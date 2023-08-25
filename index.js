const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

//mongodb connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Set up file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

// Define file schema and model
const fileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
});

const File = mongoose.model("File", fileSchema);

// Handle file upload
app.post("/upload", upload.array("files"), async (req, res) => {
    try {
        const files = req.files.map((file) => ({
            filename: file.filename,
            path: file.path,
            originalName: file.originalname,
            mimetype: file.mimetype,
        }));

        const savedFiles = await File.create(files);
        res.json(savedFiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading files" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
