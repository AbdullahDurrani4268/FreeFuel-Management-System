import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { CssBaseline, Box } from '@mui/material';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterEmployee from './pages/RegisterEmployee';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import CostCalculator from './pages/CostCalculator';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    const token = storage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        
        // Check if the user is an admin and ensure session-only storage
        if (decoded.role === 'admin' && storage !== sessionStorage) {
          localStorage.removeItem('token');
          sessionStorage.setItem('token', token);
        }
      } catch (err) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }
  }, []);
  

  const handleLogin = (userData, token) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <CssBaseline />
      <Header onLogout={handleLogout} />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {user && <Sidebar user={user} />}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px' }}>
          <Routes>
            <Route path="/" element={<Welcome onStartLogin={() => navigate('/login')} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="/register-employee" element={
              <ProtectedRoute user={user} role="admin">
                <RegisterEmployee user={user} />
              </ProtectedRoute>
            } />
            <Route path="/cost-calculator" element={
              <ProtectedRoute user={user}>
                <CostCalculator />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={<ProtectedRoute user={user}><Clients /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute user={user}><Tasks user={user} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
      </Box>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
