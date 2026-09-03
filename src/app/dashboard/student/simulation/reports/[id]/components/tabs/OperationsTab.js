import {
  formatPercent,
  formatNumber,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";
import { MetricCard, TableRow } from "../sub-components";

export function OperationsTab({
  currentData,
  previousData,
  isDark,
  kpiReports,
}) {
  if (!currentData) return null;

  return (
    <div className="space-y-6">
      {/* Operations KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Units Produced"
          value={currentData.unitsProduced}
          previousValue={previousData?.unitsProduced}
          format="number"
          icon="🏭"
          isDark={isDark}
        />
        <MetricCard
          label="Units Sold"
          value={currentData.unitsSold}
          previousValue={previousData?.unitsSold}
          format="number"
          icon="📦"
          highlight
          isDark={isDark}
        />
        <MetricCard
          label="Fill Rate"
          value={currentData.fillRate * 100}
          previousValue={previousData?.fillRate * 100}
          format="percent"
          icon="✅"
          isDark={isDark}
        />
        <MetricCard
          label="On-Time Delivery"
          value={currentData.onTimeDelivery * 100}
          previousValue={previousData?.onTimeDelivery * 100}
          format="percent"
          icon="🚚"
          isDark={isDark}
        />
        <MetricCard
          label="Perfect Order"
          value={currentData.perfectOrder * 100}
          previousValue={previousData?.perfectOrder * 100}
          format="percent"
          icon="⭐"
          isDark={isDark}
        />
        <MetricCard
          label="Defect Rate"
          value={currentData.defectRate * 100}
          previousValue={previousData?.defectRate * 100}
          format="percent"
          icon="⚠️"
          isDark={isDark}
        />
      </div>

      {/* Performance Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className="text-lg font-semibold mb-4">Production Metrics</h3>
          <div className="space-y-4">
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Capacity Utilization
              </span>
              <span className="text-xl font-bold text-amber-400">
                {formatPercent(currentData.capacityUtilization)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Forecast Accuracy (MAPE)
              </span>
              <span className="text-xl font-bold text-blue-400">
                {currentData.mape != null ? formatPercent(1 - currentData.mape) : "—"}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Production vs Sales
              </span>
              <span
                className={`text-xl font-bold ${currentData.unitsProduced >= currentData.unitsSold ? "text-emerald-400" : "text-red-400"}`}
              >
                {(
                  (currentData.unitsProduced / currentData.unitsSold) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
          <div className="space-y-4">
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Loyal Customers
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {formatNumber(currentData.customersLoyal)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Customers In Play
              </span>
              <span className="text-xl font-bold text-amber-400">
                {formatNumber(currentData.customersInPlay)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Customers Churned
              </span>
              <span className="text-xl font-bold text-red-400">
                {formatNumber(currentData.customersChurned)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
            >
              <span className={`text-sm ${getTextSecondaryClass(isDark)}`}>
                Return Rate
              </span>
              <span className="text-xl font-bold text-red-400">
                {formatPercent(currentData.returnRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Trend */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold">Operations Trend</h3>
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
                label="Units Produced"
                values={kpiReports.map((r) => r.unitsProduced)}
                format="number"
              />
              <TableRow
                label="Units Sold"
                values={kpiReports.map((r) => r.unitsSold)}
                format="number"
                highlight
              />
              <TableRow
                label="Fill Rate"
                values={kpiReports.map((r) => r.fillRate * 100)}
                format="percent"
              />
              <TableRow
                label="On-Time Delivery"
                values={kpiReports.map((r) => r.onTimeDelivery * 100)}
                format="percent"
              />
              <TableRow
                label="Perfect Order"
                values={kpiReports.map((r) => r.perfectOrder * 100)}
                format="percent"
              />
              <TableRow
                label="Capacity Utilization"
                values={kpiReports.map((r) => r.capacityUtilization * 100)}
                format="percent"
              />
              <TableRow
                label="Defect Rate"
                values={kpiReports.map((r) => r.defectRate * 100)}
                format="percent"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
