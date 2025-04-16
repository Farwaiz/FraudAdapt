import express from "express";
// import { tableExtract } from "./textract.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import cluster from "cluster";
import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import { pid } from "process";
import { cpus } from "os";
import { startServer } from "./startFLServer.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { trainModel } from "./trainModel.js";
import { prediction } from "./prediction.js";
import cors from 'cors';


const db = mysql.createConnection({
    host: "Localhost",
    user: "root",
    password: "1234", // your MySQL root password
    database: "fraudadapt_db"
  });
  
db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json(({ limit: '10mb' })))
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const predictionDir = path.join(__dirname, "prediction");
if (!fs.existsSync(predictionDir)) {
    fs.mkdirSync(predictionDir, { recursive: true });
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

const testingStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, predictionDir); // Store files in 'prediction' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage });
const predictions = multer({ storage:multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, predictionDir); // Store files in 'prediction' directory
        },
        filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
        }
    }) 
});

app.get("/user_types", (req, res) => {
    db.query("SELECT * FROM user_types", (err, results) => {
      if (err) throw err;
      res.send(results);
    });
  });

app.get("/latest-training-session", (req, res) => {
    db.query("SELECT * FROM training_sessions where status like 'started' order by session_id desc limit 1", (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get("/latest-model-weights", (req, res) => {
    db.query("SELECT * FROM model_weights where weight_path is not null order by weight_id desc limit 1", (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get("/get-clients", (req, res) => {
    db.query("SELECT * FROM users where type=2", (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});


app.post("/send-create-link", async (req, res) => {
    const email = req.body.email;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required and must be a string." });
    }

    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Only valid gmail addresses are allowed." });
    }
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.SERVER_EMAIL,
                pass: process.env.SERVER_PASSWORD, //this is the app password generated from gmail
            },
        });
        const token = jwt.sign({ email: req.body.email, userStatus : "new" }, process.env.SECRET_KEY, {
            expiresIn: '24h',
        });
        const createUserURL = process.env.BASE_APPLICATION_URL + "CreateUserPage?token=" + token;
        const mailOptions = {
            to: req.body.email,
            from: process.env.SERVER_EMAIL,
            subject: 'Complete Your Account Setup',
            text: `This email is forwarded by the FraudAdapt team to complete the account setup.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${createUserURL}\n\n
            If you didn’t request this email, you can safely ignore it—no changes have been made to your account\n.
            Thanks,\n
            The FraudAdapt Team\n`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ url: createUserURL, message: 'Account setup link has been sent' });
    } catch(error){
        console.log(error)
        res.status(500).send({ Error : error, message: 'Error : Account setup link has not been sent' });
    }
})
//This is to run the federated learning server 
app.post("/run-server", async (req, res) => {
    let id;
    try{
        const { clients, rounds } = req.body;
        const query = "INSERT INTO training_sessions (client_id, start_time, training_rounds) VALUES (?, NOW(), ?)";
        const values = [clients.toString(), rounds];
        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).send({message:"Training session unsuccessful", error : err});
            }
            id = result.insertId
        });

        await startServer(rounds);
        console.log("im here after everything")
        const updateQuery = "UPDATE training_sessions SET status = ? where session_id = ?";
        const updateValues = ['completed', id];
        db.query(updateQuery, updateValues, (err, result) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).send({message:"Training session unsuccessful", error : err});
            }
        });
        res.send({ message: "Federated learning completed successfully", userId: id });

    } catch(error){
        console.log(error)
        const failedQuery = "UPDATE training_sessions SET status = ? where session_id = ?";
        const failedValues = ['failed', id];
        db.query(failedQuery, failedValues, (err, result) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).send({message:"Training session unsuccessful", error : err});
            }
        });
        res.status(500).send("FL Server Error");
    }
});

// This is to create the user
app.post("/create-user", async (req, res) => {
    const { name, password, email, userTypeId } = req.body; 

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = "INSERT INTO users (name, password, email, type) VALUES (?, ?, ?, ?)";
        const values = [name, hashedPassword, email, userTypeId];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error:", err);
                if (err.code === "ER_DUP_ENTRY"){
                    return res.status(500).send({message:"Duplicate user email", error : err});
                }
                return res.status(500).send({message:"Server error", error : err});
            }
            res.send({ message: "User created successfully", userId: result.insertId });
        });
    } catch(error){
        res.status(500).send(error);
    }
});

// function to authorize the user by verifying the jwt token
function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
        const decodedToken = jwt.decode(token);

        if (!decodedToken) {
            return res.status(400).json({ error: 'Invalid token format' });
        }

        // get the expiration time
        const expTime = decodedToken.exp;

        const currentTime = Math.floor(Date.now() / 1000);

        // check if the token is expired
        if (expTime < currentTime) {
            return res.status(401).json({ error: 'Token has expired' });
        }
        req.user = verifiedToken;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid Token' });
    }
}

//authorizes if the user can access
app.get("/authorize", authMiddleware, (req, res) => {
    if (!req.user) {
      return res.status(403).send("Not authorized");
    }
  
    res.json({ message: "Authorized access!", user: req.user });
});

app.post("/authentication", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send("Server error");

        if (results.length === 0) {
            return res.status(401).send("Invalid credentials");
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send("Invalid credentials");
        }
        console.log(user.type);
        const token = jwt.sign({ email: email, id: user.id, userStatus : "old", userType: user.type  }, process.env.SECRET_KEY, {
            expiresIn: '24h',
        });
        res.send({ message: "Login successful", token: token, userId: user.id });
    });
})

// API Endpoint to receive the file
app.post("/upload", upload.array("file"), async (req, res) => {
    let fileName = '';
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    try {
        for (const file of req.files) {
            fileName = file.filename;
            const data = await trainModel(`uploads/${file.filename}`, req.body.rounds, req.body.id, req.body.session);

            const query = "INSERT INTO model_weights (client_id, session_id, weight_path, uploaded_at) VALUES (?, ?, ?, NOW())";
            const values = [req.body.id, req.body.session, `weights/global_weights_session${req.body.session}.weights.h5`];
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).send({message:"Training session unsuccessful", error : err});
                }
            });
            res.json(data);
        }
    } catch (error) {
        console.log(error)
        const message = error.message?.match(/ValueError: (.*)/)?.[1] || 'Unexpected error';
        console.error("Error during model training:", message);
        res.status(500).json({ Error: message });
    } finally {
        fs.unlink(`uploads/${fileName}`, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File deleted successfully");
            }
        });
    }
});


app.post("/prediction", predictions.array("file"), async (req, res) => {
    if (!req.files) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try{
        const data = await prediction(`prediction/${req.files[0].filename}`, req.body.weight_path);
        fs.unlink(`prediction/${req.files[0].filename}`, (err) => {
            if (err) {
            console.error("Error deleting file:", err);
            } else {
            console.log("File deleted successfully");
            }
        });        
        res.json(data);
        // res.json({ message: "File uploaded successfully", filePath: req.files.path });
    } catch (error) {
        console.error("Error during model training:", error);
        res.status(500).json({ error: "Error processing file" });
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