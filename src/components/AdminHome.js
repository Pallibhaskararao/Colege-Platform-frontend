import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { useNavigate, Link } from 'react-router-dom';
import './AdminHome.css';
const AdminHome = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Add loading state for user
  const [loadingPosts, setLoadingPosts] = useState(true); // Add loading state for posts
  const [error, setError] = useState(null); // Add error state
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        setLoadingUser(true);
        const res = await axios.get('http://https://colege-platform-backend.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        if (res.data.role !== 'Admin') {
          navigate('/home');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please log in again.');
        navigate('/auth');
      } finally {
        setLoadingUser(false);
      }
    };

    // Fetch posts
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const res = await axios.get('http://https://colege-platform-backend.onrender.com/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserProfile();
    fetchPosts();
  }, [token, navigate]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://https://colege-platform-backend.onrender.com/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post.');
    }
  };

  const handleCommentSubmit = async (postId, text) => {
    try {
      const res = await axios.post(`http://https://colege-platform-backend.onrender.com/api/posts/${postId}/comment`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.map(post => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment.');
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  return (
    <div className="admin-home">
      <h2>Admin Dashboard</h2>
      {error && (
        <div style={{ backgroundColor: '#E74C3C', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleLogout}
        style={{
          maxWidth:'80px',
          padding: '10px 20px',
          backgroundColor: '#E74C3C',
          color: '#ECF0F1',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'background-color 0.3s', // Add hover effect
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#C0392B')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#E74C3C')}
      >
        Logout
      </button>
      {loadingUser ? (
        <p>Loading user profile...</p>
      ) : user ? (
        <div>
          <h3>Welcome, {user.name} (Admin)!</h3>
          <p>Branch: {user.branch?.name || 'Not specified'}</p>
          <p>Skills: {user.skills?.length > 0 ? user.skills.map(skill => skill.name).join(', ') : 'None'}</p>
        </div>
      ) : null}
      <div className="admin-tools">
        <h3>Admin Tools</h3>
        <ul>
          <li>
            <Link to="/admin/delete-post">Delete Post</Link>
          </li>
          <li>
            <Link to="/admin/create-faculty">Create Faculty Account</Link>
          </li>
          <li>
            <Link to="/admin/manage-users">Ban/Unban Users</Link>
          </li>
        </ul>
      </div>
      <h3>Posts</h3>
      {loadingPosts ? (
        <p>Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            onLike={handleLike}
            onCommentSubmit={handleCommentSubmit}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};

export default AdminHome;