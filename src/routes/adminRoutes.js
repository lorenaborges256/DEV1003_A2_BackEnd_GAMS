const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const adminController = require('../controllers/adminController');

// GET /admin/users — list all users
router.get('/users', verifyToken, isAdmin, adminController.getUsers);

// GET /admin/users/:id — get a single user by ID
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserById);

// DELETE /admin/users/:id — remove a user from the system
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

module.exports = router;
