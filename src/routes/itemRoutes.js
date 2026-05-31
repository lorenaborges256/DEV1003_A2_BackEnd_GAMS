const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const Item = require('../models/Item');

const router = express.Router();

router.get('/', verifyToken, async (request, response, next) => {
  try {
    // TODO: add search by name
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
    response.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', verifyToken, async (request, response, next) => {
  try {
    const item = await Item.findById(request.params.id);

    if (!item) {
      return response.status(404).json({ error: 'Item not found.' });
    }

    return response.status(200).json(item);
  } catch (error) {
    return next(error);
  }
});

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
      new: true,
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

module.exports = router;
