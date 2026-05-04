// src/app/dashboard/faculty/simulations/[id]/components/TabContent/CapacityExpansionTab.js
"use client";

import { useMemo } from "react";

const EXPANSION_TYPES = {
  SMALL_LINE: { label: "Small Production Line", capacity: 50000, icon: "📦" },
  MEDIUM_LINE: { label: "Medium Production Line", capacity: 100000, icon: "📦📦" },
  LARGE_LINE: { label: "Large Production Line", capacity: 200000, icon: "📦📦📦" },
};

const getExpansionTypeConfig = (type) => EXPANSION_TYPES[type] || { label: type, capacity: 0, icon: "🏭" };

export default function CapacityExpansionTab({ theme, simulation, quarterData, formatCurrency, formatNumber, selectedQuarter }) {
  const currentQuarter = selectedQuarter || simulation?.currentQuarter || 1;

  // Organize expansions by firm
  const expansionData = useMemo(() => {
    // Use quarterData if available (has complete state), otherwise fall back to simulation
    const firmsData = quarterData?.firms || simulation?.firms;
    if (!firmsData) return [];

    return firmsData
      .map((firmData) => {
        // Handle different data structures:
        // From quarterData: { firm, state, decision, kpi }
        // From simulation: { firm, state, decision, kpi } or just firm object
        const firm = firmData.firm || firmData;
        const state = firmData.state || (firmData.firm ? firmData : {});
        const expansions = state?.expansionInProgress || [];

        return {
          firmId: firm.id || firm._id,
          firmNumber: firm.firmNumber || firm.number,
          firmColor: firm.color,
          firmName: firm.name,
          additionalCapacity: state?.additionalCapacity || 0,
          expansions: expansions.map((exp) => ({
            ...exp,
            config: getExpansionTypeConfig(exp.type),
            isCompleted: exp.completesQ <= currentQuarter,
            quartersTillCompletion: Math.max(0, exp.completesQ - currentQuarter),
          })),
          totalExpansionCapacity: expansions.reduce((sum, exp) => sum + (exp.capacity || 0), 0),
          totalMaintenanceCost: expansions.reduce((sum, exp) => sum + (exp.maintenance || 0), 0),
        };
      })
      .filter((f) => f.expansions.length > 0 || f.additionalCapacity > 0)
      .sort((a, b) => a.firmNumber - b.firmNumber);
  }, [quarterData?.firms, simulation?.firms, currentQuarter]);

  if (expansionData.length === 0) {
    return (
      <div className={`${theme.card} border rounded-xl p-12 text-center`}>
        <div className="text-5xl mb-4">🏭</div>
        <h3 className="font-semibold mb-2">No Capacity Expansion</h3>
        <p className={theme.textMuted}>No firms have active capacity expansion projects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Quarter Info */}
      {selectedQuarter && (
        <div className={`${theme.card} border rounded-xl p-4 bg-blue-500/10 border-blue-500/50`}>
          <p className={`text-sm font-medium`}>Viewing Quarter {selectedQuarter} Data</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
        <div className={`${theme.card} border rounded-xl p-4 text-center`}>
          <span className="text-2xl">🏭</span>
          <p className={`text-xs ${theme.textMuted} mt-2`}>Active Expansions</p>
          <p className="text-xl font-bold mt-1">
            {expansionData.reduce((sum, f) => sum + f.expansions.length, 0)}
          </p>
        </div>
        <div className={`${theme.card} border rounded-xl p-4 text-center`}>
          <span className="text-2xl">📈</span>
          <p className={`text-xs ${theme.textMuted} mt-2`}>Total New Capacity</p>
          <p className="text-xl font-bold mt-1">
            {formatNumber(expansionData.reduce((sum, f) => sum + f.totalExpansionCapacity, 0))}
          </p>
        </div>
        <div className={`${theme.card} border rounded-xl p-4 text-center`}>
          <span className="text-2xl">💰</span>
          <p className={`text-xs ${theme.textMuted} mt-2`}>Maintenance Costs</p>
          <p className="text-xl font-bold mt-1 text-red-400">
            {formatCurrency(expansionData.reduce((sum, f) => sum + f.totalMaintenanceCost, 0))}
          </p>
        </div>
        <div className={`${theme.card} border rounded-xl p-4 text-center`}>
          <span className="text-2xl">⭐</span>
          <p className={`text-xs ${theme.textMuted} mt-2`}>Completed</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">
            {expansionData.reduce((sum, f) => sum + f.expansions.filter((e) => e.isCompleted).length, 0)}
          </p>
        </div>
      </div>

      {/* Firm Expansion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {expansionData.map((firmExp) => (
          <div key={firmExp.firmId} className={`${theme.card} border rounded-xl overflow-hidden`}>
            {/* Header */}
            <div className="h-1.5" style={{ backgroundColor: firmExp.firmColor }} />
            <div className="p-5 border-b border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: firmExp.firmColor }}
                >
                  {firmExp.firmNumber}
                </div>
                <div>
                  <h3 className="font-semibold">{firmExp.firmName}</h3>
                  <p className={`text-xs ${theme.textMuted}`}>{firmExp.expansions.length} active project(s)</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`p-2 rounded ${theme.cardInner}`}>
                  <p className={theme.textMuted}>New Capacity</p>
                  <p className="font-bold text-blue-400">{formatNumber(firmExp.totalExpansionCapacity)}</p>
                </div>
                <div className={`p-2 rounded ${theme.cardInner}`}>
                  <p className={theme.textMuted}>Maintenance</p>
                  <p className="font-bold text-red-400">{formatCurrency(firmExp.totalMaintenanceCost)}</p>
                </div>
                <div className={`p-2 rounded ${theme.cardInner}`}>
                  <p className={theme.textMuted}>Added Capacity</p>
                  <p className="font-bold text-green-400">+{formatNumber(firmExp.additionalCapacity)}</p>
                </div>
              </div>
            </div>

            {/* Expansions List */}
            <div className="p-5 space-y-3">
              {firmExp.expansions.map((exp, idx) => {
                const config = exp.config;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${theme.cardInner} border ${
                      exp.isCompleted ? "border-emerald-500/30" : "border-yellow-500/30"
                    }`}
                  >
                    {/* Status badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{config.label}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{formatNumber(exp.capacity)} units/qtr</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          exp.isCompleted
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {exp.isCompleted ? "✓ Completed Q" + exp.completesQ : "In Progress"}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <p className={theme.textMuted}>Completion Quarter</p>
                        <p className="font-semibold">Q{exp.completesQ}</p>
                      </div>
                      <div>
                        <p className={theme.textMuted}>Time To Complete</p>
                        <p className={`font-semibold ${exp.quartersTillCompletion === 0 ? "text-emerald-400" : ""}`}>
                          {exp.quartersTillCompletion === 0
                            ? "This Quarter"
                            : `${exp.quartersTillCompletion} Quarter${exp.quartersTillCompletion !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div>
                        <p className={theme.textMuted}>Capacity Added</p>
                        <p className="font-semibold text-blue-400">+{formatNumber(exp.capacity)}</p>
                      </div>
                      <div>
                        <p className={theme.textMuted}>Quarterly Maintenance</p>
                        <p className="font-semibold text-red-400">{formatCurrency(exp.maintenance)}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!exp.isCompleted && (
                      <div className={`h-1.5 rounded-full ${theme.cardInner} overflow-hidden`}>
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                          style={{
                            width: `${((currentQuarter - (exp.completesQ - exp.quartersTillCompletion - 1)) / (exp.quartersTillCompletion + 1)) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Summary */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="font-semibold mb-4">📅 Completion Timeline</h3>
        <div className="space-y-3">
          {Array.from(
            { length: Math.max(...expansionData.flatMap((f) => f.expansions.map((e) => e.completesQ)), currentQuarter) - currentQuarter + 2 },
            (_, i) => currentQuarter + i,
          )
            .slice(0, 5)
            .map((q) => {
              const completionsAtQ = expansionData.flatMap((f) =>
                f.expansions
                  .filter((e) => e.completesQ === q && !e.isCompleted)
                  .map((e) => ({
                    ...e,
                    firmNumber: f.firmNumber,
                    firmName: f.firmName,
                    firmColor: f.firmColor,
                  })),
              );

              return (
                <div key={q} className={`p-3 rounded-lg ${theme.cardInner} border border-gray-700/30`}>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-blue-400 min-w-16">Q{q}</span>
                    {completionsAtQ.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {completionsAtQ.map((exp, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            {exp.firmName}: {getExpansionTypeConfig(exp.type).label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${theme.textMuted}`}>No expansions scheduled</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
