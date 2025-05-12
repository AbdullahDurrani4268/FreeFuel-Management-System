import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, FormControlLabel, Checkbox } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth/login';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        // Always use sessionStorage for admin users, regardless of rememberMe
        const storage = data.user.role === 'admin' ? sessionStorage : (rememberMe ? localStorage : sessionStorage);
        storage.setItem('token', data.token);
        onLogin && onLogin(data.user, data.token);
      }
    } catch (err) {
      setError('Network error');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#FF6B1B' }}>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />}
            label="Remember Me"
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ fontWeight: 'bold', backgroundColor: '#FF6B1B', ':hover': { backgroundColor: '#e65c00' } }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
