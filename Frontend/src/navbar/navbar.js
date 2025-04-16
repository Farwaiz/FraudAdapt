// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './navbar.css';
import { jwtDecode } from "jwt-decode";
import logo from '../images/logo.png';  // Updated to use .png instead of .svg

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (linkPath) => location.pathname === linkPath;
  
  // Check the pages which we should not be in 
  const isAuthPage = location.pathname === '/CreateUserPage' || location.pathname === '/login';
  const [userType, setUserType] = useState(null);
  useEffect(()=>{
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

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const openMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <img 
            src={logo}
            alt="FraudAdapt Logo" 
            className="FraudAdapt-logo"
          />
          <h1 className="FraudAdapt-name">FraudAdapt</h1>
        </div>

        {!isAuthPage && userType!==1 && (
          <>
            <button 
              className="mobile-menu-button"
              onClick={openMenu}
              aria-label="Toggle navigation menu"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>

            <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Fraud Prediction
              </Link>
              <Link 
                to="/ModelTraining" 
                className={`nav-link ${isActive('/ModelTraining') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Model Training
              </Link>
            </nav>
          </>
        )}
        <div className="logout-container" onClick={() => logout()}>
          <h4 className="logout-name">Logout</h4>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
