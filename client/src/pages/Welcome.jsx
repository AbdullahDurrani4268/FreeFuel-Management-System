import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import freeFuelLogo from '../assets/FreeFuel.png';

function Welcome({ onStartLogin }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', background: 'linear-gradient(135deg, #1B4B7A 0%, #FF6B1B 100%)' }}>
      <Paper elevation={6} sx={{ p: 5, textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.95)' }}>
        <img src={freeFuelLogo} alt="FreeFuel Logo" style={{ width: 120, marginBottom: 24 }} />
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#FF6B1B', mb: 1 }}>
          FreeFuel Energy Pvt Ltd
        </Typography>
        <Typography variant="h6" sx={{ color: '#1B4B7A', mb: 3 }}>
          Solar Energy Solutions for Pakistan
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ fontWeight: 'bold', backgroundColor: '#FF6B1B', ':hover': { backgroundColor: '#e65c00' }, px: 6, py: 1.5 }}
          onClick={onStartLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
}

export default Welcome; 