const Notification = require('../models/Notification');
const Watchlist = require('../models/Watchlist');

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

const markAsRead = async (request, response, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: request.params.id, user: request.user.id },
      { status: 'read' },
      { returnDocument: 'after' },
    );

    if (!notification) {
      return next({ status: 404, message: 'Notification not found.' });
    }

    return response.status(200).json(notification);
  } catch (err) {
    return next(err);
  }
};

const triggerNotifications = async (request, response, next) => {
  try {
    const { targetId, targetType, message } = request.body;

    const watchlistEntries = await Watchlist.find({ targetId });

    if (watchlistEntries.length === 0) {
      return response.status(200).json({ message: 'No users watching this item.' });
    }

    const notifications = await Promise.all(
      watchlistEntries.map((entry) => Notification.create({
        user: entry.user,
        targetId,
        targetType,
        message,
      })),
    );

    return response.status(201).json({
      message: `${notifications.length} notification(s) sent.`,
      notifications,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteNotification = async (request, response, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!notification) {
      return next({ status: 404, message: 'Notification not found.' });
    }

    return response.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  triggerNotifications,
  deleteNotification,
};
