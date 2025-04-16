import express from "express";
// import { tableExtract } from "./textract.js";
import dotenv from 'dotenv';
import cluster from "cluster";
import { pid } from "process";
import { cpus } from "os";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { trainModel } from "./trainModel.js";
import { prediction } from "./prediction.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json(({ limit: '10mb' })))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const predictionDir = path.join(__dirname, "prediction");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Store files in 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

// const testingStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, predictionDir); // Store files in 'prediction' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${file.originalname}`);
//     }
// });

const upload = multer({ storage });
// const predictions = multer({ testingStorage });

// API Endpoint to receive the file
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    try{
        await trainModel(`uploads/${req.file.filename}`);
        fs.unlink(`uploads/${req.file.filename}`, (err) => {
            if (err) {
            console.error("Error deleting file:", err);
            } else {
            console.log("File deleted successfully");
            }
        });        
        res.json({ message: "File uploaded successfully", filePath: req.file.path });
    } catch (error) {
        console.error("Error during model training:", error);
        res.status(500).json({ error: "Error processing file" });
    }
});

// app.post("/prediction", predictions.single("file"), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//     }
//     try{
//         await prediction(`prediction/${req.file.filename}`);
//         fs.unlink(`prediction/${req.file.filename}`, (err) => {
//             if (err) {
//             console.error("Error deleting file:", err);
//             } else {
//             console.log("File deleted successfully");
//             }
//         });        
//         res.json({ message: "File uploaded successfully", filePath: req.file.path });
//     } catch (error) {
//         console.error("Error during model training:", error);
//         res.status(500).json({ error: "Error processing file" });
//     }
// });
app.post('/table-extraction', async function(req, res) {
    let textractData =[];
    console.log('Received Data POST Req');

    try {
        // Array to hold promises for tableExtract calls
        const lambdaPromises = [];

        // Pushing promises for each tableExtract call
        // Waiting for all tableExtract calls to finish
        // await Promise.all(req.body.map(img => tableExtract(img, textractData)));
        // for (let img of req.body){
        //     // Pushing promises for each tableExtract call
        //     lambdaPromises.push(tableExtract(img, textractData));
        // }
        // // Waiting for all tableExtract calls to finish
        // await Promise.all(lambdaPromises);
        // Sending the response after all tableExtract calls are finished
        // if (!res.headersSent) {
        //     // Sending the response after all tableExtract calls are finished
        //     res.send(textractData);

        // }
    } catch (error) {
        // Handle errors here
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/", async (req, res) => {
  console.log(`Express! Farwaiz${pid}`);
    await new Promise(r => setTimeout(r, 5000));
    console.log(`done express ${pid}`);
    res.send("Hello from Express! Farwaiz");
});
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});