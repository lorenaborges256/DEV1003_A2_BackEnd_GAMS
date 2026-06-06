const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Notification = require('../models/Notification');
const Watchlist = require('../models/Watchlist');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', verifyToken, notificationController.getNotifications);

router.put('/:id/read', verifyToken, notificationController.markAsRead);

router.post('/trigger', verifyToken, notificationController.triggerNotifications);

router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
