const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const Contract = require('../models/Contract');
const ContractAcceptance = require('../models/ContractAcceptance');

const router = express.Router();

router.get('/', verifyToken, async (request, response, next) => {
  try {
    const filter = {};

    if (request.query.type) {
      filter.type = request.query.type;
    }

    if (request.query.status === 'available') {
      const now = new Date();
      filter.startAt = { $lte: now };
      filter.endAt = { $gte: now };
    } else if (request.query.status === 'upcoming') {
      const now = new Date();
      filter.startAt = { $gt: now };
    }

    const contracts = await Contract.find(filter);
    response.status(200).json(contracts);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', verifyToken, async (request, response, next) => {
  try {
    const contract = await Contract.findById(request.params.id);

    if (!contract) {
      return response.status(404).json({ error: 'Contract not found.' });
    }

    return response.status(200).json({
      ...contract.toObject(),
      isAvailable: contract.isAvailable(),
      placesRemaining: contract.maxAcceptances - contract.currentAcceptances,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const contract = await Contract.create(request.body);
    return response.status(201).json(contract);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const contract = await Contract.findByIdAndUpdate(request.params.id, request.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!contract) {
      return response.status(404).json({ error: 'Contract not found.' });
    }

    return response.status(200).json(contract);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/accept', verifyToken, async (request, response, next) => {
  try {
    const contract = await Contract.findById(request.params.id);

    if (!contract) {
      return response.status(404).json({ error: 'Contract not found.' });
    }

    if (!contract.isAvailable()) {
      return response.status(400).json({ error: 'Contract is not currently available.' });
    }

    contract.currentAcceptances += 1;
    await contract.save();

    const acceptance = await ContractAcceptance.create({
      user: request.user.id,
      contract: contract._id,
      instructions: `Present this acceptance to the guild upon completion to collect your reward. Contract: ${contract.title}. Reward: ${contract.rewardAmount} Gold.`,
    });

    return response.status(201).json({
      message: 'Contract accepted successfully.',
      instructions: acceptance.instructions,
      contract: {
        id: contract._id,
        title: contract.title,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', verifyToken, isAdmin, async (request, response, next) => {
  try {
    const contract = await Contract.findByIdAndDelete(request.params.id);

    if (!contract) {
      return response.status(404).json({ error: 'Contract not found.' });
    }

    return response.status(200).json({ message: 'Contract deleted successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
