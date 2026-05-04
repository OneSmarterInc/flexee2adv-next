import {
  formatCurrency,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";
import { MetricCard } from "../sub-components";

// FIX (prev): Tailwind purges dynamic `text-${color}-400` strings at build time.
const COLOR_CLASS = {
  blue:    "text-blue-400",
  emerald: "text-emerald-400",
  purple:  "text-purple-400",
  amber:   "text-amber-400",
  cyan:    "text-cyan-400",
  pink:    "text-pink-400",
  red:     "text-red-400",
  indigo:  "text-indigo-400",
};

export function AnalyticsDashboard({ data, isDark, selectedQuarter, firm }) {
  if (!data) return null;

  if (data.featureEnabled === false) {
    return (
      <div
        className={`${
          isDark
            ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30"
            : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
        } border rounded-xl p-12 text-center`}
      >
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard Locked</h2>
        <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"} mb-6`}>
          {data.message || "This advanced analytics feature is not yet available."}
        </p>
        <div
          className={`inline-block p-6 ${
            isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"
          } border rounded-lg`}
        >
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}>
            To unlock detailed KPI tracking and analytics:
          </p>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">💰 $1,000,000</div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Purchase the <strong>ANALYTICS</strong> technology to enable this dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { panels = {}, costBreakdown = {}, bscSnapshot = {}, trendSeries = [] } = data;

  // FIX 3: "UNDERUTILISED" wasn't handled — falls to gray, should be amber.
  // Added UNDERUTILISED alongside any other non-standard statuses.
  const getStatusColor = (status) => {
    switch (status) {
      case "OK":            return "text-emerald-400";
      case "OPTIMAL":       return "text-green-400";
      case "WARN":
      case "UNDERUTILISED": return "text-amber-400";
      case "CRITICAL":      return "text-red-400";
      default:              return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OK":      return "✓";
      case "OPTIMAL": return "⭐";
      case "WARN":
      case "UNDERUTILISED": return "⚠️";
      case "CRITICAL":return "🔴";
      default:        return "•";
    }
  };

  // FIX 5: "BASIC" is the lowest maturity tier — was rendering emerald (good).
  // Explicit map: ADVANCED → green, DEVELOPING → blue, BASIC → amber.
  const getMaturityBadgeClass = (maturity) => {
    switch (maturity) {
      case "ADVANCED":   return "bg-emerald-500/20 text-emerald-400";
      case "DEVELOPING": return "bg-blue-500/20 text-blue-400";
      case "BASIC":
      default:           return "bg-amber-500/20 text-amber-400";
    }
  };

  // FIX 2 (costBreakdown.total): backend returns total: 0.
  // Compute the real total from individual line items as a fallback.
  const computedCostTotal =
    (costBreakdown.labor         || 0) +
    (costBreakdown.holding        || 0) +
    (costBreakdown.marketing      || 0) +
    (costBreakdown.quality        || 0) +
    (costBreakdown.freight        || 0) +
    (costBreakdown.techMaintenance|| 0) +
    (costBreakdown.interest       || 0) +
    (costBreakdown.vmiSetup       || 0) +
    (costBreakdown.vmiOngoing     || 0);
  const costTotal = costBreakdown.total > 0 ? costBreakdown.total : computedCostTotal;

  return (
    <div className="space-y-6">
      {/* Executive Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Financial Panel */}
        {panels.financial && (
          <div className={`${getCardClass(isDark)} p-5 relative overflow-hidden border-l-4 border-l-blue-500`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">Financial</span>
              {/* FIX 1: panels.financial.score is absent from the payload → TypeError crash.
                  Use bscSnapshot.financial as the score source; fall back to "—". */}
              <span className="text-2xl font-bold text-blue-400">
                {(panels.financial.score ?? bscSnapshot.financial ?? null) !== null
                  ? (panels.financial.score ?? bscSnapshot.financial).toFixed(0)
                  : "—"}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Revenue</span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {formatCurrency(panels.financial.revenue, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Rev Growth</span>
                {/* FIX (prev): revenue growth can be negative */}
                <span className={(panels.financial.revenueGrowth ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
                  {panels.financial.revenueGrowth?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Net Income</span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {formatCurrency(panels.financial.netIncome, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Net Margin</span>
                <span className="text-amber-400">
                  {panels.financial.netMarginPct?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Panel */}
        {panels.customer && (
          <div className={`${getCardClass(isDark)} p-5 relative overflow-hidden border-l-4 border-l-emerald-500`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">Customer</span>
              {/* FIX 1: same missing score field */}
              <span className="text-2xl font-bold text-emerald-400">
                {(panels.customer.score ?? bscSnapshot.customer ?? null) !== null
                  ? (panels.customer.score ?? bscSnapshot.customer).toFixed(0)
                  : "—"}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>CSI</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  {panels.customer.csi?.toFixed(1)}
                  <span className={`text-xs ${getStatusColor(panels.customer.csiStatus)}`}>
                    {getStatusIcon(panels.customer.csiStatus)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Market Share</span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {panels.customer.marketSharePct?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Fill Rate</span>
                <span className="text-green-400">
                  {panels.customer.fillRatePct?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Return Rate</span>
                <span className="text-red-400">
                  {panels.customer.returnRatePct?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Operations Panel */}
        {panels.operations && (
          <div className={`${getCardClass(isDark)} p-5 relative overflow-hidden border-l-4 border-l-purple-500`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">Operations</span>
              {/* FIX 1: same missing score field */}
              <span className="text-2xl font-bold text-purple-400">
                {(panels.operations.score ?? bscSnapshot.process ?? null) !== null
                  ? (panels.operations.score ?? bscSnapshot.process).toFixed(0)
                  : "—"}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Perfect Order</span>
                <span className="text-green-400">
                  {panels.operations.perfectOrderPct?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Capacity Util</span>
                {/* FIX 3: UNDERUTILISED now maps to amber */}
                <span className={getStatusColor(panels.operations.capacityStatus)}>
                  {panels.operations.capacityUtilPct?.toFixed(1)}%
                  {panels.operations.capacityStatus === "UNDERUTILISED" && (
                    <span className="ml-1 text-xs opacity-75">↓</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Defect Rate</span>
                <span className="text-amber-400">
                  {panels.operations.defectRatePct?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>On-Time Delivery</span>
                <span className="text-blue-400">
                  {panels.operations.onTimeDeliveryPct?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Panel */}
        {panels.inventory && (
          <div className={`${getCardClass(isDark)} p-5 relative overflow-hidden border-l-4 border-l-amber-500`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">Inventory</span>
              <span className="text-2xl font-bold text-amber-400">
                {panels.inventory.inventoryTurnover?.toFixed(2)}x
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Raw Materials</span>
                {/* FIX (prev): was rawMaterialUnits * 1000 passed to formatCurrency — wrong unit + wrong type */}
                <span className="text-cyan-400">
                  {(panels.inventory.rawMaterialUnits || 0).toLocaleString()} u
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Finished Goods</span>
                {/* FIX (prev): same */}
                <span className="text-blue-400">
                  {(panels.inventory.finishedGoodsUnits || 0).toLocaleString()} u
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Weeks of Supply</span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {panels.inventory.weeksOfSupply?.toFixed(1)} wks
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Retailer Inv</span>
                <span className="text-purple-400">
                  {panels.inventory.retailerInventory?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Learning Panel */}
        {panels.learning && (
          <div className={`${getCardClass(isDark)} p-5 relative overflow-hidden border-l-4 border-l-cyan-500`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide">
                Learning & Growth
              </span>
              {/* FIX 5: BASIC was rendering emerald — it's the lowest tier, should be amber */}
              <span className={`text-xs px-2 py-1 rounded ${getMaturityBadgeClass(panels.learning.scMaturity)}`}>
                {panels.learning.scMaturity || "—"}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Tech Count</span>
                {/* FIX 4: techSystemsCount (1) disagrees with techSystemsOwned.length (8).
                    Use the array length as the authoritative source. */}
                <span className="text-blue-400">
                  {panels.learning.techSystemsOwned?.length ?? panels.learning.techSystemsCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Tech Investment</span>
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  {formatCurrency(panels.learning.techInvestmentTotal, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass(isDark)}>Forecast Acc</span>
                <span className="text-green-400">
                  {panels.learning.forecastAccuracyPct?.toFixed(1)}%
                </span>
              </div>
              {/* FIX (prev): was labelled "Tech Systems" — duplicate. Now "Systems Owned". */}
              <div className="flex justify-between gap-2">
                <span className={`${getTextSecondaryClass(isDark)} shrink-0`}>Systems Owned</span>
                <span className="text-xs text-right truncate">
                  {panels.learning.techSystemsOwned?.join(", ") || "None"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Balanced Scorecard Summary */}
      {/* FIX (prev): bscSnapshot defaults to {} — was always truthy. Guard on actual data. */}
      {bscSnapshot.overall !== undefined && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className="text-lg font-semibold mb-4">
            Balanced Scorecard - Q{selectedQuarter}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Overall",   value: bscSnapshot.overall?.toFixed(1),  color: "text-blue-400" },
              { label: "Financial", value: bscSnapshot.financial?.toFixed(0), color: "text-emerald-400" },
              { label: "Customer",  value: bscSnapshot.customer?.toFixed(0),  color: "text-cyan-400" },
              { label: "Process",   value: bscSnapshot.process?.toFixed(0),   color: "text-purple-400" },
              { label: "Learning",  value: bscSnapshot.learning?.toFixed(0),  color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`text-center p-4 ${getBgSecondaryClass(isDark)} rounded-lg`}>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className={`text-xs ${getTextSecondaryClass(isDark)} mt-1`}>{label}</div>
              </div>
            ))}
            <div className={`text-center p-4 ${getBgSecondaryClass(isDark)} rounded-lg`}>
              <div className="text-2xl font-bold text-yellow-400">{bscSnapshot.grade}</div>
              <div className="text-xs mt-1">Rank #{bscSnapshot.rank || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {/* FIX (prev): costBreakdown defaults to {} — was always truthy. */}
      {/* FIX 2: backend returns total: 0. Compute fallback from line items. */}
      {computedCostTotal > 0 && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Labor",            value: costBreakdown.labor,            color: "blue" },
              { label: "Holding",          value: costBreakdown.holding,          color: "emerald" },
              { label: "Marketing",        value: costBreakdown.marketing,        color: "purple" },
              { label: "Quality",          value: costBreakdown.quality,          color: "amber" },
              { label: "Freight",          value: costBreakdown.freight,          color: "cyan" },
              { label: "Tech Maintenance", value: costBreakdown.techMaintenance,  color: "pink" },
              { label: "Interest",         value: costBreakdown.interest,         color: "red" },
              { label: "VMI Setup",        value: costBreakdown.vmiSetup,         color: "indigo" },
            ]
              .filter((item) => (item.value || 0) > 0) // hide zero-value line items
              .map((item) => (
                <div key={item.label} className={`text-center p-4 ${getBgSecondaryClass(isDark)} rounded-lg`}>
                  {/* FIX (prev): static color map — dynamic class strings are purged by Tailwind */}
                  <div className={`text-sm font-semibold ${COLOR_CLASS[item.color]} mb-1`}>
                    {item.label}
                  </div>
                  <div className={isDark ? "text-white" : "text-gray-900"}>
                    {formatCurrency(item.value, true)}
                  </div>
                </div>
              ))}
          </div>
          <div
            className={`mt-4 p-4 ${getBgSecondaryClass(isDark)} rounded-lg border ${
              isDark ? "border-gray-700/50" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(costTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trendSeries && trendSeries.length > 0 && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className="text-lg font-semibold mb-4">Quarterly Trend Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}>
                  {["Quarter", "Revenue", "Net Income", "CSI", "Market Share", "Fill Rate", "Perfect Order", "BSC Overall"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`py-2 px-3 font-semibold first:text-left text-right ${getTextSecondaryClass(isDark)}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {trendSeries.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"} ${
                      row.quarter === selectedQuarter
                        ? isDark ? "bg-blue-500/10" : "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold">Q{row.quarter}</td>
                    <td className="text-right py-2 px-3 font-mono">
                      {formatCurrency(row.revenue, true)}
                    </td>
                    <td className="text-right py-2 px-3 font-mono">
                      {formatCurrency(row.netIncome, true)}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-cyan-400">
                      {row.csi?.toFixed(1)}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-green-400">
                      {row.marketSharePct?.toFixed(2)}%
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-blue-400">
                      {row.fillRatePct?.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-purple-400">
                      {row.perfectOrderPct?.toFixed(1)}%
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-amber-400">
                      {row.bscOverall?.toFixed(1)}
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