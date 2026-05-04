import {
  formatCurrency,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";
import { MetricCard, TableRow } from "../sub-components";

export function FinancialTab({
  currentData,
  previousData,
  isDark,
  selectedQuarter,
  firm,
  kpiReports,
}) {
  if (!currentData) return null;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue"
          value={currentData.revenue}
          previousValue={previousData?.revenue}
          icon="💰"
          highlight
          isDark={isDark}
        />
        <MetricCard
          label="COGS"
          value={currentData.cogs}
          previousValue={previousData?.cogs}
          icon="🏭"
          isDark={isDark}
        />
        <MetricCard
          label="Operating Expenses"
          value={currentData.operatingExpenses}
          previousValue={previousData?.operatingExpenses}
          icon="📋"
          isDark={isDark}
        />
        <MetricCard
          label="Net Income"
          value={currentData.netIncome}
          previousValue={previousData?.netIncome}
          icon="📈"
          highlight
          isDark={isDark}
        />
      </div>

      {/* P&L Statement Style */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
        >
          <h3 className="text-lg font-semibold">
            Income Statement - Q{selectedQuarter}
          </h3>
          <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
            {firm?.name}
          </span>
        </div>
        <div className="p-5">
          <table className="w-full">
            <tbody
              className={`divide-y ${isDark ? "divide-gray-700/30" : "divide-gray-200"}`}
            >
              <tr className={isDark ? "bg-blue-500/5" : "bg-blue-50"}>
                <td
                  className={`py-3 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Revenue
                </td>
                <td
                  className={`py-3 text-sm text-right font-mono font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                >
                  {formatCurrency(currentData.revenue)}
                </td>
              </tr>
              <tr>
                <td
                  className={`py-3 text-sm ${getTextSecondaryClass(isDark)} pl-4`}
                >
                  Less: Cost of Goods Sold
                </td>
                <td className="py-3 text-sm text-right font-mono text-red-400">
                  ({formatCurrency(currentData.cogs)})
                </td>
              </tr>
              <tr className={isDark ? "bg-gray-700/20" : "bg-gray-100"}>
                <td
                  className={`py-3 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Gross Profit
                </td>
                <td
                  className={`py-3 text-sm text-right font-mono ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formatCurrency(currentData.revenue - currentData.cogs)}
                </td>
              </tr>
              <tr>
                <td
                  className={`py-3 text-sm ${getTextSecondaryClass(isDark)} pl-4`}
                >
                  Gross Margin %
                </td>
                <td
                  className={`py-3 text-sm text-right font-mono ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {formatPercent(currentData.grossMarginPct)}
                </td>
              </tr>
              <tr>
                <td
                  className={`py-3 text-sm ${getTextSecondaryClass(isDark)} pl-4`}
                >
                  Less: Operating Expenses
                </td>
                <td className="py-3 text-sm text-right font-mono text-red-400">
                  ({formatCurrency(currentData.operatingExpenses)})
                </td>
              </tr>
              <tr className={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}>
                <td
                  className={`py-3 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Net Income
                </td>
                <td
                  className={`py-3 text-sm text-right font-mono font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  {formatCurrency(currentData.netIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold">Cost Breakdown</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Labor",
                value: currentData.laborCost,
                color: "bg-blue-500",
              },
              {
                label: "Holding",
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
              {
                label: "Interest",
                value: currentData.interestCost,
                color: "bg-red-500",
              },
            ].map((cost) => (
              <div
                key={cost.label}
                className={`p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${cost.color}`} />
                  <span className={`text-xs ${getTextSecondaryClass(isDark)}`}>
                    {cost.label}
                  </span>
                </div>
                <div className="text-lg font-semibold font-mono">
                  {formatCurrency(cost.value, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Trend */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold">Financial Trend</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                <th
                  className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                >
                  Metric
                </th>
                {kpiReports.map((r) => (
                  <th
                    key={r.quarter}
                    className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
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
                label="COGS"
                values={kpiReports.map((r) => r.cogs)}
                format="currency"
              />
              <TableRow
                label="Gross Profit"
                values={kpiReports.map((r) => r.revenue - r.cogs)}
                format="currency"
              />
              <TableRow
                label="Gross Margin %"
                values={kpiReports.map((r) => r.grossMarginPct)}
                format="percent"
              />
              <TableRow
                label="Operating Expenses"
                values={kpiReports.map((r) => r.operatingExpenses)}
                format="currency"
              />
              <TableRow
                label="Net Income"
                values={kpiReports.map((r) => r.netIncome)}
                format="currency"
                highlight
              />
              <TableRow
                label="Cash Balance"
                values={kpiReports.map((r) => r.cash)}
                format="currency"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
