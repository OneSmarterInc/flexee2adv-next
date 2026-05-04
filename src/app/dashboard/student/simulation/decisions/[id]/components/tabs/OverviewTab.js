// src/app/dashboard/student/decisions/[id]/components/tabs/OverviewTab.js

export default function OverviewTab({
  theme,
  firmState,
  demandHistory,
  decisions,
  formatNumber,
  nextQuarter,
  simulation,
  calculateTotalCost,
  formatCurrency,
  isDark
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory Status */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📦</span> Inventory Status
          {firmState?._sourceQuarter && (
            <span className={`text-xs ${theme.textMuted} font-normal`}>(from Q{firmState._sourceQuarter})</span>
          )}
        </h3>
        <div className="space-y-3">
          {[
            { icon: "🧱", label: "Raw Materials", value: firmState?.rawMaterials },
            { icon: "📱", label: "Finished Goods", value: firmState?.finishedGoods },
            { icon: "🚚", label: "In Transit", value: firmState?.inTransit },
            { icon: "🏪", label: "At Retailers", value: firmState?.retailerInventory },
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-lg ${theme.cardInner} flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="text-xl font-bold">{formatNumber(item.value || 0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Perfect Order & Performance */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>✅</span> Perfect Order Score
        </h3>
        <div className="space-y-3">
          {[
            { label: "On-Time", value: firmState?.perfectOrder?.onTime },
            { label: "In-Full", value: firmState?.perfectOrder?.inFull },
            { label: "Damage-Free", value: firmState?.perfectOrder?.damageFree },
            { label: "Documentation", value: firmState?.perfectOrder?.documentation },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-3">
              <span className={`text-sm w-24 ${theme.textMuted}`}>{metric.label}</span>
              <div className={`flex-1 h-2 rounded-full ${theme.cardInner} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${(metric.value || 0) >= 0.95 ? "bg-green-500" : "bg-yellow-500"}`}
                  style={{ width: `${(metric.value || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">{((metric.value || 0) * 100).toFixed(0)}%</span>
            </div>
          ))}
          <div className={`pt-3 border-t ${isDark ? "border-gray-600" : "border-gray-300"} flex justify-between items-center`}>
            <span className="font-medium">Overall</span>
            <span className={`text-lg font-bold ${(firmState?.perfectOrder?.overall || 0) >= 0.9 ? "text-green-400" : "text-yellow-400"}`}>
              {((firmState?.perfectOrder?.overall || 0) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Last Quarter Demand */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Q{demandHistory?.quarter || simulation?.currentQuarter - 1} Market Demand
          {demandHistory?._derived && (
            <span className={`text-xs ${theme.textMuted} font-normal`}>(estimated)</span>
          )}
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "East (R1)", value: demandHistory?.demandR1 },
              { label: "Central (R2)", value: demandHistory?.demandR2 },
              { label: "West (R3)", value: demandHistory?.demandR3 },
            ].map((region) => (
              <div key={region.label} className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
                <p className={`text-xs ${theme.textMuted}`}>{region.label}</p>
                <p className="font-bold">{formatNumber(region.value || 0)}</p>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex justify-between items-center`}>
            <span className="text-blue-400">Total Demand</span>
            <span className="text-xl font-bold text-blue-400">{formatNumber(demandHistory?.totalDemand || 0)}</span>
          </div>
        </div>
      </div>

      {/* Decision Summary */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>📋</span> Your Q{nextQuarter} Decisions
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Orders", value: formatNumber((decisions.orderGlobal || 0) + (decisions.orderRegional || 0)) },
              { label: "Total Production", value: formatNumber((decisions.productionP1 || 0) + (decisions.productionP2 || 0) + (decisions.productionP3 || 0)) },
              { label: "Marketing", value: formatCurrency(decisions.marketingBudget || 0) },
              { label: "Shipping", value: decisions.shippingMode },
            ].map((stat) => (
              <div key={stat.label} className={`p-3 rounded-lg ${theme.cardInner}`}>
                <p className={`text-xs ${theme.textMuted}`}>{stat.label}</p>
                <p className="font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-lg bg-orange-500/10 border border-orange-500/30`}>
            <div className="flex justify-between items-center">
              <span className={theme.textMuted}>Est. Total Spend</span>
              <span className="text-lg font-bold text-orange-400">{formatCurrency(calculateTotalCost())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}