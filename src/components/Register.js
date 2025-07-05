import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = ({ setToken }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [skills, setSkills] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null); // For file input
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [emailValid, setEmailValid] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, skillsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/branches'),
          axios.get('http://localhost:5000/api/skills'),
        ]);
        setAvailableBranches(branchesRes.data);
        setAvailableSkills(skillsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load branches or skills.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const validateEmail = () => {
      if (!email) {
        setEmailValid(null);
        setEmailError('');
        return;
      }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) {
        setEmailValid(false);
        setEmailError('Invalid email format');
        return;
      }
      const domain = email.split('@')[1];
      if (domain !== 'mvgrce.edu.in') {
        setEmailValid(false);
        setEmailError('Email must be a college email (e.g., username@mvgrce.edu.in)');
        return;
      }
      setEmailValid(true);
      setEmailError('');
    };

    const timeout = setTimeout(validateEmail, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!emailValid) {
      setError('Please enter a valid college email.');
      setIsLoading(false);
      return;
    }
    if (!branch) {
      setError('Please select a branch.');
      setIsLoading(false);
      return;
    }

    try {
      // Register the user
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name,
        email,
        password,
        branch,
        skills,
      });

      const token = res.data.token;
      const userId = res.data.userId;

      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // If a profile picture was selected, upload it
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        await axios.put(
          'http://localhost:5000/api/users/profile-picture',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      navigate('/home');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
    setSkills(selectedSkills);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Email (username@mvgrce.edu.in):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your college email"
            disabled={isLoading}
            className={emailValid === null ? '' : emailValid ? 'valid' : 'invalid'}
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Branch:</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Select a branch</option>
            {availableBranches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Skills:</label>
          <select
            multiple
            value={skills}
            onChange={handleSkillsChange}
            disabled={isLoading}
          >
            {availableSkills.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="skills-note">Hold Ctrl (Windows) or Cmd (Mac) to select multiple skills.</p>
        </div>
        <div className="form-group">
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(e) => setProfilePicture(e.target.files[0])}
            disabled={isLoading}
          />
          {profilePicture && (
            <p>Selected: {profilePicture.name}</p>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isLoading || !emailValid}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="login-link">
        Already have an account? <Link to="/auth/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;