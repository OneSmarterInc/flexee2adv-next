// src/app/dashboard/admin/simulations/[id]/components/TabContent/GreenScoreTab.js
"use client";

import { useState, useMemo } from "react";

// Green score bracket colors
const BRACKET_CONFIG = {
  POOR: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Poor" },
  BELOW_AVERAGE: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Below Average" },
  AVERAGE: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Average" },
  GOOD: { color: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/30", label: "Good" },
  EXCELLENT: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Excellent" },
};

const getBracketConfig = (bracket) => BRACKET_CONFIG[bracket] || BRACKET_CONFIG.AVERAGE;

const getScoreColor = (score) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-lime-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
};

// Score gauge
const ScoreGauge = ({ score, size = 100 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-xs text-gray-400">Score</span>
      </div>
    </div>
  );
};

// Disposal method badge
const DisposalBadge = ({ method, isDark }) => {
  const config = {
    RECYCLE: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "♻️ Recycle" },
    LANDFILL: { bg: "bg-orange-500/20", text: "text-orange-400", label: "🏭 Landfill" },
    REFURBISH: { bg: "bg-blue-500/20", text: "text-blue-400", label: "🔧 Refurbish" },
  };

  const cfg = config[method] || config.RECYCLE;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

// Helper to resolve firmId from various firm object shapes
const getFirmId = (f) => f._id || f.firm?._id || f.firmId || f.id;

export default function GreenScoreTab({
  theme,
  isDark,
  simulation,
  greenScoreHistory,
  fetchAllGreenScoreHistory,
  formatNumber,
  formatPercent,
  getGreenScoreBracket,
  selectedQuarter,
}) {
  const [expandedFirm, setExpandedFirm] = useState(null);
  const [sortBy, setSortBy] = useState("number");

  // Organize data by firm
  // FIX: Filter history by selectedQuarter so the display always reflects
  // the viewed quarter, regardless of whether the API filters or not.
  const firmScores = useMemo(() => {
    const firms = {};

    Object.entries(greenScoreHistory || {}).forEach(([firmId, data]) => {
      if (data && data.greenScoreHistory) {
        // Sort by quarter ascending, then filter to selectedQuarter
        let history = [...data.greenScoreHistory].sort(
          (a, b) => a.quarter - b.quarter
        );

        if (selectedQuarter) {
          history = history.filter((h) => h.quarter <= selectedQuarter);
        }

        // Skip firms with no history after filtering
        if (history.length === 0) return;

        const firmNum = data.firmNumber || firmId;
        const firmEntry = simulation?.firms?.find(
          (f) => getFirmId(f) === firmId
        );
        const firmColor =
          firmEntry?.firmColor || firmEntry?.firm?.firmColor || "#6b7280";

        const lastRecord = history[history.length - 1];
        const firstRecord = history[0];

        firms[firmId] = {
          firmId,
          firmNumber: firmNum,
          firmColor,
          history,
          currentScore: lastRecord?.newScore || 0,
          totalImprovement:
            (lastRecord?.newScore || 0) - (firstRecord?.previousScore || 0),
        };
      }
    });

    return Object.values(firms).sort((a, b) => {
      if (sortBy === "score") return b.currentScore - a.currentScore;
      if (sortBy === "improvement")
        return b.totalImprovement - a.totalImprovement;
      return a.firmNumber - b.firmNumber;
    });
  }, [greenScoreHistory, sortBy, simulation, selectedQuarter]);

  // Refresh passes selectedQuarter so the correct data is fetched
  const handleRefresh = () => {
    fetchAllGreenScoreHistory(selectedQuarter || null);
  };

  if (Object.keys(greenScoreHistory || {}).length === 0) {
    return (
      <div className={`${theme.card} border rounded-xl p-12 text-center`}>
        <div className="text-5xl mb-4">♻️</div>
        <h3 className="font-semibold mb-2">No Green Score Data</h3>
        <p className={theme.textMuted}>
          Green score tracking is not enabled for this simulation
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
      <div
        className={`${theme.card} border rounded-xl p-4 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${theme.textMuted}`}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-1.5 text-sm rounded-lg ${theme.secondaryBg} border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="number">Firm Number</option>
            <option value="score">Current Score</option>
            <option value="improvement">Total Improvement</option>
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
        {firmScores.map((firm) => {
          const lastRecord = firm.history[firm.history.length - 1];

          return (
            <div
              key={firm.firmId}
              className={`${theme.card} border rounded-xl overflow-hidden`}
            >
              {/* Header */}
              <div
                className="p-4 border-b border-gray-700/50 cursor-pointer hover:bg-white/5 transition"
                onClick={() =>
                  setExpandedFirm(
                    expandedFirm === firm.firmId ? null : firm.firmId
                  )
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
                      <h3 className="font-semibold">Firm {firm.firmNumber}</h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        {firm.history.length} quarters tracked
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        firm.currentScore
                      )}`}
                    >
                      {firm.currentScore}
                    </div>
                    <div
                      className={`text-xs ${
                        firm.totalImprovement >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {firm.totalImprovement >= 0 ? "+" : ""}
                      {firm.totalImprovement}
                    </div>
                  </div>
                </div>

                {/* Score gauge and stats */}
                <div className="flex items-center gap-6 justify-center py-2">
                  <ScoreGauge score={firm.currentScore} size={80} />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={theme.textMuted}>Latest Quarter:</span>
                      <span className="font-medium">
                        Q{lastRecord?.quarter}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme.textMuted}>Method:</span>
                      <DisposalBadge
                        method={lastRecord?.disposalMethod}
                        isDark={isDark}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme.textMuted}>Effect:</span>
                      <span className="font-medium">
                        {lastRecord?.effectBracket}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded History */}
              {expandedFirm === firm.firmId && (
                <div
                  className={`border-t border-gray-700/50 ${theme.cardInner}`}
                >
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {firm.history.map((record) => (
                      <div
                        key={
                          record._id || `${firm.firmId}-q${record.quarter}`
                        }
                        className={`p-3 rounded-lg ${theme.cardInner} border border-gray-700/30`}
                      >
                        {/* Quarter header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-sm">
                            Q{record.quarter}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-mono ${getScoreColor(
                                record.newScore
                              )}`}
                            >
                              {record.previousScore} → {record.newScore}
                            </span>
                            <span
                              className={`text-xs ${
                                record.scoreChange >= 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {record.scoreChange >= 0 ? "+" : ""}
                              {record.scoreChange}
                            </span>
                          </div>
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className={theme.textMuted}>Method:</span>
                            <DisposalBadge
                              method={record.disposalMethod}
                              isDark={isDark}
                            />
                          </div>
                          <div>
                            <span className={`block ${theme.textMuted}`}>
                              Units
                            </span>
                            <span className="font-medium">
                              {formatNumber(record.unitsDisposed)}
                            </span>
                          </div>
                          <div>
                            <span className={`block ${theme.textMuted}`}>
                              Disposal Cost
                            </span>
                            <span className="font-medium text-red-400">
                              ${formatNumber(record.disposalCost)}
                            </span>
                          </div>
                          <div>
                            <span className={`block ${theme.textMuted}`}>
                              Recovery
                            </span>
                            <span className="font-medium text-emerald-400">
                              ${formatNumber(record.disposalRecovery)}
                            </span>
                          </div>
                          {record.ecoPackagingCost > 0 && (
                            <div>
                              <span className={`block ${theme.textMuted}`}>
                                Eco Packaging Cost
                              </span>
                              <span className="font-medium text-green-400">
                                ${formatNumber(record.ecoPackagingCost.toFixed(2))}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className={`block ${theme.textMuted}`}>
                              CSI Effect
                            </span>
                            <span
                              className={`font-medium ${
                                record.csiEffect > 0
                                  ? "text-emerald-400"
                                  : record.csiEffect < 0
                                    ? "text-red-400"
                                    : ""
                              }`}
                            >
                              {record.csiEffect > 0 ? "+" : ""}
                              {record.csiEffect}
                            </span>
                          </div>
                          <div>
                            <span className={`block ${theme.textMuted}`}>
                              Churn
                            </span>
                            <span className="font-medium">
                              {formatPercent(record.churnMultiplier * 100)}
                            </span>
                          </div>
                        </div>

                        {/* Effect bracket */}
                        <div className="pt-2 border-t border-gray-700/30">
                          <span className={theme.textMuted}>Effect: </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              getBracketConfig(record.effectBracket).bg
                            } ${getBracketConfig(record.effectBracket).color}`}
                          >
                            {getBracketConfig(record.effectBracket).label}
                          </span>
                          {record.ecoPackaging && (
                            <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                              🌱 Eco Packaging
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="font-semibold mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
          {firmScores.map((firm) => {
            const avgScore =
              firm.history.reduce((sum, h) => sum + h.newScore, 0) /
              firm.history.length;
            const totalCost = firm.history.reduce(
              (sum, h) => sum + h.disposalCost,
              0
            );
            const totalRecovery = firm.history.reduce(
              (sum, h) => sum + h.disposalRecovery,
              0
            );

            return (
              <div
                key={firm.firmId}
                className={`p-3 rounded-lg ${theme.cardInner} border border-gray-700/30`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  Firm {firm.firmNumber}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Score:</span>
                    <span
                      className={`font-semibold ${getScoreColor(avgScore)}`}
                    >
                      {avgScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        firm.currentScore
                      )}`}
                    >
                      {firm.currentScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net:</span>
                    <span
                      className={`font-semibold ${
                        totalRecovery - totalCost >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      ${formatNumber(totalRecovery - totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}