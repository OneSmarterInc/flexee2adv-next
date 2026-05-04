// src/app/dashboard/student/decisions/[id]/components/tabs/MarketingTab.js

export default function MarketingTab({
  theme,
  decisions,
  setDecisions,
  constraints = {},
  inspectionLevels = [],
  isSubmitted,
  simulation,
  formatCurrency,
  textMuted
}) {
  const defaultInspectionLevels = inspectionLevels.length > 0 ? inspectionLevels : [
    { level: "NONE", cost: 0, detection: 0.2 },
    { level: "BASIC", cost: 2, detection: 0.7 },
    { level: "FULL", cost: 5, detection: 0.95 },
  ];

  const maxMarketing = constraints.financial?.maxMarketingBudget || 10000000;

  return (
    <div className={`${theme.card} border rounded-xl p-6`}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span>📢</span> Marketing & Quality
      </h3>

      <div className="space-y-8">
        {/* Marketing Budget */}
        <div>
          <h4 className="font-medium mb-4">Marketing Budget</h4>
          <p className={`${theme.textMuted} mb-4 text-sm`}>
            Marketing increases brand awareness and demand. Max budget: {formatCurrency(maxMarketing)}
          </p>
          <label className="block max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={decisions.marketingBudget}
                onChange={(e) => setDecisions({ ...decisions, marketingBudget: parseInt(e.target.value) || 0 })}
                disabled={isSubmitted}
                className={`w-full pl-8 pr-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
                min="0"
                max={maxMarketing}
                step="100000"
              />
            </div>
          </label>
        </div>

        {/* Customer Segments */}
        {simulation?.features?.customerSegments && (
          <div>
            <h4 className="font-medium mb-4">Customer Segment Allocation</h4>
            <p className={`${theme.textMuted} mb-4 text-sm`}>
              Allocate marketing spend across customer segments. Combined total must not exceed 100%.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Champions", key: "segmentChampions" },
                { label: "Growth", key: "segmentGrowth" },
                { label: "At Risk", key: "segmentAtRisk" },
                { label: "Other", key: "segmentOther" },
              ].map((seg) => (
                <label key={seg.key} className="block">
                  <span className="text-sm">{seg.label}</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={decisions[seg.key]}
                      onChange={(e) => setDecisions({ ...decisions, [seg.key]: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitted}
                      className={`w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </label>
              ))}
            </div>
            {(() => {
              const total = decisions.segmentChampions + decisions.segmentGrowth + decisions.segmentAtRisk + decisions.segmentOther;
              return total > 100 && (
                <p className="text-red-400 text-sm mt-2">⚠️ Segments total cannot exceed 100% (currently {total}%)</p>
              );
            })()}
          </div>
        )}

        {/* Inspection Level */}
        {simulation?.features?.qualityControl && (
          <div>
            <h4 className="font-medium mb-4">Quality Inspection Level</h4>
            <p className={`${theme.textMuted} mb-4 text-sm`}>
              Higher inspection catches more defects but increases labor costs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {defaultInspectionLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => !isSubmitted && setDecisions({ ...decisions, inspectionLevel: level.level })}
                  disabled={isSubmitted}
                  className={`p-4 rounded-lg border transition text-left ${
                    decisions.inspectionLevel === level.level
                      ? "border-blue-500 bg-blue-500/10"
                      : `${theme.cardInner} border-transparent hover:border-gray-500`
                  } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <p className="font-medium mb-2">{level.level}</p>
                  <div className={`text-xs ${theme.textMuted} space-y-1`}>
                    <p>Cost: ${level.cost}/unit</p>
                    <p>Detection: {(level.detection * 100).toFixed(0)}%</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}