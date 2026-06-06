const Contract = require('../models/Contract');

const getContracts = async (request, response, next) => {
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
    return response.status(200).json(contracts);
  } catch (err) {
    return next(err);
  }
};

const getContractById = async (request, response, next) => {
  try {
    const contract = await Contract.findById(request.params.id);

    if (!contract) {
      return next({ status: 404, message: 'Contract not found.' });
    }

    return response.status(200).json({
      ...contract.toObject(),
      isAvailable: contract.isAvailable(),
      placesRemaining: contract.maxAcceptances - contract.currentAcceptances,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getContracts, getContractById };
