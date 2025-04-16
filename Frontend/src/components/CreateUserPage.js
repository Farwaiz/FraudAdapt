import React, { useState, useEffect } from 'react';
import './CreateUserPage.css'; // CSS file for styling
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function CreateUserPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (validate()) {
      try{
        const response = await axios.post("http://localhost:4000/create-user", {
          name : formData.name,
          password : formData.password,
          email : formData.email,
          userTypeId : 2 
        });
        console.log("Form submitted:", formData);
        console.log(response)
        alert(response.data.message);
        setFormData({ name: '', email: '', password: '' });
      } catch(error){
        console.log(error)
      }
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.userStatus === "new"){
          setFormData(data => ({
            ...data,
            email: decoded.email
          }));
        }else{
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token", error);
        navigate("/login");
      }
    }else{
      navigate("/login");
    }
  }, [navigate])
  
  return (
    <div className="create-container">
      <h2>Create User</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
            placeholder="Enter your email address"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit">Create User</button>
      </form>

      <div className="security-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
          <path d="M12 11l4 4" />
          <path d="M8 11l8 8" />
        </svg>
        Your information is secure and encrypted
      </div>
    </div>
  );
}

export default CreateUserPage;
