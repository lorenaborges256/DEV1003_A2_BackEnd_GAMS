const Item = require('../models/Item');
const Reservation = require('../models/Reservation');

const getItems = async (request, response, next) => {
  try {
    const filter = {};

    if (request.query.category) {
      filter.category = request.query.category;
    }

    if (request.query.status === 'available') {
      filter.stockQuantity = { $gt: 0 };
    } else if (request.query.status === 'unavailable') {
      filter.stockQuantity = 0;
    }

    const items = await Item.find(filter);
    return response.status(200).json(items);
  } catch (err) {
    return next(err);
  }
};

const getItemById = async (request, response, next) => {
  try {
    const item = await Item.findById(request.params.id);

    if (!item) {
      return next({ status: 404, message: 'Item not found.' });
    }

    return response.status(200).json(item);
  } catch (err) {
    return next(err);
  }
};

const createItem = async (request, response, next) => {
  try {
    const item = await Item.create(request.body);
    return response.status(201).json(item);
  } catch (err) {
    return next(err);
  }
};

const updateItem = async (request, response, next) => {
  try {
    const item = await Item.findByIdAndUpdate(request.params.id, request.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!item) {
      return next({ status: 404, message: 'Item not found.' });
    }

    return response.status(200).json(item);
  } catch (err) {
    return next(err);
  }
};

const deleteItem = async (request, response, next) => {
  try {
    const item = await Item.findByIdAndDelete(request.params.id);

    if (!item) {
      return next({ status: 404, message: 'Item not found.' });
    }

    return response.status(200).json({ message: 'Item deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

const reserveItem = async (request, response, next) => {
  try {
    const item = await Item.findById(request.params.id);

    if (!item) {
      return next({ status: 404, message: 'Item not found.' });
    }

    if (!item.isAvailable()) {
      return next({ status: 400, message: 'Item is currently unavailable.' });
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
  } catch (err) {
    return next(err);
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, reserveItem };
