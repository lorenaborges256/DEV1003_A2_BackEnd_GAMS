const express = require('express');

const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// POST /auth/register — create a new user account
router.post('/register', register);

// POST /auth/login — authenticate and receive a JWT
router.post('/login', login);

// POST /auth/logout — instruct the client to discard the token
router.post('/logout', logout);

module.exports = router;
