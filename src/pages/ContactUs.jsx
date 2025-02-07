import React, { useState } from "react";
import { toast } from "react-toastify"; 
import "./ContactUs.css";
import NavigationBar from "../components/NavigationBar";

const FancyContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
 
  const [showContactInfo, setShowContactInfo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/contactus/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      toast.dismiss(); // Close any existing toast before showing a new one

      if (response.ok) {
        toast.success("Your message has been submitted successfully!");
        setFormData({ name: "", email: "", message: "" }); // Clear form
      } else {
        toast.error("Failed to submit your message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error with the submission. Please try again.");
    }
  };

  return (
    <>
      <NavigationBar />

      <div className="fancy-contact-us-container">
        <h1 className="fancy-title">We'd Love to Hear from You</h1>
        <p className="fancy-subtitle">Drop us a message and we’ll get back to you soon!</p>

        <div className="fancy-form-container">
          <form onSubmit={handleSubmit}>
            <div className="fancy-form-field">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="fancy-input"
                placeholder=" "
              />
              <label className="fancy-label">Full Name</label>
            </div>
            <div className="fancy-form-field">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="fancy-input"
                placeholder=" "
              />
              <label className="fancy-label">Email Address</label>
            </div>
            <div className="fancy-form-field">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="fancy-textarea"
                placeholder=" "
              />
              <label className="fancy-label">Your Message</label>
            </div>
            <button type="submit" className="fancy-submit-button">Send Message</button>
          </form>
        </div>

        <button
          className="fancy-contact-toggle"
          onClick={() => setShowContactInfo(!showContactInfo)}
        >
          {showContactInfo ? "Hide Contact Info" : "Show Contact Info"}
        </button>

        {showContactInfo && (
          <div className="fancy-contact-info">
            <h2>Our Contact Details</h2>
            <p>📞 <span>+91 9147946920</span></p>
            <p>✉️ <span>support@trustvault.com</span></p>
          </div>
        )}
      </div>
    </>
  );
};

export default FancyContactUs;
