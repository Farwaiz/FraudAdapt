import React, { useState, useRef, useEffect } from 'react';
import {defaults } from "chart.js/auto";
import { Bar, Line } from 'react-chartjs-2';
import fileImg from '../images/fileImg.png'
import loader from '../images/loader.gif'
import axios from 'axios';

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 20;
defaults.plugins.title.color = "black";

function Upload({name, pageType}) {
    const [transactionFiles,setTransactionFiles] = useState([]);
        const [dragging, setDragging] = useState(false);
        const [responseData,setResponseData] = useState([]);
        const fileRef = useRef(null);
        const [loading,setLoading] = useState(false);
     async function onSelectFile(event){
            const files = event.target.files[0];
            if (transactionFiles.length === 1){
                alert("Maximum of 1 files");
                return
            }
            setTransactionFiles((file)=>[...file, files]);
            console.log(files)
        }
        function imageDelete(index){
            setTransactionFiles((previousImages)=> 
                previousImages.filter((_,i) => i !== index)
            )
            console.log(transactionFiles)
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
                const files = event.target.files[0];
                if (transactionFiles.length === 1){
                    alert("Maximum of 1 files");
                    return
                }
                setTransactionFiles((file)=>[...file, files]);
            }catch(error){
                return;
            }
        }
        useEffect(() => {
            if (responseData) {
              console.log('Updated responseData:', responseData);
              console.log(responseData.length)
            }
          }, [responseData]);

          async function makeReq(files, type){
            console.log('hi')
            const file= new FormData();
            for(let i=0;i<files.length;i++){
                file.append('file', files[i])
            }
            console.log(file.get('file'))
            console.log(transactionFiles)
            console.log(transactionFiles[0])
            let url = '';
            console.log(type)
            if(type === 'Predict'){
                url = 'http://localhost:4000/prediction';
            }else{
                url = 'http://localhost:4000/upload';
            }
            setLoading(true);
            console.log('loading')
            console.log(loading)
            await axios.post(url, file)
            // .then(response => response.json())
            .then(data => {
                console.log("data")
                console.log(data)
                if(data){
                    setResponseData(data.data);
                }
                console.log('responseData');
                console.log(responseData);
            })
            .catch(error => {
                console.log(error);
            })
            .finally(()=>setLoading(false));
            console.log('loading')
            console.log(loading)
        }
        //     fetch(url, {
        //         method: 'POST',
        //         body: file,
               
        //      })
        //     .then(response => response.json())
        //     .then(data => {
        // }
  return (
    <div>
        <div id={loading ? 'loading' : 'notLoading'}>
            <img src={loader} alt='loading' />
        </div>
        <div className='top'>
            <div className='container' onDragOver={dragOver} onDragLeave={dragLeave} onDrop={dragDrop}>
                <label htmlFor='sip' >
                    {
                        dragging 
                        ? <p style={{margin:'auto'}}>Drop Image</p> 
                        : <p style={{margin:'auto'}}>Click to Upload or Drag and Drop file <strong>FOR {pageType.name}</strong></p>
                    }
                <input id='sip' type="file" name="file" onChange={onSelectFile} accept=".csv" placeholder='Hello' hidden multiple ref={fileRef}/>
                </label>
                
            </div>
            <div className='imgContainer'>
                {
                    transactionFiles.map((image,index)=>
                        <div className='image' key={index}>
                            <span className='delete' onClick={()=>imageDelete(index)}>&times;</span>
                            <img src={fileImg} alt='dataset'/>
                        </div>
                    )
                }
            </div>
            <button className='analyze' onClick={()=>makeReq(transactionFiles,pageType.type)} disabled={transactionFiles.length < 1}>{pageType.type}</button>
        </div>
        <div className={Object.keys(responseData).length>0 ? 'charts' : 'nocharts'}>
            <div className='fraud-table'>
                <h3>Fraud Table</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Number of cases</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Fraud</td><td>{responseData.fraud}</td></tr>
                        <tr><td>Not-Fraud</td><td>{responseData['not-fraud']}</td></tr>
                    </tbody>
                </table>
            </div>
            <div className='graph'>
                <Bar
                    data={{
                        labels: ['fraud', 'not-fraud'],
                        datasets: [
                        {
                            label:  'Transaction Results',
                            data: [responseData.fraud, responseData['not-fraud']],
                            backgroundColor: [
                            "rgba(43, 63, 229, 0.8)",
                            "rgba(250, 192, 19, 0.8)",
                            ],
                            borderRadius: 5,
                        },
                        ],
                    }}
                    options={{
                        plugins: {
                        title: {
                            text: 'Transaction Result',
                        },
                        },
                    }}
                />
            </div>
        </div>
    </div>
  )
}

export default Upload