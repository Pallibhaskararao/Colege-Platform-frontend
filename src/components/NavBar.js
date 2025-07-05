import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSearch, FaBell, FaEnvelope, FaUsers, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import './NavBar.css';

const NavBar = ({ token, setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  if (!token) return null;

  const navItems = [
    { path: '/home', icon: <FaHome />, label: 'Home' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/search', icon: <FaSearch />, label: 'Search' },
    { path: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/messages', icon: <FaEnvelope />, label: 'Messages' },
    { path: '/groups', icon: <FaUsers />, label: 'Groups' },
    { path: '/create-post', icon: <FaPlus />, label: 'Create Post' },
    { path: null, icon: <FaSignOutAlt />, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <nav>
      <div className="navbar-links-container">
        {navItems.map((item) =>
          item.path ? (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`navbar-link ${item.label === 'Logout' ? 'navbar-logout' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
};

export default NavBar;