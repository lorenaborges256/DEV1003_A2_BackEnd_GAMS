const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// All dashboard routes require a valid token (any authenticated user).
// Controllers will be added here as they are implemented.

// GET /dashboard — user's personal dashboard summary
router.get('/', verifyToken, (request, response) => {
  response.status(200).json({ message: 'Dashboard route — controller coming soon.' });
});

module.exports = router;
