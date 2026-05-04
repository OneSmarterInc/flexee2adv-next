// src/app/dashboard/student/decisions/[id]/components/tabs/ProductionTab.js

export default function ProductionTab({
  theme,
  decisions,
  setDecisions,
  firmState,
  productionConstraints = {},
  formatNumber,
  formatCurrency,
  constraints = {},
  isSubmitted,
  simulation,
  textMuted
}) {
  const maxPerShift = productionConstraints.maxPerShift || 250000;
  const maxShifts = productionConstraints.maxShifts || 3;
  const partsPerUnit = constraints.production?.partsPerUnit || 3;
  const currentQuarter = simulation?.currentQuarter || 1;

  // Product Innovation feature
  const productInnovationEnabled = simulation?.features?.productInnovation;
  const p3Launched = firmState?.p3Launched || decisions.launchP3;

  // P3 Configuration options
  const p3Configs = [
    { value: "STANDARD", label: "Standard", description: "Lower cost, broader market appeal", margin: "25%" },
    { value: "PREMIUM", label: "Premium", description: "Higher margin, niche market", margin: "40%" },
  ];

  // ========== CAPACITY CALCULATION WITH EXPANSION SUPPORT ==========
  const baseCapacityPerShift = firmState?.capacityUnits || maxPerShift;
  const additionalCapacity = firmState?.additionalCapacity || 0;
  const expansionInProgress = firmState?.expansionInProgress || [];
  
  // Capacity from expansions completing THIS quarter (will be available for production)
  const completingThisQuarter = expansionInProgress
    .filter((exp) => exp.completesQ <= currentQuarter)
    .reduce((sum, exp) => sum + (exp.capacity || 0), 0);
  
  // Total effective additional capacity = already completed + completing this quarter
  const effectiveAdditionalCapacity = additionalCapacity + completingThisQuarter;
  
  // Expansions still under construction (future quarters)
  const stillBuilding = expansionInProgress.filter((exp) => exp.completesQ > currentQuarter);
  
  // ========== PRODUCTION CALCULATIONS ==========
  const totalProduction = (decisions.productionP1 || 0) + (decisions.productionP2 || 0) + (decisions.productionP3 || 0);
  const baseCapacity = baseCapacityPerShift * decisions.shifts;
  const maxCapacity = baseCapacity + effectiveAdditionalCapacity;
  const utilization = maxCapacity > 0 ? (totalProduction / maxCapacity) * 100 : 0;
  const isOverCapacity = totalProduction > maxCapacity;
  const partsNeeded = totalProduction * partsPerUnit;
  const partsAvailable = (firmState?.rawMaterials || 0) + (firmState?.inTransit || 0) + (decisions.orderRegional || 0);
  const isOverMaterials = partsNeeded > partsAvailable;

  // Labor cost multipliers
  const getShiftMultiplier = (shifts) => {
    if (shifts === 1) return 1;
    if (shifts === 2) return 1.15;
    return 1.5;
  };

  return (
    <div className="space-y-6">
      {/* Production Capacity Card */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4">🏭 Production Capacity</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>Base (per shift)</p>
            <p className="text-lg font-bold">{formatNumber(baseCapacityPerShift)}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>Past Expansions</p>
            <p className={`text-lg font-bold ${additionalCapacity > 0 ? 'text-green-400' : theme.textMuted}`}>
              +{formatNumber(additionalCapacity)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>Completing Q{currentQuarter}</p>
            <p className={`text-lg font-bold ${completingThisQuarter > 0 ? 'text-yellow-400' : theme.textMuted}`}>
              +{formatNumber(completingThisQuarter)}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-center`}>
            <p className={`text-xs text-blue-300`}>Available (1 shift)</p>
            <p className="text-xl font-bold text-blue-400">
              {formatNumber(baseCapacityPerShift + effectiveAdditionalCapacity)}
            </p>
          </div>
        </div>

        {completingThisQuarter > 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-3">
            <p className="text-sm text-green-400">
              ✅ +{formatNumber(completingThisQuarter)} units from expansion completing this quarter —
              <span className="font-semibold"> included in Q{currentQuarter} capacity!</span>
            </p>
          </div>
        )}

        {stillBuilding.length > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400 font-medium mb-2">🏗️ Future Expansions:</p>
            {stillBuilding.map((exp, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-300 ml-4">
                <span>• {exp.type?.replace("_", " ")}</span>
                <span>+{formatNumber(exp.capacity)} units</span>
                <span className="text-yellow-400">Ready Q{exp.completesQ}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Production Card */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span>🏭</span> Production Planning
        </h3>
        <p className={`${theme.textMuted} mb-6`}>
          Set production quantities for each product. Current max capacity: {formatNumber(maxCapacity)} units ({decisions.shifts} shift{decisions.shifts > 1 ? 's' : ''}).
        </p>

        {/* Capacity Info */}
        <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Raw Materials</p>
              <p className="text-lg font-bold">{formatNumber(firmState?.rawMaterials || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>In Transit</p>
              <p className="text-lg font-bold">{formatNumber(firmState?.inTransit || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Regional Orders</p>
              <p className="text-lg font-bold text-blue-400">+{formatNumber(decisions.orderRegional || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Total Parts Available</p>
              <p className="text-lg font-bold">{formatNumber(partsAvailable)}</p>
            </div>
          </div>
        </div>

        {/* Production Inputs - Core Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <label className="block">
            <span className="text-sm font-medium">📱 Product 1 (Standard)</span>
            <input
              type="number"
              value={decisions.productionP1 || 0}
              onChange={(e) => setDecisions({ ...decisions, productionP1: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min="0"
              step="5000"
            />
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              Entry-level product • Base margin
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium">💎 Product 2 (Premium)</span>
            <input
              type="number"
              value={decisions.productionP2 || 0}
              onChange={(e) => setDecisions({ ...decisions, productionP2: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min="0"
              step="5000"
            />
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              High-end product • Higher margin
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Number of Shifts</span>
            <select
              value={decisions.shifts || 1}
              onChange={(e) => setDecisions({ ...decisions, shifts: parseInt(e.target.value) })}
              disabled={isSubmitted}
              className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
            >
              {Array.from({ length: maxShifts }, (_, i) => i + 1).map((s) => {
                const shiftCapacity = (baseCapacityPerShift * s) + effectiveAdditionalCapacity;
                return (
                  <option key={s} value={s}>
                    {s} shift{s > 1 ? "s" : ""} ({formatNumber(shiftCapacity)} total capacity)
                  </option>
                );
              })}
            </select>
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              2nd shift: +15% labor • 3rd shift: +50% labor
            </p>
          </label>
        </div>

        {/* Capacity Check */}
        <div className="space-y-3">
          <div className={`p-4 rounded-lg ${isOverCapacity ? "bg-red-500/10 border border-red-500/30" : "bg-blue-500/10 border border-blue-500/30"}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={isOverCapacity ? "text-red-400" : "text-blue-400"}>
                {isOverCapacity ? "⚠️ Over Capacity!" : "⚡ Capacity Utilization"}
              </span>
              <span className={`font-bold ${isOverCapacity ? "text-red-400" : ""}`}>{utilization.toFixed(1)}%</span>
            </div>
            <div className={`h-2 rounded-full ${theme.cardInner} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${isOverCapacity ? "bg-red-500" : utilization > 85 ? "bg-yellow-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <p className={`text-xs ${theme.textMuted} mt-2`}>
              Production: {formatNumber(totalProduction)} / Capacity: {formatNumber(maxCapacity)}
              {effectiveAdditionalCapacity > 0 && (
                <span className="text-green-400"> (includes +{formatNumber(effectiveAdditionalCapacity)} from expansions)</span>
              )}
            </p>
          </div>

          {isOverMaterials && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <p className="text-orange-400 text-sm">
                ⚠️ Insufficient raw materials: Need {formatNumber(partsNeeded)} parts but only {formatNumber(partsAvailable)} available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Innovation - P3 */}
      {productInnovationEnabled && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🚀</span> Product Innovation - Product 3
            {firmState?.p3Launched && (
              <span className="text-green-400 text-xs ml-2">✓ Launched Q{firmState?.p3LaunchQuarter}</span>
            )}
          </h3>
          
          {!firmState?.p3Launched ? (
            <>
              <p className={`${theme.textMuted} mb-6`}>
                Launch a new innovative product to capture additional market share. Requires R&D investment and production setup.
              </p>

              {/* Launch Decision */}
              <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={decisions.launchP3 || false}
                    onChange={(e) => setDecisions({ 
                      ...decisions, 
                      launchP3: e.target.checked,
                      productionP3: e.target.checked ? (decisions.productionP3 || 0) : 0
                    })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">🎯 Launch Product 3 This Quarter</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      R&D Cost: $5,000,000 • Setup Cost: $2,000,000 • First production available immediately
                    </p>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <p className={`${theme.textMuted} mb-6`}>
              Product 3 is live! Configure production and pricing to maximize market penetration.
            </p>
          )}

          {/* P3 Configuration - Only show if launching or already launched */}
          {(decisions.launchP3 || firmState?.p3Launched) && (
            <div className="space-y-6">
              {/* Product Configuration */}
              {!firmState?.p3Launched && (
                <div>
                  <p className="font-medium mb-3">Product Configuration</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p3Configs.map((config) => (
                      <button
                        key={config.value}
                        onClick={() => !isSubmitted && setDecisions({ ...decisions, p3Config: config.value })}
                        disabled={isSubmitted}
                        className={`p-4 rounded-lg border transition text-left ${
                          decisions.p3Config === config.value
                            ? "border-blue-500 bg-blue-500/10"
                            : `${theme.cardInner} border-transparent hover:border-gray-500`
                        }`}
                      >
                        <p className="font-medium mb-1">{config.label}</p>
                        <p className={`text-xs ${theme.textMuted}`}>{config.description}</p>
                        <p className={`text-xs text-green-400 mt-1`}>Target Margin: {config.margin}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* P3 Pricing and Production */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-sm font-medium">💰 Product 3 Price</span>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={decisions.p3Price || 549}
                      onChange={(e) => setDecisions({ ...decisions, p3Price: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitted}
                      className={`w-full pl-8 pr-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
                      min="300"
                      max="1200"
                      step="25"
                    />
                  </div>
                  <p className={`text-xs ${theme.textMuted} mt-1`}>
                    {decisions.p3Config === "PREMIUM" ? "Suggested: $700-$1000" : "Suggested: $450-$650"}
                  </p>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">🏭 Product 3 Production</span>
                  <input
                    type="number"
                    value={decisions.productionP3 || 0}
                    onChange={(e) => setDecisions({ ...decisions, productionP3: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitted}
                    className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
                    min="0"
                    step="5000"
                  />
                  <p className={`text-xs ${theme.textMuted} mt-1`}>
                    Shares capacity with P1 & P2 • Uses same raw materials
                  </p>
                </label>
              </div>

              {/* P3 Info Box */}
              <div className={`p-4 rounded-lg bg-purple-500/10 border border-purple-500/30`}>
                <p className="text-purple-400 text-sm">
                  <strong>💡 Product 3 Strategy:</strong>{" "}
                  {firmState?.p3Launched 
                    ? `P3 has been active for ${currentQuarter - firmState?.p3LaunchQuarter} quarter(s). Market awareness is building.`
                    : "First quarter sales will be limited as market awareness builds. Expect 30-50% of forecasted demand initially."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Production Summary */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="font-semibold mb-4">📊 Production Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>P1 (Standard)</p>
            <p className="text-lg font-bold">{formatNumber(decisions.productionP1 || 0)}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
            <p className={`text-xs ${theme.textMuted}`}>P2 (Premium)</p>
            <p className="text-lg font-bold">{formatNumber(decisions.productionP2 || 0)}</p>
          </div>
          {productInnovationEnabled && (
            <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
              <p className={`text-xs ${theme.textMuted}`}>P3 (Innovation)</p>
              <p className={`text-lg font-bold ${p3Launched ? "text-purple-400" : theme.textMuted}`}>
                {formatNumber(decisions.productionP3 || 0)}
              </p>
            </div>
          )}
          <div className={`p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center`}>
            <p className="text-xs text-blue-400">Total Production</p>
            <p className="text-lg font-bold text-blue-400">{formatNumber(totalProduction)}</p>
          </div>
        </div>

        {/* Capacity Breakdown */}
        <div className={`mt-4 p-3 rounded-lg ${theme.cardInner}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={theme.textMuted}>Capacity Breakdown</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex justify-between">
              <span className={theme.textMuted}>Base:</span>
              <span>{formatNumber(baseCapacityPerShift * decisions.shifts)}</span>
            </div>
            <div className="flex justify-between">
              <span className={theme.textMuted}>Expansions:</span>
              <span className="text-green-400">+{formatNumber(effectiveAdditionalCapacity)}</span>
            </div>
            <div className="flex justify-between">
              <span className={theme.textMuted}>Total:</span>
              <span className="text-blue-400 font-bold">{formatNumber(maxCapacity)}</span>
            </div>
            <div className="flex justify-between">
              <span className={theme.textMuted}>Utilization:</span>
              <span className={utilization > 100 ? "text-red-400" : utilization > 85 ? "text-yellow-400" : "text-green-400"}>
                {utilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Labor Cost Estimate */}
        <div className={`mt-4 p-3 rounded-lg ${theme.cardInner} flex justify-between items-center`}>
          <span className={theme.textMuted}>Estimated Labor Cost</span>
          <span className="font-bold">
            {formatCurrency(totalProduction * 20 * getShiftMultiplier(decisions.shifts))}
          </span>
        </div>

        {/* Parts Consumption */}
        <div className={`mt-2 p-3 rounded-lg ${theme.cardInner} flex justify-between items-center`}>
          <span className={theme.textMuted}>Parts Required ({partsPerUnit} per unit)</span>
          <span className={`font-bold ${isOverMaterials ? "text-red-400" : ""}`}>
            {formatNumber(partsNeeded)} / {formatNumber(partsAvailable)} available
          </span>
        </div>
      </div>
    </div>
  );
}