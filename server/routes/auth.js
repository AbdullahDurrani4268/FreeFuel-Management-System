const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Register employee (admin only)
router.post('/register', authMiddleware, adminOnly, async (req, res) => {
  try {
    let { username, email, password, role } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Generate password if not provided
    let generatedPassword;
    if (!password) {
      generatedPassword = generatePassword();
      password = generatedPassword;
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', generatedPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login (all users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'freefuel_secret',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all employees (admin only)
router.get('/employees', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'employee' };
    if (search) {
      query = {
        ...query,
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const employees = await User.find(query).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit employee (admin only)
router.put('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, email } = req.body;
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete employee (admin only)
router.delete('/employees/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//Get all users (everyone)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile and password
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update username and email
    user.username = username;
    user.email = email;

    // If changing password, validate current password and new password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
      if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 