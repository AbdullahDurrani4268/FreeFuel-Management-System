const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/auth');

let io;
function setSocketIO(socketIO) { io = socketIO; }

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { heading, description, assignedTo, dueDate } = req.body;
    const author = req.user.userId;
    const task = new Task({ heading, description, assignedTo, dueDate, author });
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('author', 'username email').populate('assignedTo', 'username email');
    if (io) io.emit('taskChanged', { type: 'create', task: populatedTask });
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks (show all to all users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('author', 'username email')
      .populate({ path: 'assignedTo', select: 'username email', match: { _id: { $exists: true } } })
      .sort({ createdAt: -1 });
    // Add createdBy field
    const tasksWithCreatedBy = tasks.map(task => ({
      ...task.toObject(),
      createdBy: task.author?.username || 'Unknown',
      assignedTo: task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.username : (task.assignedTo === 'all' ? 'All' : task.assignedTo)
    }));
    res.json(tasksWithCreatedBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task (only author or admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.author) !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { heading, description, assignedTo, dueDate } = req.body;
    task.heading = heading;
    task.description = description;
    task.assignedTo = assignedTo;
    task.dueDate = dueDate;
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('author', 'username email').populate('assignedTo', 'username email');
    if (io) io.emit('taskChanged', { type: 'update', task: populatedTask });
    res.json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change status (only assigned user or 'all')
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Only assigned user (or 'all') can update status
    if (
      (task.assignedTo !== 'all' && String(task.assignedTo) !== req.user.userId && req.user.role !== 'admin')
    ) {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }
    task.status = req.body.status;
    await task.save();
    const populatedTask = await Task.findById(task._id).populate('author', 'username email').populate('assignedTo', 'username email');
    if (io) io.emit('taskChanged', { type: 'status', task: populatedTask });
    res.json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task (only author or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.author) !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await task.deleteOne();
    if (io) io.emit('taskChanged', { type: 'delete', taskId: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export setSocketIO for server.js
module.exports = router;
module.exports.setSocketIO = setSocketIO;
