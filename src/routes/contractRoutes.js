const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const contractController = require('../controllers/contractController');

const router = express.Router();

router.get('/', verifyToken, contractController.getContracts);

router.get('/:id', verifyToken, contractController.getContractById);

router.post('/', verifyToken, isAdmin, contractController.createContract);

router.put('/:id', verifyToken, isAdmin, contractController.updateContract);

router.post('/:id/accept', verifyToken, contractController.acceptContract);

router.delete('/:id', verifyToken, isAdmin, contractController.deleteContract);

module.exports = router;
