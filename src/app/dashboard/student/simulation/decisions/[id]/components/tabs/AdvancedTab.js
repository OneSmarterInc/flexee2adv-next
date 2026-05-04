// src/app/dashboard/student/decisions/[id]/components/tabs/AdvancedTab.js

export default function AdvancedTab({
  theme,
  decisions,
  setDecisions,
  simulation,
  firmState,
  decisionConfig,
  isSubmitted,
  formatCurrency,
  formatNumber,
  textMuted
}) {
  const warrantyTiers = decisionConfig?.configurations?.warrantyTiers || [];
  const disposalMethods = decisionConfig?.configurations?.disposalMethods || [];
  const capacityOptions = decisionConfig?.configurations?.capacityExpansion || [];

  // DC constraints
  const dcCentralCapacity = decisionConfig?.constraints?.dc?.dcCentralCapacity || 200000;
  const dcWestCapacity = decisionConfig?.constraints?.dc?.dcWestCapacity || 150000;
  const transferCostDcToDc = decisionConfig?.constraints?.dc?.transferCostDcToDc || 1.5;
  const transferCostDcToFactory = decisionConfig?.constraints?.dc?.transferCostDcToFactory || 2.0;

  return (
    <div className="space-y-6">
      {/* Warranty Program */}
      {simulation?.features?.returnsGreenScore && warrantyTiers.length > 0 && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🛡️</span> Warranty Program
          </h3>
          
          {/* Warranty Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {warrantyTiers.map((tier) => (
              <button
                key={tier.tier}
                onClick={() => !isSubmitted && setDecisions({ ...decisions, warrantyTier: tier.tier })}
                disabled={isSubmitted}
                className={`p-4 rounded-lg border transition text-left ${
                  decisions.warrantyTier === tier.tier
                    ? "border-blue-500 bg-blue-500/10"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                }`}
              >
                <p className="font-medium mb-2">{tier.name}</p>
                <div className={`text-xs ${theme.textMuted} space-y-1`}>
                  <p>Cost: ${tier.pricePerUnit}/unit</p>
                  <p>CSI Impact: {tier.csiPenalty > 0 ? `-${tier.csiPenalty}` : tier.csiPenalty < 0 ? `+${Math.abs(tier.csiPenalty)}` : "0"}</p>
                  <p>Churn: {((tier.churnMultiplier || 1) * 100 - 100).toFixed(0)}%</p>
                </div>
              </button>
            ))}
          </div>

          {/* Warranty Service Networks */}
          {(decisions.warrantyTier === "STANDARD" || decisions.warrantyTier === "PREMIUM") && (
            <div className={`p-4 rounded-lg ${theme.cardInner}`}>
              <p className="font-medium mb-3">Regional Warranty Service Networks</p>
              <p className={`text-xs ${theme.textMuted} mb-4`}>
                Establish regional service centers to reduce warranty fulfillment costs and improve response times.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-3 rounded-lg ${theme.secondaryBg} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={decisions.centralWarrantyNetwork || false}
                    onChange={(e) => setDecisions({ ...decisions, centralWarrantyNetwork: e.target.checked })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Central Region Network</p>
                    <p className={`text-xs ${theme.textMuted}`}>Serves R1 & R2 • Setup: $500K • $50K/qtr</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg ${theme.secondaryBg} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={decisions.westWarrantyNetwork || false}
                    onChange={(e) => setDecisions({ ...decisions, westWarrantyNetwork: e.target.checked })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">West Region Network</p>
                    <p className={`text-xs ${theme.textMuted}`}>Serves R3 • Setup: $400K • $40K/qtr</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Green Score / Disposal */}
      {simulation?.features?.returnsGreenScore && disposalMethods.length > 0 && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>♻️</span> Sustainability & Disposal
          </h3>
          <p className={`text-sm ${theme.textMuted} mb-4`}>
            Choose how to handle returned and defective products. Higher recovery methods cost more but improve your green score.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {disposalMethods.map((method) => (
              <button
                key={method.method}
                onClick={() => !isSubmitted && setDecisions({ ...decisions, disposalMethod: method.method })}
                disabled={isSubmitted}
                className={`p-4 rounded-lg border transition text-left ${
                  decisions.disposalMethod === method.method
                    ? "border-blue-500 bg-blue-500/10"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                }`}
              >
                <p className="font-medium mb-2">
                  {method.method === "LANDFILL" && "🗑️ "}
                  {method.method === "RECYCLE" && "♻️ "}
                  {method.method === "REFURBISH" && "🔧 "}
                  {method.name}
                </p>
                <div className={`text-xs ${theme.textMuted} space-y-1`}>
                  <p>Cost: ${method.costPerUnit}/unit</p>
                  <p>Recovery: ${method.recoveryPerUnit}/unit</p>
                  <p className={method.greenScoreChange > 0 ? "text-green-400" : method.greenScoreChange < 0 ? "text-red-400" : ""}>
                    Green Score: {method.greenScoreChange > 0 ? "+" : ""}{method.greenScoreChange}/qtr
                  </p>
                  {method.method === "REFURBISH" && (
                    <p className="text-green-400">Net: +${method.recoveryPerUnit - method.costPerUnit}/unit</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <label className={`flex items-center gap-3 p-4 rounded-lg ${theme.cardInner} cursor-pointer max-w-md`}>
            <input
              type="checkbox"
              checked={decisions.ecoPackaging || false}
              onChange={(e) => setDecisions({ ...decisions, ecoPackaging: e.target.checked })}
              disabled={isSubmitted}
              className="w-5 h-5 rounded"
            />
            <div>
              <p className="font-medium">🌿 Eco-Friendly Packaging</p>
              <p className={`text-xs ${theme.textMuted}`}>+$0.50/unit cost • +2 green score/qtr • Improves CSI</p>
            </div>
          </label>
        </div>
      )}

      {/* Regional DCs */}
      {simulation?.features?.regionalDCs && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🏢</span> Regional Distribution Centers
          </h3>
          
          {/* DC Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${theme.cardInner}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Central DC (Chicago)</p>
                {firmState?.dcCentralOpen && <span className="text-green-400 text-xs">✓ Open</span>}
              </div>
              <select
                value={firmState?.dcCentralOpen ? "OPEN" : decisions.dcCentralStatus}
                onChange={(e) => setDecisions({ ...decisions, dcCentralStatus: e.target.value })}
                disabled={isSubmitted || firmState?.dcCentralOpen}
                className={`w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
              >
                <option value="NO">Do Not Open</option>
                <option value="YES">Open This Quarter</option>
                {firmState?.dcCentralOpen && <option value="OPEN">Already Open</option>}
                {firmState?.dcCentralOpen && <option value="CLOSE">Close DC</option>}
              </select>
              <div className={`text-xs ${theme.textMuted} mt-2 space-y-1`}>
                <p>Setup: {formatCurrency(decisionConfig?.advancedFeatures?.dcCentral?.setupCost || 4000000)}</p>
                <p>OpEx: {formatCurrency(decisionConfig?.advancedFeatures?.dcCentral?.quarterlyOpex || 700000)}/qtr</p>
                <p>Capacity: {formatNumber(dcCentralCapacity)} units</p>
                {firmState?.dcCentralOpen && (
                  <p className="text-blue-400">Current Inventory: {formatNumber(firmState?.dcCentralInventory || 0)}</p>
                )}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${theme.cardInner}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">West DC (Los Angeles)</p>
                {firmState?.dcWestOpen && <span className="text-green-400 text-xs">✓ Open</span>}
              </div>
              <select
                value={firmState?.dcWestOpen ? "OPEN" : decisions.dcWestStatus}
                onChange={(e) => setDecisions({ ...decisions, dcWestStatus: e.target.value })}
                disabled={isSubmitted || firmState?.dcWestOpen}
                className={`w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
              >
                <option value="NO">Do Not Open</option>
                <option value="YES">Open This Quarter</option>
                {firmState?.dcWestOpen && <option value="OPEN">Already Open</option>}
                {firmState?.dcWestOpen && <option value="CLOSE">Close DC</option>}
              </select>
              <div className={`text-xs ${theme.textMuted} mt-2 space-y-1`}>
                <p>Setup: {formatCurrency(decisionConfig?.advancedFeatures?.dcWest?.setupCost || 6000000)}</p>
                <p>OpEx: {formatCurrency(decisionConfig?.advancedFeatures?.dcWest?.quarterlyOpex || 900000)}/qtr</p>
                <p>Capacity: {formatNumber(dcWestCapacity)} units</p>
                {firmState?.dcWestOpen && (
                  <p className="text-blue-400">Current Inventory: {formatNumber(firmState?.dcWestInventory || 0)}</p>
                )}
              </div>
            </div>
          </div>

          {/* DC Allocation - Only show if at least one DC is open */}
          {(firmState?.dcCentralOpen || firmState?.dcWestOpen) && (
            <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
              <p className="font-medium mb-3">📦 Inventory Allocation</p>
              <p className={`text-xs ${theme.textMuted} mb-4`}>
                Allocate finished goods from factory production to regional DCs. Units ship at end of quarter.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {firmState?.dcCentralOpen && (
                  <label className="block">
                    <span className="text-sm">Allocate to Central DC</span>
                    <input
                      type="number"
                      value={decisions.allocateCentral || 0}
                      onChange={(e) => setDecisions({ ...decisions, allocateCentral: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitted}
                      className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                      min="0"
                      max={dcCentralCapacity - (firmState?.dcCentralInventory || 0)}
                      step="1000"
                    />
                    <p className={`text-xs ${theme.textMuted} mt-1`}>
                      Available capacity: {formatNumber(dcCentralCapacity - (firmState?.dcCentralInventory || 0))}
                    </p>
                  </label>
                )}
                {firmState?.dcWestOpen && (
                  <label className="block">
                    <span className="text-sm">Allocate to West DC</span>
                    <input
                      type="number"
                      value={decisions.allocateWest || 0}
                      onChange={(e) => setDecisions({ ...decisions, allocateWest: parseInt(e.target.value) || 0 })}
                      disabled={isSubmitted}
                      className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                      min="0"
                      max={dcWestCapacity - (firmState?.dcWestInventory || 0)}
                      step="1000"
                    />
                    <p className={`text-xs ${theme.textMuted} mt-1`}>
                      Available capacity: {formatNumber(dcWestCapacity - (firmState?.dcWestInventory || 0))}
                    </p>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Inventory Transfers - Only show if at least one DC has inventory */}
          {((firmState?.dcCentralOpen && firmState?.dcCentralInventory > 0) || 
            (firmState?.dcWestOpen && firmState?.dcWestInventory > 0)) && (
            <div className={`p-4 rounded-lg ${theme.cardInner}`}>
              <p className="font-medium mb-3">🔄 Inventory Transfers</p>
              <p className={`text-xs ${theme.textMuted} mb-4`}>
                Transfer inventory between DCs or back to factory. DC-to-DC: ${transferCostDcToDc}/unit • DC-to-Factory: ${transferCostDcToFactory}/unit
              </p>
              <div className="space-y-4">
                {/* Transfer from Central */}
                {firmState?.dcCentralOpen && firmState?.dcCentralInventory > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-blue-500/5">
                    <label className="block">
                      <span className="text-sm">Transfer from Central DC</span>
                      <input
                        type="number"
                        value={decisions.transferFromCentral || 0}
                        onChange={(e) => setDecisions({ ...decisions, transferFromCentral: parseInt(e.target.value) || 0 })}
                        disabled={isSubmitted}
                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                        min="0"
                        max={firmState?.dcCentralInventory || 0}
                        step="1000"
                      />
                      <p className={`text-xs ${theme.textMuted} mt-1`}>
                        Available: {formatNumber(firmState?.dcCentralInventory || 0)} units
                      </p>
                    </label>
                    <label className="block">
                      <span className="text-sm">Transfer Destination</span>
                      <select
                        value={decisions.transferFromCentralTo || "NONE"}
                        onChange={(e) => setDecisions({ ...decisions, transferFromCentralTo: e.target.value })}
                        disabled={isSubmitted || !decisions.transferFromCentral}
                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                      >
                        <option value="NONE">No Transfer</option>
                        {firmState?.dcWestOpen && <option value="WEST">West DC (${transferCostDcToDc}/unit)</option>}
                        <option value="FACTORY">Factory (${transferCostDcToFactory}/unit)</option>
                      </select>
                    </label>
                  </div>
                )}

                {/* Transfer from West */}
                {firmState?.dcWestOpen && firmState?.dcWestInventory > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-purple-500/5">
                    <label className="block">
                      <span className="text-sm">Transfer from West DC</span>
                      <input
                        type="number"
                        value={decisions.transferFromWest || 0}
                        onChange={(e) => setDecisions({ ...decisions, transferFromWest: parseInt(e.target.value) || 0 })}
                        disabled={isSubmitted}
                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                        min="0"
                        max={firmState?.dcWestInventory || 0}
                        step="1000"
                      />
                      <p className={`text-xs ${theme.textMuted} mt-1`}>
                        Available: {formatNumber(firmState?.dcWestInventory || 0)} units
                      </p>
                    </label>
                    <label className="block">
                      <span className="text-sm">Transfer Destination</span>
                      <select
                        value={decisions.transferFromWestTo || "NONE"}
                        onChange={(e) => setDecisions({ ...decisions, transferFromWestTo: e.target.value })}
                        disabled={isSubmitted || !decisions.transferFromWest}
                        className={`mt-1 w-full px-4 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                      >
                        <option value="NONE">No Transfer</option>
                        {firmState?.dcCentralOpen && <option value="CENTRAL">Central DC (${transferCostDcToDc}/unit)</option>}
                        <option value="FACTORY">Factory (${transferCostDcToFactory}/unit)</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Capacity Expansion */}
      {simulation?.features?.capacityExpansion && capacityOptions.length > 0 && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🏗️</span> Capacity Expansion
          </h3>
          <p className={`text-sm ${theme.textMuted} mb-4`}>
            Build additional production lines. Each line adds permanent capacity but requires build time.
          </p>
          
          {/* Current capacity info */}
          <div className={`p-3 rounded-lg ${theme.cardInner} mb-4 flex justify-between items-center`}>
            <span>Current Additional Capacity:</span>
            <span className="font-bold text-blue-400">+{formatNumber(firmState?.additionalCapacity || 0)} units/qtr</span>
          </div>

          {/* Expansion in progress */}
          {firmState?.expansionInProgress?.length > 0 && (
            <div className={`p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4`}>
              <p className="text-yellow-400 text-sm font-medium mb-2">🚧 Expansion In Progress</p>
              {firmState.expansionInProgress.map((exp, idx) => (
                <p key={idx} className={`text-xs ${theme.textMuted}`}>
                  {exp.type.replace("_", " ")}: +{formatNumber(exp.capacity)} units • Completes Q{exp.completesQ}
                </p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capacityOptions.map((cap) => {
              const key = cap.type === "SMALL_LINE" ? "buildSmallLine" : cap.type === "MEDIUM_LINE" ? "buildMediumLine" : "buildLargeLine";
              return (
                <label key={cap.type} className={`flex items-center gap-3 p-4 rounded-lg ${theme.cardInner} cursor-pointer ${
                  decisions[key] ? "ring-2 ring-blue-500" : ""
                }`}>
                  <input
                    type="checkbox"
                    checked={decisions[key] || false}
                    onChange={(e) => setDecisions({ ...decisions, [key]: e.target.checked })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">{cap.name}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {formatCurrency(cap.cost)} • +{formatNumber(cap.unitsPerQuarter)} units/qtr
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>Build time: {cap.buildTime} qtr(s)</p>
                    <p className={`text-xs ${theme.textMuted}`}>Maintenance: {formatCurrency(cap.maintenance)}/qtr</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* VMI */}
      {simulation?.features?.vmi && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🤝</span> Vendor Managed Inventory
          </h3>
          <p className={`text-sm ${theme.textMuted} mb-4`}>
            Let suppliers manage your raw material inventory levels automatically based on consumption patterns.
          </p>
          <label className={`flex items-center gap-3 p-4 rounded-lg ${theme.cardInner} cursor-pointer max-w-md ${
            (decisions.enableVMI || firmState?.vmiActive) ? "ring-2 ring-green-500" : ""
          }`}>
            <input
              type="checkbox"
              checked={decisions.enableVMI || firmState?.vmiActive || false}
              onChange={(e) => setDecisions({ ...decisions, enableVMI: e.target.checked })}
              disabled={isSubmitted || firmState?.vmiActive}
              className="w-5 h-5 rounded"
            />
            <div>
              <p className="font-medium">{firmState?.vmiActive ? "✓ VMI Active" : "Enable VMI"}</p>
              <p className={`text-xs ${theme.textMuted}`}>
                Setup: {formatCurrency(decisionConfig?.advancedFeatures?.vmi?.setupCost || 2000000)} • 
                Quarterly: {formatCurrency(decisionConfig?.advancedFeatures?.vmi?.quarterlyCost || 100000)}
              </p>
              <p className={`text-xs text-green-400 mt-1`}>
                Benefits: -8% holding cost • Smoother ordering • Reduced stockouts
              </p>
            </div>
          </label>
        </div>
      )}

      {/* No features enabled message */}
      {!simulation?.features?.returnsGreenScore && 
       !simulation?.features?.regionalDCs && 
       !simulation?.features?.capacityExpansion && 
       !simulation?.features?.vmi && (
        <div className={`${theme.card} border rounded-xl p-8 text-center`}>
          <span className="text-4xl mb-4 block">📦</span>
          <p className={`${theme.textMuted}`}>
            No advanced modules are enabled for this simulation.
          </p>
          <p className={`text-xs ${theme.textMuted} mt-2`}>
            Contact your instructor to enable capacity expansion, regional DCs, sustainability, or VMI features.
          </p>
        </div>
      )}
    </div>
  );
}