const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Item', 'Contract'],
    },
  },
  {
    timestamps: true,
  },
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
