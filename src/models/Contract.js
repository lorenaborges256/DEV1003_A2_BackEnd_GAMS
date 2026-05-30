const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      trim: true,
    },
    rewardDescription: {
      type: String,
      required: true,
      trim: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    maxAcceptances: {
      type: Number,
      required: true,
    },
    currentAcceptances: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

contractSchema.methods.isAvailable = function isAvailable() {
  const now = new Date();
  return now >= this.startAt && now <= this.endAt && this.currentAcceptances < this.maxAcceptances;
};

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
