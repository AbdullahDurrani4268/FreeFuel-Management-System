import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, MenuItem, CircularProgress } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth/register';
const EMPLOYEES_API_URL = import.meta.env.VITE_API_URL + '/api/auth/employees';

function EmployeeListPanel({ onEdit }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchEmployees = async (searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${EMPLOYEES_API_URL}?search=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch employees');
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${EMPLOYEES_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
      setEmployees(employees.filter(emp => emp._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchEmployees(e.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, minWidth: 320, maxHeight: 500, overflow: 'auto', mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Employees</Typography>
      <TextField
        placeholder="Search employees..."
        value={search}
        onChange={handleSearch}
        fullWidth
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        employees.length === 0 ? <Typography>No employees found.</Typography> : (
          employees.map(emp => (
            <Box key={emp._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2">{emp.username}</Typography>
                <Typography variant="body2" color="text.secondary">{emp.email}</Typography>
              </Box>
              <Box>
                <Button size="small" onClick={() => onEdit(emp)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(emp._id)}>Delete</Button>
              </Box>
            </Box>
          ))
        )
      )}
    </Paper>
  );
}

function RegisterEmployee({ user }) {
  const [form, setForm] = useState({ username: '', email: '', role: 'employee', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const employeeListRef = useRef();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setForm({ username: emp.username, email: emp.email, role: emp.role, password: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setGeneratedPassword('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      let res, data;
      if (editingEmployee) {
        res = await fetch(`${EMPLOYEES_API_URL}/${editingEmployee._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ username: form.username, email: form.email }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Update failed');
        setSuccess('Employee updated successfully!');
        setEditingEmployee(null);
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        setSuccess('Employee registered successfully!');
        if (data.generatedPassword) setGeneratedPassword(data.generatedPassword);
      }
      setForm({ username: '', email: '', role: 'employee', password: '' });
      employeeListRef.current && employeeListRef.current.fetchEmployees && employeeListRef.current.fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', minHeight: '100vh', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Paper elevation={4} sx={{ p: 5, minWidth: 350, textAlign: 'center', borderRadius: 4, flex: 1, maxWidth: 400, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF6B1B', mb: 2 }}>
          {editingEmployee ? 'Edit Employee' : 'Register Employee'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled
          >
            <MenuItem value="employee">Employee</MenuItem>
          </TextField>
          <TextField
            label="Password (optional)"
            name="password"
            type="text"
            value={form.password}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Leave blank to auto-generate a strong password."
            disabled={!!editingEmployee}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {generatedPassword && <Alert severity="info" sx={{ mb: 2 }}>Generated Password: <b>{generatedPassword}</b></Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ fontWeight: 'bold', backgroundColor: '#FF6B1B', ':hover': { backgroundColor: '#e65c00' } }}
          >
            {loading ? <CircularProgress size={24} /> : (editingEmployee ? 'Update' : 'Register')}
          </Button>
        </form>
      </Paper>
      <Box sx={{ width: 400, ml: 4 }}>
        <EmployeeListPanel ref={employeeListRef} onEdit={handleEdit} />
      </Box>
    </Box>
  );
}

export default RegisterEmployee; 