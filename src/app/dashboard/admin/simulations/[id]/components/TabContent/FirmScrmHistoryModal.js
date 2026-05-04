// src/app/dashboard/admin/simulations/[id]/components/TabContent/FirmScrmHistoryModal.js
"use client";

import { useState } from "react";

// ============================================================================
// RISK LEVEL COLORS - Matches GAS lines 368-374
// ============================================================================
const getRiskLevelColor = (riskLevel) => {
  const colors = {
    LOW: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    MODERATE: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    ELEVATED: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    HIGH: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    CRITICAL: { bg: "bg-red-600/30", text: "text-red-300", border: "border-red-500/50" },
  };
  return colors[riskLevel] || colors.MODERATE;
};

const getRiskScoreColor = (score) => {
  if (score >= 70) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 30) return "text-yellow-400";
  return "text-green-400";
};

const getRiskScoreHex = (score) => {
  if (score >= 70) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 30) return "#eab308";
  return "#22c55e";
};

// ============================================================================
// MINI SPARKLINE FOR TREND VISUALIZATION
// ============================================================================
const MiniSparkline = ({ data, height = 40, color = "#3b82f6" }) => {
  if (!data || data.length < 2) return <div className="h-10 flex items-center justify-center text-xs text-gray-500">Not enough data</div>;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - 4 - ((value - min) / range) * (height - 8);
    return `${x},${y}`;
  }).join(" ");

  const lastX = width;
  const lastY = height - 4 - ((data[data.length - 1] - min) / range) * (height - 8);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
};

// ============================================================================
// TREND INDICATOR
// ============================================================================
const TrendIndicator = ({ current, previous }) => {
  if (previous === undefined || previous === null) return null;
  
  const diff = current - previous;
  if (diff === 0) return <span className="text-gray-400">→</span>;
  if (diff > 0) return <span className="text-red-400">↑ +{diff}</span>;
  return <span className="text-green-400">↓ {diff}</span>;
};

// ============================================================================
// RISK HISTORY TABLE ROW
// ============================================================================
const HistoryRow = ({ record, prevRecord, isDark, isLatest }) => {
  const riskColor = getRiskLevelColor(record.riskAssessment?.riskLevel);
  const totalScore = record.riskAssessment?.totalRiskScore || 0;
  const prevScore = prevRecord?.riskAssessment?.totalRiskScore;
  
  return (
    <tr className={`${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-colors ${isLatest ? "bg-blue-500/10" : ""}`}>
      {/* Quarter */}
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold">Q{record.quarter}</span>
          {isLatest && <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Latest</span>}
        </div>
      </td>
      
      {/* Total Score with Trend */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${getRiskScoreColor(totalScore)}`}>
            {totalScore}
          </span>
          <TrendIndicator current={totalScore} previous={prevScore} />
        </div>
      </td>
      
      {/* Risk Level Badge */}
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-bold ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
          {record.riskAssessment?.riskLevel || "N/A"}
        </span>
      </td>
      
      {/* 5 Risk Categories */}
      <td className="px-4 py-3 text-sm text-center">
        <span className={`font-medium ${getRiskScoreColor(record.breakdown?.supplierConcentrationRisk || 0)}`}>
          {record.breakdown?.supplierConcentrationRisk ?? "-"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <span className={`font-medium ${getRiskScoreColor(record.breakdown?.inventoryBufferRisk || 0)}`}>
          {record.breakdown?.inventoryBufferRisk ?? "-"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <span className={`font-medium ${getRiskScoreColor(record.breakdown?.demandVolatilityRisk || 0)}`}>
          {record.breakdown?.demandVolatilityRisk ?? "-"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <span className={`font-medium ${getRiskScoreColor(record.breakdown?.financialHealthRisk || 0)}`}>
          {record.breakdown?.financialHealthRisk ?? "-"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <span className={`font-medium ${getRiskScoreColor(record.breakdown?.operationalRisk || 0)}`}>
          {record.breakdown?.operationalRisk ?? "-"}
        </span>
      </td>
      
      {/* Customer Metrics */}
      <td className="px-4 py-3 text-sm text-right text-blue-400 font-medium">
        {(record.customerMetrics?.loyal || 0).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm text-right text-yellow-400 font-medium">
        {(record.customerMetrics?.inPlay || 0).toLocaleString()}
      </td>
    </tr>
  );
};

// ============================================================================
// EXPANDED QUARTER DETAIL
// ============================================================================
const QuarterDetail = ({ record, isDark }) => {
  if (!record) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Customer Movements */}
      {record.customerMovements && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-300 flex items-center gap-2">
            <span>🔄</span> Customer Movements - Q{record.quarter}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Churned to Competitor", key: "churnedToCompetitor", color: "text-red-400", icon: "📉" },
              { label: "Degraded from Loyal", key: "degradedFromLoyal", color: "text-orange-400", icon: "⬇️" },
              { label: "Won Back", key: "wonBackFromCompetitor", color: "text-green-400", icon: "🎯" },
              { label: "New Entrants", key: "newEntrants", color: "text-blue-400", icon: "✨" },
              { label: "Growth Converted", key: "growthConverted", color: "text-purple-400", icon: "⬆️" },
              { label: "At-Risk Saved", key: "atRiskSaved", color: "text-yellow-400", icon: "🛡️" },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`}
              >
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <span>{item.icon}</span> {item.label}
                </div>
                <div className={`text-lg font-bold ${item.color}`}>
                  {(record.customerMovements[item.key] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {record.recommendations && record.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-300 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h4>
          <ul className="space-y-2">
            {record.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-400 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      {record.createdAt && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/30">
          Recorded: {new Date(record.createdAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================
export default function FirmScrmHistoryModal({
  isOpen,
  onClose,
  firmHistory,
  loading,
  isDark,
  theme,
}) {
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  if (!isOpen) return null;

  // Data structure: firmHistory.quarters[] (not firmHistory.history[])
  const quarters = firmHistory?.quarters || [];
  
  // Sort by quarter descending (latest first)
  const sortedQuarters = [...quarters].sort((a, b) => b.quarter - a.quarter);

  // Extract trend data for sparklines (chronological order for display)
  const chronologicalQuarters = [...quarters].sort((a, b) => a.quarter - b.quarter);
  const riskScoreTrend = chronologicalQuarters.map(q => q.riskAssessment?.totalRiskScore || 0);
  const loyalTrend = chronologicalQuarters.map(q => q.customerMetrics?.loyal || 0);
  const inPlayTrend = chronologicalQuarters.map(q => q.customerMetrics?.inPlay || 0);

  // Get latest values
  const latestQuarter = sortedQuarters[0];
  const latestScore = latestQuarter?.riskAssessment?.totalRiskScore || 0;
  const latestLoyal = latestQuarter?.customerMetrics?.loyal || 0;

  // Find selected quarter detail
  const selectedRecord = selectedQuarter 
    ? quarters.find(q => q.quarter === selectedQuarter)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl ${isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"} shadow-2xl`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>📈</span> SCRM History
                {firmHistory?.firm && (
                  <span className="text-gray-400 font-normal ml-2">
                    — {firmHistory.firm.name || `Firm ${firmHistory.firm.id?.slice(-4)}`}
                  </span>
                )}
              </h2>
              <p className={`text-sm ${theme?.textMuted || "text-gray-500"} mt-1`}>
                {quarters.length} quarters tracked • {firmHistory?.simulation?.name || "Simulation"}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Loading SCRM history...</p>
            </div>
          ) : !firmHistory || quarters.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-400 text-lg">No SCRM history available</p>
              <p className="text-gray-500 text-sm mt-2">History will appear after quarters are processed</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Trend Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Risk Score Trend */}
                <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Risk Score Trend</span>
                    <span className={`text-xl font-bold ${getRiskScoreColor(latestScore)}`}>
                      {latestScore}
                    </span>
                  </div>
                  <div className="h-12">
                    <MiniSparkline 
                      data={riskScoreTrend} 
                      color={getRiskScoreHex(latestScore)}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Q{chronologicalQuarters[0]?.quarter}</span>
                    <span>Q{chronologicalQuarters[chronologicalQuarters.length - 1]?.quarter}</span>
                  </div>
                </div>

                {/* Loyal Customers Trend */}
                <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Loyal Customers</span>
                    <span className="text-xl font-bold text-blue-400">
                      {latestLoyal.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-12">
                    <MiniSparkline data={loyalTrend} color="#3b82f6" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Q{chronologicalQuarters[0]?.quarter}</span>
                    <span>Q{chronologicalQuarters[chronologicalQuarters.length - 1]?.quarter}</span>
                  </div>
                </div>

                {/* In-Play Trend */}
                <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">In-Play Customers</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {(latestQuarter?.customerMetrics?.inPlay || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-12">
                    <MiniSparkline data={inPlayTrend} color="#eab308" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Q{chronologicalQuarters[0]?.quarter}</span>
                    <span>Q{chronologicalQuarters[chronologicalQuarters.length - 1]?.quarter}</span>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className={`rounded-xl border ${isDark ? "border-gray-700" : "border-gray-200"} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Quarter</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Level</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400" title="Supplier Concentration Risk (25%)">
                          <div>Supplier</div>
                          <div className="text-gray-500 font-normal">25%</div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400" title="Inventory Buffer Risk (20%)">
                          <div>Inventory</div>
                          <div className="text-gray-500 font-normal">20%</div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400" title="Demand Volatility Risk (15%)">
                          <div>Demand</div>
                          <div className="text-gray-500 font-normal">15%</div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400" title="Financial Health Risk (15%)">
                          <div>Financial</div>
                          <div className="text-gray-500 font-normal">15%</div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400" title="Operational Risk (25%)">
                          <div>Operational</div>
                          <div className="text-gray-500 font-normal">25%</div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Loyal</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">In Play</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                      {sortedQuarters.map((record, idx) => {
                        const prevRecord = sortedQuarters[idx + 1]; // Previous quarter (older)
                        return (
                          <HistoryRow
                            key={`q-${record.quarter}`}
                            record={record}
                            prevRecord={prevRecord}
                            isDark={isDark}
                            isLatest={idx === 0}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quarter Detail Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">View details for:</span>
                  <div className="flex gap-2">
                    {sortedQuarters.map((q) => (
                      <button
                        key={q.quarter}
                        onClick={() => setSelectedQuarter(selectedQuarter === q.quarter ? null : q.quarter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedQuarter === q.quarter
                            ? "bg-blue-500 text-white"
                            : isDark
                              ? "bg-white/10 text-gray-300 hover:bg-white/20"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Q{q.quarter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Quarter Detail Panel */}
                {selectedRecord && (
                  <div className={`rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                    <QuarterDetail record={selectedRecord} isDark={isDark} />
                  </div>
                )}
              </div>

              {/* Risk Categories Legend */}
              <div className={`rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"} p-4`}>
                <div className="text-xs text-gray-400 mb-3 font-medium">5 Risk Categories (GAS Specification)</div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className={`p-2 rounded ${isDark ? "bg-white/5" : "bg-white"}`}>
                    <div className="font-bold text-gray-300">Supplier (25%)</div>
                    <div className="text-gray-500">Concentration risk from single-source dependency</div>
                  </div>
                  <div className={`p-2 rounded ${isDark ? "bg-white/5" : "bg-white"}`}>
                    <div className="font-bold text-gray-300">Inventory (20%)</div>
                    <div className="text-gray-500">Buffer adequacy - raw & finished goods days</div>
                  </div>
                  <div className={`p-2 rounded ${isDark ? "bg-white/5" : "bg-white"}`}>
                    <div className="font-bold text-gray-300">Demand (15%)</div>
                    <div className="text-gray-500">Forecast volatility (MAPE) + seasonal exposure</div>
                  </div>
                  <div className={`p-2 rounded ${isDark ? "bg-white/5" : "bg-white"}`}>
                    <div className="font-bold text-gray-300">Financial (15%)</div>
                    <div className="text-gray-500">Cash position, debt ratio, runway</div>
                  </div>
                  <div className={`p-2 rounded ${isDark ? "bg-white/5" : "bg-white"}`}>
                    <div className="font-bold text-gray-300">Operational (25%)</div>
                    <div className="text-gray-500">Capacity utilization, perfect order, lead time</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}