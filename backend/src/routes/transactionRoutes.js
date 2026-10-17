const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getMetrics,
  seedDemoTransactions,
} = require('../controllers/transactionController');
const { requireAnalystAuth } = require('../middleware/auth');

// Public read endpoints (metrics & search)
router.get('/metrics', getMetrics);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionById);

// Transaction creation / ingestion
router.post('/transactions', createTransaction);

// Protected Analyst Action Endpoints (require Analyst authentication)
router.patch('/transactions/:id/status', requireAnalystAuth, updateTransactionStatus);
router.post('/seed', requireAnalystAuth, seedDemoTransactions);

module.exports = router;
