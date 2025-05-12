import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Alert, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TASKS_API_URL = import.meta.env.VITE_API_URL + '/api/tasks';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(TASKS_API_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const missingTasks = tasks.filter(task => new Date(task.dueDate) < new Date());
  const urgentTasks = tasks.filter(task => {
    const diff = new Date(task.dueDate) - new Date();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });

  return (
    <Box sx={{
      p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
        Welcome, {user.username || 'User'}!
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, color: '#555' }}>
        Role: {user.role}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {[['Missing Tasks', missingTasks], ['Urgent Tasks', urgentTasks], ['Total Tasks', tasks], ['Completed Tasks', tasks.filter(task => task.status === 'completed')]].map(([title, list], index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, transition: '0.3s' }}>
                  <CardContent>
                    <Typography variant="h4" gutterBottom>{title}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {list.length === 0 ? (
                      <Typography variant="body2">No {title.toLowerCase()}.</Typography>
                    ) : (
                      list.map((task, i) => (
                        <Typography key={i} variant="body2">{task.heading} - Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;
