import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [banRequests, setBanRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to fetch users');
      }
    };

    const fetchBanRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/ban-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBanRequests(response.data);
      } catch (err) {
        console.error('Error fetching ban requests:', err);
        toast.error('Failed to fetch ban requests');
      }
    };

    fetchUsers();
    fetchBanRequests();
  }, []);

  const handleBan = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${userId}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User banned successfully');
      setUsers(users.map(user =>
        user._id === userId ? { ...user, banned: true } : user
      ));
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('Failed to ban user');
    }
  };

  const handleUnban = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${userId}/unban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User unbanned successfully');
      setUsers(users.map(user =>
        user._id === userId ? { ...user, banned: false } : user
      ));
    } catch (err) {
      console.error('Error unbanning user:', err);
      toast.error('Failed to unban user');
    }
  };

  const handleApproveBanRequest = async (banRequestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/ban-requests/${banRequestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message);
      setBanRequests(banRequests.filter(request => request._id !== banRequestId));
      const userId = banRequests.find(request => request._id === banRequestId).userToBan?._id;
      if (userId) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, banned: true } : user
        ));
      }
    } catch (err) {
      console.error('Error approving ban request:', err);
      toast.error(err.response?.data?.message || 'Failed to approve ban request');
    }
  };

  const handleRejectBanRequest = async (banRequestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/ban-requests/${banRequestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message);
      setBanRequests(banRequests.filter(request => request._id !== banRequestId));
    } catch (err) {
      console.error('Error rejecting ban request:', err);
      toast.error(err.response?.data?.message || 'Failed to reject ban request');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  return (
    <div className="manage-users-container">
      <div className="header">
        <h2>Manage Users</h2>
        <button className="back-button" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.banned ? 'Banned' : 'Active'}</td>
              <td>
                {user.banned ? (
                  <button className="unban-button" onClick={() => handleUnban(user._id)}>
                    Unban
                  </button>
                ) : (
                  <button className="ban-button" onClick={() => handleBan(user._id)}>
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Ban Requests</h2>
      <table className="ban-requests-table">
        <thead>
          <tr>
            <th>Requester</th>
            <th>User to Ban</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {banRequests.map(request => (
            <tr key={request._id}>
              <td>{request.requester?.name || 'Unknown'}</td>
              <td>{request.userToBan?.name || 'User Not Found'}</td>
              <td>{request.reason || 'No reason provided'}</td>
              <td>
                <button className="approve-button" onClick={() => handleApproveBanRequest(request._id)}>
                  Approve
                </button>
                <button className="reject-button" onClick={() => handleRejectBanRequest(request._id)}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;