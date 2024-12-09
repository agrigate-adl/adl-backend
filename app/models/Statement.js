// models/Statement.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: String,
  type: String,
  amount: Number,
});

const statementSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accountHolder: { type: String, required: true },
  accountNumber: { type: String, required: true },
  totalSavings: { type: Number, required: true },
  transactions: [transactionSchema],
});

module.exports = mongoose.model('Statement', statementSchema);
