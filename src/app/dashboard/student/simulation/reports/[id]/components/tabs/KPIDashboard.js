import { formatPercent, getCardClass, getTextSecondaryClass, getBgSecondaryClass } from "../../utils";
import { MetricCard, ProgressBar, TableRow } from "../sub-components";

export function KPIDashboard({
  currentData,
  previousData,
  kpiReports,
  isDark,
  formatPercent: formatPercentOverride,
}) {
  if (!currentData) return null;
  
  // Use provided function or imported one
  const fmt = formatPercentOverride || formatPercent;

  return (
    <div className="space-y-6">
      {/* Top KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Revenue"
          value={currentData.revenue}
          previousValue={previousData?.revenue}
          icon="💰"
          highlight
          isDark={isDark}
        />
        <MetricCard
          label="Net Income"
          value={currentData.netIncome}
          previousValue={previousData?.netIncome}
          icon="📈"
          isDark={isDark}
        />
        <MetricCard
          label="Cash Balance"
          value={currentData.cash}
          previousValue={previousData?.cash}
          icon="🏦"
          isDark={isDark}
        />
        <MetricCard
          label="Gross Margin"
          value={currentData.grossMarginPct}
          previousValue={previousData?.grossMarginPct}
          format="percent"
          icon="📊"
          isDark={isDark}
        />
        <MetricCard
          label="CSI Score"
          value={currentData.csi}
          previousValue={previousData?.csi}
          format="number"
          icon="⭐"
          highlight
          isDark={isDark}
        />
        <MetricCard
          label="Market Share"
          value={currentData.marketShare * 100}
          previousValue={previousData?.marketShare * 100}
          format="percent"
          icon="🎯"
          isDark={isDark}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>⚙️</span> Operations Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={getTextSecondaryClass(isDark)}>Fill Rate</span>
                <span className="text-emerald-400 font-medium">
                  {fmt(currentData.fillRate)}
                </span>
              </div>
              <ProgressBar
                value={currentData.fillRate * 100}
                color="green"
                showLabel={false}
                isDark={isDark}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={getTextSecondaryClass(isDark)}>
                  On-Time Delivery
                </span>
                <span className="text-blue-400 font-medium">
                  {fmt(currentData.onTimeDelivery)}
                </span>
              </div>
              <ProgressBar
                value={currentData.onTimeDelivery * 100}
                color="blue"
                showLabel={false}
                isDark={isDark}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Perfect Order</span>
                <span className="text-purple-400 font-medium">
                  {fmt(currentData.perfectOrder)}
                </span>
              </div>
              <ProgressBar
                value={currentData.perfectOrder * 100}
                color="purple"
                showLabel={false}
                isDark={isDark}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Capacity Utilization</span>
                <span className="text-amber-400 font-medium">
                  {fmt(currentData.capacityUtilization)}
                </span>
              </div>
              <ProgressBar
                value={currentData.capacityUtilization * 100}
                color="yellow"
                showLabel={false}
                isDark={isDark}
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Defect Rate</span>
                <span className="text-red-400 font-medium">
                  {fmt(currentData.defectRate)}
                </span>
              </div>
              <ProgressBar
                value={currentData.defectRate * 100}
                max={10}
                color="red"
                showLabel={false}
                isDark={isDark}
              />
            </div>
          </div>
        </div>

        {/* Balanced Scorecard Summary */}
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Balanced Scorecard
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div
              className={`text-center p-4 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <div className="text-3xl font-bold text-blue-400">
                {(currentData.bscOverall || 0).toFixed(1)}
              </div>
              <div className={`text-xs ${getTextSecondaryClass(isDark)} mt-1`}>
                Overall Score
              </div>
            </div>
            <div
              className={`text-center p-4 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <div className="text-3xl font-bold text-amber-400">
                {currentData.bscGrade || "N/A"}
              </div>
              <div className={`text-xs ${getTextSecondaryClass(isDark)} mt-1`}>
                Grade
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Financial
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${currentData.bscFinancial}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">
                  {(currentData.bscFinancial || 0).toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Customer
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${currentData.bscCustomer || 0}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">
                  {(currentData.bscCustomer || 0).toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Process
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${currentData.bscProcess}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">
                  {(currentData.bscProcess || 0).toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Learning
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${currentData.bscLearning || 0}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">
                  {(currentData.bscLearning || 0).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300"} flex justify-between items-center`}
          >
            <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
              Industry Rank
            </span>
            <span className="text-xl font-bold text-white">
              #{currentData.bscRank || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Trend Table */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold">Quarterly Trend</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                <th
                  className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase tracking-wide`}
                >
                  Metric
                </th>
                {kpiReports.map((r) => (
                  <th
                    key={r.quarter}
                    className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase tracking-wide`}
                  >
                    Q{r.quarter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRow
                label="Revenue"
                values={kpiReports.map((r) => r.revenue)}
                format="currency"
                highlight
              />
              <TableRow
                label="Net Income"
                values={kpiReports.map((r) => r.netIncome)}
                format="currency"
              />
              <TableRow
                label="Gross Margin %"
                values={kpiReports.map((r) => r.grossMarginPct)}
                format="percent"
              />
              <TableRow
                label="CSI Score"
                values={kpiReports.map((r) => r.csi)}
                format="number"
                highlight
              />
              <TableRow
                label="Units Sold"
                values={kpiReports.map((r) => r.unitsSold)}
                format="number"
              />
              <TableRow
                label="Fill Rate"
                values={kpiReports.map((r) => r.fillRate * 100)}
                format="percent"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
