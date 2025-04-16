// import { exec } from 'child_process';
// // const { exec } = require('child_process');


// function runPythonScript(){
//     return new Promise((resolve, reject) => {
//         exec('ccfd_model.py', (err, stdout, stderr) => {
//             if(err) reject(err);

//             resolve(stdout);
//         });
//     });
// }

// runPythonScript()
// .then(result => res.send(result))



// const { spawn } = require('child_process');

import { spawn } from "child_process";



export async function prediction(path, weight_path){
    return new Promise((resolve, reject) => {
        console.log("path");
        console.log(path);
        // const filePath = 'split_dataset/client_0.csv';
        const filePath = path;
        try{
            // Run the Python script
            const pythonProcess = spawn('python', ['ccfd_model.py', filePath, weight_path], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            });

            // Capture stdout from Python (the result in JSON format)
            pythonProcess.stdout.on('data', (data) => {
                try {
                    // Parse the JSON result from Python
                    const result = JSON.parse(data.toString());
                    console.log("Fraud : ", result['fraud'])
                    console.log("Not Fraud : ", result['not-fraud'])
                    console.log("Result from Python script:", result);
                    resolve(result)
                } catch (error) {
                    // console.error("Error parsing Python output:", error);
                }
            });
            // Listen to errors
            pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            });

            // Handle when the process is closed
            pythonProcess.on('close', (code) => {
            console.log(`Python script finished with code ${code}`);
            });

        }catch(error){
            resolve(false)

        }
    });
}
