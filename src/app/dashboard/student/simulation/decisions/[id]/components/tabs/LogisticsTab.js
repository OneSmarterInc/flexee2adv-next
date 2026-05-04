// src/app/dashboard/student/decisions/[id]/components/tabs/LogisticsTab.js

export default function LogisticsTab({
  theme,
  decisions,
  setDecisions,
  shippingModes = [],
  carriers = [],
  isSubmitted,
  simulation,
  textMuted
}) {
  const defaultShippingModes = shippingModes.length > 0 ? shippingModes : [
    { mode: "STANDARD", cost: 3, days: 7, onTimeBonus: 0 },
    { mode: "EXPRESS", cost: 5, days: 3, onTimeBonus: 0.03 },
    { mode: "AIR", cost: 10, days: 1, onTimeBonus: 0.08 },
  ];

  const defaultCarriers = carriers.length > 0 ? carriers : [
    { type: "TRUCK", name: "Standard Trucking", costPerUnit: 3, onTimeRate: 0.85 },
    { type: "RAIL", name: "Rail Freight", costPerUnit: 2, onTimeRate: 0.75 },
    { type: "INTERMODAL", name: "Intermodal", costPerUnit: 2.5, onTimeRate: 0.80 },
  ];

  return (
    <div className="space-y-6">
      {/* Shipping Mode */}
      {simulation?.features?.transportLogistics && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span>🚛</span> Shipping Mode
          </h3>
          <p className={`${theme.textMuted} mb-6`}>
            Select shipping mode. Faster shipping improves on-time delivery but costs more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultShippingModes.map((mode) => (
              <button
                key={mode.mode}
                onClick={() => !isSubmitted && setDecisions({ ...decisions, shippingMode: mode.mode })}
                disabled={isSubmitted}
                className={`p-4 rounded-lg border transition text-left ${
                  decisions.shippingMode === mode.mode
                    ? "border-blue-500 bg-blue-500/10"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <p className="font-medium mb-2 flex items-center gap-2">
                  {mode.mode === "STANDARD" && "🚛"}
                  {mode.mode === "EXPRESS" && "🚚"}
                  {mode.mode === "AIR" && "✈️"}
                  {mode.mode}
                </p>
                <div className={`text-xs ${theme.textMuted} space-y-1`}>
                  <p>Cost: ${mode.cost}/unit</p>
                  <p>Transit: {mode.days} day(s)</p>
                  <p>On-time bonus: +{(mode.onTimeBonus * 100).toFixed(0)}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Carrier Selection */}
      {simulation?.features?.multiCarrierSelection && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span>🚢</span> Carrier Selection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultCarriers.map((c) => (
              <button
                key={c.type}
                onClick={() => !isSubmitted && setDecisions({ ...decisions, carrier: c.type })}
                disabled={isSubmitted}
                className={`p-4 rounded-lg border transition text-left ${
                  decisions.carrier === c.type
                    ? "border-blue-500 bg-blue-500/10"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <p className="font-medium mb-2">{c.name}</p>
                <div className={`text-xs ${theme.textMuted} space-y-1`}>
                  <p>Cost: ${c.costPerUnit}/unit</p>
                  <p>On-time rate: {(c.onTimeRate * 100).toFixed(0)}%</p>
                  {c.damageRate && <p>Damage rate: {(c.damageRate * 100).toFixed(1)}%</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}