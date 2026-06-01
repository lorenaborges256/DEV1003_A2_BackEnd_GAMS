const mongoose = require('mongoose');

const contractAcceptanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ContractAcceptance = mongoose.model('ContractAcceptance', contractAcceptanceSchema);

module.exports = ContractAcceptance;
