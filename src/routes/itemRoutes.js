const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const itemController = require('../controllers/itemController');

router.get('/', verifyToken, itemController.getItems);

router.get('/:id', verifyToken, itemController.getItemById);

router.post('/', verifyToken, isAdmin, itemController.createItem);

router.put('/:id', verifyToken, isAdmin, itemController.updateItem);

router.post('/:id/reserve', verifyToken, itemController.reserveItem);

router.delete('/:id', verifyToken, isAdmin, itemController.deleteItem);

module.exports = router;
