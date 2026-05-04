// src/app/dashboard/student/decisions/[id]/components/tabs/ProcurementTab.js

export default function ProcurementTab({
  theme,
  decisions,
  setDecisions,
  firmState,
  suppliers = [],
  supplierScorecard = [],
  formatNumber,
  formatCurrency,
  isSubmitted,
  nextQuarter,
  simulation,
  textMuted
}) {
  const defaultSuppliers = suppliers.length > 0 ? suppliers : [
    { type: "GLOBAL", unitCost: 150, leadTime: 1 },
    { type: "REGIONAL", unitCost: 172.5, leadTime: 0 },
  ];

  // Analytics Mode supplier selection
  const analyticsModeEnabled = simulation?.features?.analyticsMode;
  
  // Available suppliers for selection (in analytics mode)
  const availableSuppliers = [
    { id: "SUP001", name: "Global Parts Co.", region: "Asia-Pacific", cost: 150, leadTime: 1, reliability: 0.92, quality: 0.95 },
    { id: "SUP002", name: "Pacific Components", region: "Asia-Pacific", cost: 145, leadTime: 1, reliability: 0.88, quality: 0.93 },
    { id: "SUP003", name: "Euro Manufacturing", region: "Europe", cost: 165, leadTime: 1, reliability: 0.95, quality: 0.97 },
    { id: "SUP004", name: "Regional Supply Inc.", region: "Domestic", cost: 172.5, leadTime: 0, reliability: 0.95, quality: 0.93 },
    { id: "SUP005", name: "Quick Parts USA", region: "Domestic", cost: 180, leadTime: 0, reliability: 0.97, quality: 0.94 },
  ];

  const selectedPrimary = availableSuppliers.find(s => s.id === decisions.primarySupplier);
  const selectedSecondary = availableSuppliers.find(s => s.id === decisions.secondarySupplier);

  return (
    <div className="space-y-6">
      {/* Main Procurement Card */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span>📦</span> Procurement
        </h3>
        <p className={`${theme.textMuted} mb-6`}>
          Order raw materials. Global orders are cheaper but have 1 quarter lead time. Regional orders cost more but arrive immediately.
        </p>

        {/* Supplier Info */}
        <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
          <p className={`text-sm font-medium mb-3`}>Supplier Options</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultSuppliers.map((supplier) => (
              <div key={supplier.type} className={`p-3 rounded-lg ${theme.secondaryBg}`}>
                <p className="font-medium">
                  {supplier.type === "GLOBAL" ? "🌐 Global Supplier" : "📍 Regional Supplier"}
                </p>
                <p className={`text-sm ${theme.textMuted}`}>
                  ${supplier.unitCost}/unit • {supplier.leadTime === 0 ? "Immediate delivery" : `${supplier.leadTime} quarter lead time`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Stock */}
        <div className={`p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-6`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-400">Raw Materials</p>
              <p className="text-xl font-bold text-blue-400">{formatNumber(firmState?.rawMaterials || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400">In Transit</p>
              <p className="text-xl font-bold text-blue-400">{formatNumber(firmState?.inTransit || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Finished Goods</p>
              <p className="text-lg font-bold">{formatNumber(firmState?.finishedGoods || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>At Retailers</p>
              <p className="text-lg font-bold">{formatNumber(firmState?.retailerInventory || 0)}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-medium">🌐 Global Order</span>
            <input
              type="number"
              value={decisions.orderGlobal || 0}
              onChange={(e) => setDecisions({ ...decisions, orderGlobal: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min="0"
              step="10000"
            />
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              Cost: {formatCurrency((decisions.orderGlobal || 0) * (defaultSuppliers.find(s => s.type === "GLOBAL")?.unitCost || 150))} • Arrives Q{nextQuarter + 1}
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium">📍 Regional Order</span>
            <input
              type="number"
              value={decisions.orderRegional || 0}
              onChange={(e) => setDecisions({ ...decisions, orderRegional: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min="0"
              step="10000"
            />
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              Cost: {formatCurrency((decisions.orderRegional || 0) * (defaultSuppliers.find(s => s.type === "REGIONAL")?.unitCost || 172.5))} • Arrives immediately
            </p>
          </label>
        </div>

        {/* Total Cost */}
        <div className={`mt-6 p-4 rounded-lg ${theme.cardInner}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Procurement Cost</span>
            <span className="text-xl font-bold">
              {formatCurrency(
                (decisions.orderGlobal || 0) * (defaultSuppliers.find(s => s.type === "GLOBAL")?.unitCost || 150) +
                (decisions.orderRegional || 0) * (defaultSuppliers.find(s => s.type === "REGIONAL")?.unitCost || 172.5)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Selection - Analytics Mode */}
      {analyticsModeEnabled && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🔍</span> Strategic Supplier Selection
            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Analytics Mode</span>
          </h3>
          <p className={`${theme.textMuted} mb-6`}>
            Select primary and secondary suppliers based on cost, reliability, and quality metrics. 
            Dual-sourcing provides supply chain resilience but requires allocation management.
          </p>

          {/* Primary Supplier Selection */}
          <div className="mb-6">
            <p className="font-medium mb-3">Primary Supplier</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableSuppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  onClick={() => !isSubmitted && setDecisions({ 
                    ...decisions, 
                    primarySupplier: supplier.id,
                    // Reset secondary if same as new primary
                    secondarySupplier: decisions.secondarySupplier === supplier.id ? "NONE" : decisions.secondarySupplier
                  })}
                  disabled={isSubmitted}
                  className={`p-4 rounded-lg border transition text-left ${
                    decisions.primarySupplier === supplier.id
                      ? "border-blue-500 bg-blue-500/10"
                      : `${theme.cardInner} border-transparent hover:border-gray-500`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{supplier.name}</p>
                    {decisions.primarySupplier === supplier.id && (
                      <span className="text-blue-400 text-xs">✓ Primary</span>
                    )}
                  </div>
                  <div className={`text-xs ${theme.textMuted} space-y-1`}>
                    <p>📍 {supplier.region}</p>
                    <p>💰 ${supplier.cost}/unit</p>
                    <p>⏱️ {supplier.leadTime === 0 ? "Same quarter" : `${supplier.leadTime} quarter`}</p>
                    <div className="flex gap-3 mt-2">
                      <span className={supplier.reliability >= 0.95 ? "text-green-400" : supplier.reliability >= 0.90 ? "text-yellow-400" : "text-orange-400"}>
                        📊 {(supplier.reliability * 100).toFixed(0)}% reliable
                      </span>
                      <span className={supplier.quality >= 0.95 ? "text-green-400" : "text-yellow-400"}>
                        ✓ {(supplier.quality * 100).toFixed(0)}% quality
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Supplier Selection */}
          <div className="mb-6">
            <p className="font-medium mb-3">Secondary Supplier (Optional)</p>
            <p className={`text-xs ${theme.textMuted} mb-3`}>
              A backup supplier reduces risk but requires splitting orders. Useful when primary supplier has capacity or reliability concerns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => !isSubmitted && setDecisions({ ...decisions, secondarySupplier: "NONE", primaryAllocation: 100 })}
                disabled={isSubmitted}
                className={`p-4 rounded-lg border transition text-left ${
                  decisions.secondarySupplier === "NONE" || !decisions.secondarySupplier
                    ? "border-gray-500 bg-gray-500/10"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                }`}
              >
                <p className="font-medium">No Secondary</p>
                <p className={`text-xs ${theme.textMuted}`}>Single-source from primary supplier</p>
              </button>
              {availableSuppliers
                .filter(s => s.id !== decisions.primarySupplier)
                .map((supplier) => (
                  <button
                    key={supplier.id}
                    onClick={() => !isSubmitted && setDecisions({ 
                      ...decisions, 
                      secondarySupplier: supplier.id,
                      primaryAllocation: decisions.primaryAllocation || 70
                    })}
                    disabled={isSubmitted}
                    className={`p-4 rounded-lg border transition text-left ${
                      decisions.secondarySupplier === supplier.id
                        ? "border-purple-500 bg-purple-500/10"
                        : `${theme.cardInner} border-transparent hover:border-gray-500`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{supplier.name}</p>
                      {decisions.secondarySupplier === supplier.id && (
                        <span className="text-purple-400 text-xs">✓ Secondary</span>
                      )}
                    </div>
                    <div className={`text-xs ${theme.textMuted} space-y-1`}>
                      <p>💰 ${supplier.cost}/unit • ⏱️ {supplier.leadTime === 0 ? "Immediate" : `${supplier.leadTime}Q`}</p>
                      <p>📊 {(supplier.reliability * 100).toFixed(0)}% reliable • ✓ {(supplier.quality * 100).toFixed(0)}% quality</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Allocation Slider - Only if secondary selected */}
          {decisions.secondarySupplier && decisions.secondarySupplier !== "NONE" && (
            <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
              <p className="font-medium mb-3">Order Allocation</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={decisions.primaryAllocation || 70}
                    onChange={(e) => setDecisions({ ...decisions, primaryAllocation: parseInt(e.target.value) })}
                    disabled={isSubmitted}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-blue-400">Primary: {decisions.primaryAllocation || 70}%</span>
                    <span className="text-purple-400">Secondary: {100 - (decisions.primaryAllocation || 70)}%</span>
                  </div>
                </div>
              </div>
              <p className={`text-xs ${theme.textMuted} mt-3`}>
                Primary ({selectedPrimary?.name}): {formatNumber(Math.round((decisions.orderGlobal || 0) * (decisions.primaryAllocation || 70) / 100))} units
                <br />
                Secondary ({selectedSecondary?.name}): {formatNumber(Math.round((decisions.orderGlobal || 0) * (100 - (decisions.primaryAllocation || 70)) / 100))} units
              </p>
            </div>
          )}

          {/* Emergency Regional Order */}
          <div className={`p-4 rounded-lg ${theme.cardInner}`}>
            <label className="block">
              <span className="text-sm font-medium">🚨 Emergency Regional Order</span>
              <p className={`text-xs ${theme.textMuted} mb-2`}>
                Rush order from regional suppliers at premium pricing (+25%). Arrives same quarter.
              </p>
              <input
                type="number"
                value={decisions.emergencyRegionalOrder || 0}
                onChange={(e) => setDecisions({ ...decisions, emergencyRegionalOrder: parseInt(e.target.value) || 0 })}
                disabled={isSubmitted}
                className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                min="0"
                max="100000"
                step="5000"
              />
              {decisions.emergencyRegionalOrder > 0 && (
                <p className="text-xs text-orange-400 mt-1">
                  Cost: {formatCurrency((decisions.emergencyRegionalOrder || 0) * 215)} (premium pricing)
                </p>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Supplier Scorecard - if available */}
      {supplierScorecard && supplierScorecard.length > 0 && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Supplier Performance Scorecard
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme.border}`}>
                  <th className="text-left py-2">Supplier</th>
                  <th className="text-center py-2">On-Time %</th>
                  <th className="text-center py-2">Quality %</th>
                  <th className="text-center py-2">Cost Index</th>
                  <th className="text-center py-2">Overall Score</th>
                </tr>
              </thead>
              <tbody>
                {supplierScorecard.map((supplier, idx) => (
                  <tr key={idx} className={`border-b ${theme.border}`}>
                    <td className="py-2 font-medium">{supplier.name || supplier.type}</td>
                    <td className={`text-center py-2 ${supplier.onTimeRate >= 0.95 ? "text-green-400" : supplier.onTimeRate >= 0.90 ? "text-yellow-400" : "text-red-400"}`}>
                      {(supplier.onTimeRate * 100).toFixed(0)}%
                    </td>
                    <td className={`text-center py-2 ${supplier.qualityRate >= 0.95 ? "text-green-400" : "text-yellow-400"}`}>
                      {(supplier.qualityRate * 100).toFixed(0)}%
                    </td>
                    <td className="text-center py-2">{supplier.costIndex?.toFixed(2) || "—"}</td>
                    <td className={`text-center py-2 font-bold ${supplier.overallScore >= 85 ? "text-green-400" : supplier.overallScore >= 70 ? "text-yellow-400" : "text-orange-400"}`}>
                      {supplier.overallScore?.toFixed(0) || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}