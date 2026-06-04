const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const acceptanceController = require('../controllers/acceptanceController');

// GET /acceptances — get the current user's accepted contracts
router.get('/', verifyToken, acceptanceController.getAcceptances);

// GET /acceptances/:id — get a single acceptance record by ID
router.get('/:id', verifyToken, acceptanceController.getAcceptanceById);

// DELETE /acceptances/:id — withdraw from an accepted contract
router.delete('/:id', verifyToken, acceptanceController.withdrawAcceptance);

module.exports = router;
