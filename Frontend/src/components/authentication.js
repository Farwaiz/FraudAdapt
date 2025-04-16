import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Authentication = ({ children }) => {
//   const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
//   const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
        let token = localStorage.getItem("token");

        if(token){
            try{
                const response = await axios.get("http://localhost:4000/authorize", {
                headers: {
                    Authorization: `Bearer ${token}`
                }});
                console.log(response);
            } catch (error){
                console.error("Authorization failed", error);
                navigate("/login");
            } finally {
                // setChecking(false);
            }
        } else{
            navigate("/login");
        }
    }
    checkAuth();
  }, [navigate]);


//   if (checking) return ;

  return children;
};

export default Authentication;
