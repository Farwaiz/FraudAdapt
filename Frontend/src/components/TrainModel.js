import React from 'react'
import Upload from './Upload.js'
import Navigation from '../navbar/navbar.js';
import Authentication from "./authentication.js";

function TrainModel() {
  return (
    <Authentication>
      <div>
          <Navigation></Navigation>
          <Upload pageType={{name:'TRAINING MODEL', type:'Train'}} />
      </div>
    </Authentication>
  )
}

export default TrainModel