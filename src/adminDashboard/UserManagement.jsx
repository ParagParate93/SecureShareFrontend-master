import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/getalluser");
      setUsers(response.data);
    } catch (error) {
      console.error("There was an error fetching the users!", error);
    }
  };

  // Delete user by ID
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/delete/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("There was an error deleting the user!", error);
    }
  };

  // Edit user (set the user data for updating)
  const handleEditUser = (id) => {
    const user = users.find((u) => u.id === id);
    setEditingId(id);
    setNewUser({ username: user.username, email: user.email, role: user.role });
  };

  // Update user
  const handleUpdateUser = async () => {
    try {
      const updatedUser = await axios.put(`http://localhost:8080/update/${editingId}`, newUser);
      setUsers(
        users.map((user) =>
          user.id === editingId ? { ...user, role: updatedUser.data.role } : user
        )
      );
      setEditingId(null);
      setNewUser({ username: "", email: "", role: "" });
    } catch (error) {
      console.error("There was an error updating the user!", error);
    }
  };

  // Filter users based on the search term
  const filteredUsers = users.filter((user) => {
    const username = user.username || "";
    const email = user.email || "";
    const role = user.role || "";
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container">
      <h2>User Management</h2>

      <div className="mb-3">
        {/* Conditionally render the input fields only if editing */}
        {editingId !== null && (
          <>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              disabled
            />
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              disabled
            />
            <input
              type="text"
              className="form-control"
              placeholder="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            />
            <button className="btn btn-success" onClick={handleUpdateUser}>
              Update User
            </button>
          </>
        )}
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by username, email, or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleEditUser(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
