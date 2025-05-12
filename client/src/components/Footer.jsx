import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} FreeFuel Energy Pvt Ltd. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer; 