import {
  formatCurrency,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";
import { MetricCard, TableRow } from "../sub-components";

// Helper for tertiary text color
const getTextTertiaryClass = (isDark) => 
  isDark ? "text-gray-500" : "text-gray-600";

export function InventoryTab({
  currentData,
  previousData,
  isDark,
  kpiReports,
}) {
  if (!currentData) return null;

  return (
    <div className="space-y-6">
      {/* Inventory KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Raw Materials"
          value={currentData.rawMaterialUnits}
          previousValue={previousData?.rawMaterialUnits}
          format="number"
          icon="🧱"
          isDark={isDark}
        />
        <MetricCard
          label="Finished Goods"
          value={currentData.finishedGoodsUnits}
          previousValue={previousData?.finishedGoodsUnits}
          format="number"
          icon="📦"
          isDark={isDark}
        />
        <MetricCard
          label="Inventory Value"
          value={currentData.inventoryValue}
          previousValue={previousData?.inventoryValue}
          icon="💵"
          highlight
          isDark={isDark}
        />
        <MetricCard
          label="Retailer Inventory"
          value={currentData.retailerInventory}
          previousValue={previousData?.retailerInventory}
          format="number"
          icon="🏪"
          isDark={isDark}
        />
      </div>

      {/* Inventory Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>
            Inventory Turnover
          </h3>
          <div className="text-3xl font-bold text-blue-400">
            {(currentData.inventoryTurnover || 0).toFixed(2)}x
          </div>
          <p className={`text-xs ${getTextTertiaryClass(isDark)} mt-2`}>
            Times inventory is sold and replaced
          </p>
        </div>
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>
            Weeks of Supply
          </h3>
          <div className="text-3xl font-bold text-amber-400">
            {(currentData.weeksOfSupply || 0).toFixed(1)}
          </div>
          <p className={`text-xs ${getTextTertiaryClass(isDark)} mt-2`}>
            Weeks of demand covered by inventory
          </p>
        </div>
        <div className={`${getCardClass(isDark)} p-5`}>
          <h3 className={`text-sm ${getTextSecondaryClass(isDark)} mb-2`}>
            Holding Cost
          </h3>
          <div className="text-3xl font-bold text-red-400">
            {formatCurrency(currentData.holdingCost, true)}
          </div>
          <p className={`text-xs ${getTextTertiaryClass(isDark)} mt-2`}>
            Cost to store inventory this quarter
          </p>
        </div>
      </div>

      {/* Inventory Trend */}
      <div className={`${getCardClass(isDark)} overflow-hidden`}>
        <div
          className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold">Inventory Trend</h3>
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
                label="Raw Materials (units)"
                values={kpiReports.map((r) => r.rawMaterialUnits)}
                format="number"
              />
              <TableRow
                label="Finished Goods (units)"
                values={kpiReports.map((r) => r.finishedGoodsUnits)}
                format="number"
              />
              <TableRow
                label="Inventory Value"
                values={kpiReports.map((r) => r.inventoryValue)}
                format="currency"
                highlight
              />
              <TableRow
                label="Inventory Turnover"
                values={kpiReports.map((r) => r.inventoryTurnover)}
                format="number"
              />
              <TableRow
                label="Weeks of Supply"
                values={kpiReports.map((r) => r.weeksOfSupply)}
                format="number"
              />
              <TableRow
                label="Retailer Inventory"
                values={kpiReports.map((r) => r.retailerInventory)}
                format="number"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
