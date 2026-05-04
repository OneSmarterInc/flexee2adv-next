"use client";

import { useState, useMemo } from "react";

const RETAILER_MODE_CONFIG = {
  NORMAL: { label: "Normal", color: "text-green-400", bg: "bg-green-500/10", icon: "✅" },
  PANIC: { label: "Panic", color: "text-red-400", bg: "bg-red-500/10", icon: "⚠️" },
  CLEARANCE: { label: "Clearance", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "🔻" },
};

export default function VmiPanel({
  theme,
  isDark,
  simulation,
  vmiHistory,
  loadingVmiHistory,
  fetchAllVmiHistory,
  selectedQuarter,
  formatCurrency,
  formatNumber,
  formatPercent,
}) {
  const [expandedFirm, setExpandedFirm] = useState(null);
  const [sortBy, setSortBy] = useState("number");

  // Organize VMI data by firm
  const firmVmiData = useMemo(() => {
    const firms = {};

    if (!vmiHistory || typeof vmiHistory !== "object") {
      return [];
    }

    Object.entries(vmiHistory).forEach(([firmId, history]) => {
      if (!Array.isArray(history)) {
        return;
      }

      // Find firm info using firm.id as primary key
      const firmEntry = simulation?.firms?.find((f) => f.id === firmId);
      if (!firmEntry) return;

      const firmNum = firmEntry.firmNumber || firmId;
      const firmColor = firmEntry.color || "#6b7280";
      const firmName = firmEntry.name || `Firm ${firmNum}`;

      // Get latest record
      const latestRecord = history[history.length - 1];
      if (!latestRecord || !latestRecord.vmi) return;

      const vmiData = latestRecord.vmi;

      firms[firmId] = {
        firmId,
        firmNumber: firmNum,
        firmName,
        firmColor,
        history,
        currentVmi: vmiData,
        isActive: vmiData.active,
        retailerMode: vmiData.retailerMode || "NORMAL",
        setupCost: vmiData.setupCost || 0,
        ongoingCost: vmiData.ongoingCost || 0,
        totalCostThisQuarter: vmiData.totalCostThisQuarter || 0,
        coverageMonths: vmiData.coverageMonths || 0,
        clearancePrevented: vmiData.clearancePrevented || false,
        panicPrevented: vmiData.panicPrevented || false,
        revenueProtected: vmiData.revenueProtected || 0,
        csiProtected: vmiData.csiProtected || 0,
        cumulativeTotalCost: vmiData.cumulativeTotalCost || 0,
        cumulativeRevenueProtected: vmiData.cumulativeRevenueProtected || 0,
        cumulativeNetBenefit: vmiData.cumulativeNetBenefit || 0,
      };
    });

    return Object.values(firms).sort((a, b) => {
      if (sortBy === "cost") return b.cumulativeTotalCost - a.cumulativeTotalCost;
      if (sortBy === "benefit") return b.cumulativeNetBenefit - a.cumulativeNetBenefit;
      return a.firmNumber - b.firmNumber;
    });
  }, [vmiHistory, sortBy, simulation]);

  const handleRefresh = () => {
    fetchAllVmiHistory();
  };

  // Empty state
  if (Object.keys(vmiHistory || {}).length === 0) {
    return (
      <div className={`${theme.card} border rounded-xl p-12 text-center`}>
        <div className="text-5xl mb-4">🤝</div>
        <h3 className="font-semibold mb-2">No VMI Data</h3>
        <p className={theme.textMuted}>
          VMI tracking is not enabled for this simulation
        </p>
        <button
          onClick={handleRefresh}
          className={`mt-4 px-4 py-2 ${theme.accentBg} text-white rounded-lg text-sm`}
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className={`${theme.card} border rounded-xl p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${theme.textMuted}`}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-1.5 text-sm rounded-lg ${theme.secondaryBg} ${theme.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="number">Firm Number</option>
            <option value="cost">Cumulative Cost</option>
            <option value="benefit">Net Benefit</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          {selectedQuarter && (
            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-medium">
              Viewing Q{selectedQuarter}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 ${theme.secondaryBg} rounded-lg text-sm font-medium transition hover:${theme.secondaryBg}`}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {firmVmiData.map((firm) => {
          const modeConfig = RETAILER_MODE_CONFIG[firm.retailerMode] || RETAILER_MODE_CONFIG.NORMAL;
          const isActive = firm.isActive;

          return (
            <div key={firm.firmId} className={`${theme.card} rounded-xl overflow-hidden`}>
              {/* Header */}
              <div
                className={`p-4 border-b ${isDark ? "border-gray-700/50 hover:bg-white/5" : "border-gray-200/50 hover:bg-gray-50/50"} cursor-pointer transition`}
                onClick={() =>
                  setExpandedFirm(expandedFirm === firm.firmId ? null : firm.firmId)
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: firm.firmColor }}
                    >
                      {firm.firmNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold">{firm.firmName}</h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        {firm.history.length} quarters tracked
                      </p>
                    </div>
                  </div>
                  <div>
                    {isActive ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                        ✕ Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${theme.cardInner}`}>
                    <div className={`text-xs ${theme.textMuted} mb-1`}>Retailer Mode</div>
                    <div
                      className={`text-sm font-semibold ${modeConfig.color} flex items-center gap-1`}
                    >
                      {modeConfig.icon} {modeConfig.label}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme.cardInner}`}>
                    <div className={`text-xs ${theme.textMuted} mb-1`}>Coverage</div>
                    <div className={`text-sm font-semibold ${theme.text}`}>
                      {firm.coverageMonths.toFixed(2)} mo
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${theme.cardInner}`}>
                    <div className={`text-xs ${theme.textMuted} mb-1`}>Cost This Q</div>
                    <div className={`text-sm font-semibold ${theme.text}`}>
                      {formatCurrency(firm.totalCostThisQuarter)}
                    </div>
                  </div>
                </div>

                {/* Prevention badges */}
                {(firm.clearancePrevented || firm.panicPrevented) && (
                  <div className="flex gap-2 mt-3">
                    {firm.clearancePrevented && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        🔻 Clearance Prevented
                      </span>
                    )}
                    {firm.panicPrevented && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                        ⚠️ Panic Prevented
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedFirm === firm.firmId && (
                <div className={`border-t ${isDark ? "border-gray-700/50" : "border-gray-200/50"} ${theme.cardInner}`}>
                  <div className="p-4 space-y-4">
                    {/* This Quarter Costs */}
                    <div>
                      <h4 className={`text-sm font-semibold ${theme.text} mb-2`}>
                        This Quarter Costs
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={theme.textMuted}>Setup Cost:</span>
                          <span className={theme.text}>
                            {formatCurrency(firm.setupCost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={theme.textMuted}>Ongoing Cost:</span>
                          <span className={theme.text}>
                            {formatCurrency(firm.ongoingCost)}
                          </span>
                        </div>
                        <div className={`flex justify-between text-sm p-2 rounded-lg ${theme.cardInner}`}>
                          <span className="font-medium">Total Cost:</span>
                          <span className="font-semibold text-orange-400">
                            {formatCurrency(firm.totalCostThisQuarter)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* This Quarter Benefits */}
                    <div>
                      <h4 className={`text-sm font-semibold ${theme.text} mb-2`}>
                        This Quarter Benefits
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={theme.textMuted}>Revenue Protected:</span>
                          <span className={`text-green-400 font-medium`}>
                            {formatCurrency(firm.revenueProtected)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={theme.textMuted}>CSI Protected:</span>
                          <span className={`text-green-400 font-medium`}>
                            {firm.csiProtected.toFixed(2)} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cumulative Summary */}
                    <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} ${isDark ? "border border-blue-500/30" : "border border-blue-200/50"}`}>
                      <h4 className={`text-sm font-semibold text-blue-400 mb-3`}>
                        📊 Cumulative Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme.textMuted}>Total VMI Cost:</span>
                          <span className={`font-semibold text-orange-400`}>
                            {formatCurrency(firm.cumulativeTotalCost)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme.textMuted}>Total Revenue Protected:</span>
                          <span className={`font-semibold text-green-400`}>
                            {formatCurrency(firm.cumulativeRevenueProtected)}
                          </span>
                        </div>
                        <div className={`flex justify-between p-2 rounded-lg ${theme.cardInner} font-semibold`}>
                          <span>Net Benefit:</span>
                          <span className={firm.cumulativeNetBenefit >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {formatCurrency(firm.cumulativeNetBenefit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quarterly History */}
                    {firm.history.length > 1 && (
                      <div>
                        <h4 className={`text-sm font-semibold ${theme.text} mb-2`}>
                          Quarterly Breakdown
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {firm.history.map((record, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg ${theme.cardInner} ${isDark ? "border-gray-700/30" : "border-gray-200/30"} text-xs`}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Q{record.quarter}</span>
                                <span className={record.vmi?.active ? "text-green-400" : "text-gray-400"}>
                                  {record.vmi?.active ? "✓" : "✕"}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={theme.textMuted}>Cost: {formatCurrency(record.vmi?.totalCostThisQuarter || 0)}</span>
                                <span className={theme.textMuted}>Revenue: {formatCurrency(record.vmi?.revenueProtected || 0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
