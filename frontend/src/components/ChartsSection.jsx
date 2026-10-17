import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs">
        <p className="font-semibold text-white mb-1">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-slate-300 flex items-center justify-between gap-4 py-0.5">
            <span style={{ color: entry.color || entry.fill }}>{entry.name}:</span>
            <span className="font-mono font-medium text-white">
              {entry.name.toLowerCase().includes('volume')
                ? `$${Number(entry.value).toLocaleString()}`
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsSection = ({
  categoryBreakdown = [],
  riskDistribution = [],
  isLoading = false,
}) => {
  const hasData = categoryBreakdown.length > 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Volume & Risk Chart */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Top Merchant Sectors by Volume ($)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Aggregated from active transactions</span>
        </div>

        <div className="h-48 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              Loading sector distribution...
            </div>
          ) : !hasData ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No transaction data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdown}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  name="Total Volume"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Risk Distribution Donut Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Risk Tier Breakdown
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Heuristic score tiers</span>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          {isLoading ? (
            <div className="text-slate-400 text-xs">Computing risk metrics...</div>
          ) : !hasData ? (
            <div className="text-slate-400 text-xs">Awaiting transactions...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  iconSize={7}
                  formatter={(val) => <span className="text-[11px] text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChartsSection;
