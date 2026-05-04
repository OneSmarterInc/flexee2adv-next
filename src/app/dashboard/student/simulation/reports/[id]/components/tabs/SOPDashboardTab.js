import {
  formatCurrency,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
} from "../../utils";

// FIX 2: Explicit label map replaces the broken camelCase regex formatter.
// The regex produced "csi" (no change on all-lowercase), "capacity Util"
// (truncated acronym), "short Term Debt" (wrong spacing), etc.
const METRIC_LABELS = {
  fillRate:         "Fill Rate",
  csi:              "CSI Score",
  perfectOrder:     "Perfect Order",
  forecastAccuracy: "Forecast Accuracy",
  capacityUtil:     "Capacity Utilization",
  cash:             "Cash",
  shortTermDebt:    "Short-Term Debt",
};

// FIX 6 & 7: Shared status → badge colour helper.
// Old code only had a binary OK vs "everything else → amber" check, so
// CRITICAL statuses on capacity, rawMaterial, and finishedGoods all showed amber.
const statusBadgeClass = (status) => {
  switch (status) {
    case "OK":
    case "OPTIMAL":  return "bg-emerald-500/20 text-emerald-400";
    case "WARN":     return "bg-amber-500/20 text-amber-400";
    case "CRITICAL": return "bg-red-500/20 text-red-400";
    default:         return "bg-gray-500/20 text-gray-400";
  }
};

export function SOPDashboardTab({ data, isDark, selectedQuarter, firm }) {
  if (!data) {
    return (
      <div className={`${getCardClass(isDark)} p-8 text-center`}>
        <p className={`text-lg ${getTextSecondaryClass(isDark)}`}>
          No SOP data available for Q{selectedQuarter}
        </p>
      </div>
    );
  }

  const getAlertColor = (level) => {
    switch (level) {
      case "CRITICAL": return "bg-red-500/10 border-red-500/30 text-red-400";
      case "WARN":     return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "INFO":     return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      default:         return "bg-gray-500/10 border-gray-500/30 text-gray-400";
    }
  };

  const getMetricTextColor = (status) => {
    switch (status) {
      case "OK":
      case "OPTIMAL":  return "text-emerald-400";
      case "WARN":     return "text-amber-400";
      case "CRITICAL": return "text-red-400";
      default:         return "text-gray-400";
    }
  };

  // FIX 4: Render "N/A" when status is NO_DATA instead of showing 0.
  // Also handles dollar formatting for cash/debt metrics.
  const formatMetricValue = (key, metric) => {
    if (metric.status === "NO_DATA") return "N/A";
    const v = metric.value;
    if (key === "cash" || key === "shortTermDebt") {
      if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
      return `$${v.toFixed(0)}`;
    }
    return typeof v === "number"
      ? v.toLocaleString(undefined, { maximumFractionDigits: 1 })
      : v;
  };

  // FIX 3: PANIC must be red (it's a CRITICAL-level retailer state).
  // Old code only split NORMAL vs "everything else → amber", so PANIC showed amber.
  const getRetailerModeColor = (mode) => {
    switch (mode) {
      case "NORMAL":    return "text-emerald-400";
      case "CLEARANCE": return "text-amber-400";
      case "PANIC":     return "text-red-400";
      default:          return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Supply Operations Planning</h2>
        {/* FIX 5: totalMarketDemand is a unit count, not a dollar figure — removed $ */}
        <p className={`text-sm ${getTextSecondaryClass(isDark)}`}>
          {data.firmName} • Q{data.quarter} • Total Market Demand:{" "}
          {(data.totalMarketDemand || 0).toLocaleString()} units
        </p>
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Alerts</h3>
          {data.alerts.map((alert, idx) => (
            <div key={idx} className={`border rounded-lg p-4 ${getAlertColor(alert.level)}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  {alert.level === "CRITICAL" ? "🚨" : alert.level === "WARN" ? "⚠️" : "ℹ️"}
                </span>
                <p className="flex-1">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.keyMetrics &&
            Object.entries(data.keyMetrics).map(([key, metric]) => (
              <div key={key} className={`${getCardClass(isDark)} p-4`}>
                {/* FIX 2: explicit label map */}
                <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>
                  {METRIC_LABELS[key] ?? key}
                </p>
                {/* FIX 4: N/A for NO_DATA */}
                <p className={`text-2xl font-bold ${getMetricTextColor(metric.status)}`}>
                  {formatMetricValue(key, metric)}
                </p>
                <p className={`text-xs mt-1 ${getTextSecondaryClass(isDark)}`}>
                  {metric.status === "NO_DATA" ? "No data yet" : metric.status}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Demand Outlook */}
      {data.demandOutlook && data.demandOutlook.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Demand Outlook</h3>
          <div className={`${getCardClass(isDark)} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}>
                    {["Quarter", "Season", "Multiplier", "Region 1", "Region 2", "Region 3", "Total"].map((h) => (
                      <th key={h} className={`py-3 px-4 font-semibold text-sm first:text-left text-center ${getTextSecondaryClass(isDark)}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.demandOutlook.map((outlook, idx) => (
                    <tr key={idx} className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}>
                      <td className="py-3 px-4 font-semibold">Q{outlook.quarter}</td>
                      <td className="text-center py-3 px-4 text-sm">{outlook.seasonLabel}</td>
                      <td className="text-center py-3 px-4 font-mono text-sm">
                        {outlook.seasonalMultiplier?.toFixed(2)}x
                      </td>
                      <td className="text-center py-3 px-4 font-mono text-sm">
                        {(outlook.demandR1 || 0).toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4 font-mono text-sm">
                        {(outlook.demandR2 || 0).toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4 font-mono text-sm">
                        {(outlook.demandR3 || 0).toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4 font-mono font-semibold text-blue-400">
                        {(outlook.totalDemand || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Forecast History */}
      {data.forecastHistory && data.forecastHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Forecast Accuracy</h3>
          <div className={`${getCardClass(isDark)} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}>
                    {["Quarter", "Forecast (Total)", "Actual (Total)", "Error", "Accuracy %", "MAPE"].map((h) => (
                      <th key={h} className={`py-3 px-4 font-semibold text-sm first:text-left text-center ${getTextSecondaryClass(isDark)}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.forecastHistory.map((history, idx) => {
                    // FIX 1: forecast/actual/error are nested objects {r1, r2, r3, total}.
                    // Old code did (history.forecast || 0).toLocaleString() which rendered
                    // "[object Object]". We need the .total field. Fallback keeps it safe
                    // if the shape ever changes to a flat number.
                    const forecastTotal = history.forecast?.total ?? history.forecast ?? 0;
                    const actualTotal   = history.actual?.total   ?? history.actual   ?? 0;
                    const errorTotal    = history.error?.total     ?? history.error    ?? 0;

                    return (
                      <tr key={idx} className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}>
                        <td className="py-3 px-4 font-semibold">Q{history.quarter}</td>
                        <td className="text-center py-3 px-4 font-mono text-sm">
                          {forecastTotal.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4 font-mono text-sm">
                          {actualTotal.toLocaleString()}
                        </td>
                        <td className={`text-center py-3 px-4 font-mono text-sm ${errorTotal < 0 ? "text-green-400" : "text-red-400"}`}>
                          {errorTotal.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4 font-mono font-semibold text-emerald-400">
                          {(history.accuracyPct || 0).toFixed(1)}%
                        </td>
                        <td className="text-center py-3 px-4 font-mono text-sm">
                          {(history.mape || 0).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Supply Plan */}
      {data.supplyPlan && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Supply Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Units Produced</p>
              <p className="text-3xl font-bold text-blue-400">
                {(data.supplyPlan.unitsProduced || 0).toLocaleString()}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Total Capacity</p>
              <p className="text-3xl font-bold text-emerald-400">
                {(data.supplyPlan.totalCapacity || 0).toLocaleString()}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Capacity Utilization</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-amber-400">
                  {(data.supplyPlan.capacityUtilPct || 0).toFixed(1)}%
                </p>
                {/* FIX 6: was only OPTIMAL → green, everything else → amber (CRITICAL showed amber) */}
                <span className={`text-xs px-2 py-1 rounded ${statusBadgeClass(data.supplyPlan.capacityStatus)}`}>
                  {data.supplyPlan.capacityStatus}
                </span>
              </div>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Expansions In Progress</p>
              <p className="text-3xl font-bold text-purple-400">
                {data.supplyPlan.expansionsInProgress || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Position */}
      {data.inventoryPosition && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Inventory Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Raw Material Units</p>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                {(data.inventoryPosition.rawMaterialUnits || 0).toLocaleString()}
              </p>
              {/* FIX 7: CRITICAL was amber */}
              <span className={`text-xs px-2 py-1 rounded inline-block ${statusBadgeClass(data.inventoryPosition.rawMaterialStatus)}`}>
                {data.inventoryPosition.rawMaterialStatus}
              </span>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Finished Goods Units</p>
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {(data.inventoryPosition.finishedGoodsUnits || 0).toLocaleString()}
              </p>
              {/* FIX 7: finishedGoodsStatus CRITICAL was showing amber */}
              <span className={`text-xs px-2 py-1 rounded inline-block ${statusBadgeClass(data.inventoryPosition.finishedGoodsStatus)}`}>
                {data.inventoryPosition.finishedGoodsStatus}
              </span>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Inventory Value</p>
              <p className="text-2xl font-bold text-purple-400">
                ${(data.inventoryPosition.inventoryValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Inventory Turnover</p>
              <p className="text-2xl font-bold text-amber-400">
                {(data.inventoryPosition.inventoryTurnover || 0).toFixed(2)}x
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Weeks of Supply</p>
              <p className="text-2xl font-bold text-blue-400">
                {(data.inventoryPosition.weeksOfSupply || 0).toFixed(1)} wks
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Retailer Inventory</p>
              <p className="text-2xl font-bold text-green-400">
                {(data.inventoryPosition.retailerInventory || 0).toLocaleString()}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>In Transit Units</p>
              <p className="text-2xl font-bold text-indigo-400">
                {(data.inventoryPosition.inTransitUnits || 0).toLocaleString()}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Retailer Mode</p>
              {/* FIX 3: PANIC was rendering amber */}
              <p className={`text-lg font-bold ${getRetailerModeColor(data.inventoryPosition.retailerMode)}`}>
                {data.inventoryPosition.retailerMode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quality Section */}
      {data.qualitySection && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Inspection Level</p>
              <p className="text-2xl font-bold text-blue-400">
                {data.qualitySection.inspectionLevel}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Defect Rate</p>
              <p className="text-2xl font-bold text-amber-400">
                {(data.qualitySection.defectRatePct || 0).toFixed(2)}%
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Return Rate</p>
              <p className={`text-2xl font-bold ${(data.qualitySection.returnRatePct || 0) > 2 ? "text-red-400" : "text-emerald-400"}`}>
                {(data.qualitySection.returnRatePct || 0).toFixed(2)}%
              </p>
              <span className={`text-xs mt-2 px-2 py-1 rounded inline-block ${statusBadgeClass(data.qualitySection.returnRateStatus)}`}>
                {data.qualitySection.returnRateStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Section */}
      {data.logisticsSection && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Logistics & Transportation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Carrier Mode</p>
              <p className="text-2xl font-bold text-blue-400">
                {data.logisticsSection.carrierMode ?? "—"}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Freight Cost</p>
              <p className="text-2xl font-bold text-purple-400">
                ${(data.logisticsSection.freightCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Last Mile Cost</p>
              <p className="text-2xl font-bold text-green-400">
                ${(data.logisticsSection.lastMileCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>Volume Discount</p>
              <p className="text-2xl font-bold text-amber-400">
                {(data.logisticsSection.volumeDiscount || 0).toFixed(2)}%
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>TMS Discount</p>
              <p className="text-2xl font-bold text-blue-400">
                {(data.logisticsSection.tmsDiscountPct || 0).toFixed(2)}%
              </p>
            </div>
            <div className={`${getCardClass(isDark)} p-5`}>
              <p className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>TMS Applied</p>
              <p className={`text-lg font-bold ${data.logisticsSection.tmsDiscountApplied ? "text-emerald-400" : "text-gray-400"}`}>
                {data.logisticsSection.tmsDiscountApplied ? "✓ Yes" : "✗ No"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}