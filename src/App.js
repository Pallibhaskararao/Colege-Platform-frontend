import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserProvider } from './context/UserContext';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Profile from './components/Profile';
import Search from './components/Search';
import Acquaintances from './components/Acquaintances';
import Notifications from './components/Notifications';
import UserProfile from './components/UserProfile';
import CreatePost from './components/CreatePost';
import Messages from './components/Messages';
import Ideas from './components/Ideas';
import Auth from './components/Auth';
import AdminHome from './components/AdminHome';
import DeletePost from './components/DeletePost';
import CreateFaculty from './components/CreateFaculty';
import ManageUsers from './components/ManageUsers';
import CreateGroup from './components/CreateGroup';
import Groups from './components/Groups';
import GroupChat from './components/GroupChat';
import BanRequest from './components/BanRequest';
import './App.css';

function App() {
  const [token, setToken] = React.useState(localStorage.getItem('token') || null);
  const [userRole, setUserRole] = React.useState(null);
  const [userId, setUserId] = React.useState(localStorage.getItem('userId') || null);
  const [isLoadingRole, setIsLoadingRole] = React.useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const lastProcessedToken = React.useRef(null);

  useEffect(() => {
    console.log('App.js useEffect: fetchUserRole', { token, userId, userRole, isLoadingRole });
    const fetchUserRole = async () => {
      if (token && !userRole && !isLoadingRole && token !== lastProcessedToken.current) {
        lastProcessedToken.current = token;
        setIsLoadingRole(true);
        try {
          const res = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched user role:', res.data.role); // Debug log
          setUserRole(res.data.role);
          setUserId(res.data._id);
          localStorage.setItem('userId', res.data._id);
        } catch (err) {
          console.error('Error fetching user role in App.js:', err.response?.data || err.message);
          if (err.response?.status === 401) {
            setUserRole(null);
            setToken(null);
            setUserId(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/auth');
          }
        } finally {
          setIsLoadingRole(false);
        }
      }
    };
    if (token) {
      fetchUserRole();
    }
  }, [token, navigate]);

  const handleSetToken = (newToken) => {
    console.log('App.js handleSetToken:', { newToken });
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUserRole(null);
      setUserId(null);
      navigate('/auth', { replace: true });
    }
  };

  const shouldShowNavbar = token && userRole && userRole !== 'Admin' && !location.pathname.startsWith('/admin');
  console.log('shouldShowNavbar:', { shouldShowNavbar, token, userRole, pathname: location.pathname }); // Debug log

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    console.log('ProtectedRoute:', { token, userRole, isLoadingRole, pathname: location.pathname });
    if (!token) {
      return <Navigate to="/auth" replace />;
    }
    if (!userRole || isLoadingRole) {
      return <div>Loading...</div>;
    }
    if (adminOnly && userRole !== 'Admin') {
      return <Navigate to="/home" replace />;
    }
    if (token && userRole && (location.pathname === '/auth' || location.pathname === '/')) {
      return <Navigate to={userRole === 'Admin' ? '/admin' : '/home'} replace />;
    }
    return children;
  };

  console.log('App.js render:', { token, userId, userRole, pathname: location.pathname });

  return (
    <div>
      {shouldShowNavbar && <NavBar token={token} setToken={handleSetToken} />}
      <div className="App">
        <UserProvider value={{ token, setToken: handleSetToken, userId, setUserId, userRole, setUserRole }}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Navigate to="/home" replace /></ProtectedRoute>} />
            <Route path="/auth/*" element={<Auth setToken={handleSetToken} />} />
            <Route path="/home" element={<ProtectedRoute><Home token={token} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
            <Route path="/acquaintances" element={<ProtectedRoute><Acquaintances /></ProtectedRoute>} />
            <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminHome /></ProtectedRoute>} />
            <Route
              path="/admin/delete-post"
              element={<ProtectedRoute adminOnly={true}><DeletePost /></ProtectedRoute>}
            />
            <Route
              path="/admin/create-faculty"
              element={<ProtectedRoute adminOnly={true}><CreateFaculty /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-users"
              element={<ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>}
            />
            <Route path="/group-chat/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route
              path="/ban-request/:postId/:userId"
              element={<ProtectedRoute><BanRequest /></ProtectedRoute>}
            />
            <Route path="*" element={<ProtectedRoute><Navigate to="/home" replace /></ProtectedRoute>} />
          </Routes>
        </UserProvider>
      </div>
    </div>
  );
}

export default App;