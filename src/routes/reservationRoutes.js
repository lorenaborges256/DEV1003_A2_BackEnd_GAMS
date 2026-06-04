const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const reservationController = require('../controllers/reservationController');

// GET /reservations — get the current user's reservations
router.get('/', verifyToken, reservationController.getReservations);

// GET /reservations/:id — get a single reservation by ID
router.get('/:id', verifyToken, reservationController.getReservationById);

// DELETE /reservations/:id — cancel a reservation
router.delete('/:id', verifyToken, reservationController.cancelReservation);

module.exports = router;
