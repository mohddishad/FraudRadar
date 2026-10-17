const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { evaluateRisk } = require('../services/riskEngine');
const { getPreparedSeedData } = require('../data/seedData');

/**
 * Safely escape regular expression special characters to prevent ReDoS / Regex Syntax crashes
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/transactions
 * Retrieve transactions with safe search, strict allowlists, and bounded pagination
 */
exports.getTransactions = async (req, res, next) => {
  try {
    // Strictly extract string primitives to prevent query parameter type confusion & NoSQL injection
    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const rawRisk = typeof req.query.riskLevel === 'string' ? req.query.riskLevel.trim().toUpperCase() : '';
    const rawStatus = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : '';
    const rawSortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy.trim() : 'timestamp';
    const rawSortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.trim().toLowerCase() : 'desc';

    const query = {};

    // 1. Safe regex search
    if (rawSearch) {
      const escaped = escapeRegex(rawSearch);
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [
        { transactionRef: searchRegex },
        { cardholderName: searchRegex },
        { merchant: searchRegex },
        { accountNumber: searchRegex },
        { category: searchRegex },
        { location: searchRegex },
      ];
    }

    // 2. Strict allowlist check for riskLevel
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
    if (rawRisk && validRiskLevels.includes(rawRisk)) {
      query.riskLevel = rawRisk;
    }

    // 3. Strict allowlist check for status (prevents NoSQL injection like status[$ne])
    const validStatuses = ['PENDING', 'CONFIRMED_FRAUD', 'DISMISSED'];
    if (rawStatus && validStatuses.includes(rawStatus)) {
      query.status = rawStatus;
    }

    // 4. Bounded pagination (prevents memory exhaustion)
    const pageNum = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // 5. Strict sorting allowlist
    const sortField = ['timestamp', 'amount', 'riskScore'].includes(rawSortBy) ? rawSortBy : 'timestamp';
    const sortDirection = rawSortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * Retrieve single transaction details by ID or reference with strict format validation
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction identifier provided',
      });
    }

    const cleanId = id.trim();
    let transaction;

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      transaction = await Transaction.findById(cleanId).lean();
    } else if (/^TXN-[0-9]{4,8}$/i.test(cleanId)) {
      transaction = await Transaction.findOne({ transactionRef: cleanId.toUpperCase() }).lean();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Transaction identifier must be a valid 24-character hexadecimal ID or reference code (e.g. TXN-12345)',
      });
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with identifier: ${cleanId}`,
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transactions
 * Create a new transaction with strict type validation, length bounds, and rule-based risk evaluation
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const body = req.body || {};
    const validationErrors = [];

    // 1. Validate Cardholder Name
    if (typeof body.cardholderName !== 'string' || body.cardholderName.trim().length === 0) {
      validationErrors.push('Cardholder name is required and must be text');
    } else if (body.cardholderName.trim().length > 100) {
      validationErrors.push('Cardholder name must not exceed 100 characters');
    }

    // 2. Validate Amount
    const parsedAmount = Number(body.amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      validationErrors.push('Amount must be a positive finite number greater than 0');
    } else if (parsedAmount > 10000000) {
      validationErrors.push('Amount exceeds maximum processing limit of $10,000,000');
    }

    // 3. Validate Merchant
    if (typeof body.merchant !== 'string' || body.merchant.trim().length === 0) {
      validationErrors.push('Merchant name is required and must be text');
    } else if (body.merchant.trim().length > 100) {
      validationErrors.push('Merchant name must not exceed 100 characters');
    }

    // 4. Validate Category
    if (typeof body.category !== 'string' || body.category.trim().length === 0) {
      validationErrors.push('Category is required and must be text');
    } else if (body.category.trim().length > 50) {
      validationErrors.push('Category must not exceed 50 characters');
    }

    // 5. Validate Location
    if (typeof body.location !== 'string' || body.location.trim().length === 0) {
      validationErrors.push('Location is required and must be text');
    } else if (body.location.trim().length > 100) {
      validationErrors.push('Location must not exceed 100 characters');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Sanitize optional and bounded fields
    let cleanAccount = typeof body.accountNumber === 'string' ? body.accountNumber.trim().slice(0, 30) : '';
    if (!cleanAccount) {
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      cleanAccount = `4000 **** **** ${randDigits}`;
    }

    const cleanDevice = typeof body.device === 'string' ? body.device.trim().slice(0, 100) : 'Authorized Mobile App';
    const cleanIp = typeof body.ipAddress === 'string' ? body.ipAddress.trim().slice(0, 45) : '192.168.1.1';
    const cleanCurrency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase().slice(0, 5) : 'USD';
    const cleanIsVpn = Boolean(body.isVpnOrProxy);

    // Check account velocity (consecutive txns in last 15 mins)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentVelocityCount = await Transaction.countDocuments({
      accountNumber: cleanAccount,
      timestamp: { $gte: fifteenMinutesAgo },
    });

    const txnPayload = {
      cardholderName: body.cardholderName.trim().slice(0, 100),
      accountNumber: cleanAccount,
      amount: Math.round(parsedAmount * 100) / 100,
      currency: cleanCurrency,
      merchant: body.merchant.trim().slice(0, 100),
      category: body.category.trim().slice(0, 50),
      location: body.location.trim().slice(0, 100),
      device: cleanDevice,
      ipAddress: cleanIp,
      isVpnOrProxy: cleanIsVpn,
      timestamp: body.timestamp && !isNaN(new Date(body.timestamp).getTime()) ? new Date(body.timestamp) : new Date(),
    };

    // Run transparent rule-based risk evaluation
    const { riskScore, riskLevel, riskReasons } = evaluateRisk(txnPayload, recentVelocityCount);

    // Generate unique reference
    const uniqueNum = Math.floor(10000 + Math.random() * 90000);
    const transactionRef = `TXN-${uniqueNum}`;

    const newTransaction = new Transaction({
      ...txnPayload,
      transactionRef,
      riskScore,
      riskLevel,
      riskReasons,
      status: 'PENDING',
    });

    await newTransaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction successfully processed and scored',
      data: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/transactions/:id/status
 * Update review status (CONFIRMED_FRAUD, DISMISSED, PENDING)
 * Validates ObjectId format and restricts input fields
 */
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Strict validation of ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format. Must be a valid 24-character hexadecimal ObjectId.',
      });
    }

    const { status, analystNotes = '', reviewedBy = 'Analyst' } = req.body || {};

    const validStatuses = ['PENDING', 'CONFIRMED_FRAUD', 'DISMISSED'];
    if (!status || typeof status !== 'string' || !validStatuses.includes(status.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updatedStatus = status.trim().toUpperCase();
    const isReviewComplete = updatedStatus !== 'PENDING';

    const safeNotes = typeof analystNotes === 'string' ? analystNotes.trim().slice(0, 1000) : '';
    const safeReviewer = typeof reviewedBy === 'string' ? reviewedBy.trim().slice(0, 100) : 'Analyst';

    const updateFields = {
      status: updatedStatus,
      analystNotes: safeNotes,
      reviewedAt: isReviewComplete ? new Date() : null,
      reviewedBy: isReviewComplete ? safeReviewer : '',
    };

    const transaction = await Transaction.findByIdAndUpdate(id, updateFields, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with ID: ${id}`,
      });
    }

    res.json({
      success: true,
      message: `Transaction marked as ${updatedStatus}`,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/metrics
 * Calculate dashboard analytics and metrics directly from database
 */
exports.getMetrics = async (req, res, next) => {
  try {
    const [counts, volumeAgg, categoryAgg, timelineAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            pendingCount: {
              $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
            },
            confirmedFraudCount: {
              $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED_FRAUD'] }, 1, 0] },
            },
            dismissedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'DISMISSED'] }, 1, 0] },
            },
            highRiskCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] },
            },
            mediumRiskCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] },
            },
            lowRiskCount: {
              $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] },
            },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            volume: { $sum: '$amount' },
            avgRisk: { $avg: '$riskScore' },
          },
        },
        { $sort: { volume: -1 } },
        { $limit: 6 },
      ]),

      Transaction.find()
        .sort({ timestamp: -1 })
        .limit(7)
        .select('transactionRef amount riskScore timestamp')
        .lean(),
    ]);

    const stat = counts[0] || {
      totalTransactions: 0,
      pendingCount: 0,
      confirmedFraudCount: 0,
      dismissedCount: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
    };

    const volume = volumeAgg[0] || {
      totalVolume: 0,
      avgAmount: 0,
    };

    const fraudRate = stat.totalTransactions > 0
      ? ((stat.confirmedFraudCount / stat.totalTransactions) * 100).toFixed(1)
      : '0.0';

    const riskDistribution = [
      { name: 'Low Risk (0-34)', value: stat.lowRiskCount, color: '#10b981' },
      { name: 'Medium Risk (35-69)', value: stat.mediumRiskCount, color: '#f59e0b' },
      { name: 'High Risk (70-100)', value: stat.highRiskCount, color: '#ef4444' },
    ];

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions: stat.totalTransactions,
          totalVolume: Math.round(volume.totalVolume * 100) / 100,
          avgAmount: Math.round(volume.avgAmount * 100) / 100,
          pendingCount: stat.pendingCount,
          confirmedFraudCount: stat.confirmedFraudCount,
          dismissedCount: stat.dismissedCount,
          highRiskCount: stat.highRiskCount,
          mediumRiskCount: stat.mediumRiskCount,
          lowRiskCount: stat.lowRiskCount,
          fraudRate: parseFloat(fraudRate),
        },
        riskDistribution,
        categoryBreakdown: categoryAgg.map((cat) => ({
          category: cat._id,
          count: cat.count,
          volume: Math.round(cat.volume),
          avgRisk: Math.round(cat.avgRisk),
        })),
        recentTrend: timelineAgg.reverse().map((t) => ({
          ref: t.transactionRef,
          amount: t.amount,
          riskScore: t.riskScore,
          time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/seed
 * Seed 15-20 realistic transactions into database without duplicates
 */
exports.seedDemoTransactions = async (req, res, next) => {
  try {
    const demoItems = getPreparedSeedData();
    let createdCount = 0;

    for (const item of demoItems) {
      const result = await Transaction.findOneAndUpdate(
        { transactionRef: item.transactionRef },
        { $set: item },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      if (result) {
        createdCount++;
      }
    }

    const totalInDb = await Transaction.countDocuments();

    res.json({
      success: true,
      message: `Successfully seeded ${demoItems.length} demo transactions with realistic risk scores and rules`,
      totalInDatabase: totalInDb,
    });
  } catch (error) {
    next(error);
  }
};
