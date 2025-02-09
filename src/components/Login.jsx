
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';
import { ClipLoader } from "react-spinners"; // Import green loader

import "../Styles/Login.css";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState(""); 
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResendOtp, setShowResendOtp] = useState(false); // Flag to show Resend OTP button
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Show loader


    try {
      const response = await axios.post("http://localhost:8080/users/signin", {
        email: loginData.email,
        password: loginData.password,
      });

      if (response.data) {
        setIsOtpSent(true);
        setErrorMessage("");
        toast.success("OTP sent to your email.");
      } else {
        toast.error("Invalid email or password!");
      }
    } catch (error) {
      toast.error("Invalid email or password!");
    } finally {
      setIsSubmitting(false); // Hide loader after response
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Show loader


    try {
      const response = await axios.post(
        "http://localhost:8080/otp/verifyotp",
        {
          email: loginData.email,
          otp: otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",  // 👈 Explicitly request JSON response
          },
        }
      );

      if (response.data && response.data.success) {
        toast.success("Login Successful!");
        localStorage.setItem("authtoken", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("loggedIn", true);

        setTimeout(() => {
          if (response.data.role === "ROLE_ADMIN") {
            navigate("/AdminDashboard");
          } else {
            navigate("/UserDashboard");
          }
        }, 1000);  
      } else {
        setErrorMessage("Invalid OTP!");
        setShowResendOtp(true);
      }
    } catch (error) {
      setErrorMessage("Invalid OTP!");
      setShowResendOtp(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    console.log("Resending OTP...");

    try {

      await axios.post(`http://localhost:8080/sendOtp/${loginData.email}`);

      toast.success("New OTP sent to your email.");

      setShowResendOtp(false);

    } catch (error) {

      toast.error("Error sending OTP.");

    }

  };

  return (
    <div className="login">
      <h2 style={{ color: 'black' }}>Welcome Back!</h2>
      <p className="text-gray-600">Please sign in to your account</p>
      {errorMessage && <p className="error">{errorMessage}</p>}

      {!isOtpSent ? (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting} // Disable input during submission
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          {/* Sign In button with green loader */}

          <button type="submit" className="btn" disabled={isSubmitting}>

            {isSubmitting ? <ClipLoader size={20} color={"#28a745"} /> : "Sign In"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={handleOtpChange}
            required
          />
          <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? <ClipLoader size={20} color={"#28a745"} /> : "Verify OTP"}
          </button>
        </form>
      )}

      {showResendOtp && (
        <button className="resend-otp" onClick={handleResendOtp} disabled={isSubmitting}>
          Resend OTP
        </button>
      )}

      <p>
        Don't have an account? <Link to="/signup">Register here</Link>.<br />
        Forgot password? <Link to="/forgot-password">Click here</Link>.
      </p>
    </div>
  );
};

export default Login;
