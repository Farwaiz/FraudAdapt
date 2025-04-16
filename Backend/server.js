import express from "express";
// import { tableExtract } from "./textract.js";
import dotenv from 'dotenv';
import cluster from "cluster";
import { pid } from "process";
import { cpus } from "os";

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

if (cluster.isPrimary) {
    console.log(`Primary ${pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < cpus().length; i++) {
      cluster.fork();
    }
  
    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
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
    console.log(`Worker ${pid} started`);

  }
