const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Watchlist = require('../models/Watchlist');

const router = express.Router();

router.post('/', verifyToken, async (request, response, next) => {
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
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
