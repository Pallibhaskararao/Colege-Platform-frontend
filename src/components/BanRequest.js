import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileMini from './ProfileMini';

const BanRequest = () => {
  const { postId, userId } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        if (postId !== 'null') {
          const postResponse = await axios.get(`http://https://colege-platform-backend.onrender.com/api/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPost(postResponse.data);
        }

        const userResponse = await axios.get(`http://https://colege-platform-backend.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, userId, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the ban request.');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        'http://https://colege-platform-backend.onrender.com/api/ban-requests',
        {
          userToBan: userId,
          reason: reason.trim(),
          post: postId === 'null' ? null : postId, // Include post if available
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Ban request sent successfully!');
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      console.error('Error submitting ban request:', err);
      setError(err.response?.data?.message || 'Failed to send ban request.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#E74C3C' }}>Error</h2>
        <div
          style={{
            backgroundColor: '#E74C3C',
            padding: '10px',
            borderRadius: '4px',
            color: '#ECF0F1',
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#E74C3C' }}>Error</h2>
        <div
          style={{
            backgroundColor: '#E74C3C',
            padding: '10px',
            borderRadius: '4px',
            color: '#ECF0F1',
          }}
        >
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#E74C3C' }}>Send Ban Request</h2>

      {error && (
        <div
          style={{
            backgroundColor: '#E74C3C',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#ECF0F1',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#2ECC71',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#ECF0F1',
          }}
        >
          {success}
        </div>
      )}

      {post && (
        <div
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
          }}
        >
          <h3>Post Details</h3>
          <p>
            <strong>Title:</strong> {post.title}
          </p>
          <p>
            <strong>Description:</strong> {post.description}
          </p>
          <p>
            <strong>Tags:</strong> {post.tags.join(', ')}
          </p>
          <p>
            <strong>Posted by:</strong> {post.author.name}
          </p>
          <p>
            <strong>Posted on:</strong> {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>User to Ban</h3>
        <ProfileMini user={user} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="reason"
            style={{ display: 'block', marginBottom: '5px' }}
          >
            Reason for Ban Request:
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe why you want to ban this user..."
            style={{
              width: '100%',
              height: '100px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Submit Ban Request
        </button>
      </form>
    </div>
  );
};

export default BanRequest;