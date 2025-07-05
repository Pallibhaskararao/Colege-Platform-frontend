import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './Auth.css';

const Auth = ({ setToken }) => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">MVGR INNOVATION HUB</h1>
      </div>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        {/* Fallback route for unmatched paths under /auth */}
        <Route path="*" element={<div>Redirecting to login...</div>} />
      </Routes>
    </div>
  );
};

export default Auth;