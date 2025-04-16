import FraudPrediction from './components/FraudPrediction.js';
import { useEffect, useState } from 'react';
import TrainModel from './components/TrainModel.js';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './components/Login.js';
import CreateUserPage from './components/CreateUserPage.js';
import AdminHome from './components/AdminHome.js';
import './App.css';
import { jwtDecode } from "jwt-decode";

function App() {
  const [userType, setUserType] = useState(null);
  useEffect(()=>{
    window.dispatchEvent(new Event("storage"));
    let token = localStorage.getItem("token");
    try{
      if (token) {
        const decoded = jwtDecode(token);
        if (parseInt(decoded.userType) === 2){
          setUserType(2);
        } else {
          setUserType(1)
        }
      } else {
        setUserType(1)
      }
    } catch(error){
      setUserType(1)
    }
  }, [])

  // useEffect(() => {
  //   if (userType !== null) {
  //     console.log("@updated userType:", userType);
  //   }
  // }, [userType]);
 
  if (userType === null) {
    return <div>Loading...</div>; // or a spinner
  }
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {userType === 1 && ( <Route path="/" element={<AdminHome />} /> )} 
          {userType === 2 && ( <Route path="/" element={<FraudPrediction />} /> )}
          <Route path="/CreateUserPage"
              element={<CreateUserPage />} />
          <Route path="/ModelTraining"
              element={<TrainModel />} />
          <Route path="/login"
              element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
