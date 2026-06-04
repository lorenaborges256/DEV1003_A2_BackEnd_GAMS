const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', verifyToken, async (request, response, next) => {
  try {
    const notifications = await Notification.find({ user: request.user.id }).sort({
      createdAt: -1,
    });
    return response.status(200).json(notifications);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id/read', verifyToken, async (request, response, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: request.params.id, user: request.user.id },
      { status: 'read' },
      { returnDocument: 'after' },
    );

    if (!notification) {
      return response.status(404).json({ error: 'Notification not found.' });
    }

    return response.status(200).json(notification);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
