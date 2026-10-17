const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cardholderName: {
      type: String,
      required: [true, 'Cardholder name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    merchant: {
      type: String,
      required: [true, 'Merchant name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    device: {
      type: String,
      default: 'Authorized Mobile App',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '192.168.1.10',
    },
    isVpnOrProxy: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
      index: true,
    },
    riskReasons: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED_FRAUD', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    analystNotes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for search & filtering performance
transactionSchema.index({ cardholderName: 'text', merchant: 'text', transactionRef: 'text' });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
