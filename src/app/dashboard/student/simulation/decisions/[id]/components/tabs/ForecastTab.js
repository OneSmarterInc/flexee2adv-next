// src/app/dashboard/student/decisions/[id]/components/tabs/ForecastTab.js

export default function ForecastTab({
  theme,
  decisions,
  setDecisions,
  demandHistory,
  season,
  isSubmitted,
  simulation,
  firmState,
  formatNumber,
  nextQuarter,
  textMuted
}) {
  // Check if market expansion is enabled and which regions are active
  const marketExpansionEnabled = simulation?.features?.marketExpansion;
  const r4Active = firmState?.r4Active || decisions.enterR4;
  const r5Active = firmState?.r5Active || decisions.enterR5;
  const r6Active = firmState?.r6Active || decisions.enterR6;

  // Entry costs for new markets
  const marketEntryCost = 2000000; // $2M per market entry

  return (
    <div className="space-y-6">
      {/* Main Forecast Card */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <span>🔮</span> Demand Forecast - Core Regions
        </h3>
        <p className={`${theme.textMuted} mb-6`}>
          Enter your demand forecast for each region. This helps plan production and procurement.
        </p>

        {/* Forecast Method */}
        <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
          <p className={`text-sm font-medium mb-3`}>Forecast Method</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "GUT", label: "Gut Feel", description: "Intuition-based forecasting" },
              { value: "MODEL", label: "Statistical Model", description: "Data-driven forecasting" },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => !isSubmitted && setDecisions({ ...decisions, forecastMethod: method.value })}
                disabled={isSubmitted}
                className={`px-4 py-3 rounded-lg border transition text-left ${
                  decisions.forecastMethod === method.value
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : `${theme.cardInner} border-transparent hover:border-gray-500`
                } ${isSubmitted ? "opacity-50" : ""}`}
              >
                <p className="font-medium">{method.label}</p>
                <p className={`text-xs ${theme.textMuted}`}>{method.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Reference Data */}
        <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
          <p className={`text-sm font-medium mb-3`}>
            Q{demandHistory?.quarter || simulation?.currentQuarter - 1} Actual Demand (Reference)
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${theme.textMuted}`}>East (R1)</p>
              <p className="font-bold">{formatNumber(demandHistory?.demandR1 || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Central (R2)</p>
              <p className="font-bold">{formatNumber(demandHistory?.demandR2 || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>West (R3)</p>
              <p className="font-bold">{formatNumber(demandHistory?.demandR3 || 0)}</p>
            </div>
            <div>
              <p className={`text-xs ${theme.textMuted}`}>Q{nextQuarter} Multiplier</p>
              <p className="font-bold text-yellow-400">{season?.multiplier || 1.0}x</p>
            </div>
          </div>
        </div>

        {/* Regional Forecasts - Core Regions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "East Region (R1)", key: "forecastR1", lastDemand: demandHistory?.demandR1, icon: "🏙️" },
            { label: "Central Region (R2)", key: "forecastR2", lastDemand: demandHistory?.demandR2, icon: "🌾" },
            { label: "West Region (R3)", key: "forecastR3", lastDemand: demandHistory?.demandR3, icon: "🌴" },
          ].map((region) => (
            <label key={region.key} className="block">
              <span className="text-sm font-medium">{region.icon} {region.label}</span>
              <input
                type="number"
                value={decisions[region.key] || 0}
                onChange={(e) => setDecisions({ ...decisions, [region.key]: parseInt(e.target.value) || 0 })}
                disabled={isSubmitted}
                className={`mt-1 w-full px-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
                min="0"
                step="10000"
              />
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Suggested: ~{formatNumber(Math.round((region.lastDemand || 200000) * (season?.multiplier || 1)))}
              </p>
            </label>
          ))}
        </div>

        {/* Core Regions Total */}
        <div className={`mt-6 p-4 rounded-lg ${theme.cardInner} flex justify-between items-center`}>
          <span className="font-medium">Core Regions Total (R1-R3)</span>
          <span className="text-xl font-bold">
            {formatNumber((decisions.forecastR1 || 0) + (decisions.forecastR2 || 0) + (decisions.forecastR3 || 0))}
          </span>
        </div>
      </div>

      {/* Market Expansion - R4, R5, R6 */}
      {marketExpansionEnabled && (
        <div className={`${theme.card} border rounded-xl p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🌍</span> Market Expansion - New Regions
          </h3>
          <p className={`${theme.textMuted} mb-6`}>
            Expand into new geographic markets. Each market entry costs ${(marketEntryCost / 1000000).toFixed(0)}M and takes 1 quarter to establish.
            New markets start with lower demand but grow over time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Region 4 - Northeast */}
            <div className={`p-4 rounded-lg ${theme.cardInner} ${r4Active ? "ring-2 ring-green-500" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">🗽 Northeast (R4)</p>
                {firmState?.r4Active && (
                  <span className="text-green-400 text-xs">✓ Active Q{firmState?.r4EntryQuarter}</span>
                )}
              </div>
              
              {!firmState?.r4Active ? (
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={decisions.enterR4 || false}
                    onChange={(e) => setDecisions({ 
                      ...decisions, 
                      enterR4: e.target.checked,
                      forecastR4: e.target.checked ? (decisions.forecastR4 || 30000) : 0
                    })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Enter Market (${(marketEntryCost / 1000000).toFixed(0)}M)</span>
                </label>
              ) : (
                <p className={`text-xs ${theme.textMuted} mb-3`}>
                  Quarters Active: {firmState?.r4QuartersActive || 1}
                </p>
              )}

              {(decisions.enterR4 || firmState?.r4Active) && (
                <label className="block">
                  <span className="text-xs">Forecast R4</span>
                  <input
                    type="number"
                    value={decisions.forecastR4 || 0}
                    onChange={(e) => setDecisions({ ...decisions, forecastR4: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitted}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                    min="0"
                    step="5000"
                  />
                  <p className={`text-xs ${theme.textMuted} mt-1`}>
                    {firmState?.r4Active 
                      ? `Market maturity: ${Math.min(100, (firmState?.r4QuartersActive || 1) * 25)}%`
                      : "First quarter: expect 50% demand fill"}
                  </p>
                </label>
              )}
            </div>

            {/* Region 5 - Southeast */}
            <div className={`p-4 rounded-lg ${theme.cardInner} ${r5Active ? "ring-2 ring-green-500" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">🏖️ Southeast (R5)</p>
                {firmState?.r5Active && (
                  <span className="text-green-400 text-xs">✓ Active Q{firmState?.r5EntryQuarter}</span>
                )}
              </div>
              
              {!firmState?.r5Active ? (
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={decisions.enterR5 || false}
                    onChange={(e) => setDecisions({ 
                      ...decisions, 
                      enterR5: e.target.checked,
                      forecastR5: e.target.checked ? (decisions.forecastR5 || 25000) : 0
                    })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Enter Market (${(marketEntryCost / 1000000).toFixed(0)}M)</span>
                </label>
              ) : (
                <p className={`text-xs ${theme.textMuted} mb-3`}>
                  Quarters Active: {firmState?.r5QuartersActive || 1}
                </p>
              )}

              {(decisions.enterR5 || firmState?.r5Active) && (
                <label className="block">
                  <span className="text-xs">Forecast R5</span>
                  <input
                    type="number"
                    value={decisions.forecastR5 || 0}
                    onChange={(e) => setDecisions({ ...decisions, forecastR5: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitted}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                    min="0"
                    step="5000"
                  />
                  <p className={`text-xs ${theme.textMuted} mt-1`}>
                    {firmState?.r5Active 
                      ? `Market maturity: ${Math.min(100, (firmState?.r5QuartersActive || 1) * 25)}%`
                      : "First quarter: expect 50% demand fill"}
                  </p>
                </label>
              )}
            </div>

            {/* Region 6 - Southwest */}
            <div className={`p-4 rounded-lg ${theme.cardInner} ${r6Active ? "ring-2 ring-green-500" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">🌵 Southwest (R6)</p>
                {firmState?.r6Active && (
                  <span className="text-green-400 text-xs">✓ Active Q{firmState?.r6EntryQuarter}</span>
                )}
              </div>
              
              {!firmState?.r6Active ? (
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={decisions.enterR6 || false}
                    onChange={(e) => setDecisions({ 
                      ...decisions, 
                      enterR6: e.target.checked,
                      forecastR6: e.target.checked ? (decisions.forecastR6 || 20000) : 0
                    })}
                    disabled={isSubmitted}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm">Enter Market (${(marketEntryCost / 1000000).toFixed(0)}M)</span>
                </label>
              ) : (
                <p className={`text-xs ${theme.textMuted} mb-3`}>
                  Quarters Active: {firmState?.r6QuartersActive || 1}
                </p>
              )}

              {(decisions.enterR6 || firmState?.r6Active) && (
                <label className="block">
                  <span className="text-xs">Forecast R6</span>
                  <input
                    type="number"
                    value={decisions.forecastR6 || 0}
                    onChange={(e) => setDecisions({ ...decisions, forecastR6: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitted}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border ${theme.input} disabled:opacity-50`}
                    min="0"
                    step="5000"
                  />
                  <p className={`text-xs ${theme.textMuted} mt-1`}>
                    {firmState?.r6Active 
                      ? `Market maturity: ${Math.min(100, (firmState?.r6QuartersActive || 1) * 25)}%`
                      : "First quarter: expect 50% demand fill"}
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Expansion Markets Total */}
          {(r4Active || r5Active || r6Active) && (
            <div className={`mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 flex justify-between items-center`}>
              <span className="text-purple-400 font-medium">Expansion Regions Total (R4-R6)</span>
              <span className="text-xl font-bold text-purple-400">
                {formatNumber((decisions.forecastR4 || 0) + (decisions.forecastR5 || 0) + (decisions.forecastR6 || 0))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grand Total Forecast */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-lg">📊 Total Forecast (All Regions)</span>
            <p className={`text-xs ${theme.textMuted}`}>
              Core: R1-R3 {marketExpansionEnabled && (r4Active || r5Active || r6Active) && " • Expansion: R4-R6"}
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-400">
            {formatNumber(
              (decisions.forecastR1 || 0) + 
              (decisions.forecastR2 || 0) + 
              (decisions.forecastR3 || 0) +
              (decisions.forecastR4 || 0) +
              (decisions.forecastR5 || 0) +
              (decisions.forecastR6 || 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}