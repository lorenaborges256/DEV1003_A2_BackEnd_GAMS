const Watchlist = require('../models/Watchlist');

const getWatchlist = async (request, response, next) => {
  try {
    const watchlist = await Watchlist.find({ user: request.user.id });
    return response.status(200).json(watchlist);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getWatchlist };
