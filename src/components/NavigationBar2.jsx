import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar2.css";

const NavigationBar2 = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Check if user is logged in when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("authtoken");
    if (token) {
      setIsLoggedIn(true);
      const email = localStorage.getItem("email"); 
      setUserEmail(email);
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authtoken"); 
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.setItem("loggedIn", false);
    navigate("/login", {replace: "true"});
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/AdminDashboard">TrustVault</Link>
      </div>
      <ul className="navbar-links">
        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        ) : (
          <>
            <li className="profile-container" onClick={toggleDropdown}>
              <button className="profile-button">Profile</button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <p style={{ color: 'white',margin:'15px' }}>{userEmail}</p>
                  <Link to="/ProfilePage">
                    <button className="dropdown-item">Profile Page</button>
                  </Link>
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          </>
        )}
        <li>
          <Link to="/about">About Us</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar2;
