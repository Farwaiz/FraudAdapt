import Navigation from './navbar/navbar.js';
import FraudPrediction from './components/FraudPrediction.js';
import TrainModel from './components/TrainModel.js';
import {BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Login from './components/Login.js';
import './App.css';

function App() {
  return (
    <div>
    <BrowserRouter>
      <Navigation></Navigation>
      <Routes>
        <Route path="/"
            element={<FraudPrediction />} />
        <Route path="/ModelTraining"
            element={<TrainModel />} />
        
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
