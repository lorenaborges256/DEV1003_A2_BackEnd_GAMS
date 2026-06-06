const Notification = require('../models/Notification');

const getNotifications = async (request, response, next) => {
  try {
    const notifications = await Notification.find({ user: request.user.id }).sort({
      createdAt: -1,
    });
    return response.status(200).json(notifications);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getNotifications };
