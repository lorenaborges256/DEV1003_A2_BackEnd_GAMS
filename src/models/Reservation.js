const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    reservationNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

reservationSchema.pre('save', function () {
  if (!this.reservationNumber) {
    this.reservationNumber = `RES-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
