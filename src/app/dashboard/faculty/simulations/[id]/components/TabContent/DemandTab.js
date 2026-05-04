// src/app/dashboard/faculty/simulations/[id]/components/TabContent/DemandTab.js

import { formatNumber, getSeason } from "../../utils";

export default function DemandTab({
  theme,
  isDark,
  simulation,
  demandHistory,
  getSeason: getSeason_,
}) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {demandHistory.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
          {[
            {
              label: "Peak Demand",
              value: formatNumber(
                Math.max(...demandHistory.map((d) => d.totalDemand || 0))
              ),
              icon: "📈",
              color: "text-green-400",
            },
            {
              label: "Avg Demand",
              value: formatNumber(
                Math.round(
                  demandHistory.reduce((sum, d) => sum + (d.totalDemand || 0), 0) /
                    demandHistory.length
                )
              ),
              icon: "📊",
              color: "text-blue-400",
            },
            {
              label: "Low Demand",
              value: formatNumber(
                Math.min(...demandHistory.map((d) => d.totalDemand || 0))
              ),
              icon: "📉",
              color: "text-red-400",
            },
            {
              label: "Market Size",
              value: formatNumber(simulation.totalMarketSize),
              icon: "🌍",
              color: "text-yellow-400",
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              className={`${theme.card} border rounded-xl p-4`}
            >
              <div className="flex items-start justify-between">
                <p
                  className={`text-xs ${theme.textMuted} uppercase tracking-wide`}
                >
                  {metric.label}
                </p>
                <span className="text-lg">{metric.icon}</span>
              </div>
              <p className={`text-xl font-bold mt-2 ${metric.color}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart Card */}
      <DemandChart
        theme={theme}
        isDark={isDark}
        demandHistory={demandHistory}
        getSeason={getSeason_}
      />

      {/* Regional & Seasonality */}
      {demandHistory.length > 0 && (
        <DemandRegionalSeasonality
          theme={theme}
          demandHistory={demandHistory}
          simulation={simulation}
        />
      )}

      {/* Detailed Table */}
      {demandHistory.length > 0 && (
        <DemandTable
            theme={theme}
            isDark={isDark}
            demandHistory={demandHistory}
            getSeason={getSeason_}
          />
      )}
    </div>
  );
}

function DemandChart({ theme, isDark, demandHistory, getSeason }) {
  if (demandHistory.length === 0) {
    return (
      <div className={`${theme.card} border rounded-xl overflow-hidden`}>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-5xl mb-4">📊</span>
          <p className={`${theme.textMuted} text-lg font-medium`}>
            No demand history available
          </p>
          <p className={`text-sm ${theme.textMuted} mt-2`}>
            Data appears after quarters are processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.card} border rounded-xl overflow-hidden`}>
      <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          📈 Demand Trend Analysis
        </h3>
        <span className={`text-xs px-3 py-1.5 rounded-full ${theme.cardInner}`}>
          Q1 - Q{demandHistory.length}
        </span>
      </div>

      <div className="p-6">
        <div className="flex">
          {/* Y-Axis */}
          <div
            className="w-14 flex flex-col justify-between items-end pr-3"
            style={{ height: "240px" }}
          >
            {(() => {
              const maxDemand = Math.max(
                ...demandHistory.map((d) => d.totalDemand || 0)
              );
              return [100, 75, 50, 25, 0].map((pct, idx) => (
                <span key={idx} className={`text-xs ${theme.textMuted}`}>
                  {formatNumber(Math.round((maxDemand * pct) / 100))}
                </span>
              ));
            })()}
          </div>

          {/* Chart Area */}
          <div className="flex-1 relative">
            {/* Grid Lines */}
            <div
              className="absolute inset-0"
              style={{ height: "240px" }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-t ${
                    isDark ? "border-gray-700/50" : "border-gray-200"
                  }`}
                  style={{ top: `${i * 25}%` }}
                />
              ))}
            </div>

            {/* Bars Container */}
            <div
              className="relative flex items-end justify-around"
              style={{ height: "240px" }}
            >
              {demandHistory.map((d) => {
                const maxDemand = Math.max(
                  ...demandHistory.map((h) => h.totalDemand || 0)
                );
                const barHeight =
                  maxDemand > 0 ? (d.totalDemand / maxDemand) * 220 : 0;

                return (
                  <div
                    key={d.quarter}
                    className="flex flex-col items-center group"
                    style={{
                      width: `${100 / demandHistory.length}%`,
                      maxWidth: "120px",
                    }}
                  >
                    <div
                      className="relative w-full flex justify-center"
                      style={{ height: "220px" }}
                    >
                      <div
                        className={`absolute bottom-0 rounded-t-lg transition-all duration-300 cursor-pointer group-hover:opacity-90 ${
                          d.seasonalMultiplier > 1
                            ? "bg-gradient-to-t from-green-600 to-green-400"
                            : d.seasonalMultiplier < 1
                            ? "bg-gradient-to-t from-blue-600 to-blue-400"
                            : "bg-gradient-to-t from-purple-600 to-purple-400"
                        }`}
                        style={{
                          height: `${Math.max(barHeight, 4)}px`,
                          width: "60%",
                          minWidth: "32px",
                          maxWidth: "60px",
                        }}
                      >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg ${
                              isDark
                                ? "bg-gray-900 border border-gray-600"
                                : "bg-white border border-gray-300"
                            }`}
                          >
                            {formatNumber(d.totalDemand)}
                          </div>
                        </div>

                        {barHeight > 50 && (
                          <div className="absolute inset-x-0 top-2 text-center">
                            <span className="text-xs font-bold text-white drop-shadow-lg">
                              {d.totalDemand >= 1000000
                                ? `${(d.totalDemand / 1000000).toFixed(1)}M`
                                : `${(d.totalDemand / 1000).toFixed(0)}K`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex mt-4 ml-14">
          {demandHistory.map((d) => {
            const season = getSeason(d.quarter);
            return (
              <div
                key={d.quarter}
                className="flex-1 text-center"
                style={{ maxWidth: "120px" }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-lg ${season.color}`}>
                    {season.icon}
                  </span>
                  <span className="font-bold">Q{d.quarter}</span>
                </div>
                <p className={`text-xs ${theme.textMuted}`}>
                  {d.seasonalMultiplier?.toFixed(2)}x
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-700/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-green-600 to-green-400" />
            <span className={`text-xs ${theme.textMuted}`}>
              High Season (&gt;1.0x)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-purple-600 to-purple-400" />
            <span className={`text-xs ${theme.textMuted}`}>
              Normal (1.0x)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-600 to-blue-400" />
            <span className={`text-xs ${theme.textMuted}`}>
              Low Season (&lt;1.0x)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 border-t-2 border-dashed border-yellow-500" />
            <span className={`text-xs ${theme.textMuted}`}>
              Average
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemandRegionalSeasonality({ theme, demandHistory, simulation }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Regional Distribution */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          🌍 Regional Distribution
        </h3>
        <div className="space-y-5">
          {[
            { name: "East Region", key: "demandR1", color: "bg-blue-500", icon: "🌐" },
            { name: "Central Region", key: "demandR2", color: "bg-purple-500", icon: "🗺️" },
            { name: "West Region", key: "demandR3", color: "bg-pink-500", icon: "🧭" },
          ].map((region) => {
            const total = demandHistory.reduce((sum, d) => sum + (d[region.key] || 0), 0);
            const totalDemand = demandHistory.reduce(
              (sum, d) => sum + (d.totalDemand || 0),
              0
            );
            const percent = totalDemand > 0 ? ((total / totalDemand) * 100).toFixed(1) : 0;
            const avg = Math.round(total / demandHistory.length);

            return (
              <div key={region.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span>{region.icon}</span>
                    {region.name}
                  </span>
                  <span className="font-bold">{percent}%</span>
                </div>
                <div className={`h-2.5 rounded-full bg-gray-700 overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${region.color}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className={`text-xs ${theme.textMuted}`}>
                  Avg: {formatNumber(avg)} units/quarter
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonality Pattern */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          📅 Seasonality Pattern
        </h3>
        <div className="space-y-3">
          {[
            {
              q: 1,
              name: "Q1 Post-Holiday",
              icon: "❄️",
              mult: simulation.seasonality?.q1Multiplier || 0.85,
            },
            {
              q: 2,
              name: "Q2 Spring",
              icon: "🌸",
              mult: simulation.seasonality?.q2Multiplier || 1.0,
            },
            {
              q: 3,
              name: "Q3 Summer",
              icon: "☀️",
              mult: simulation.seasonality?.q3Multiplier || 1.0,
            },
            {
              q: 4,
              name: "Q4 Holiday",
              icon: "🎄",
              mult: simulation.seasonality?.q4Multiplier || 1.25,
            },
          ].map((s) => {
            const diff = ((s.mult - 1) * 100).toFixed(0);
            return (
              <div
                key={s.q}
                className={`flex items-center gap-4 p-3 rounded-lg ${theme.cardInner}`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.name}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      s.mult > 1
                        ? "text-green-400"
                        : s.mult < 1
                        ? "text-red-400"
                        : ""
                    }`}
                  >
                    {s.mult.toFixed(2)}x
                  </p>
                  <p
                    className={`text-xs ${
                      parseFloat(diff) > 0
                        ? "text-green-400"
                        : parseFloat(diff) < 0
                        ? "text-red-400"
                        : theme.textMuted
                    }`}
                  >
                    {parseFloat(diff) > 0 ? "+" : ""}
                    {diff}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DemandTable({ theme, isDark, demandHistory, getSeason }) {
  return (
    <div className={`${theme.card} border rounded-xl overflow-hidden`}>
      <div className="p-5 border-b border-gray-700/50">
        <h3 className="font-semibold flex items-center gap-2">
          📋 Detailed History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${theme.cardInner} text-xs uppercase tracking-wide`}>
            <tr>
              <th className="px-4 py-3 text-left">Quarter</th>
              <th className="px-4 py-3 text-left">Season</th>
              <th className="px-4 py-3 text-right">East (R1)</th>
              <th className="px-4 py-3 text-right">Central (R2)</th>
              <th className="px-4 py-3 text-right">West (R3)</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Multiplier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {demandHistory.map((d) => {
              const season = getSeason(d.quarter);
              return (
                <tr
                  key={d.quarter}
                  className={`${
                    isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 font-bold">Q{d.quarter}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-2 ${season.color}`}>
                      {season.icon} {season.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(d.demandR1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(d.demandR2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(d.demandR3)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatNumber(d.totalDemand)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        d.seasonalMultiplier > 1
                          ? "bg-green-500/20 text-green-400"
                          : d.seasonalMultiplier < 1
                          ? "bg-blue-500/20 text-blue-400"
                          : `${theme.cardInner}`
                      }`}
                    >
                      {d.seasonalMultiplier?.toFixed(2)}x
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}