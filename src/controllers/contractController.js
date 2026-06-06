const Contract = require('../models/Contract');
const ContractAcceptance = require('../models/ContractAcceptance');

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

const createContract = async (request, response, next) => {
  try {
    const contract = await Contract.create(request.body);
    return response.status(201).json(contract);
  } catch (err) {
    return next(err);
  }
};

const updateContract = async (request, response, next) => {
  try {
    const contract = await Contract.findByIdAndUpdate(request.params.id, request.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!contract) {
      return next({ status: 404, message: 'Contract not found.' });
    }

    return response.status(200).json(contract);
  } catch (err) {
    return next(err);
  }
};

const deleteContract = async (request, response, next) => {
  try {
    const contract = await Contract.findByIdAndDelete(request.params.id);

    if (!contract) {
      return next({ status: 404, message: 'Contract not found.' });
    }

    return response.status(200).json({ message: 'Contract deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

const acceptContract = async (request, response, next) => {
  try {
    const contract = await Contract.findById(request.params.id);

    if (!contract) {
      return next({ status: 404, message: 'Contract not found.' });
    }

    if (!contract.isAvailable()) {
      return next({ status: 400, message: 'Contract is not currently available.' });
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
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  acceptContract,
};
