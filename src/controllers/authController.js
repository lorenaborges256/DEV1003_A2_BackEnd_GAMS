/* eslint-disable linebreak-style */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generates a signed JWT for a given user id and role
const generateToken = (userId, role) => jwt.sign(
  { id: userId, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' },
);

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// POST /auth/logout
const logout = (req, res) => res.status(200).json({
  message: 'Logged out successfully. Please discard your token on the client.',
});

module.exports = { register, login, logout };
