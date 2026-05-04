// src/app/dashboard/faculty/simulations/[id]/components/TabContent/FeaturesTab.js

import { CORE_FEATURES } from "../../constants";
import { countEnabledAdvanced, formatNumber, formatCurrency } from "../../utils";

export default function FeaturesTab({
  theme,
  simulation,
  ADVANCED_MODULES,
  handleUpdateFeatures,
  actionLoading,
}) {
  const advancedCount = countEnabledAdvanced(
    simulation.features,
    ADVANCED_MODULES
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Core Features */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          ✨ Core Features
        </h3>
        <div className="space-y-2">
          {Object.entries(CORE_FEATURES).map(([key, config]) => (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg ${theme.cardInner}`}
            >
              <span className="flex items-center gap-2 text-sm">
                <span>{config.icon}</span>
                {config.label}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  simulation.features?.[key]
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {simulation.features?.[key] ? "ON" : "OFF"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Modules */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            🚀 Advanced Modules
          </h3>
          <span className={`text-sm ${theme.textMuted}`}>
            {advancedCount}/7 enabled
          </span>
        </div>
        <div className="space-y-3">
          {Object.entries(ADVANCED_MODULES).map(([key, config]) => {
            const enabled = simulation.features?.[key];
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-lg border transition ${
                  enabled
                    ? "border-purple-500/30 bg-purple-500/5"
                    : `${theme.cardInner} border-transparent`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {config.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleUpdateFeatures({ [key]: !enabled })
                  }
                  disabled={actionLoading}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                    enabled
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : `${theme.secondaryBg}`
                  }`}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration */}
      <div
        className={`${theme.card} border rounded-xl p-5 lg:col-span-2`}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          📋 Market Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Market Size",
              value: `${formatNumber(
                simulation.totalMarketSize
              )} units`,
            },
            {
              label: "Starting Revenue",
              value: formatCurrency(simulation.startingRevenue),
            },
            {
              label: "Starting Cash",
              value: formatCurrency(simulation.startingCash),
            },
            { label: "Firms", value: simulation.numFirms },
            { label: "Regions", value: simulation.numRegions },
            { label: "Products", value: simulation.numProducts },
            { label: "Max Quarters", value: simulation.maxQuarters },
            {
              label: "Event Probability",
              value: `${(simulation.eventProbability * 100).toFixed(
                0
              )}%`,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${theme.cardInner}`}
            >
              <p className={`text-xs ${theme.textMuted}`}>
                {item.label}
              </p>
              <p className="font-semibold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}