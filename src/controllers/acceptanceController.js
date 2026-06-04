const ContractAcceptance = require('../models/ContractAcceptance');
const Contract = require('../models/Contract');

// GET /acceptances
// Returns all contract acceptances belonging to the currently authenticated user,
// with the related contract title, reward description, and dates populated.
const getAcceptances = async (request, response, next) => {
  try {
    const acceptances = await ContractAcceptance.find({ user: request.user.id })
      .populate('contract', 'title rewardDescription rewardAmount startAt endAt')
      .sort({ createdAt: -1 });

    return response.status(200).json(acceptances);
  } catch (err) {
    return next(err);
  }
};

// GET /acceptances/:id
// Returns a single contract acceptance by ID.
// Only the owner of the acceptance may access it.
const getAcceptanceById = async (request, response, next) => {
  try {
    const acceptance = await ContractAcceptance.findOne({
      _id: request.params.id,
      user: request.user.id,
    }).populate('contract', 'title rewardDescription rewardAmount startAt endAt');

    if (!acceptance) {
      return next({ status: 404, message: 'Acceptance not found.' });
    }

    return response.status(200).json(acceptance);
  } catch (err) {
    return next(err);
  }
};

// DELETE /acceptances/:id
// Withdraws the user from an accepted contract and decrements
// the contract's currentAcceptances count by 1.
// Only the owner of the acceptance may withdraw.
const withdrawAcceptance = async (request, response, next) => {
  try {
    const acceptance = await ContractAcceptance.findOne({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!acceptance) {
      return next({ status: 404, message: 'Acceptance not found.' });
    }

    // Restore the acceptance slot on the related contract
    await Contract.findByIdAndUpdate(acceptance.contract, {
      $inc: { currentAcceptances: -1 },
    });

    await acceptance.deleteOne();

    return response.status(200).json({ message: 'Withdrawn from contract successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAcceptances, getAcceptanceById, withdrawAcceptance };
