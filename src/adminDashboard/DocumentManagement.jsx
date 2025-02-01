import React, { useState } from "react";
import "./styles.css";

function DocumentManagement() {
  // Preloaded documents (these should be passed from the User Dashboard page in a real application)
  const [documents, setDocuments] = useState([
    {
      title: "ProjectReport.pdf",
      description: "Final project report for Q4",
      uploadedAt: "06/12/2024, 9:30 AM",
    },
    {
      title: "MeetingMinutes.docx",
      description: "Minutes of the last team meeting",
      uploadedAt: "05/12/2024, 2:15 PM",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedDocument, setEditedDocument] = useState({ title: "", description: "" });

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedDocument(documents[index]);
  };

  const handleSaveEdit = () => {
    const updatedDocuments = [...documents];
    updatedDocuments[editingIndex] = editedDocument;
    setDocuments(updatedDocuments);
    setEditingIndex(null);
    setEditedDocument({ title: "", description: "" });
  };

  const handleDeleteDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Document Management</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Uploaded At</th>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document, index) => (
              <tr key={index}>
                <td>{document.uploadedAt}</td>
                <td>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editedDocument.title}
                      onChange={(e) =>
                        setEditedDocument({ ...editedDocument, title: e.target.value })
                      }
                    />
                  ) : (
                    document.title
                  )}
                </td>
                <td>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editedDocument.description}
                      onChange={(e) =>
                        setEditedDocument({
                          ...editedDocument,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    document.description
                  )}
                </td>
                <td className="file-actions">
                  {editingIndex === index ? (
                    <>
                      <button className="btn btn-success" onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEditClick(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteDocument(index)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No documents found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentManagement;
