import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import NavigationBar2 from "../components/NavigationBar2";
import NavigationBar3 from "../components/NavigationBar3";


const ProfilePage = () => {

  const [authtoken, setAuthToken] = useState(localStorage.getItem("authtoken"));
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email"));
  // Retrieve role and email from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // State to manage profile data; initially null until fetched from backend
  const [user, setUser] = useState(null);
  // Edited user for form changes
  const [editedUser, setEditedUser] = useState(null);
  // Manage form editing mode
  const [isEditing, setIsEditing] = useState(false);
  // Validation errors state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Regex patterns for validation
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const phoneRegex = /^\+?\d{10,15}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[#@$*]).{6,20}$/;

  // Fetch user profile data from backend when component mounts
  useEffect(() => {
    const emailFromStorage = localStorage.getItem("email");
    setUserEmail(emailFromStorage);
    if (emailFromStorage) {
      axios.get(`http://localhost:8080/by-email?email=${emailFromStorage}`,
      {headers:{Authorization: `Bearer ${authtoken}`}})
        .then((response) => {
          setUser(response.data);
          setEditedUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
      } 
      else {
        console.error("No email found in localStorage");
    }
  }, [authtoken]);

    // Handle file input change to update profilePicture (as a Base64 string)
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditedUser({ ...editedUser, profilePicture: reader.result });
        };
        reader.readAsDataURL(file);
      }
    };

  // Handle input changes and validate fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = { ...editedUser, [name]: value };
    setEditedUser(updatedUser);
    validateField(name, value);
  };

  // Validate individual fields
  const validateField = (fieldName, value) => {
    let errorMessage = '';
    switch (fieldName) {
      case 'name':
        if (!value.match(nameRegex)) errorMessage = 'Name must contain only letters and spaces.';
        break;
      case 'email':
        if (!value.match(emailRegex)) errorMessage = 'Enter a valid email address.';
        break;
      case 'phone':
        if (!value.match(phoneRegex)) errorMessage = 'Phone number must be between 10 and 15 digits.';
        break;
      case 'password':
        // Only validate password if a value is provided (e.g., when updating it)
        if (value && !value.match(passwordRegex))
          errorMessage = 'Password must be 6-20 characters, include a letter, number, and special character.';
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: errorMessage }));
  };

  // Check if the form is valid
  const isFormValid = () => {
    // Ensure there are no errors and all fields (except password if not changed) are non-empty
    return (
      Object.values(errors).every((error) => error === '') &&
      editedUser &&
      editedUser.name.trim() !== '' &&
      editedUser.email.trim() !== '' &&
      editedUser.phone.trim() !== ''
    );
  };

  // Save changes by calling the backend API
  const saveChanges = () => {
    if (!isFormValid()) {
      return;
    }
    const roleFromStorage = localStorage.getItem("role");
    const updatedUser = { ...editedUser, role: roleFromStorage };
    // Send updated data to the backend using the email as identifier
    axios.put(`http://localhost:8080/by-email?email=${userEmail}`,
      updatedUser,
      {headers:{Authorization: `Bearer ${authtoken}`}}
    )
      .then((response) => {
        setUser(response.data);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating user data:", error);
      });
  };

  // Toggle edit mode; if saving, call the saveChanges function
  const toggleEditMode = () => {
    if (isEditing) {
      // Attempt to save changes if the form is valid
      saveChanges();
    } else {
      setIsEditing(true);
    }
  };

  // While user data is being fetched, show a loading message
  if (!user || !editedUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-dashboard-container">
      {role && (role === "ROLE_ADMIN" ? <NavigationBar3 /> : <NavigationBar2 />)}
      
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h2>{isEditing ? 'Edit Profile' : 'Profile'}</h2>
            <button
              className="btn btn-edit"
              onClick={toggleEditMode}
              disabled={isEditing && !isFormValid()} // Prevent saving invalid data
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-picture">
            <img src={user.profilePicture || '/default-profile.png'} alt="Profile" />
              {isEditing && (
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                />
              )}
            </div>

            <div className="profile-info">
              <div className="profile-info-item">
                <label>Name</label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="error-message">{errors.name}</p>}
                  </>
                ) : (
                  <p>{user.name}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Email</label>
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      disabled
                    />
                    <p className="error-message"> Note: Email cannot be changed </p>
                  </>
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <p className="error-message">{errors.phone}</p>}
                  </>
                ) : (
                  <p>{user.phone}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editedUser.bio || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{user.bio || 'No bio available.'}</p>
                )}
              </div>

              <div className="profile-info-item">
                <label>Password</label>
                {isEditing ? (
                  <>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter new password if you wish to change"
                      value={editedUser.password || ''}
                      onChange={handleChange}
                    />
                    {errors.password && <p className="error-message">{errors.password}</p>}
                  </>
                ) : (
                  <p>**********</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
