import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PostCard from './PostCard';
import './Home.css';

const Home = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortMode, setSortMode] = useState('Recent'); // Default to 'Recent'
  const { userId } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data); // Backend sorts by createdAt descending
      } catch (err) {
        console.error('Error fetching posts in Home:', err.response?.data || err.message);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post in Home:', err.response?.data || err.message);
      setError('Failed to like post.');
    }
  };

  const handleDislike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error disliking post in Home:', err.response?.data || err.message);
      setError('Failed to dislike post.');
    }
  };

  // Add handleCommentSubmit function
  const handleCommentSubmit = async (postId, text) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId ? res.data : post
        )
      );
    } catch (err) {
      console.error('Error submitting comment in Home:', err.response?.data || err.message);
      setError('Failed to submit comment.');
    }
  };

  const getSortedPosts = () => {
    const postsCopy = [...posts];
    if (sortMode === 'Recent') {
      return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      return postsCopy.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }
  };

  const toggleSortMode = () => {
    setSortMode(sortMode === 'Recent' ? 'Top' : 'Recent');
  };

  console.log('Home component:', { token, userId, sortMode });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  const sortedPosts = getSortedPosts();

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Home</h2>
        <button
          onClick={toggleSortMode}
          className={`toggle-button ${sortMode === 'Top' ? 'top' : ''}`}
        >
          {sortMode === 'Recent' ? 'Recent' : 'Top'}
        </button>
      </div>
      <div className="posts-container">
        {sortedPosts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          sortedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onDislike={handleDislike}
              onCommentSubmit={handleCommentSubmit} // Pass the handleCommentSubmit function
              currentUserId={userId}
              token={token}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;