import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const PRESETS = [
  {
    name: '🔴 Flagged Crypto Scam',
    data: {
      cardholderName: 'Viktor Dragunov',
      accountNumber: '4111 **** **** 7701',
      amount: '8400.00',
      currency: 'USD',
      merchant: 'CoinNexus OTC Swap',
      category: 'Cryptocurrency',
      location: 'Seychelles',
      device: 'Tor Exit Node / Proxy',
      ipAddress: '185.220.101.44',
      isVpnOrProxy: true,
    },
  },
  {
    name: '🔴 Offshore Gambling Spill',
    data: {
      cardholderName: 'Damian Cross',
      accountNumber: '5424 **** **** 1092',
      amount: '5100.00',
      currency: 'USD',
      merchant: 'Royal Palms Casino Online',
      category: 'Online Gambling',
      location: 'Panama City, PA',
      device: 'Android Emulator / Residential Proxy',
      ipAddress: '190.14.88.19',
      isVpnOrProxy: true,
    },
  },
  {
    name: '🟡 Large Electronics Purchase',
    data: {
      cardholderName: 'Sarah Jenkins',
      accountNumber: '4000 **** **** 4821',
      amount: '2350.00',
      currency: 'USD',
      merchant: 'B&H Photo Video New York',
      category: 'Electronics',
      location: 'New York, US',
      device: 'Chrome / Windows (Unrecognized)',
      ipAddress: '68.195.42.11',
      isVpnOrProxy: false,
    },
  },
  {
    name: '🟢 Normal Daily Retail',
    data: {
      cardholderName: 'Emily Watson',
      accountNumber: '3782 **** **** 9012',
      amount: '48.75',
      currency: 'USD',
      merchant: 'Trader Joe\'s Grocery',
      category: 'Grocery',
      location: 'San Francisco, US',
      device: 'Apple Pay on iPhone 15',
      ipAddress: '73.222.18.9',
      isVpnOrProxy: false,
    },
  },
];

export const NewTransactionModal = ({
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    cardholderName: '',
    accountNumber: '',
    amount: '',
    currency: 'USD',
    merchant: '',
    category: 'Retail',
    location: '',
    device: 'Authorized Mobile App',
    ipAddress: '192.168.1.1',
    isVpnOrProxy: false,
  });

  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const applyPreset = (preset) => {
    setFormData({ ...preset.data });
    setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];

    if (!formData.cardholderName.trim()) {
      newErrors.push('Cardholder name is required.');
    }
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.push('Please enter a valid amount greater than $0.');
    }
    if (!formData.merchant.trim()) {
      newErrors.push('Merchant name is required.');
    }
    if (!formData.location.trim()) {
      newErrors.push('Location is required.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    try {
      await onSubmit(formData);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Failed to process transaction. Verify backend connectivity.';
      setErrors([serverMsg]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Simulate New Transaction</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                Rule Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Submit transaction telemetry to execute transparent backend heuristic scoring.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick Preset Selector for Easy Testing */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick Fill Demo Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-indigo-950/50 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 border border-slate-800 transition text-left cursor-pointer truncate"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Box */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Validation Alert:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cardholder Name */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Cardholder Name *
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Account Number Mask */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Account / Card Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="4111 **** **** 8820"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 5200.00"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Merchant */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Merchant Name *
              </label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                placeholder="e.g. Kraken Exchange"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Industry Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Retail">Retail</option>
                <option value="Grocery">Grocery</option>
                <option value="Dining">Dining</option>
                <option value="Electronics">Electronics</option>
                <option value="Travel">Travel</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Cryptocurrency">Cryptocurrency (High Risk)</option>
                <option value="Online Gambling">Online Gambling (High Risk)</option>
                <option value="Wire Transfer">Wire Transfer (High Risk)</option>
                <option value="Prepaid Cards">Prepaid Cards (High Risk)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Origination Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. New York, US or Lagos, NG"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Client Device */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Client Device Fingerprint
              </label>
              <input
                type="text"
                name="device"
                value={formData.device}
                onChange={handleChange}
                placeholder="e.g. Safari on iOS or Tor Proxy"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Origin IP Address
              </label>
              <input
                type="text"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="e.g. 192.168.1.1"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Proxy Checkbox */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="isVpnOrProxy"
              name="isVpnOrProxy"
              checked={formData.isVpnOrProxy}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isVpnOrProxy" className="text-xs text-slate-300 cursor-pointer select-none">
              Flag request as routed through an <span className="font-semibold text-rose-300">Untrusted VPN, Tor exit node, or anonymous proxy</span> (+25 heuristic points)
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating & Saving...' : 'Run Risk Scoring & Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransactionModal;
