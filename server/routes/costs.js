const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost');

// Create a new cost
router.post('/', async (req, res) => {
  try {
    const cost = new Cost(req.body);
    await cost.save();
    res.status(201).json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a cost
router.put('/:id', async (req, res) => {
  try {
    const cost = await Cost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true // Enable validation on update
      }
    );
    if (!cost) {
      return res.status(404).json({ message: 'Cost not found' });
    }
    res.json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all costs with populated client data
router.get('/', async (req, res) => {
  try {
    const costs = await Cost.find()
      .populate('client', 'name phoneNumber email address')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(costs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific cost with populated client data
router.get('/:id', async (req, res) => {
  try {
    const cost = await Cost.findById(req.params.id)
      .populate('client', 'name phoneNumber email address');
    if (!cost) {
      return res.status(404).json({ message: 'Cost not found' });
    }
    res.json(cost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a cost
router.delete('/:id', async (req, res) => {
  try {
    const cost = await Cost.findByIdAndDelete(req.params.id);
    if (!cost) {
      return res.status(404).json({ message: 'Cost not found' });
    }
    res.json({ message: 'Cost deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 