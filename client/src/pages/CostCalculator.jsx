import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = import.meta.env.VITE_API_URL + '/api/costs';
const CLIENTS_API_URL = import.meta.env.VITE_API_URL + '/api/clients';

function CostCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const systemId = location.state?.systemId || (location.state?.cost?.system?._id || location.state?.cost?.system);
  const editingCost = location.state?.cost || null;

  const [form, setForm] = useState({
    // Client Info Section
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    // System Info
    systemSize: '',
    systemType: '',
    systemLocation: '',
    // Panels Section
    totalWattsPerPanel: 0,
    totalPanels: 0,
    ratePerWatt: 0,

    // Inverters Section
    inverters: [{ quantity: 1, price: 0 }],

    // Batteries Section
    batteries: [{ quantity: 1, price: 0 }],

    // Cables and Breakers Section
    cableDCPrice: 0,
    cableACPrice: 0,
    breakerDCPrice: 0,
    breakerACPrice: 0,

    // Battery Components Section
    breakerBatteryPrice: 0,
    batteryCablePrice: 0,
    luxBatteryPrice: 0,

    // Infrastructure Section
    changeOverPrice: 0,
    dbPrice: 0,
    accessoriesPrice: 0,
    transportationPrice: 0,

    // Services and Frames Section
    serviceType: 'total',
    servicePerWattRate: 0,
    serviceTotalPrice: 0,
    framesType: 'total',
    framesPerWattRate: 0,
    framesTotalPrice: 0,

    // Additional Components Section
    netmeteringPrice: 0,
    earthingPrice: 0,
    loopersSPDPrice: 0,

    // Profit Section
    profitPercentage: 0,
    profitAmount: 0,

    // Final Price Selection
    selectedPriceType: 'percentage',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    // Fetch all clients
    fetch(CLIENTS_API_URL)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(() => setClients([]));
  }, []);

  useEffect(() => {
    if (editingCost) {
      setForm({
        clientName: editingCost.client?.name || '',
        clientPhone: editingCost.client?.phoneNumber || '',
        clientEmail: editingCost.client?.email || '',
        clientAddress: editingCost.client?.address || '',
        systemSize: editingCost.system?.systemSize || '',
        systemType: editingCost.system?.systemType || '',
        systemLocation: editingCost.system?.systemLocation || '',
        totalWattsPerPanel: editingCost.totalWattsPerPanel || 0,
        totalPanels: editingCost.totalPanels || 0,
        ratePerWatt: editingCost.ratePerWatt || 0,
        inverters: (editingCost.inverters || [{ quantity: 1, price: 0 }]).map(inv => ({ ...inv, totalPrice: inv.totalPrice || (inv.quantity * inv.price) })),
        batteries: (editingCost.batteries || [{ quantity: 1, price: 0 }]).map(bat => ({ ...bat, totalPrice: bat.totalPrice || (bat.quantity * bat.price) })),
        cableDCPrice: editingCost.cableDCPrice || 0,
        cableACPrice: editingCost.cableACPrice || 0,
        breakerDCPrice: editingCost.breakerDCPrice || 0,
        breakerACPrice: editingCost.breakerACPrice || 0,
        breakerBatteryPrice: editingCost.breakerBatteryPrice || 0,
        batteryCablePrice: editingCost.batteryCablePrice || 0,
        luxBatteryPrice: editingCost.luxBatteryPrice || 0,
        changeOverPrice: editingCost.changeOverPrice || 0,
        dbPrice: editingCost.dbPrice || 0,
        accessoriesPrice: editingCost.accessoriesPrice || 0,
        transportationPrice: editingCost.transportationPrice || 0,
        serviceType: editingCost.serviceType || 'total',
        servicePerWattRate: editingCost.servicePerWattRate || 0,
        serviceTotalPrice: editingCost.serviceTotalPrice || 0,
        framesType: editingCost.framesType || 'total',
        framesPerWattRate: editingCost.framesPerWattRate || 0,
        framesTotalPrice: editingCost.framesTotalPrice || 0,
        netmeteringPrice: editingCost.netmeteringPrice || 0,
        earthingPrice: editingCost.earthingPrice || 0,
        loopersSPDPrice: editingCost.loopersSPDPrice || 0,
        profitPercentage: editingCost.profitPercentage || 0,
        profitAmount: editingCost.profitAmount || 0,
        selectedPriceType: editingCost.selectedPriceType || 'percentage',
      });
      setSameAddress(editingCost.system?.systemLocation === editingCost.client?.address);
    }
  }, [editingCost]);

  // When clientAddress or sameAddress changes, update systemLocation if needed
  useEffect(() => {
    if (sameAddress) {
      setForm(prev => ({ ...prev, systemLocation: prev.clientAddress }));
    }
  }, [sameAddress, form.clientAddress]);

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    if (clientId === '') {
      // New client
      setForm({
        ...form,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        clientAddress: '',
        systemSize: '',
        systemType: '',
        systemLocation: '',
      });
    } else {
      const client = clients.find(c => c._id === clientId);
      setForm({
        ...form,
        clientName: client.name,
        clientPhone: client.phoneNumber,
        clientEmail: client.email,
        clientAddress: client.address,
        systemSize: client.system?.systemSize || '',
        systemType: client.system?.systemType || '',
        systemLocation: client.system?.systemLocation || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleInverterChange = (index, field, value) => {
    const newInverters = [...form.inverters];
    newInverters[index] = { 
      ...newInverters[index], 
      [field]: parseFloat(value) || 0,
      totalPrice: field === 'quantity' ? 
        (parseFloat(value) || 0) * (newInverters[index].price || 0) :
        (newInverters[index].quantity || 0) * (parseFloat(value) || 0)
    };
    setForm({ ...form, inverters: newInverters });
  };

  const handleBatteryChange = (index, field, value) => {
    const newBatteries = [...form.batteries];
    newBatteries[index] = { 
      ...newBatteries[index], 
      [field]: parseFloat(value) || 0,
      totalPrice: field === 'quantity' ? 
        (parseFloat(value) || 0) * (newBatteries[index].price || 0) :
        (newBatteries[index].quantity || 0) * (parseFloat(value) || 0)
    };
    setForm({ ...form, batteries: newBatteries });
  };

  const addInverter = () => {
    setForm({
      ...form,
      inverters: [...form.inverters, { quantity: 1, price: 0, totalPrice: 0 }],
    });
  };

  const removeInverter = (index) => {
    const newInverters = form.inverters.filter((_, i) => i !== index);
    setForm({ ...form, inverters: newInverters });
  };

  const addBattery = () => {
    setForm({
      ...form,
      batteries: [...form.batteries, { quantity: 1, price: 0, totalPrice: 0 }],
    });
  };

  const removeBattery = (index) => {
    const newBatteries = form.batteries.filter((_, i) => i !== index);
    setForm({ ...form, batteries: newBatteries });
  };

  const calculateTotalWatts = () => {
    return form.totalWattsPerPanel * form.totalPanels;
  };

  const calculateTotalPanelsPrice = () => {
    return calculateTotalWatts() * form.ratePerWatt;
  };

  const calculateTotalInvertersPrice = () => {
    return form.inverters.reduce((total, inverter) => {
      return total + (inverter.quantity * inverter.price);
    }, 0);
  };

  const calculateTotalBatteriesPrice = () => {
    return form.batteries.reduce((total, battery) => {
      return total + (battery.quantity * battery.price);
    }, 0);
  };

  const calculateServicePrice = () => {
    if (form.serviceType === 'perWatt') {
      return calculateTotalWatts() * form.servicePerWattRate;
    }
    return form.serviceTotalPrice;
  };

  const calculateFramesPrice = () => {
    if (form.framesType === 'perWatt') {
      return calculateTotalWatts() * form.framesPerWattRate;
    }
    return form.framesTotalPrice;
  };

  const calculateTotalPrice = () => {
    return (
      calculateTotalPanelsPrice() +
      calculateTotalInvertersPrice() +
      calculateTotalBatteriesPrice() +
      Number(form.cableDCPrice) +
      Number(form.cableACPrice) +
      Number(form.breakerDCPrice) +
      Number(form.breakerACPrice) +
      Number(form.breakerBatteryPrice) +
      Number(form.batteryCablePrice) +
      Number(form.luxBatteryPrice) +
      Number(form.changeOverPrice) +
      Number(form.dbPrice) +
      Number(form.accessoriesPrice) +
      Number(form.transportationPrice) +
      calculateServicePrice() +
      calculateFramesPrice() +
      Number(form.netmeteringPrice) +
      Number(form.earthingPrice) +
      Number(form.loopersSPDPrice)
    );
  };
  

  const calculateProfitWithPercentage = () => {
    const totalPrice = calculateTotalPrice();
    return (totalPrice * form.profitPercentage) / 100;
  };

  const calculateProfitWithAmount = () => {
    return Number(form.profitAmount);
  };

  const calculateFinalPriceWithPercentage = () => {
    const totalPrice = calculateTotalPrice();
    const profit = calculateProfitWithPercentage();
    return totalPrice + profit;
  };

  const calculateFinalPriceWithAmount = () => {
    const totalPrice = calculateTotalPrice();
    const profit = calculateProfitWithAmount();
    return totalPrice + profit;
  };

  const calculateFinalPrice = () => {
    if (form.selectedPriceType === 'percentage') {
      return calculateFinalPriceWithPercentage();
    }
    return calculateFinalPriceWithAmount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let clientId = selectedClientId;
      let clientData;
      // If no clientId, create client
      if (!clientId) {
        const clientResponse = await fetch(CLIENTS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.clientName,
            phoneNumber: form.clientPhone,
            email: form.clientEmail,
            address: form.clientAddress,
          }),
        });
        if (!clientResponse.ok) throw new Error('Failed to create client');
        clientData = await clientResponse.json();
        clientId = clientData._id;
      }
      let finalSystemId = systemId;
      // If no systemId, create system
      if (!finalSystemId) {
        if (!form.systemSize || !form.systemType || !form.systemLocation) {
          setError('Please fill all system fields.');
          setLoading(false);
          return;
        }
        const systemResponse = await fetch(`${CLIENTS_API_URL}/${clientId}/systems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemSize: String(form.systemSize),
            systemType: String(form.systemType),
            systemLocation: String(form.systemLocation),
          }),
        });
        const systemData = await systemResponse.json();
        if (!systemResponse.ok) throw new Error(systemData.message || 'Failed to create system');
        finalSystemId = systemData._id;
      } else if (editingCost) {
        // Update system if editing
        await fetch(`${CLIENTS_API_URL}/systems/${finalSystemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemSize: form.systemSize,
            systemType: form.systemType,
            systemLocation: form.systemLocation,
          }),
        });
        // Update client if editing
        await fetch(`${CLIENTS_API_URL}/${editingCost.client._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.clientName,
            phoneNumber: form.clientPhone,
            email: form.clientEmail,
            address: form.clientAddress,
          }),
        });
      }
      // Add totalPrice to inverters and batteries
      const invertersWithTotal = form.inverters.map(inv => ({ ...inv, totalPrice: inv.quantity * inv.price }));
      const batteriesWithTotal = form.batteries.map(bat => ({ ...bat, totalPrice: bat.quantity * bat.price }));
      // ...rest of calculations...
      const totalPrice = calculateTotalPrice();
      const profitWithPercentage = calculateProfitWithPercentage();
      const profitWithAmount = calculateProfitWithAmount();
      const finalPriceWithPercentage = calculateFinalPriceWithPercentage();
      const finalPriceWithAmount = calculateFinalPriceWithAmount();
      const finalPrice = calculateFinalPrice();
      const costData = {
        ...form,
        inverters: invertersWithTotal,
        batteries: batteriesWithTotal,
        system: finalSystemId,
        totalWatts: calculateTotalWatts(),
        totalPanelsPrice: calculateTotalPanelsPrice(),
        totalInvertersPrice: calculateTotalInvertersPrice(),
        totalBatteriesPrice: calculateTotalBatteriesPrice(),
        serviceTotalPrice: calculateServicePrice(),
        framesTotalPrice: calculateFramesPrice(),
        totalPrice,
        profitWithPercentage,
        profitWithAmount,
        finalPriceWithPercentage,
        finalPriceWithAmount,
        finalPrice,
      };
      const method = editingCost ? 'PUT' : 'POST';
      const url = editingCost ? `${CLIENTS_API_URL}/costs/${editingCost._id}` : `${CLIENTS_API_URL}/systems/${finalSystemId}/costs`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to save cost');
      } else {
        setSuccess(`Cost ${editingCost ? 'updated' : 'saved'} successfully`);
        setTimeout(() => navigate('/clients'), 1000);
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <Box sx={{ flexGrow: 1, maxWidth: 900 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {editingCost ? 'Edit Cost Calculation' : 'Cost Calculator'}
          </Typography>
          {/* Client Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Client</InputLabel>
            <Select value={selectedClientId} onChange={handleClientSelect} label="Select Client">
              <MenuItem value=''>New Client</MenuItem>
              {clients.map(client => (
                <MenuItem key={client._id} value={client._id}>{client.name} ({client.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <form onSubmit={handleSubmit}>
            {/* Client Info Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Client Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Client Name"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="clientPhone"
                  value={form.clientPhone}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="clientEmail"
                  type="email"
                  value={form.clientEmail}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  name="clientAddress"
                  value={form.clientAddress}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            {/* System Info Section */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>System Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="System Size (kW)"
                  name="systemSize"
                  type="number"
                  value={form.systemSize}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>System Type</InputLabel>
                  <Select
                    name="systemType"
                    value={form.systemType}
                    onChange={handleChange}
                    label="System Type"
                  >
                    <MenuItem value="onGrid">On Grid</MenuItem>
                    <MenuItem value="offGrid">Off Grid</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sameAddress}
                      onChange={e => setSameAddress(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="System address same as client address"
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="System Location"
                  name="systemLocation"
                  value={form.systemLocation}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={sameAddress}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />

            {/* Panels Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Panels Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Watts Per Panel"
                  name="totalWattsPerPanel"
                  type="number"
                  value={form.totalWattsPerPanel}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Panels"
                  name="totalPanels"
                  type="number"
                  value={form.totalPanels}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rate (per watt)"
                  name="ratePerWatt"
                  type="number"
                  value={form.ratePerWatt}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Total Watts: {calculateTotalWatts()}
                </Typography>
                <Typography variant="subtitle1">
                  Total Panels Price: {calculateTotalPanelsPrice()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Inverters Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Inverters</Typography>
            {form.inverters.map((inverter, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={inverter.quantity}
                    onChange={(e) => handleInverterChange(index, 'quantity', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Price"
                    type="number"
                    value={inverter.price}
                    onChange={(e) => handleInverterChange(index, 'price', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton
                    color="error"
                    onClick={() => removeInverter(index)}
                    disabled={form.inverters.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addInverter}
              sx={{ mb: 2 }}
            >
              Add Inverter
            </Button>
            <Typography variant="subtitle1">
              Total Inverters Price: {calculateTotalInvertersPrice()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Batteries Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Batteries</Typography>
            {form.batteries.map((battery, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={battery.quantity}
                    onChange={(e) => handleBatteryChange(index, 'quantity', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Price"
                    type="number"
                    value={battery.price}
                    onChange={(e) => handleBatteryChange(index, 'price', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton
                    color="error"
                    onClick={() => removeBattery(index)}
                    disabled={form.batteries.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addBattery}
              sx={{ mb: 2 }}
            >
              Add Battery
            </Button>
            <Typography variant="subtitle1">
              Total Batteries Price: {calculateTotalBatteriesPrice()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Cables and Breakers Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Cables and Breakers</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cable DC Price"
                  name="cableDCPrice"
                  type="number"
                  value={form.cableDCPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cable AC Price"
                  name="cableACPrice"
                  type="number"
                  value={form.cableACPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Breaker DC Price"
                  name="breakerDCPrice"
                  type="number"
                  value={form.breakerDCPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Breaker AC Price"
                  name="breakerACPrice"
                  type="number"
                  value={form.breakerACPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Battery Components Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Battery Components</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Breaker Battery Price"
                  name="breakerBatteryPrice"
                  type="number"
                  value={form.breakerBatteryPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Battery Cable Price"
                  name="batteryCablePrice"
                  type="number"
                  value={form.batteryCablePrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Lux Battery Price"
                  name="luxBatteryPrice"
                  type="number"
                  value={form.luxBatteryPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Infrastructure Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Infrastructure</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Change Over Price"
                  name="changeOverPrice"
                  type="number"
                  value={form.changeOverPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="DB Price"
                  name="dbPrice"
                  type="number"
                  value={form.dbPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Accessories Price"
                  name="accessoriesPrice"
                  type="number"
                  value={form.accessoriesPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Transportation Price"
                  name="transportationPrice"
                  type="number"
                  value={form.transportationPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Services and Frames Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Services and Frames</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    label="Service Type"
                  >
                    <MenuItem value="perWatt">Per Watt Rate</MenuItem>
                    <MenuItem value="total">Total Price</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {form.serviceType === 'perWatt' ? (
                  <TextField
                    label="Service Per Watt Rate"
                    name="servicePerWattRate"
                    type="number"
                    value={form.servicePerWattRate}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                ) : (
                  <TextField
                    label="Service Total Price"
                    name="serviceTotalPrice"
                    type="number"
                    value={form.serviceTotalPrice}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frames Type</InputLabel>
                  <Select
                    name="framesType"
                    value={form.framesType}
                    onChange={handleChange}
                    label="Frames Type"
                  >
                    <MenuItem value="perWatt">Per Watt Rate</MenuItem>
                    <MenuItem value="total">Total Price</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {form.framesType === 'perWatt' ? (
                  <TextField
                    label="Frames Per Watt Rate"
                    name="framesPerWattRate"
                    type="number"
                    value={form.framesPerWattRate}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                ) : (
                  <TextField
                    label="Frames Total Price"
                    name="framesTotalPrice"
                    type="number"
                    value={form.framesTotalPrice}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Additional Components Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Additional Components</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Netmetering Price"
                  name="netmeteringPrice"
                  type="number"
                  value={form.netmeteringPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Earthing Price"
                  name="earthingPrice"
                  type="number"
                  value={form.earthingPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Loopers + SPD Price"
                  name="loopersSPDPrice"
                  type="number"
                  value={form.loopersSPDPrice}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Total Price Display */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Total Price</Typography>
            <Typography variant="h5" color="primary">
              Total Price: {calculateTotalPrice()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Profit Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Profit</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Profit Percentage"
                  name="profitPercentage"
                  type="number"
                  value={form.profitPercentage}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Profit Amount"
                  name="profitAmount"
                  type="number"
                  value={form.profitAmount}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Profit with Percentage: {calculateProfitWithPercentage()}
            </Typography>
            <Typography variant="subtitle1">
              Profit with Amount: {calculateProfitWithAmount()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Final Price Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Final Price</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Final Price with Percentage: {calculateFinalPriceWithPercentage()}
            </Typography>
            <Typography variant="subtitle1">
              Final Price with Amount: {calculateFinalPriceWithAmount()}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Final Price Selection */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Select Final Price</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Final Price Type</InputLabel>
                  <Select
                    name="selectedPriceType"
                    value={form.selectedPriceType}
                    onChange={handleChange}
                    label="Final Price Type"
                  >
                    <MenuItem value="percentage">Percentage Based Price</MenuItem>
                    <MenuItem value="amount">Amount Based Price</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
              Selected Final Price: {calculateFinalPrice()}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : 'Save Cost Calculation'}
              </Button>
            </Box>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </Paper>
      </Box>
    </Box>
  );
}

export default CostCalculator; 