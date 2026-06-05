const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const Reservation = require('../models/Reservation');
const Item = require('../models/Item');

const router = express.Router();

const itemController = require('../controllers/itemController');

router.get('/', verifyToken, itemController.getItems);

router.get('/:id', verifyToken, itemController.getItemById);

router.post('/', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const item = await Item.create(request.body);
    return response.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const item = await Item.findByIdAndUpdate(request.params.id, request.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!item) {
      return response.status(404).json({ error: 'Item not found.' });
    }

    return response.status(200).json(item);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/reserve', verifyToken, async (request, response, next) => {
  try {
    const item = await Item.findById(request.params.id);

    if (!item) {
      return response.status(404).json({ error: 'Item not found.' });
    }

    if (!item.isAvailable()) {
      return response.status(400).json({ error: 'Item is currently unavailable.' });
    }

    item.stockQuantity -= 1;
    await item.save();

    const reservation = await Reservation.create({
      user: request.user.id,
      item: item._id,
    });

    return response.status(201).json({
      message: 'Item reserved successfully.',
      reservationNumber: reservation.reservationNumber,
      item: {
        id: item._id,
        name: item.name,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const item = await Item.findByIdAndDelete(request.params.id);

    if (!item) {
      return response.status(404).json({ error: 'Item not found.' });
    }

    return response.status(200).json({ message: 'Item deleted successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
