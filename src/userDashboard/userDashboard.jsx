import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFileAlt,
  faFilePdf,
  faFileImage,
  faSearch,
  faSort,
  faUpload,
  faEllipsisV, faCheckCircle, faShareAlt, faShareSquare
} from "@fortawesome/free-solid-svg-icons";

import { ClipLoader } from "react-spinners"; // Import red loader
import "./UserDashboard.css";
import NavigationBar2 from "../components/NavigationBar2";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import getDecodedToken from "./auth";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
const UserDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [selectedDocumentName, setSelectedDocumentName] = useState("");
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSharing, setIsSharing] = useState(false); // State for loader
  const [shareInfoDialogOpen, setShareInfoDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [sharedDocInfo, setSharedDocInfo] = useState(null);
  var name = localStorage.getItem("name");
  var useremail = localStorage.getItem("email");
  useEffect(() => {
    // Decode the JWT token
    const token = localStorage.getItem("authtoken");
    console.log("token before decoding :    " + token);
    if (token !== null) {
      const token1 = token;
      console.log("token before decoding in loop :    " + token1);
      const decodedToken = getDecodedToken(); // Decode the token
      console.log("token after decoding :    " + decodedToken);
      setUser(decodedToken);
    }
    fetchDocuments();
  }, []);

  console.log("user decode ", user);
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("authtoken");
      console.log(token);
      const response = await axios.get(
        "http://localhost:8080/api/document/getAllDocument",
        {
          params: { uploadedBy: name, uploaderEmail: useremail },
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Failed to fetch documents. Please try again later.");
    }
  };
  const handleMenuClick = (e, doc) => {
    setAnchorEl(e.currentTarget);  // Set the anchor to the clicked icon
    setSelectedDoc(doc);  // Set the selected document
  };

  const handleMenuClose = () => {
    setAnchorEl(null);  // Close the menu by setting anchorEl to null
    setSelectedDoc(null);  // Reset selectedDoc
  };
  const formatFileType = (mimeType) => {
    const fileTypeMap = {
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.ms-excel": "XLS",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
      "text/plain": "TXT",
      "image/png": "PNG",
      "image/jpeg": "JPG",
      "image/jpg": "JPG",
      "image/gif": "GIF",
      "image/svg+xml": "SVG",
      "application/zip": "ZIP",
      "application/x-rar-compressed": "RAR",
    };

    return fileTypeMap[mimeType] || mimeType.toUpperCase();
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("authtoken");

    // Validate file type and size
    if (file.type.startsWith("video/")) {
      alert("Video files are not allowed!");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size cannot be larger than 2MB!");
      event.target.value = "";
      return;
    }

    console.log("username :   " + name);
    console.log("usermail...: " + useremail);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", name);
    formData.append("uploaderEmail", useremail);

    try {
      console.log(localStorage.getItem("authtoken"));
      const token = localStorage.getItem("authtoken");
      console.log("this is my jwt token :    " + localStorage.getItem("authtoken"));
      await axios.post("http://localhost:8080/api/document/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log(token);
      fetchDocuments();
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }

    event.target.value = "";
  };


  const deleteDocument = async (id) => {
    try {
      const token = localStorage.getItem("authtoken");

      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }

      const res = await axios.delete(`http://localhost:8080/api/document/deleteDocument/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      fetchDocuments();
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error.response || error.message);
      alert("Failed to delete file.");
    }
  };


  const handleDownload = async (docId) => {
    const token = localStorage.getItem("authtoken");
    const fileUrl = `http://localhost:8080/api/document/download/${docId}`;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    try {
      const response = await fetch(fileUrl, { headers });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docId; // You can customize the filename here
      link.click();
      window.URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };


  // Preview file
  const handlePreview = async (doc) => {
    try {
      const token = localStorage.getItem("authtoken"); // Retrieve JWT token

      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }

      const fileUrl = `http://localhost:8080/api/document/download/${doc.id}`;
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const response = await fetch(fileUrl, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      const fileType = doc.type;

      const previewWindow = window.open("", "_blank");
      if (!previewWindow) {
        alert("Please allow pop-ups to preview the document.");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);

      if (fileType === "application/pdf") {
        previewWindow.document.write(`<embed src="${objectUrl}" width="100%" height="600px" type="application/pdf" />`);
      } else if (fileType.startsWith("image/")) {
        previewWindow.document.write(`<img src="${objectUrl}" alt="${doc.name}" width="50%" height="auto"/>`);
      } else if (fileType === "text/plain") {
        const text = await blob.text();
        previewWindow.document.write(`<pre>${text}</pre>`);
      } else {
        previewWindow.document.write(`
          <p>Preview is not available for this file type. You can download it below:</p>
          <a href="${objectUrl}" download="${doc.name}">Download File</a>
        `);
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      alert("Failed to preview file.");
    }
  };


  // Toggle sort order
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    const sortedDocuments = [...documents].sort((a, b) => {
      // Parse dates properly
      const dateA = new Date(a.uploadedAt); // Assuming 'uploadedAt' is the date field
      const dateB = new Date(b.uploadedAt);

      // Ensure the dates are valid
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0; // Return 0 to avoid sorting if date is invalid
      }

      return newSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setDocuments(sortedDocuments);
    setSortOrder(newSortOrder);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return faFilePdf;
      case "txt":
        return faFileAlt;
      case "jpg":
      case "png":
      case "jpeg":
        return faFileImage;
      default:
        return faFileAlt;
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("Invalid or missing date:", dateString);
      return "Invalid Date"; // Return a fallback value for invalid dates
    }

    // If the date string contains a microsecond and timezone, we remove it
    const sanitizedDate = dateString.split(".")[0]; // Safely handle the split
    const date = new Date(sanitizedDate);

    // Check if date is valid
    if (isNaN(date)) {
      console.error("Invalid date format:", dateString);
      return "Invalid Date";
    }

    return date.toLocaleString();
  };

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleOpenSharePopup = (docId, docName) => {
    setSelectedDocumentId(docId);
    setSelectedDocumentName(docName); // Set the document name
    setIsSharePopupOpen(true);
  };

  const handleCloseSharePopup = () => {
    setIsSharePopupOpen(false);
    setEmail("");
    setEmailError("");
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(value) ? "" : "Invalid email address");
  };

  const handleShareDocument = async () => {
    if (!email || emailError) {
      alert("Please enter a valid email address.");
      return;
    }
    const onClose = () => {
      setOpen(false); // Close the popup
    };

    setIsSharing(true); // Show red loader
    const token = localStorage.getItem("authtoken"); // ******************

    try {
      // Call the API to share the document
      await axios.post(
        "http://localhost:8080/api/document/share",
        {
          documentId: selectedDocumentId,
          sharedWith: email,
          documentName: selectedDocumentName,
          sharedBy: name,
          sharedAt: "2024-12-08T10:00:00",

        },
        {
          headers: {
            "Authorization": `Bearer ${token}`, // ****************** Add token to the headers
          },
        }
      );
      alert("Document shared successfully!");
      handleCloseSharePopup();
    } catch (error) {
      console.error("Error sharing document:", error);
      alert("Failed to share document. Please try again.");
    } finally {

      setIsSharing(false); // Hide red loader after completion
    }
  };


  const handleViewShareInfo = (doc) => {
    // Show sharing info dialog when document is shared
    setSharedDocInfo({
      sharedBy: doc.sharedBy,
      sharedAt: doc.sharedAt,
    });
    setShareInfoDialogOpen(true);
  };

  const handleCloseShareInfoDialog = () => {
    setShareInfoDialogOpen(false);
    setSharedDocInfo(null);
  };
  return (
    <div className="user-dashboard-container">
      <NavigationBar2 />
      <header className="user-dashboard-header">
        <h1>User Dashboard</h1>
        <p>Manage your documents securely.</p>
      </header>

      <main className="user-dashboard-main">
        {/* Upload Section */}
        <section className="user-dashboard-upload-section">
          <label className="upload-button">
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload File</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="upload-input"
            />
          </label>
        </section>

        {/* Search and Sort Section */}
        <section className="user-dashboard-sort-search">
          <div className="search-sort-container">
            <button className="sort-button" onClick={toggleSortOrder}>
              <FontAwesomeIcon icon={faSort} />
              {sortOrder === "asc" ? " Ascending" : " Descending"}
            </button>
            <div className="search-input-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search files by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </section>

        {/* File List Section */}
        <section className="user-dashboard-file-list">
          {filteredDocuments.length === 0 ? (
            <p>No documents available.</p>
          ) : (
            <table className="file-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Date Uploaded</th>
                  <th>File Type</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      {doc.name}
                      {doc.shared && (
                        <FontAwesomeIcon
                          icon={faShareSquare}
                          className="shared-icon"
                          title="Shared with you"
                          style={{ marginLeft: '90px' }}
                          onClick={() => handleViewShareInfo(doc)}
                        />
                      )}
                    </td>
                    <td>{formatDate(doc.uploadedAt)}</td>
                    <td>
                      <FontAwesomeIcon icon={getFileIcon(doc.type)} /> {formatFileType(doc.type)}
                    </td>
                    <td>{formatFileSize(doc.size)}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className="action-icon"
                        onClick={(e) => handleMenuClick(e, doc)}
                      />
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedDoc === doc}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handlePreview(doc)}>Preview</MenuItem>
                        {/* Add the download option */}
                        <MenuItem onClick={() => handleDownload(doc.id)}>Download</MenuItem>
                        {!doc.shared && [
                          <MenuItem key="share" onClick={() => handleOpenSharePopup(doc.id, doc.name)}>Share</MenuItem>,
                          <MenuItem key="delete" onClick={() => deleteDocument(doc.id)}>Delete</MenuItem>
                        ]}
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Share Document Popup */}
      <Dialog open={isSharePopupOpen} onClose={handleCloseSharePopup}>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            fullWidth
            error={!!emailError}
            helperText={emailError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSharePopup} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleShareDocument}
            color="primary"
            disabled={isSharing || !email || emailError}
          >
            {isSharing ? (
              <ClipLoader size={18} color="green" /> // Green loader
            ) : (
              <>
                <FontAwesomeIcon icon={faShareAlt} style={{ marginRight: "8px" }} />
                Share
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Document Info Dialog */}
      <Dialog open={shareInfoDialogOpen} onClose={handleCloseShareInfoDialog}>
        <DialogTitle>Shared Document Info</DialogTitle>
        <DialogContent>
          <p><strong>Shared By:</strong> {sharedDocInfo?.sharedBy}</p>
          <p><strong>Shared At:</strong> {formatDate(sharedDocInfo?.sharedAt)}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareInfoDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
