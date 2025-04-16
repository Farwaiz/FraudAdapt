import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"; 
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const { register, formState: { errors }, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  // const apiUrl = process.env.API_URL;

  const onSubmit = async (data) => {
    console.log(data);
    // return false;
    try {
      const response = await axios.post("http://localhost:4000/authentication", {
        email: data.email,
        password: data.password
      });
  
      const result = response.data;
  
      // Assuming result.token contains the JWT
      window.localStorage.setItem("token", result.token);
      window.localStorage.setItem("login", "true");
      window.dispatchEvent(new Event("storage"));
      // alert("Login successful!");
      setTimeout(() => {
        // alert("Login successful!");
        window.location.href = "/"; // Forces full page reload
      }, 1000);
  
    } catch (error) {
      console.error("Login error:", error);
  
      if (error.response && error.response.data) {
        alert(error.response.data.error || "Invalid credentials");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="container1">
      <div className="login-card">
        <h2 className="title">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            className="login-input"
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", { required: true })}
              className="login-input"
            />
  
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}
