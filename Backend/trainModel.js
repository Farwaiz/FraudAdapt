import { spawn } from "child_process";

// export async function trainModel(path, rounds, clientId, session){
//   return new Promise((resolve, reject) => {

//     try{
//       const filePath = path;
//       let errorData = '';
//       let completed =false;
//       // Run the Python script
//       const pythonProcess = spawn('python', ['client.py', filePath, rounds.toString(), clientId.toString(), session.toString()], {
//           env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
//       });

//       // Capture stdout from Python (the result in JSON format)
//       pythonProcess.stdout.on('data', (data) => {
//           try {
//               // Parse the JSON result from Python
//               // const result = JSON.parse(data.toString());
//               const result = JSON.parse(data.toString());
//               console.log("auc : ", result['auc'])
//               console.log("recall : ", result['recall'])
//               console.log("binary_accuracy : ", result['binary_accuracy'])
//               console.log("precision : ", result['precision'])
//               completed =true;
//               resolve(result)

//           } catch (error) {
//               // console.error("Error parsing Python output:", error);
//           }
//       });
//       // Listen to errors
//       pythonProcess.stderr.on('data', (data) => {
//         errorData += data.toString();
//       });

//       // Handle when the process is closed
//       pythonProcess.on('close', (code) => {
//         // if (!completed) {
//         //   return reject(
//         //     new Error(
//         //       `Python script exited with code ${code}. Error:\n${errorData}`
//         //     )
//         //   );
//         // }else{
//           console.log("closed Gravedully")
//         // }
//       });
//     }catch(error){
//       resolve(false)
//     }
//   });

// }

export async function trainModel(path, rounds, clientId, session) {
  return new Promise((resolve, reject) => {
    const filePath = path;
    let stdoutData = '';
    let stderrData = '';

    const pythonProcess = spawn('python', ['client.py', filePath, rounds.toString(), clientId.toString(), session.toString()], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    // Collect stdout and stderr
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}. Error:\n${stderrData}`));
      }

      try {
        const lines = stdoutData.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const result = JSON.parse(lastLine); // Only parse last line

        console.log("auc:", result['auc']);
        console.log("recall:", result['recall']);
        console.log("binary_accuracy:", result['binary_accuracy']);
        console.log("precision:", result['precision']);

        resolve(result);
      } catch (err) {
        reject(new Error(`Error parsing final line of Python output as JSON:\n${err.message}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}
