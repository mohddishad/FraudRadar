/**
 * FraudRadar Transparent Rule-Based Risk Engine
 * 
 * Note: FraudRadar relies on explainable, deterministic heuristic rules 
 * rather than opaque black-box AI models, giving analysts immediate insight 
 * into exactly why a transaction was flagged.
 */

const HIGH_RISK_CATEGORIES = [
  'cryptocurrency',
  'online gambling',
  'wire transfer',
  'prepaid cards',
  'pawn shop',
  'peer-to-peer'
];

const MEDIUM_RISK_CATEGORIES = [
  'luxury goods',
  'electronics',
  'jewelry',
  'travel'
];

const HIGH_RISK_LOCATIONS = [
  'lagos',
  'cayman islands',
  'panama',
  'cyprus',
  'seychelles',
  'unknown'
];

/**
 * Evaluates a transaction and returns risk score (0-100), risk level (LOW/MEDIUM/HIGH),
 * and an array of transparent, human-readable reasons.
 * 
 * @param {Object} txn - The transaction data
 * @param {number} recentAccountTxnCount - Count of recent transactions by the same account (last 15 min)
 * @returns {Object} { riskScore, riskLevel, riskReasons }
 */
function evaluateRisk(txn, recentAccountTxnCount = 0) {
  let score = 0;
  const reasons = [];

  const amount = Number(txn.amount) || 0;
  const category = (txn.category || '').toLowerCase().trim();
  const location = (txn.location || '').toLowerCase().trim();
  const device = (txn.device || '').toLowerCase().trim();
  const isVpn = Boolean(
    txn.isVpnOrProxy ||
    device.includes('vpn') ||
    device.includes('proxy') ||
    device.includes('tor') ||
    device.includes('emulator')
  );

  // 1. Amount Threshold Rules
  if (amount >= 5000) {
    score += 35;
    reasons.push(`High Value Alert: Amount ($${amount.toLocaleString()}) exceeds the $5,000 threshold (+35)`);
  } else if (amount >= 2000) {
    score += 20;
    reasons.push(`Elevated Charge: Amount ($${amount.toLocaleString()}) exceeds $2,000 retail baseline (+20)`);
  }

  // Structuring / Round number signal
  if (amount >= 500 && amount % 100 === 0) {
    score += 10;
    reasons.push(`Structuring Pattern: Even round-dollar sum ($${amount.toFixed(2)}) is common in synthetic testing (+10)`);
  }

  // 2. Merchant Category Rules
  if (HIGH_RISK_CATEGORIES.some((cat) => category.includes(cat))) {
    score += 25;
    reasons.push(`High-Risk Merchant Sector: Category "${txn.category}" presents high chargeback and liquidity risk (+25)`);
  } else if (MEDIUM_RISK_CATEGORIES.some((cat) => category.includes(cat))) {
    score += 15;
    reasons.push(`Moderate-Risk Merchant Sector: Category "${txn.category}" has elevated resale liquidity (+15)`);
  }

  // 3. Time / Nocturnal Window Rule
  const txnDate = txn.timestamp ? new Date(txn.timestamp) : new Date();
  const txnHour = txnDate.getHours();
  if (txnHour >= 1 && txnHour <= 5) {
    score += 15;
    reasons.push(`Nocturnal Timing: Transaction initiated during off-hours window (${txnHour.toString().padStart(2, '0')}:00 local) (+15)`);
  }

  // 4. Anonymizer / Device Integrity Rules
  if (isVpn) {
    score += 25;
    reasons.push(`Network Anonymizer: Request routed through VPN, Tor, or untrusted proxy (+25)`);
  } else if (device.includes('new') || device.includes('unrecognized') || device.includes('unregistered')) {
    score += 10;
    reasons.push(`Hardware Alert: Unrecognized client device fingerprint (+10)`);
  }

  // 5. Geographic Corridor Rules
  if (HIGH_RISK_LOCATIONS.some((loc) => location.includes(loc))) {
    score += 20;
    reasons.push(`High-Risk Corridor: Transaction originated from flagged cross-border location (${txn.location}) (+20)`);
  }

  // 6. Velocity / Rapid Burst Rules
  if (recentAccountTxnCount >= 2) {
    score += 30;
    reasons.push(`Rapid Velocity Spike: ${recentAccountTxnCount} consecutive transactions detected within 15 minutes (+30)`);
  } else if (recentAccountTxnCount === 1) {
    score += 15;
    reasons.push(`Short-Interval Repeat: Successive transaction detected for account in close timeframe (+15)`);
  }

  // Normalize and clamp score between 5 and 100
  let finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level
  let riskLevel = 'LOW';
  if (finalScore >= 70) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 35) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Default explanation if perfectly safe
  if (reasons.length === 0) {
    finalScore = 5;
    reasons.push('Standard consumer transaction parameters verified');
    reasons.push('Known device and domestic merchant alignment');
  }

  return {
    riskScore: finalScore,
    riskLevel,
    riskReasons: reasons,
  };
}

module.exports = {
  evaluateRisk,
  HIGH_RISK_CATEGORIES,
  MEDIUM_RISK_CATEGORIES,
};
