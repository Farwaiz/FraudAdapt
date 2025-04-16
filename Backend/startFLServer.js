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



export async function startServer(rounds){
    return new Promise((resolve, reject) => {
        try{
            // Run the Python script
            const pythonProcess = spawn('python', ['server.py', rounds], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            });

            // Capture stdout from Python (the result in JSON format)
            pythonProcess.stdout.on('data', (data) => {
                try {
                    // Parse the JSON result from Python
                    resolve(data)
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
                if (code !== 0 ) {
                  return reject(new Error(`Script failed: gg`));
                }
                try {
                  // Try parsing as JSON if that's expected
                  const parsed = {"messge" : 'done'};
                  resolve(parsed);
                } catch (e) {
                  // Return raw output if not JSON
                  resolve(output.trim());
                }
              });
        }catch(error){
            resolve(false)

        }
    });
}
