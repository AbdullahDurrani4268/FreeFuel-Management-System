const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const System = require('../models/System');
const Cost = require('../models/Cost');

// Create a new client
router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific client
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a client (cascade delete systems and costs)
router.delete('/:id', async (req, res) => {
  try {
    // Find all systems for this client
    const systems = await System.find({ client: req.params.id });
    // Delete all costs for each system
    for (const system of systems) {
      await Cost.deleteMany({ system: system._id });
    }
    // Delete all systems for this client
    await System.deleteMany({ client: req.params.id });
    // Delete the client
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client and all related systems and costs deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SYSTEM ROUTES
// Add a system to a client
router.post('/:clientId/systems', async (req, res) => {
  try {
    const system = new System({ ...req.body, client: req.params.clientId });
    await system.save();
    res.status(201).json(system);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get all systems for a client
router.get('/:clientId/systems', async (req, res) => {
  try {
    const systems = await System.find({ client: req.params.clientId });
    res.json(systems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update a system
router.put('/systems/:systemId', async (req, res) => {
  try {
    const system = await System.findByIdAndUpdate(req.params.systemId, req.body, { new: true });
    res.json(system);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete a system (cascade delete costs)
router.delete('/systems/:systemId', async (req, res) => {
  try {
    // Delete all costs for this system
    await Cost.deleteMany({ system: req.params.systemId });
    // Delete the system
    await System.findByIdAndDelete(req.params.systemId);
    res.json({ message: 'System and its cost deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// COST ROUTES
// Add a cost to a system
router.post('/systems/:systemId/costs', async (req, res) => {
  try {
    const cost = new Cost({ ...req.body, system: req.params.systemId });
    await cost.save();
    res.status(201).json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get all costs for a system
router.get('/systems/:systemId/costs', async (req, res) => {
  try {
    const costs = await Cost.find({ system: req.params.systemId });
    res.json(costs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update a cost
router.put('/costs/:costId', async (req, res) => {
  try {
    const cost = await Cost.findByIdAndUpdate(req.params.costId, req.body, { new: true });
    res.json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete a cost
router.delete('/costs/:costId', async (req, res) => {
  try {
    await Cost.findByIdAndDelete(req.params.costId);
    res.json({ message: 'Cost deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 