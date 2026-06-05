const Item = require('../models/Item');

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

module.exports = { getItems, getItemById };
