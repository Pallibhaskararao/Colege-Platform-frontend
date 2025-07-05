import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from './PostCard';
import ProfileMini from './ProfileMini';
import { FaEllipsisH } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [view, setView] = useState('posts');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, loggedInUserRes, postsRes, requestsRes] = await Promise.all([
          axios.get(`http://locahost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://locahost:5000/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://locahost:5000/api/posts/user/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://locahost:5000/api/users/requests/sent', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUser(userRes.data);
        setLoggedInUser(loggedInUserRes.data);
        setPosts(postsRes.data);
        setSentRequests(requestsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth');
        }
      }
    };
    fetchData();
  }, [id, token, navigate]);

  const handleLike = async (postId) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [postId]: 'like' }));
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error('Error liking post:', err);
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        alert('Failed to like the post. Please try again.');
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: null }));
    }
  };

  const handleDislike = async (postId) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [postId]: 'dislike' }));
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error('Error disliking post:', err);
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        alert('Failed to dislike the post. Please try again.');
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: null }));
    }
  };

  const handleCommentSubmit = async (postId, text) => {
    try {
      setLoadingActions((prev) => ({ ...prev, [postId]: 'comment' }));
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? res.data : post)));
    } catch (err) {
      console.error('Error commenting:', err);
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        alert('Failed to submit comment. Please try again.');
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: null }));
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://locahost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      if (err.response?.status === 401) {
        navigate('/auth');
      } else {
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post(
        `http://locahost:5000/api/users/requests/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get('http://locahost:5000/api/users/requests/sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentRequests(res.data);
      alert('Friend request sent!');
    } catch (err) {
      console.error('Error sending request:', err);
      alert(err.response?.data?.message || 'Failed to send request.');
    }
  };

  const handleChat = () => {
    navigate('/messages', { state: { selectedUserId: id } });
  };

  const isRequestSent = (userId) => sentRequests.some((req) => req.to._id === userId && req.status === 'pending');
  const isAcquaintance = (userId) => loggedInUser?.acquaintances.some((a) => a._id === userId);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!user || !loggedInUser) return <div>Loading...</div>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h2>{user.name}'s Profile</h2>
        {loggedInUser.role === 'Faculty' && user._id !== loggedInUser._id && (
          <div style={{ position: 'relative' }}>
            <button onClick={toggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
              <FaEllipsisH />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '30px', right: '0', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', borderRadius: '5px', padding: '5px' }}>
                <Link to={`/ban-request/null/${user._id}`} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <button style={{ textDecoration: 'none', backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                    Send Ban Request
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="profile-pic-holder">
        <img
          src={`http://locahost:5000${user.profilePicture}`} // Retrieve profilePicture from the database
          alt="Profile"
          className="profile-pic"
        />
      </div>
      <div className="profile-info">
        <p>Email: {user.email}</p>
        <p>Branch: {user.branch?.name || 'N/A'}</p>
        <p>Skills: {user.skills?.map((s) => s.name).join(', ') || 'None'}</p>
        <p>Bio: {user.bio || 'No bio'}</p>
      </div>

      {user._id !== loggedInUser._id && (
        <div className="action-buttons">
          {!isAcquaintance(user._id) && (
            isRequestSent(user._id) ? (
              <button disabled>Request Sent</button>
            ) : (
              <button onClick={() => handleSendRequest(user._id)}>Send Friend Request</button>
            )
          )}
          {loggedInUser.role === 'Faculty' && (
            <button onClick={handleChat} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>
              Chat
            </button>
          )}
        </div>
      )}

      <div className="toggle-buttons">
        <button
          onClick={() => setView('posts')}
          className={`toggle-button ${view === 'posts' ? 'active' : 'inactive'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setView('acquaintances')}
          className={`toggle-button ${view === 'acquaintances' ? 'active' : 'inactive'}`}
        >
          Acquaintances
        </button>
      </div>

      {view === 'posts' && (
        <div className="posts-section">
          <h3>Posts</h3>
          {posts.length === 0 ? (
            <p>{user.name} has not created any posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onCommentSubmit={handleCommentSubmit}
                onDelete={handleDelete}
                currentUserId={currentUserId}
                token={token}
                scrollToPostId={null}
                scrollToCommentId={null}
                loadingActions={loadingActions}
              />
            ))
          )}
        </div>
      )}

      {view === 'acquaintances' && (
        <div className="acquaintances-section">
          <h3>Acquaintances</h3>
          {user.acquaintances.length === 0 ? (
            <p>{user.name} has no acquaintances yet.</p>
          ) : (
            user.acquaintances.map((a) => <ProfileMini key={a._id} user={a} />)
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;