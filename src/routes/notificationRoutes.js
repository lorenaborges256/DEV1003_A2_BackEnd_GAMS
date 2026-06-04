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

module.exports = router;
