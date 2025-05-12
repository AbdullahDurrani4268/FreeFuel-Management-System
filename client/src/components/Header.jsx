import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import freeFuelLogo from '../assets/FreeFuel.png';

function Header({ onLogout }) {
  const navigate = useNavigate();
  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={freeFuelLogo} alt="FreeFuel Logo" style={{ width: 40, marginRight: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6B1B' }}>
            FreeFuel Energy Pvt Ltd
          </Typography>
        </Box>
        <Box>
          <IconButton color="primary" onClick={() => navigate('/profile')}>
            <PersonIcon />
          </IconButton>
          <IconButton color="error" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 