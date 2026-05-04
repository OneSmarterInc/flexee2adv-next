// src/app/dashboard/faculty/simulations/[id]/components/tabs/CreditTab.jsx
"use client";

import { useState, useMemo } from "react";

// Credit tier configuration with colors
const TIER_CONFIG = {
  Excellent: { color: "emerald", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", icon: "★★★★★" },
  Good: { color: "blue", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", icon: "★★★★☆" },
  Fair: { color: "yellow", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", icon: "★★★☆☆" },
  Poor: { color: "orange", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", icon: "★★☆☆☆" },
  Distressed: { color: "red", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", icon: "★☆☆☆☆" },
};

const getTierConfig = (tier) => TIER_CONFIG[tier] || TIER_CONFIG.Fair;

// Score color based on value
const getScoreColor = (score) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
};

// Utilization color based on percentage
const getUtilizationColor = (util) => {
  if (util <= 50) return "bg-emerald-500";
  if (util <= 75) return "bg-yellow-500";
  if (util <= 100) return "bg-orange-500";
  return "bg-red-500";
};

// Score breakdown component
const ScoreBreakdown = ({ creditScore, isDark }) => {
  if (!creditScore) return null;
  
  const metrics = [
    { label: "Current Ratio", score: creditScore.currentRatioScore, max: 20 },
    { label: "Debt/Equity", score: creditScore.debtToEquityScore, max: 25 },
    { label: "Profit Margin", score: creditScore.profitMarginScore, max: 20 },
    { label: "Interest Coverage", score: creditScore.interestCoverageScore, max: 15 },
    { label: "Cash Flow", score: creditScore.cashFlowScore, max: 20 },
  ];

  return (
    <div className="space-y-2">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-3">
          <span className={`text-xs w-28 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{m.label}</span>
          <div className={`flex-1 h-2 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
            <div
              className={`h-full rounded-full transition-all ${
                m.score >= m.max * 0.8 ? "bg-emerald-500" :
                m.score >= m.max * 0.5 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${(m.score / m.max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono w-12 text-right">{m.score}/{m.max}</span>
        </div>
      ))}
    </div>
  );
};

// Circular score gauge
const ScoreGauge = ({ score, size = 80 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
};

// Summary stat card
const StatCard = ({ label, value, subValue, icon, color = "blue", isDark }) => (
  <div className={`p-4 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>{label}</p>
        <p className={`text-xl font-bold ${color === "red" ? "text-red-400" : color === "green" ? "text-emerald-400" : ""}`}>
          {value}
        </p>
        {subValue && <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{subValue}</p>}
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

// Firm credit card component
const FirmCreditCard = ({ 
  item, 
  isOpen, 
  onToggle, 
  isDark, 
  formatCurrency, 
  formatNumber, 
  formatPercent,
  simulation 
}) => {
  const tierConfig = getTierConfig(item.summary?.currentTier);
  const utilizationPct = item.summary?.utilizationRate || 0;
  
  // Find firm name from simulation
  const firmData = simulation?.firms?.find(f => 
    f.id === item.firmId || f._id === item.firmId || f.firmNumber === item.firmNumber
  );
  const firmName = firmData?.name || `Firm ${item.firmNumber}`;
  const firmColor = firmData?.color || "#3B82F6";

  return (
    <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Firm identifier with color */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: firmColor }}
          >
            {item.firmNumber || "?"}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{firmName}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tierConfig.bg} ${tierConfig.text} ${tierConfig.border} border`}>
                {item.summary?.currentTier || "N/A"}
              </span>
            </div>
            
            {/* Quick stats row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Credit Limit: </span>
                <span className="font-medium">{formatCurrency(item.summary?.currentCreditLimit || 0)}</span>
              </div>
              <div>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Current Debt: </span>
                <span className={`font-medium ${item.summary?.currentDebt > 0 ? "text-orange-400" : ""}`}>
                  {formatCurrency(item.summary?.currentDebt || 0)}
                </span>
              </div>
              <div>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>Interest Rate: </span>
                <span className="font-medium">
                  {((item.history?.[0]?.annualRate || 0.18) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Score gauge */}
          <ScoreGauge score={item.summary?.currentScore || 0} />
        </div>

        {/* Utilization bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Credit Utilization</span>
            <span className={`font-medium ${utilizationPct > 100 ? "text-red-400" : utilizationPct > 75 ? "text-orange-400" : ""}`}>
              {formatPercent(utilizationPct)}
            </span>
          </div>
          <div className={`h-2.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"} overflow-hidden`}>
            <div
              className={`h-full rounded-full transition-all ${getUtilizationColor(utilizationPct)}`}
              style={{ width: `${Math.min(utilizationPct, 100)}%` }}
            />
          </div>
          {utilizationPct > 100 && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <span>⚠️</span> Over credit limit by {formatPercent(utilizationPct - 100)}
            </p>
          )}
        </div>

        {/* Warning badges */}
        {(item.summary?.timesOverlimit > 0 || item.summary?.forcedSalesCount > 0) && (
          <div className="flex gap-2 mt-3">
            {item.summary?.timesOverlimit > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                ⚠️ Overlimit {item.summary.timesOverlimit}x
              </span>
            )}
            {item.summary?.forcedSalesCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                🔴 Forced Sales {item.summary.forcedSalesCount}x
              </span>
            )}
          </div>
        )}

        {/* Cost summary */}
        <div className={`grid grid-cols-2 gap-4 mt-4 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Interest Paid</p>
            <p className="font-semibold text-orange-400">{formatCurrency(item.summary?.totalInterestPaid || 0)}</p>
          </div>
          <div>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Overlimit Fees</p>
            <p className={`font-semibold ${item.summary?.totalOverlimitFees > 0 ? "text-red-400" : ""}`}>
              {formatCurrency(item.summary?.totalOverlimitFees || 0)}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
            ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          {isOpen ? "Hide Details" : "View Score Breakdown & History"}
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className={`border-t ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
          {/* Score breakdown */}
          <div className="p-5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>📊</span> Credit Score Breakdown
            </h4>
            <ScoreBreakdown 
              creditScore={item.history?.[0]?.creditScore} 
              isDark={isDark} 
            />
          </div>

          {/* History table */}
          <div className={`border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <div className="p-5">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>📜</span> Quarter History
              </h4>
              
              {(!item.history || item.history.length === 0) ? (
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No history available</p>
              ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <th className="text-left py-2 pr-4 font-medium">Q</th>
                        <th className="text-left py-2 pr-4 font-medium">Tier</th>
                        <th className="text-right py-2 pr-4 font-medium">Score</th>
                        <th className="text-right py-2 pr-4 font-medium">Credit Limit</th>
                        <th className="text-right py-2 pr-4 font-medium">Debt</th>
                        <th className="text-right py-2 pr-4 font-medium">Interest</th>
                        <th className="text-right py-2 pr-4 font-medium">Auto-Borrow</th>
                        <th className="text-right py-2 pr-4 font-medium">Auto-Repay</th>
                        <th className="text-center py-2 font-medium">Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.history.map((h, idx) => {
                        const rowTier = getTierConfig(h.tierName);
                        return (
                          <tr 
                            key={h._id || idx} 
                            className={`border-t ${isDark ? "border-white/5" : "border-gray-200"} 
                              ${idx === 0 ? (isDark ? "bg-white/5" : "bg-blue-50") : ""}`}
                          >
                            <td className="py-2.5 pr-4 font-medium">Q{h.quarter}</td>
                            <td className="py-2.5 pr-4">
                              <span className={`px-2 py-0.5 rounded text-xs ${rowTier.bg} ${rowTier.text}`}>
                                {h.tierName}
                              </span>
                            </td>
                            <td className={`py-2.5 pr-4 text-right font-mono ${getScoreColor(h.creditScore?.totalScore || 0)}`}>
                              {h.creditScore?.totalScore || 0}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono">{formatCurrency(h.creditLimit || 0)}</td>
                            <td className={`py-2.5 pr-4 text-right font-mono ${h.endingDebt > h.creditLimit ? "text-red-400" : ""}`}>
                              {formatCurrency(h.endingDebt || 0)}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono text-orange-400">
                              {h.interestCharge > 0 ? `-${formatCurrency(h.interestCharge)}` : "-"}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono">
                              {h.autoBorrowAmount > 0 ? (
                                <span className="text-yellow-400">+{formatCurrency(h.autoBorrowAmount)}</span>
                              ) : "-"}
                            </td>
                            <td className="py-2.5 pr-4 text-right font-mono">
                              {h.autoRepayAmount > 0 ? (
                                <span className="text-emerald-400">-{formatCurrency(h.autoRepayAmount)}</span>
                              ) : "-"}
                            </td>
                            <td className="py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {h.wasOverlimit && (
                                  <span title="Overlimit" className="text-orange-400">⚠️</span>
                                )}
                                {h.forcedSaleTriggered && (
                                  <span title="Forced Sale" className="text-red-400">🔴</span>
                                )}
                                {!h.wasOverlimit && !h.forcedSaleTriggered && (
                                  <span className="text-emerald-400">✓</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main CreditTab component
export default function CreditTab({
  theme,
  isDark,
  simulation,
  getSeason,
  firmsCreditHistory = [],
  fetchAllFirmsCreditHistory,
  formatCurrency,
  formatNumber,
  formatPercent,
}) {
  const [openFirm, setOpenFirm] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleToggle = (id) => setOpenFirm((prev) => (prev === id ? null : id));

  const handleRefresh = async () => {
    if (!fetchAllFirmsCreditHistory) return;
    setIsRefreshing(true);
    await fetchAllFirmsCreditHistory(true);
    setIsRefreshing(false);
  };

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    if (!firmsCreditHistory.length) return null;
    
    const totalDebt = firmsCreditHistory.reduce((sum, f) => sum + (f.summary?.currentDebt || 0), 0);
    const totalCreditLimit = firmsCreditHistory.reduce((sum, f) => sum + (f.summary?.currentCreditLimit || 0), 0);
    const totalInterest = firmsCreditHistory.reduce((sum, f) => sum + (f.summary?.totalInterestPaid || 0), 0);
    const totalFees = firmsCreditHistory.reduce((sum, f) => sum + (f.summary?.totalOverlimitFees || 0), 0);
    const avgScore = firmsCreditHistory.reduce((sum, f) => sum + (f.summary?.currentScore || 0), 0) / firmsCreditHistory.length;
    const firmsOverlimit = firmsCreditHistory.filter(f => (f.summary?.utilizationRate || 0) > 100).length;
    const firmsWithForcedSales = firmsCreditHistory.filter(f => (f.summary?.forcedSalesCount || 0) > 0).length;
    
    return {
      totalDebt,
      totalCreditLimit,
      totalInterest,
      totalFees,
      avgScore: Math.round(avgScore),
      avgUtilization: totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0,
      firmsOverlimit,
      firmsWithForcedSales,
    };
  }, [firmsCreditHistory]);

  // Tier distribution
  const tierDistribution = useMemo(() => {
    const dist = { Excellent: 0, Good: 0, Fair: 0, Poor: 0, Distressed: 0 };
    firmsCreditHistory.forEach(f => {
      const tier = f.summary?.currentTier || "Fair";
      if (dist[tier] !== undefined) dist[tier]++;
    });
    return dist;
  }, [firmsCreditHistory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🏦</span> Credit Facility Management
          </h2>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Monitor creditworthiness, debt levels, and borrowing activity across all firms
          </p>
        </div>
        {fetchAllFirmsCreditHistory && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} 
              text-white disabled:opacity-50`}
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        )}
      </div>

      {/* No data state */}
      {firmsCreditHistory.length === 0 ? (
        <div className={`text-center py-16 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="text-4xl mb-4">💳</div>
          <p className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>No Credit History Available</p>
          <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Credit data will appear after quarters are processed
          </p>
        </div>
      ) : (
        <>
          {/* Aggregate Stats Cards */}
          {aggregateStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Outstanding Debt"
                value={formatCurrency(aggregateStats.totalDebt)}
                subValue={`of ${formatCurrency(aggregateStats.totalCreditLimit)} limit`}
                icon="💰"
                isDark={isDark}
              />
              <StatCard
                label="Average Credit Score"
                value={aggregateStats.avgScore}
                subValue={`${formatPercent(aggregateStats.avgUtilization)} avg utilization`}
                icon="📊"
                isDark={isDark}
              />
              <StatCard
                label="Total Interest & Fees"
                value={formatCurrency(aggregateStats.totalInterest + aggregateStats.totalFees)}
                subValue={`${formatCurrency(aggregateStats.totalFees)} in penalties`}
                icon="📉"
                color={aggregateStats.totalFees > 0 ? "red" : undefined}
                isDark={isDark}
              />
              <StatCard
                label="Credit Health"
                value={`${firmsCreditHistory.length - aggregateStats.firmsOverlimit}/${firmsCreditHistory.length}`}
                subValue={aggregateStats.firmsOverlimit > 0 ? `${aggregateStats.firmsOverlimit} overlimit` : "All within limits"}
                icon={aggregateStats.firmsOverlimit > 0 ? "⚠️" : "✅"}
                color={aggregateStats.firmsOverlimit > 0 ? "red" : "green"}
                isDark={isDark}
              />
            </div>
          )}

          {/* Tier Distribution */}
          <div className={`p-5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <span>📈</span> Credit Tier Distribution
            </h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(tierDistribution).map(([tier, count]) => {
                const config = getTierConfig(tier);
                return (
                  <div
                    key={tier}
                    className={`px-4 py-2.5 rounded-lg border ${config.bg} ${config.border} ${config.text} flex items-center gap-2`}
                  >
                    <span className="text-xs opacity-60">{config.icon}</span>
                    <span className="font-medium">{tier}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Firm Cards */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <span>🏢</span> Firm Credit Details
            </h3>
            {firmsCreditHistory.map((item) => (
              <FirmCreditCard
                key={item.firmId}
                item={item}
                isOpen={openFirm === item.firmId}
                onToggle={() => handleToggle(item.firmId)}
                isDark={isDark}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                formatPercent={formatPercent}
                simulation={simulation}
              />
            ))}
          </div>

          {/* Credit Tiers Reference */}
          <div className={`p-5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <span>📋</span> Credit Tier Reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <th className="text-left py-2 pr-4 font-medium">Tier</th>
                    <th className="text-center py-2 pr-4 font-medium">Min Score</th>
                    <th className="text-center py-2 pr-4 font-medium">Credit Multiplier</th>
                    <th className="text-center py-2 pr-4 font-medium">Credit Limit</th>
                    <th className="text-center py-2 font-medium">Annual Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: "Excellent", min: 80, mult: "2.0x", limit: "$100M", rate: "8%" },
                    { tier: "Good", min: 60, mult: "1.5x", limit: "$75M", rate: "12%" },
                    { tier: "Fair", min: 40, mult: "1.0x", limit: "$50M", rate: "18%" },
                    { tier: "Poor", min: 20, mult: "0.5x", limit: "$25M", rate: "24%" },
                    { tier: "Distressed", min: 0, mult: "0.25x", limit: "$12.5M", rate: "30%" },
                  ].map((row) => {
                    const config = getTierConfig(row.tier);
                    return (
                      <tr key={row.tier} className={`border-t ${isDark ? "border-white/5" : "border-gray-200"}`}>
                        <td className="py-2.5 pr-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                            {row.tier}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-center font-mono">{row.min}+</td>
                        <td className="py-2.5 pr-4 text-center font-mono">{row.mult}</td>
                        <td className="py-2.5 pr-4 text-center font-mono">{row.limit}</td>
                        <td className="py-2.5 text-center font-mono">{row.rate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`mt-4 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-200"} text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <p><strong>Auto-Borrow:</strong> Triggered when cash falls below $10M floor</p>
              <p><strong>Auto-Repay:</strong> 50% of excess cash above $20M ceiling applied to debt</p>
              <p><strong>Overlimit Fee:</strong> 2% quarterly fee on amounts exceeding credit limit</p>
              <p><strong>Forced Sale:</strong> 10% inventory liquidated at 50% value when debt exceeds 150% of limit</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}