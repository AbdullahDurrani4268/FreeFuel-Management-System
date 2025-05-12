import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

const CLIENTS_API_URL = import.meta.env.VITE_API_URL + '/api/clients';

function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', phoneNumber: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [expandedSystem, setExpandedSystem] = useState(null);
  const [systems, setSystems] = useState({}); // {clientId: [systems]}
  const [costs, setCosts] = useState({}); // {systemId: [costs]}
  const [viewCost, setViewCost] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all clients
  const fetchClients = async () => {
    try {
      const res = await fetch(CLIENTS_API_URL);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setClients([]);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // Fetch systems for a client
  const fetchSystems = async (clientId) => {
    try {
      const res = await fetch(`${CLIENTS_API_URL}/${clientId}/systems`);
      const data = await res.json();
      setSystems(prev => ({ ...prev, [clientId]: data }));
    } catch (err) {
      setSystems(prev => ({ ...prev, [clientId]: [] }));
    }
  };

  // Fetch costs for a system
  const fetchCosts = async (systemId) => {
    try {
      const res = await fetch(`${CLIENTS_API_URL}/systems/${systemId}/costs`);
      const data = await res.json();
      setCosts(prev => ({ ...prev, [systemId]: data }));
    } catch (err) {
      setCosts(prev => ({ ...prev, [systemId]: [] }));
    }
  };

  // Add client
  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(CLIENTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add client');
      setSuccess('Client added successfully!');
      setForm({ name: '', phoneNumber: '', email: '', address: '' });
      fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add system
  const handleAddSystem = async (clientId) => {
    const systemSize = prompt('Enter system size (kW):');
    if (!systemSize) return;
    const systemType = prompt('Enter system type (onGrid, offGrid, Hybrid):');
    if (!systemType) return;
    const systemLocation = prompt('Enter system location:');
    if (!systemLocation) return;
    try {
      await fetch(`${CLIENTS_API_URL}/${clientId}/systems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemSize, systemType, systemLocation }),
      });
      fetchSystems(clientId);
    } catch {}
  };

  // Add cost
  const handleAddCost = (systemId) => {
    navigate('/cost-calculator', { state: { systemId } });
  };

  // Edit cost
  const handleEditCost = (cost) => {
    navigate('/cost-calculator', { state: { cost } });
  };

  // Delete cost
  const handleDeleteCost = async (costId, systemId) => {
    if (!window.confirm('Are you sure you want to delete this cost?')) return;
    await fetch(`${CLIENTS_API_URL}/costs/${costId}`, { method: 'DELETE' });
    fetchCosts(systemId);
  };

  // Delete system
  const handleDeleteSystem = async (systemId, clientId) => {
    if (!window.confirm('Are you sure you want to delete this system?')) return;
    await fetch(`${CLIENTS_API_URL}/systems/${systemId}`, { method: 'DELETE' });
    fetchSystems(clientId);
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    await fetch(`${CLIENTS_API_URL}/${clientId}`, { method: 'DELETE' });
    fetchClients();
  };

  // View cost
  const handleViewCost = (cost) => {
    setViewCost(cost);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Clients</Typography>
      <Paper elevation={5} sx={{ p: 3, mb: 4}}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Client</Typography>
        <form onSubmit={handleAddClient}>
          <TextField label="Name" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Address" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} fullWidth required sx={{ mb: 2 }} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ fontWeight: 'bold' }}>
            {loading ? 'Adding...' : 'Add Client'}
          </Button>
        </form>
      </Paper>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>All Clients</Typography>
      {clients.map(client => (
        <Accordion key={client._id} expanded={expandedClient === client._id} onChange={() => {
          setExpandedClient(expandedClient === client._id ? null : client._id);
          if (expandedClient !== client._id) fetchSystems(client._id);
        }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flexGrow: 1 }}>{client.name} ({client.email})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={() => handleDeleteClient(client._id)} color="error"><DeleteIcon /></IconButton>
            </Box>
            <Typography variant="subtitle1">Systems</Typography>
            <Button startIcon={<AddIcon />} onClick={() => handleAddSystem(client._id)} sx={{ mb: 2 }}>Add System</Button>
            {(systems[client._id] || []).map(system => (
              <Accordion key={system._id} expanded={expandedSystem === system._id} onChange={() => {
                setExpandedSystem(expandedSystem === system._id ? null : system._id);
                if (expandedSystem !== system._id) fetchCosts(system._id);
              }} sx={{ mb: 2, ml: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ flexGrow: 1 }}>System: {system.systemSize}kW, {system.systemType}, {system.systemLocation}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton onClick={() => handleDeleteSystem(system._id, client._id)} color="error"><DeleteIcon /></IconButton>
                  </Box>
                  <Typography variant="subtitle2">Costs</Typography>
                  <Button startIcon={<AddIcon />} onClick={() => handleAddCost(system._id)} sx={{ mb: 2 }}>Add Cost</Button>
                  {(costs[system._id] || []).map(cost => (
                    <Paper key={cost._id} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2">Total: {cost.finalPrice}</Typography>
                        <Typography variant="body2">Type: {cost.selectedPriceType}</Typography>
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleViewCost(cost)}><VisibilityIcon /></IconButton>
                        <IconButton onClick={() => handleEditCost(cost)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteCost(cost._id, system._id)} color="error"><DeleteIcon /></IconButton>
                      </Box>
                    </Paper>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      {/* Cost View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cost Details</DialogTitle>
        <DialogContent>
          {viewCost ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(viewCost, null, 2)}</pre>
          ) : 'No data'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Clients; 