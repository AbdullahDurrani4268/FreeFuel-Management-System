import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, FormControl, InputLabel, Grid, Card, CardContent, CardActions, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { io } from 'socket.io-client';

const TASKS_API_URL = import.meta.env.VITE_API_URL + '/api/tasks';
const USERS_API_URL = import.meta.env.VITE_API_URL + '/api/auth/users';
const SOCKET_URL = import.meta.env.VITE_API_URL;

function Tasks({ user }) {
  console.log('User:', user);
  console.log('Username:', user.username);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    assignedTo: 'all',
    dueDate: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(TASKS_API_URL, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(USERS_API_URL, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          // If not admin, just set empty employees array
          setEmployees(data);
          return;
        }
        throw new Error(data.message || 'Failed to fetch employees');
      }
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    // Socket.io for real-time updates
    const socket = io(SOCKET_URL);
    socket.on('taskChanged', () => {
      fetchTasks();
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
    setFormData({
      heading: '',
      description: '',
      assignedTo: 'all',
      dueDate: new Date(),
    });
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setFormData({
      heading: task.heading,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: new Date(task.dueDate),
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dueDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let res;
      if (editTask) {
        res = await fetch(`${TASKS_API_URL}/${editTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(TASKS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save task');
      setSuccess(editTask ? 'Task updated successfully!' : 'Task added successfully!');
      fetchTasks();
      handleClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${TASKS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete task');
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${TASKS_API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change status');
      fetchTasks();
    } catch (err) {
      console.error('Error changing status:', err);
      setError(err.message);
    }
  };

  const getAssignedTo = (assignedTo) => {
    const matchingEmployee = employees.find(employee => employee._id === assignedTo);
    return matchingEmployee ? matchingEmployee.username : 'Unknown';
  };
  

  const isMissing = (dueDate) => new Date(dueDate) < new Date();
  const isUrgent = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Tasks</Typography>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>Add Task</Button>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <Card sx={{ 
                  bgcolor: isMissing(task.dueDate) ? '#ffebee' : isUrgent(task.dueDate) ? '#fff3e0' : 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <CardContent>
                    <Typography variant="h6">{task.heading}</Typography>
                    <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                    <Typography variant="body2">Assigned to: {task.assignedTo === 'All' ? task.assignedTo :  getAssignedTo(task.assignedTo)}</Typography>
                    <Typography variant="body2">Created by: {task.createdBy || (typeof task.author === 'object' ? task.author?.username : task.author) || 'Unknown'}</Typography>
                    <Typography variant="body2">Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2" sx={{ color: 'orange' }}>Status: {task.status}</Typography>
                    <Typography variant="body2">Created: {new Date(task.createdAt).toLocaleString()}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleStatusChange(task._id, task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending')} disabled={!(task.assignedTo === 'All' || (typeof task.assignedTo === 'object' ? task.assignedTo?._id === user.userId : task.assignedTo === user.userId) || user.role === 'admin')}>
                      Change Status
                    </Button>
                    {(task.author._id === user.userId || user.role === 'admin') && (
                      <>
                        <IconButton size="small" onClick={() => handleEdit(task)}><EditIcon /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(task._id)}><DeleteIcon /></IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No tasks found.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="heading"
            label="Heading"
            type="text"
            fullWidth
            value={formData.heading}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Assigned To</InputLabel>
            <Select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
            >
              <MenuItem value="all">All</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>{employee.username}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth margin="dense" required />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (editTask ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks;
