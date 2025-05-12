import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalculateIcon from '@mui/icons-material/Calculate';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawerWidth = open ? 240 : 65;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Header height
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        padding: '8px'
      }}>
        <Tooltip title={open ? "Collapse Sidebar" : "Expand Sidebar"}>
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List>
        <Tooltip title="Dashboard" placement="right" open={!open}>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItem>
        </Tooltip>
        <Tooltip title="Tasks" placement="right" open={!open}>
          <ListItem button onClick={() => navigate('/tasks')}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Tasks" />}
          </ListItem>
        </Tooltip>
        <Tooltip title="Clients" placement="right" open={!open}>
          <ListItem button onClick={() => navigate('/clients')}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Clients" />}
          </ListItem>
        </Tooltip>
        <Tooltip title="Cost Calculator" placement="right" open={!open}>
          <ListItem button onClick={() => navigate('/cost-calculator')}>
            <ListItemIcon>
              <CalculateIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Cost Calculator" />}
          </ListItem>
        </Tooltip>
        {user && user.role === 'admin' && (
          <Tooltip title="Register Employee" placement="right" open={!open}>
            <ListItem button onClick={() => navigate('/register-employee')}>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Register Employee" />}
            </ListItem>
          </Tooltip>
        )}
      </List>
      <Divider />
    </Drawer>
  );
}

export default Sidebar; 