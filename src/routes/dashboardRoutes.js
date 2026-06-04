const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const dashboardController = require('../controllers/dashboardController');

// GET /dashboard — get the current user's full activity summary
router.get('/', verifyToken, dashboardController.getDashboard);

module.exports = router;
