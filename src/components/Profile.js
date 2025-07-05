import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PostCard from './PostCard';
import ProfileMini from './ProfileMini';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('posts');
  const pendingRequestsRef = useRef(null);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
        return;
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const userRequest = axios.get('http://locahost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const branchesRequest = axios.get('http://locahost:5000/api/branches');

        const skillsRequest = axios.get('http://locahost:5000/api/skills');

        const postsRequest = axios.get('http://locahost:5000/api/posts/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const [userRes, branchesRes, skillsRes, postsRes] = await Promise.all([
          userRequest,
          branchesRequest,
          skillsRequest,
          postsRequest,
        ]);

        const userData = userRes.data;
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setBranch(userData.branch?._id || '');
        setBio(userData.bio || '');
        setSkills(userData.skills || []);
        setAvailableBranches(branchesRes.data);
        setAvailableSkills(skillsRes.data);
        setPosts(postsRes.data);
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
  }, [token, navigate]);

  useEffect(() => {
    if (location.state?.showPendingRequests && pendingRequestsRef.current) {
      setView('acquaintances');
      pendingRequestsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'http://locahost:5000/api/users/profile',
        { name, email, branch, bio, skills: skills.map((skill) => skill._id || skill) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedUser = res.data;

      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        const uploadRes = await axios.put(
          'http://locahost:5000/api/users/profile-picture',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        updatedUser = uploadRes.data;
      }

      setUser(updatedUser);
      setProfilePicture(null);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to update profile.');
      }
    }
  };

  const handleSkillChange = (e) => {
    const skillId = e.target.value;
    const selectedSkill = availableSkills.find((s) => s._id === skillId);
    if (selectedSkill && !skills.some((s) => s._id === skillId)) {
      setSkills([...skills, selectedSkill]);
    }
  };

  const removeSkill = (skillId) => {
    setSkills(skills.filter((s) => s._id !== skillId));
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await axios.put(
        `http://locahost:5000/api/users/requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error('Error accepting request:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to accept request.');
      }
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const res = await axios.put(
        `http://locahost:5000/api/users/requests/${requestId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error('Error declining request:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to decline request.');
      }
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error('Error liking post:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to like post.');
      }
    }
  };

  const handleDislike = async (postId) => {
    try {
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error('Error disliking post:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to dislike post.');
      }
    }
  };

  const handleCommentSubmit = async (postId, text) => {
    try {
      const res = await axios.post(
        `http://locahost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error('Error commenting:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to comment.');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://locahost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postId));
      alert('Post deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to delete post.');
      }
    }
  };

  const handleRemoveAcquaintance = async (acquaintanceId) => {
    if (!window.confirm('Are you sure you want to remove this acquaintance?')) return;
    try {
      const res = await axios.delete(`http://locahost:5000/api/users/acquaintances/${acquaintanceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      alert('Acquaintance removed successfully!');
    } catch (err) {
      console.error('Error removing acquaintance:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
      } else {
        alert(err.response?.data?.message || 'Failed to remove acquaintance.');
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="edit-profile-button" onClick={() => setEditMode(true)}>
          Edit Profile
        </button>
      </div>
      <div className="profile-content">
        <div className="profile-pic-holder">
          <img
            src={`http://locahost:5000${user.profilePicture}`} // Retrieve profilePicture from the database
            alt="Profile"
            className="profile-pic"
          />
        </div>
        <div className="profile-info">
          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div>
                <label>Profile Picture:</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                />
                {profilePicture && (
                  <p>Selected: {profilePicture.name}</p>
                )}
              </div>
              <div>
                <label>Name:</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label>Email:</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Branch:</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">Select a branch</option>
                  {availableBranches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Bio:</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <label>Skills:</label>
                <select onChange={handleSkillChange} defaultValue="">
                  <option value="">Select a skill</option>
                  {availableSkills.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                <div className="skills-list">
                  {skills.map((s) => (
                    <span key={s._id}>
                      {s.name} <button type="button" onClick={() => removeSkill(s._id)}>x</button>
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          ) : (
            <div>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Branch:</strong> {user.branch?.name || 'N/A'}</p>
              <p><strong>Skills:</strong> {user.skills?.map((s) => s.name).join(', ') || 'None'}</p>
              <p><strong>Bio:</strong> {user.bio || 'No bio'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="toggle-buttons">
        <button
          className={`toggle-button ${view === 'posts' ? 'active' : 'inactive'}`}
          onClick={() => setView('posts')}
        >
          My Posts
        </button>
        <button
          className={`toggle-button ${view === 'acquaintances' ? 'active' : 'inactive'}`}
          onClick={() => setView('acquaintances')}
        >
          Acquaintances
        </button>
      </div>

      {view === 'posts' && (
        <div className="posts-section">
          <h3>My Posts</h3>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onCommentSubmit={handleCommentSubmit}
                onDelete={handleDeletePost}
                currentUserId={currentUserId}
                scrollToPostId={null}
                scrollToCommentId={null}
              />
            ))
          )}
        </div>
      )}

      {view === 'acquaintances' && (
        <div className="acquaintances-section">
          <h3 ref={pendingRequestsRef}>Pending Requests</h3>
          {user.pendingRequests?.length ? (
            user.pendingRequests.map((req) => (
              <div key={req._id} className="pending-request">
                <p>{req.from.name} ({req.from.email})</p>
                <div>
                  <button onClick={() => handleAcceptRequest(req._id)}>Accept</button>
                  <button onClick={() => handleDeclineRequest(req._id)}>Decline</button>
                </div>
              </div>
            ))
          ) : (
            <p>No pending requests.</p>
          )}
          <h3>Your Acquaintances</h3>
          {user.acquaintances?.length ? (
            user.acquaintances.map((a) => (
              <ProfileMini key={a._id} user={a} onRemove={handleRemoveAcquaintance} />
            ))
          ) : (
            <p>No acquaintances yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;