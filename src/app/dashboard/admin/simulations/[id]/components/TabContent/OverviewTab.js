// src/app/dashboard/faculty/simulations/[id]/components/TabContent/OverviewTab.js

import {
  formatCurrency,
  formatNumber,
  getSeason,
  formatPercent,
} from "../../utils";
import { SEASON_CONFIG } from "../../constants";

export default function OverviewTab({
  theme,
  simulation,
  getSeason: _getSeason,
  selectedQuarter,
}) {
  return (
    <div className="space-y-6">
      {selectedQuarter && (
        <div className={`${theme.card} border rounded-xl p-4 bg-blue-500/10 border-blue-500/50`}>
          <p className={`text-sm font-medium`}>
            Viewing Quarter {selectedQuarter} Data
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Key Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            {
              label: "Market Size",
              value: formatNumber(simulation.totalMarketSize),
              suffix: " units",
              icon: "📈",
            },
            {
              label: "Starting Revenue",
              value: formatCurrency(simulation.startingRevenue),
              icon: "💰",
            },
            {
              label: "Active Firms",
              value: simulation.firms?.length || simulation.numFirms,
              icon: "🏢",
            },
            {
              label: "Regions",
              value: simulation.numRegions,
              icon: "🌍",
            },
            {
              label: "Products",
              value: simulation.numProducts,
              icon: "📦",
            },
            {
              label: "Event Probability",
              value: `${(simulation.eventProbability * 100).toFixed(0)}%`,
              icon: "⚡",
            },
            {
              label: "Demand Variability",
              value: `±${(simulation.demandVariability * 100).toFixed(0)}%`,
              icon: "📉",
            },
            {
              label: "Total Enrolled",
              value:
                simulation.firms?.reduce(
                  (sum, f) => sum + (f.memberCount || 0),
                  0
                ) || 0,
              icon: "👥",
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              className={`${theme.card} border rounded-xl p-4 transition hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <p
                  className={`text-xs ${theme.textMuted} uppercase tracking-wide`}
                >
                  {metric.label}
                </p>
                <span className="text-lg">{metric.icon}</span>
              </div>
              <p className="text-xl font-bold mt-2">
                {metric.value}
                {metric.suffix && (
                  <span className={`text-sm ${theme.textMuted}`}>
                    {metric.suffix}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Seasonality & Active Events */}
        <div className="space-y-6">
          <div className={`${theme.card} border rounded-xl p-5`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              📅 Seasonality
            </h3>
            <div className="space-y-3">
              {[
                { q: "Q1", key: "q1Multiplier", ...SEASON_CONFIG[1] },
                { q: "Q2", key: "q2Multiplier", ...SEASON_CONFIG[2] },
                { q: "Q3", key: "q3Multiplier", ...SEASON_CONFIG[3] },
                { q: "Q4", key: "q4Multiplier", ...SEASON_CONFIG[4] },
              ].map((s) => {
                const mult = simulation.seasonality?.[s.key] || 1;
                const pct = ((mult - 0.5) / 1) * 100;
                return (
                  <div key={s.q} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span className="font-medium">{s.q}</span>
                      </span>
                      <span
                        className={`font-semibold ${
                          mult > 1
                            ? "text-green-400"
                            : mult < 1
                            ? "text-red-400"
                            : theme.textMuted
                        }`}
                      >
                        {mult.toFixed(2)}x
                      </span>
                    </div>
                    <div
                      className={`h-1.5 rounded-full ${theme.cardInner} overflow-hidden`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          mult > 1
                            ? "bg-green-500"
                            : mult < 1
                            ? "bg-red-400"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${theme.card} border rounded-xl p-5`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              ⚡ Active Events
            </h3>
            {simulation.activeEvents?.length > 0 ? (
              <div className="space-y-2">
                {simulation.activeEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${theme.cardInner}`}
                  >
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      Magnitude: {(event.magnitude * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme.textMuted} text-center py-4`}>
                No active events
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}