const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Watchlist = require('../models/Watchlist');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.post('/', verifyToken, watchlistController.addToWatchlist);

router.delete('/:id', verifyToken, watchlistController.removeFromWatchlist);

router.get('/', verifyToken, watchlistController.getWatchlist);

module.exports = router;
