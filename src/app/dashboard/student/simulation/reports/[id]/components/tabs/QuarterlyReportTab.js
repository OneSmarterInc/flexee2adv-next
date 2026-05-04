import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";

export function QuarterlyReportTab({
  currentData,
  previousData,
  isDark,
  selectedQuarter,
  firm,
  kpiReports,
  tenqReports,
  tenqYtd,
  tenqCompare,
  vmiData,
  simulation,
  getSeason,
  handleDownload10QReport,
}) {
  if (!currentData) return null;

  const reportData = tenqReports ? tenqReports[selectedQuarter] : null;
  const ytdData = tenqYtd ? tenqYtd[selectedQuarter] : null;
  const compareData = tenqCompare ? tenqCompare[selectedQuarter] : null;
  const season = getSeason(selectedQuarter);

  // Get VMI data from API (vmiData is an array of trend objects)
  let vmiProcessed = null;

  if (vmiData && Array.isArray(vmiData) && vmiData.length > 0) {
    // Find the matching quarter or use the latest
    const quarterRecord =
      vmiData.find((r) => r.quarter === selectedQuarter) ||
      vmiData[vmiData.length - 1];

    if (quarterRecord) {
      // Process VMI data structure from API
      const vmiObj = quarterRecord.vmi || {};
      vmiProcessed = {
        active: vmiObj.active || false,
        setupCost: vmiObj.setupCost || 0,
        ongoingCost: vmiObj.ongoingCost || 0,
        totalCostThisQuarter: vmiObj.totalCostThisQuarter || 0,
        retailerMode: vmiObj.retailerMode || "NORMAL",
        coverageMonths: vmiObj.coverageMonths || 0,
        clearancePrevented: vmiObj.clearancePrevented || false,
        panicPrevented: vmiObj.panicPrevented || false,
        revenueProtected: vmiObj.revenueProtected || 0,
        csiProtected: vmiObj.csiProtected || 0,
        cumulativeTotalCost: vmiObj.cumulativeTotalCost || 0,
        cumulativeRevenueProtected: vmiObj.cumulativeRevenueProtected || 0,
        cumulativeNetBenefit: vmiObj.cumulativeNetBenefit || 0,
        distribution: vmiObj.distribution || [],
        avgInventoryLevel: vmiObj.avgInventoryLevel || 0,
        fillRateConsistency: vmiObj.fillRateConsistency || 0,
        numDistributors: vmiObj.numDistributors || 0,
        avgOrdersPerMonth: vmiObj.avgOrdersPerMonth || 0,
      };
    }
  }

  // Build theme object
  const theme = {
    text: isDark ? "text-white" : "text-gray-900",
    textSecondary: getTextSecondaryClass(isDark),
    border: isDark ? "border-gray-700/50" : "border-gray-200",
  };

  // Calculate some derived metrics
  const grossProfit = currentData.revenue - currentData.cogs;
  const grossMarginPct =
    currentData.revenue > 0 ? (grossProfit / currentData.revenue) * 100 : 0;
  const netMarginPct =
    currentData.revenue > 0
      ? (currentData.netIncome / currentData.revenue) * 100
      : 0;

  const totalOperatingCosts =
    currentData.laborCost +
    currentData.holdingCost +
    currentData.marketingCost +
    currentData.qualityCost +
    currentData.freightCost +
    currentData.techMaintenanceCost;

  const totalCustomers =
    currentData.customersLoyal +
    currentData.customersInPlay +
    currentData.customersChurned;
  const loyaltyRate =
    totalCustomers > 0
      ? (currentData.customersLoyal / totalCustomers) * 100
      : 0;
  const churnRate =
    totalCustomers > 0
      ? (currentData.customersChurned / totalCustomers) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div
        className={`${isDark ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30" : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"} border rounded-xl p-6`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{season.icon}</span>
              <div>
                <h2 className={`text-2xl font-bold ${theme.text}`}>
                  Q{selectedQuarter} Performance Report
                </h2>
                <p className={theme.textSecondary}>
                  {firm?.name} • {season.name}
                </p>
              </div>
            </div>
            <p className={`text-sm ${theme.textSecondary} mt-2`}>
              {season.hint}
            </p>
          </div>

          <div className="flex gap-4">
            <div
              className={`text-center px-6 py-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(currentData.netIncome, true)}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>
                Net Income
              </div>
            </div>
            <div
              className={`text-center px-6 py-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <div className="text-2xl font-bold text-blue-400">
                #{currentData.bscRank}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>
                Industry Rank
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            Revenue
          </div>
          <div
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatCurrency(currentData.revenue, true)}
          </div>
          {previousData && (
            <div
              className={`text-xs mt-1 ${currentData.revenue >= previousData.revenue ? "text-emerald-400" : "text-red-400"}`}
            >
              {currentData.revenue >= previousData.revenue ? "↑" : "↓"} vs Q
              {selectedQuarter - 1}
            </div>
          )}
        </div>
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            Gross Margin
          </div>
          <div
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {grossMarginPct.toFixed(1)}%
          </div>
        </div>
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            Units Sold
          </div>
          <div
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatNumber(currentData.unitsSold)}
          </div>
        </div>
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            Fill Rate
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {formatPercent(currentData.fillRate)}
          </div>
        </div>
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            CSI Score
          </div>
          <div className="text-xl font-bold text-blue-400">
            {(currentData.csi || 0).toFixed(1)}
          </div>
        </div>
        <div className={`${getCardClass(isDark)} p-4`}>
          <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-1`}>
            Cash Balance
          </div>
          <div
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatCurrency(currentData.cash, true)}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div
          className={`text-center px-6 py-3 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg flex-1`}
        >
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(currentData.netIncome, true)}
          </div>
          <div className={`text-xs ${getTextSecondaryClass(isDark)}`}>
            Net Income
          </div>
        </div>
        <div
          className={`text-center px-6 py-3 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg flex-1`}
        >
          <div className="text-2xl font-bold text-blue-400">
            #{currentData.bscRank}
          </div>
          <div className={`text-xs ${getTextSecondaryClass(isDark)}`}>
            Industry Rank
          </div>
        </div>
        <button
          onClick={handleDownload10QReport}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap"
        >
          <span>📥</span> Download 10-Q
        </button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Statement */}
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${theme.border} flex items-center justify-between`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <span>💰</span> Income Statement
            </h3>
            <span className={`text-xs ${theme.textSecondary}`}>
              Q{selectedQuarter}
            </span>
          </div>

          <div className="p-5">
            <table className="w-full text-sm">
              <tbody>
                <tr className={`border-b ${theme.border}`}>
                  <td className="py-2 font-medium">Revenue</td>
                  <td className="py-2 text-right font-mono text-emerald-400">
                    {formatCurrency(currentData.revenue)}
                  </td>
                </tr>
                <tr className={`border-b ${theme.border}`}>
                  <td className={`py-2 pl-4 ${theme.textSecondary}`}>
                    Cost of Goods Sold
                  </td>
                  <td className="py-2 text-right font-mono text-red-400">
                    ({formatCurrency(currentData.cogs)})
                  </td>
                </tr>
                <tr
                  className={`border-b ${theme.border} ${isDark ? "bg-gray-700/20" : "bg-gray-100"}`}
                >
                  <td className="py-2 font-medium">Gross Profit</td>
                  <td className="py-2 text-right font-mono">
                    {formatCurrency(grossProfit)}
                  </td>
                </tr>
                <tr className={`border-b ${theme.border}`}>
                  <td className={`py-2 pl-4 ${theme.textSecondary}`}>
                    Operating Expenses
                  </td>
                  <td className="py-2 text-right font-mono text-red-400">
                    ({formatCurrency(currentData.operatingExpenses)})
                  </td>
                </tr>
                <tr className={`border-b ${theme.border}`}>
                  <td className={`py-2 pl-4 ${theme.textSecondary}`}>
                    Interest Expense
                  </td>
                  <td className="py-2 text-right font-mono text-red-400">
                    ({formatCurrency(currentData.interestCost)})
                  </td>
                </tr>
                <tr className={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}>
                  <td className="py-3 font-bold">Net Income</td>
                  <td className="py-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(currentData.netIncome)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className={`mt-4 pt-4 border-t ${theme.border} flex justify-between text-sm`}>
              <span className={theme.textSecondary}>Net Margin</span>
              <span
                className={`font-semibold ${netMarginPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {netMarginPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${theme.border} flex items-center justify-between`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <span>📊</span> Cost Breakdown
            </h3>
            <span className={`text-sm font-mono ${theme.textSecondary}`}>
              {formatCurrency(totalOperatingCosts, true)} total
            </span>
          </div>

          <div className="p-5 space-y-3">
            {[
              {
                label: "Labor",
                value: currentData.laborCost,
                color: "bg-blue-500",
              },
              {
                label: "Holding/Storage",
                value: currentData.holdingCost,
                color: "bg-purple-500",
              },
              {
                label: "Marketing",
                value: currentData.marketingCost,
                color: "bg-pink-500",
              },
              {
                label: "Quality",
                value: currentData.qualityCost,
                color: "bg-amber-500",
              },
              {
                label: "Freight",
                value: currentData.freightCost,
                color: "bg-emerald-500",
              },
              {
                label: "Tech Maintenance",
                value: currentData.techMaintenanceCost,
                color: "bg-cyan-500",
              },
            ].map((cost) => {
              const pct =
                totalOperatingCosts > 0
                  ? (cost.value / totalOperatingCosts) * 100
                  : 0;
              return (
                <div key={cost.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                      {cost.label}
                    </span>
                    <span
                      className={`font-mono ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {formatCurrency(cost.value, true)}
                    </span>
                  </div>
                  <div
                    className={`h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                  >
                    <div
                      className={`h-full ${cost.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {currentData.interestCost > 0 && (
              <div className={`pt-3 border-t ${theme.border}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Interest Expense</span>
                  <span className="font-mono text-red-400">
                    {formatCurrency(currentData.interestCost, true)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supply Chain Performance */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${theme.border}`}>
          <h3 className="font-semibold flex items-center gap-2">
            <span>🔗</span> Supply Chain Performance
          </h3>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Production */}
            <div>
              <h4 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                Production
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Units Produced
                  </span>
                  <span className="font-mono font-semibold">
                    {formatNumber(currentData.unitsProduced)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Units Sold
                  </span>
                  <span className="font-mono font-semibold">
                    {formatNumber(currentData.unitsSold)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Capacity Used
                  </span>
                  <span className="font-mono font-semibold text-amber-400">
                    {formatPercent(currentData.capacityUtilization)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Defect Rate
                  </span>
                  <span
                    className={`font-mono font-semibold ${currentData.defectRate <= 0.03 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatPercent(currentData.defectRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fulfillment */}
            <div>
              <h4 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                Fulfillment
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Fill Rate
                  </span>
                  <span
                    className={`font-mono font-semibold ${currentData.fillRate >= 0.95 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {formatPercent(currentData.fillRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    On-Time Delivery
                  </span>
                  <span
                    className={`font-mono font-semibold ${currentData.onTimeDelivery >= 0.9 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {formatPercent(currentData.onTimeDelivery)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Perfect Order
                  </span>
                  <span
                    className={`font-mono font-semibold ${currentData.perfectOrder >= 0.9 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {formatPercent(currentData.perfectOrder)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Return Rate
                  </span>
                  <span
                    className={`font-mono font-semibold ${currentData.returnRate <= 0.05 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatPercent(currentData.returnRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h4 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                Inventory
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Raw Materials
                  </span>
                  <span className="font-mono font-semibold">
                    {formatNumber(currentData.rawMaterialUnits)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Finished Goods
                  </span>
                  <span className="font-mono font-semibold">
                    {formatNumber(currentData.finishedGoodsUnits)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Inventory Turnover
                  </span>
                  <span className="font-mono font-semibold text-blue-400">
                    {(currentData.inventoryTurnover || 0).toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    Weeks of Supply
                  </span>
                  <span
                    className={`font-mono font-semibold ${(currentData.weeksOfSupply || 0) >= 4 && (currentData.weeksOfSupply || 0) <= 8 ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {(currentData.weeksOfSupply || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${theme.border}`}>
            <h3 className="font-semibold flex items-center gap-2">
              <span>👥</span> Customer Base
            </h3>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">
                  {formatNumber(currentData.customersLoyal)}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>Loyal</div>
              </div>
              <div className="flex-1 text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="text-2xl font-bold text-amber-400">
                  {formatNumber(currentData.customersInPlay)}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>In Play</div>
              </div>
              <div className="flex-1 text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {formatNumber(currentData.customersChurned)}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>Churned</div>
              </div>
            </div>

            {/* Stacked Bar */}
            <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden flex`}>
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${loyaltyRate}%` }}
                title={`Loyal: ${loyaltyRate.toFixed(1)}%`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{
                  width: `${(currentData.customersInPlay / totalCustomers) * 100}%`,
                }}
                title={`In Play: ${((currentData.customersInPlay / totalCustomers) * 100).toFixed(1)}%`}
              />
              <div
                className="bg-red-500 h-full"
                style={{ width: `${churnRate}%` }}
                title={`Churned: ${churnRate.toFixed(1)}%`}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className={theme.textSecondary}>Loyalty Rate</span>
                <span className="font-semibold text-emerald-400">
                  {loyaltyRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme.textSecondary}>Churn Rate</span>
                <span className="font-semibold text-red-400">
                  {churnRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* YTD Summary */}
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${theme.border} flex items-center justify-between`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <span>📈</span> Year-to-Date Summary
            </h3>
            {ytdData && (
              <span className={`text-xs ${theme.textSecondary}`}>
                Through Q{ytdData.throughQuarter}
              </span>
            )}
          </div>

          <div className="p-5">
            {ytdData && ytdData.ytdTotals ? (
              <div className="space-y-4">
                {/* Main YTD Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                  >
                    <div className={`text-xs ${theme.textSecondary} mb-1`}>
                      YTD Revenue
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatCurrency(ytdData.ytdTotals.revenue, true)}
                    </div>
                  </div>
                  <div
                    className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                  >
                    <div className={`text-xs ${theme.textSecondary} mb-1`}>
                      YTD Net Income
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {formatCurrency(ytdData.ytdTotals.netIncome, true)}
                    </div>
                  </div>
                  <div
                    className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                  >
                    <div className={`text-xs ${theme.textSecondary} mb-1`}>
                      YTD Units Sold
                    </div>
                    <div className="text-xl font-bold">
                      {formatNumber(ytdData.ytdTotals.unitsSold)}
                    </div>
                  </div>
                  <div
                    className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                  >
                    <div className={`text-xs ${theme.textSecondary} mb-1`}>
                      Avg Fill Rate
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatPercent(ytdData.ytdTotals.avgFillRate)}
                    </div>
                  </div>
                </div>

                {/* YTD Averages */}
                <div className={`pt-4 border-t ${theme.border}`}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={theme.textSecondary}>Avg CSI Score</span>
                    <span className="font-semibold text-blue-400">
                      {ytdData.ytdTotals.avgCsi?.toFixed(1) || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme.textSecondary}>YTD Net Margin</span>
                    <span
                      className={`font-semibold ${ytdData.ytdTotals.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {ytdData.ytdTotals.revenue > 0
                        ? (
                            (ytdData.ytdTotals.netIncome /
                              ytdData.ytdTotals.revenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                <p>YTD data not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VMI Management (optional) */}
      {simulation?.features?.vmi && vmiProcessed ? (
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${theme.border}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <span>📦</span> VMI Management
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${vmiProcessed.active ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}
              >
                {vmiProcessed.active ? "✓ Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}
              >
                <div className={`text-xs font-medium ${theme.textSecondary} mb-1`}>
                  Net Benefit
                </div>
                <div
                  className={`text-lg font-bold ${vmiProcessed.cumulativeNetBenefit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {formatCurrency(vmiProcessed.cumulativeNetBenefit, true)}
                </div>
              </div>

              <div
                className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}
              >
                <div className={`text-xs font-medium ${theme.textSecondary} mb-1`}>
                  Coverage
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {vmiProcessed.coverageMonths.toFixed(2)} mo
                </div>
              </div>

              <div
                className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}
              >
                <div className={`text-xs font-medium ${theme.textSecondary} mb-1`}>
                  Revenue Protected
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {formatCurrency(vmiProcessed.revenueProtected, true)}
                </div>
              </div>

              <div
                className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}
              >
                <div className={`text-xs font-medium ${theme.textSecondary} mb-1`}>
                  Retailer Mode
                </div>
                <div className={`text-lg font-bold ${vmiProcessed.retailerMode === "NORMAL" ? "text-emerald-400" : vmiProcessed.retailerMode === "CLEARANCE" ? "text-amber-400" : "text-red-400"}`}>
                  {vmiProcessed.retailerMode}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Peer Comparison */}
      {compareData && compareData.peers && compareData.peers.length > 0 && (
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${theme.border}`}>
            <h3 className="font-semibold flex items-center gap-2">
              <span>⚔️</span> How You Compare
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? "bg-gray-800/50" : "bg-gray-100"}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Firm
                  </th>
                  <th
                    className={`py-3 px-4 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Revenue
                  </th>
                  <th
                    className={`py-3 px-4 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Net Income
                  </th>
                  <th
                    className={`py-3 px-4 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Market Share
                  </th>
                  <th
                    className={`py-3 px-4 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    CSI
                  </th>
                  <th
                    className={`py-3 px-4 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Fill Rate
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {compareData.peers.map((peer, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${theme.border} ${peer.isCurrentFirm ? "bg-blue-500/10" : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-100"}`}
                  >
                    <td className="py-3 px-4 font-medium">
                      {peer.firmName || `Firm ${idx + 1}`}
                      {peer.isCurrentFirm && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(peer.revenue, true)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono ${peer.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {formatCurrency(peer.netIncome, true)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatPercent(peer.marketShare * 100)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {peer.csi?.toFixed(1) || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatPercent(peer.fillRate)}
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
