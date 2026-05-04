// src/app/dashboard/faculty/simulations/[id]/components/TabContent/FirmsTab.js

import { formatCurrency, formatNumber, formatPercent } from "../../utils";

export default function FirmsTab({ theme, simulation, quarterData, selectedQuarter, getSeason }) {
  return (
    <div className="space-y-6">
      {selectedQuarter && (
        <div className={`${theme.card} border rounded-xl p-4 bg-blue-500/10 border-blue-500/50`}>
          <p className={`text-sm font-medium`}>
            Viewing Quarter {selectedQuarter} Data
          </p>
        </div>
      )}
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
        {[
          {
            label: "Total Cash",
            value: formatCurrency(
              simulation.firms?.reduce((sum, f) => sum + (f.currentCash || 0), 0)
            ),
            icon: "💵",
          },
          {
            label: "Avg CSI",
            value: `${(
              simulation.firms?.reduce((sum, f) => sum + (f.currentCsi || 0), 0) /
              (simulation.firms?.length || 1)
            ).toFixed(1)} pts`,
            icon: "⭐",
          },
          {
            label: "Total Members",
            value: simulation.firms?.reduce(
              (sum, f) => sum + (f.memberCount || 0),
              0
            ),
            icon: "👥",
          },
          {
            label: "Tech Adopted",
            value: `${simulation.firms?.reduce(
              (sum, f) => sum + (f.techOwned?.length || 0),
              0
            )} systems`,
            icon: "🔧",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${theme.card} border rounded-xl p-4 text-center`}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className={`text-xs ${theme.textMuted} mt-2`}>{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Firm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        {simulation.firms?.map((firm) => (
          <FirmCard
            key={firm.id}
            firm={firm}
            quarterData={quarterData}
            theme={theme}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
          />
        ))}
      </div>
    </div>
  );
}

function FirmCard({
  firm,
  quarterData,
  theme,
  formatCurrency,
  formatNumber,
  formatPercent,
}) {
  const firmState = quarterData?.firms?.find(
    (f) => f.firm.id === firm.id
  )?.state;

  return (
    <div
      className={`${theme.card} border rounded-xl overflow-hidden transition hover:shadow-lg`}
    >
      <div className="h-1.5" style={{ backgroundColor: firm.color }} />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: firm.color }}
            >
              {firm.firmNumber}
            </div>
            <div>
              <h3 className="font-bold">{firm.name}</h3>
              <p className={`text-xs ${theme.textMuted}`}>
                {firm.memberCount || 0} members
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              firm.memberCount > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {firm.memberCount > 0 ? "Active" : "No Team"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Cash</p>
            <p className="font-bold">{formatCurrency(firm.currentCash)}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>CSI Score</p>
            <p className="font-bold">
              {firm.currentCsi?.toFixed(1)}{" "}
              <span className={`text-xs ${theme.textMuted}`}>pts</span>
            </p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Market Share</p>
            <p className="font-bold">{formatPercent(firm.currentMarketShare)}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Technology</p>
            <p className="font-bold">
              {firm.techOwned?.length || 0}{" "}
              <span className={`text-xs ${theme.textMuted}`}>systems</span>
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={theme.textMuted}>Market Share</span>
            <span className="font-medium">
              {formatPercent(firm.currentMarketShare)}
            </span>
          </div>
          <div
            className={`h-1.5 rounded-full ${theme.cardInner} overflow-hidden`}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(firm.currentMarketShare || 0) * 100}%`,
                backgroundColor: firm.color,
              }}
            />
          </div>
        </div>

        {firm.enrollments?.length > 0 && (
          <div className="pt-3 border-t border-gray-700/50">
            <p className={`text-xs ${theme.textMuted} mb-2`}>Team Members</p>
            <div className="flex flex-wrap gap-1">
              {firm.enrollments.slice(0, 5).map((e, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${theme.cardInner}`}
                  title={e.user?.email}
                >
                  {e.user?.firstName || e.user?.email?.split("@")[0]}
                </span>
              ))}
              {firm.enrollments.length > 5 && (
                <span
                  className={`px-2 py-1 rounded text-xs ${theme.cardInner}`}
                >
                  +{firm.enrollments.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}