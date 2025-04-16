import React from 'react'
import Upload from './Upload.js'
import Navigation from '../navbar/navbar.js';
import Authentication from "./authentication.js";

function FraudPrediction() {

  return (
    <Authentication>
      <div>
        <Navigation></Navigation>
        <Upload pageType={{name:'PREDICTING FRAUD', type:'Predict'}} />
      </div>
    </Authentication>
  )
}

export default FraudPrediction