const Reservation = require('../models/Reservation');
const Item = require('../models/Item');

// GET /reservations
// Returns all reservations belonging to the currently authenticated user,
// with the related item name and image populated.
const getReservations = async (request, response, next) => {
  try {
    const reservations = await Reservation.find({ user: request.user.id })
      .populate('item', 'name imageUrl price')
      .sort({ createdAt: -1 });

    return response.status(200).json(reservations);
  } catch (err) {
    return next(err);
  }
};

// GET /reservations/:id
// Returns a single reservation by ID.
// Only the owner of the reservation may access it.
const getReservationById = async (request, response, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: request.params.id,
      user: request.user.id,
    }).populate('item', 'name imageUrl price');

    if (!reservation) {
      return next({ status: 404, message: 'Reservation not found.' });
    }

    return response.status(200).json(reservation);
  } catch (err) {
    return next(err);
  }
};

// DELETE /reservations/:id
// Cancels a reservation and restores the item's stock quantity by 1.
// Only the owner of the reservation may cancel it.
const cancelReservation = async (request, response, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!reservation) {
      return next({ status: 404, message: 'Reservation not found.' });
    }

    // Restore stock quantity on the related item
    await Item.findByIdAndUpdate(reservation.item, { $inc: { stockQuantity: 1 } });

    await reservation.deleteOne();

    return response.status(200).json({ message: 'Reservation cancelled successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getReservations, getReservationById, cancelReservation };
