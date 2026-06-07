const Watchlist = require('../models/Watchlist');

const getWatchlist = async (request, response, next) => {
  try {
    const watchlist = await Watchlist.find({ user: request.user.id });
    return response.status(200).json(watchlist);
  } catch (err) {
    return next(err);
  }
};

const addToWatchlist = async (request, response, next) => {
  try {
    const { targetId, targetType } = request.body;

    const existing = await Watchlist.findOne({
      user: request.user.id,
      targetId,
    });

    if (existing) {
      return response.status(409).json({ error: 'Already watching this item.' });
    }

    const watchlistEntry = await Watchlist.create({
      user: request.user.id,
      targetId,
      targetType,
    });

    return response.status(201).json(watchlistEntry);
  } catch (err) {
    return next(err);
  }
};

const removeFromWatchlist = async (request, response, next) => {
  try {
    const watchlistEntry = await Watchlist.findOneAndDelete({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!watchlistEntry) {
      return next({ status: 404, message: 'Watchlist entry not found.' });
    }

    return response.status(200).json({ message: 'Removed from watchlist.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
