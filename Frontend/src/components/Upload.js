import React, { useState, useRef, useEffect } from 'react';
import { defaults } from "chart.js/auto";
import { Bar } from 'react-chartjs-2';
import fileImg from '../images/fileImg.png'
import loader from '../images/loader.gif'
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import './Upload.css';

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

function Upload({ name, pageType }) {
    const [transactionFiles, setTransactionFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [trainingAbility, setTrainingAbility] = useState(false);
    const [responseData, setResponseData] = useState([]);
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [rounds, setRounds] = useState(null);
    const [clientId, setClientId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [weightPath, setWeightPath] = useState(null);
    
    async function onSelectFile(event){
        const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
        const invalidFiles = Array.from(event.target.files).filter(file => !allowedTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            alert("Only CSV files are allowed.");
            event.target.value = ""; // Reset the file input
            return;
        }

        const files = event.target.files[0];
        if (transactionFiles.length === 1){
            alert("Maximum of 1 files");
            return
        }
        setTransactionFiles((file)=>[...file, files]);
    }
    function imageDelete(index){
        setTransactionFiles((previousImages)=> 
            previousImages.filter((_,i) => i !== index)
        )
        fileRef.current.value = "";
    }
    function dragOver(event){
        event.preventDefault();
        setDragging(true);
    }
    function dragLeave(event){
        event.preventDefault();
        setDragging(false);
    }
    async function dragDrop(event){
        event.preventDefault();
        setDragging(false);
        try{
            const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
            const invalidFiles = Array.from(event.dataTransfer.files).filter(file => !allowedTypes.includes(file.type));

            if (invalidFiles.length > 0) {
                alert("Only CSV files are allowed.");
                event.target.value = "";
                return;
            }

            const files = event.dataTransfer.files[0];
            if (transactionFiles.length === 1){
                alert("Maximum of 1 files");
                return
            }
            setTransactionFiles((file)=>[...file, files]);
        }catch(error){
            console.log(error)
            return;
        }
    }
    useEffect(() => {
        let token = localStorage.getItem("token");
        if(pageType.type === 'Train'){
            const checkTrainingUsers = async () => {
                try{
                    const response = await axios.get("http://localhost:4000/latest-training-session", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }});
                    if(response.data.length > 0){
                        const decoded = jwtDecode(token);
                        let clientIds = response.data[0].client_id
                        setRounds(response.data[0].training_rounds)
                        setClientId(decoded.id)
                        setSessionId(response.data[0].session_id)
                        setTrainingAbility((clientIds.split(",")).includes((decoded.id).toString()));
                    }
                } catch (error){
                    console.error("Check Training Ability Error", error);
                }
            }
            checkTrainingUsers();
        } else if(pageType.type === 'Predict'){
            const checkWeightPath = async () => {
                try{
                    const response = await axios.get("http://localhost:4000/latest-model-weights", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }});
                    console.log(response)
                    if(response.data.length > 0){
                        setWeightPath(response.data[0].weight_path)
                        console.log(weightPath)
                    }
                } catch (error){
                    console.error("Check Training Ability Error", error);
                }
            }
            checkWeightPath();
        }
      }, [responseData, pageType]);

      async function makeReq(files, type){
        const file= new FormData();
        for(let i=0;i<files.length;i++){
            file.append('file', files[i])
        }
        let url = '';

        if(type === 'Predict'){
            url = 'http://localhost:4000/prediction';
            file.append('weight_path', weightPath); // your integer value
        }else{
            url = 'http://localhost:4000/upload';
            file.append('rounds', rounds); // your integer value
            file.append('id', clientId); // your integer value
            file.append('session', sessionId); // your integer value
        }
        setLoading(true);

        await axios.post(url, file)
        // .then(response => response.json())
        .then(data => {
            setResponseData(data.data);
        })
        .catch(error => {
            if(error?.response?.data?.['Error'] === "Missing required features"){
                alert(error?.response?.data?.['Error'])
            }
            console.log(error);
        })
        .finally(()=>setLoading(false));
    }
  return (
    <div className="upload-container">
        {loading && (
            <div className="loading-overlay">
                <img src={loader} alt="Loading..." />
            </div>
        )}
        
        <div className={`upload-area ${dragging ? 'dragging' : ''}`}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDrop={dragDrop}>
            <label className="upload-label" htmlFor="sip">
                <p className="upload-text">
                    {dragging ? 'Drop File' : `Click to Upload or Drag and Drop file FOR ${pageType.name}`}
                </p>
                <input
                    id="sip"
                    type="file"
                    name="file"
                    onChange={onSelectFile}
                    accept=".csv"
                    hidden
                    multiple
                    ref={fileRef}
                />
            </label>
        </div>

        <div className="file-preview-container">
            {transactionFiles.map((file, index) => (
                <div className="file-preview" key={index}>
                    <button
                        className="delete-button"
                        onClick={() => imageDelete(index)}
                        aria-label="Delete file"
                    >
                        ×
                    </button>
                    <img src={fileImg} alt="File preview" />
                </div>
            ))}
        </div>

        <button
            className="analyze-button"
            onClick={() => makeReq(transactionFiles, pageType.type)}
            disabled={((pageType.type  === 'Predict' && !weightPath) || transactionFiles.length < 1) || ((pageType.type  === 'Train' && !trainingAbility) || transactionFiles.length < 1)}
        >
            {pageType.type}
        </button>

        {Object.keys(responseData).length > 0 && (
            <div className="results-container">
                {pageType.type === 'Predict' ? (
                    <>
                        <div className="fraud-table">
                            <h3>Fraud Analysis Results</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Number of cases</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Fraud</td>
                                        <td>{responseData.fraud}</td>
                                    </tr>
                                    <tr>
                                        <td>Not-Fraud</td>
                                        <td>{responseData['not-fraud']}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="graph-container">
                            <Bar
                                data={{
                                    labels: ['Fraud', 'Not-Fraud'],
                                    datasets: [{
                                        label: 'Transaction Results',
                                        data: [responseData.fraud, responseData['not-fraud']],
                                        backgroundColor: [
                                            "rgba(220, 53, 69, 0.8)",
                                            "rgba(40, 167, 69, 0.8)",
                                        ],
                                        borderRadius: 5,
                                    }],
                                }}
                                options={{
                                    plugins: {
                                        title: {
                                            text: 'Transaction Result Distribution',
                                        },
                                    },
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="evaluation-table">
                        <h3>Model Evaluation Metrics</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Accuracy</td>
                                    <td>{(responseData['binary_accuracy'] * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>Precision</td>
                                    <td>{(responseData['precision'] * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>Recall</td>
                                    <td>{(responseData['recall'] * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>AUC</td>
                                    <td>{(responseData.auc * 100).toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
    </div>
  )
}

export default Upload