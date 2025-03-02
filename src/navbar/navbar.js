// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import '../App.css';
import { useLocation, Link } from 'react-router-dom';

function Navigation() {
  const location =useLocation();

  function isActive(linkPath) {
    return location.pathname === linkPath;
  };
  return (
  <div>
      <div style={{display:'flex',width:'100%',backgroundColor:'#034562'}}>
        <div style={{width:'30vw',margin:'auto'}}>
            <span style={{display:'flex', fontFamily:'inter',fontSize:'large',float: 'left',width: '30vw',color:'#fff',/*backgroundColor: '#796D6D',*/margin: '10px 0px',padding: '0.2% 0%',height: 'fit-content',justifyContent: 'center',borderRadius:'15px'}}>
                FraudAdapt
            </span>
        </div>
        <nav style={{display:'flex',float: 'right',flexDirection:'row',alignItems:'center',width:'60vw',/*justifyContent:"space-around",*/margin:'10px'}}>
          <div className='navigation-link-bar' style={{display:'flex',width:'20vw', justifyContent:'space-evenly', }}>
            <Link to='/' id='predictionPage' style={{color: isActive('/') ? 'white' : 'white'}}>Fraud Prediction</Link>
            <Link to='/ModelTraining' id='trainingPage' style={{color: isActive('/ModelTraining') ? 'white' : 'white'}}>Model Training</Link>
          </div>
        </nav>
      {/* <div className='userIcon' style={{backgroundImage:'url("logo.svg")',backgroundColor:'rgba(255, 255, 255, 0.6)',width:'25px',height:'25px', borderRadius: '50%',margin: 'auto'}}>

      </div> */}
      
    </div>
    
    </div>
  );
}

export default Navigation;
