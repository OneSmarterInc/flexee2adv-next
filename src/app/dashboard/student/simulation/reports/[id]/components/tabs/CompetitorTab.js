import {
  formatCurrency,
  formatPercent,
  formatNumber,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";

// Helper for tertiary text color
const getTextTertiaryClass = (isDark) =>
  isDark ? "text-gray-500" : "text-gray-600";

export function CompetitorTab({
  currentData,
  isDark,
  selectedQuarter,
  competitorReports,
}) {
  if (!currentData) return null;

  const competitorData = competitorReports[selectedQuarter];

  return (
    <div className="space-y-6">
      {competitorData ? (
        <>
          {/* Competitors Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorData.competitors &&
            competitorData.competitors.length > 0 ? (
              competitorData.competitors.map((competitor, idx) => (
                <div key={idx} className={`${getCardClass(isDark)} p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">
                      {competitor.firmName || `Firm ${competitor.firmNumber}`}
                    </h4>
                    {competitor.rank && (
                      <span className="text-2xl font-bold text-amber-400">
                        #{competitor.rank}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {competitor.revenue !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          Revenue
                        </span>
                        <span className="font-semibold text-green-400">
                          {formatCurrency(competitor.revenue, true)}
                        </span>
                      </div>
                    )}
                    {competitor.marketShare !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          Market Share
                        </span>
                        <span className="font-semibold text-blue-400">
                          {formatPercent(competitor.marketShare)}
                        </span>
                      </div>
                    )}
                    {competitor.csi !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          CSI Score
                        </span>
                        <span className="font-semibold text-cyan-400">
                          {(competitor.csi || 0).toFixed(1)}
                        </span>
                      </div>
                    )}
                    {competitor.unitsSold !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          Units Sold
                        </span>
                        <span className="font-semibold text-yellow-400">
                          {formatNumber(competitor.unitsSold)}
                        </span>
                      </div>
                    )}
                    {competitor.netIncome !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          Net Income
                        </span>
                        <span
                          className={`font-semibold ${competitor.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {formatCurrency(competitor.netIncome, true)}
                        </span>
                      </div>
                    )}
                    {competitor.grossMarginPct !== undefined && (
                      <div
                        className={`flex justify-between items-center p-3 ${getBgSecondaryClass(isDark)} rounded-lg`}
                      >
                        <span
                          className={`text-sm ${getTextSecondaryClass(isDark)}`}
                        >
                          Gross Margin
                        </span>
                        <span className="font-semibold text-purple-400">
                          {formatPercent(competitor.grossMarginPct)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No competitor data available</p>
              </div>
            )}
          </div>

          {/* Market Position Analysis */}
          {competitorData.marketAnalysis && (
            <div className={`${getCardClass(isDark)} p-5`}>
              <h3 className="text-lg font-semibold mb-4">
                Market Position Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitorData.marketAnalysis.marketLeader && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
                      Market Leader
                    </p>
                    <p className="text-lg font-bold text-blue-400">
                      {competitorData.marketAnalysis.marketLeader}
                    </p>
                  </div>
                )}
                {competitorData.marketAnalysis.totalMarketSize !==
                  undefined && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
                      Total Market Size
                    </p>
                    <p className="text-lg font-bold text-emerald-400">
                      {formatNumber(
                        competitorData.marketAnalysis.totalMarketSize,
                      )}
                    </p>
                  </div>
                )}
                {competitorData.marketAnalysis.averageMarketShare !==
                  undefined && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
                      Average Market Share
                    </p>
                    <p className="text-lg font-bold text-purple-400">
                      {formatPercent(
                        competitorData.marketAnalysis.averageMarketShare,
                      )}
                    </p>
                  </div>
                )}
                {competitorData.marketAnalysis.competitorCount !==
                  undefined && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
                      Active Competitors
                    </p>
                    <p className="text-lg font-bold text-amber-400">
                      {competitorData.marketAnalysis.competitorCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Competitive Advantages/Disadvantages */}
          {competitorData.strategicInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitorData.strategicInsights.strengths && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
                  <h4 className="font-semibold text-emerald-400 mb-3">
                    💪 Your Strengths
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {Array.isArray(
                      competitorData.strategicInsights.strengths,
                    ) ? (
                      competitorData.strategicInsights.strengths.map(
                        (strength, idx) => (
                          <li
                            key={idx}
                            className={`${getTextTertiaryClass(isDark)} flex items-start gap-2`}
                          >
                            <span className="text-emerald-400 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ),
                      )
                    ) : (
                      <li className={getTextTertiaryClass(isDark)}>
                        {competitorData.strategicInsights.strengths}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {competitorData.strategicInsights.opportunities && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                  <h4 className="font-semibold text-blue-400 mb-3">
                    🎯 Opportunities
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {Array.isArray(
                      competitorData.strategicInsights.opportunities,
                    ) ? (
                      competitorData.strategicInsights.opportunities.map(
                        (opportunity, idx) => (
                          <li
                            key={idx}
                            className={`${getTextTertiaryClass(isDark)} flex items-start gap-2`}
                          >
                            <span className="text-blue-400 mt-1">→</span>
                            <span>{opportunity}</span>
                          </li>
                        ),
                      )
                    ) : (
                      <li className={getTextTertiaryClass(isDark)}>
                        {competitorData.strategicInsights.opportunities}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {competitorData.strategicInsights.threats && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <h4 className="font-semibold text-red-400 mb-3">
                    ⚠️ Threats
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {Array.isArray(
                      competitorData.strategicInsights.threats,
                    ) ? (
                      competitorData.strategicInsights.threats.map(
                        (threat, idx) => (
                          <li
                            key={idx}
                            className={`${getTextTertiaryClass(isDark)} flex items-start gap-2`}
                          >
                            <span className="text-red-400 mt-1">!</span>
                            <span>{threat}</span>
                          </li>
                        ),
                      )
                    ) : (
                      <li className={getTextTertiaryClass(isDark)}>
                        {competitorData.strategicInsights.threats}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {competitorData.strategicInsights.weaknesses && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                  <h4 className="font-semibold text-amber-400 mb-3">
                    📍 Weaknesses to Address
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {Array.isArray(
                      competitorData.strategicInsights.weaknesses,
                    ) ? (
                      competitorData.strategicInsights.weaknesses.map(
                        (weakness, idx) => (
                          <li
                            key={idx}
                            className={`${getTextTertiaryClass(isDark)} flex items-start gap-2`}
                          >
                            <span className="text-amber-400 mt-1">•</span>
                            <span>{weakness}</span>
                          </li>
                        ),
                      )
                    ) : (
                      <li className={getTextTertiaryClass(isDark)}>
                        {competitorData.strategicInsights.weaknesses}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Competitive Metrics Comparison Table */}
          <div className={`${getCardClass(isDark)} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-semibold">
                Competitor Metrics Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}
                  >
                    <th
                      className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Firm
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Revenue
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Market Share
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      CSI Score
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Fill Rate
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitorData.competitors?.map((comp, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} ${comp.isCurrentFirm ? (isDark ? "bg-blue-500/10" : "bg-blue-50") : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"}`}
                    >
                      <td
                        className={`py-3 px-4 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {comp.firmName}
                        {comp.isCurrentFirm && (
                          <span className="ml-2 text-xs text-blue-400">
                            (You)
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {formatCurrency(comp.revenue, true)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {formatPercent(comp.marketShare * 100)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {comp.csi?.toFixed(1) || "N/A"}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {formatPercent(comp.fillRate)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-amber-400">
                        #{comp.rank}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className={`${getCardClass(isDark)} p-12 text-center`}>
          <div className="text-4xl mb-3">⚔️</div>
          <h3 className="text-lg font-semibold mb-2">Competitor Analysis</h3>
          <p className={getTextSecondaryClass(isDark)}>
            No competitor data available for Q{selectedQuarter}
          </p>
        </div>
      )}
    </div>
  );
}
