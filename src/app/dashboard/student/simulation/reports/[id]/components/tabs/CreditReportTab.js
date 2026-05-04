import {
  formatCurrency,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";

export function CreditReportTab({
  creditHistory,
  isDark,
}) {
  if (!creditHistory) {
    return (
      <div className={`${getCardClass(isDark)} p-8 text-center`}>
        <div className="text-3xl mb-3">💳</div>
        <p className={getTextSecondaryClass(isDark)}>
          Credit history data not available
        </p>
      </div>
    );
  }

  const { summary, creditScore } = creditHistory;

  const getScoreColor = (score) => {
    if (score >= 850) return "text-emerald-400";
    if (score >= 750) return "text-blue-400";
    if (score >= 650) return "text-amber-400";
    return "text-red-400";
  };

  const getTierColor = (tier) => {
    const tierMap = {
      EXCELLENT: "text-emerald-400 bg-emerald-500/10",
      GOOD: "text-blue-400 bg-blue-500/10",
      FAIR: "text-amber-400 bg-amber-500/10",
      POOR: "text-red-400 bg-red-500/10",
    };
    return tierMap[tier] || "text-gray-400 bg-gray-500/10";
  };

  return (
    <div className="space-y-6">
      {/* Credit Header */}
      <div className={`${getCardClass(isDark)} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>💳</span> Credit Profile
          </h3>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getTierColor(summary.currentTier)}`}
          >
            {summary.currentTier}
          </span>
        </div>

        {/* Credit Score Circle */}
        <div
          className={`flex items-center justify-center p-8 ${getBgSecondaryClass(isDark)} rounded-lg mb-6`}
        >
          <div className="text-center">
            <div
              className={`text-6xl font-bold ${getScoreColor(summary.currentScore)} mb-2`}
            >
              {Math.round(summary.currentScore)}
            </div>
            <div className={`${getTextSecondaryClass(isDark)} text-sm`}>
              Credit Score
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
            <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
              Credit Limit
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {formatCurrency(summary.currentCreditLimit, true)}
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
            <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
              Current Debt
            </div>
            <div className="text-lg font-bold text-amber-400">
              {formatCurrency(summary.currentDebt, true)}
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
            <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
              Utilization
            </div>
            <div className="text-lg font-bold text-blue-400">
              {formatPercent(summary.utilizationRate)}
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
            <div className={`text-xs ${getTextSecondaryClass(isDark)} mb-2`}>
              Total Interest
            </div>
            <div className="text-lg font-bold text-red-400">
              {formatCurrency(summary.totalInterestPaid, true)}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {creditScore && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Score Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className={getTextSecondaryClass(isDark)}>
                  Current Ratio
                </span>
                <span className="text-emerald-400 font-semibold">
                  {creditScore.currentRatioScore}/20
                </span>
              </div>
              <div
                className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${(creditScore.currentRatioScore / 20) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className={getTextSecondaryClass(isDark)}>
                  Debt/Equity
                </span>
                <span className="text-blue-400 font-semibold">
                  {creditScore.debtToEquityScore}/25
                </span>
              </div>
              <div
                className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(creditScore.debtToEquityScore / 25) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className={getTextSecondaryClass(isDark)}>
                  Profit Margin
                </span>
                <span className="text-purple-400 font-semibold">
                  {creditScore.profitMarginScore}/20
                </span>
              </div>
              <div
                className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${(creditScore.profitMarginScore / 20) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-2">
                <span className={getTextSecondaryClass(isDark)}>
                  Interest Coverage
                </span>
                <span className="text-amber-400 font-semibold">
                  {creditScore.interestCoverageScore}/15
                </span>
              </div>
              <div
                className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${(creditScore.interestCoverageScore / 15) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4 md:col-span-2`}>
              <div className="flex justify-between items-center mb-2">
                <span className={getTextSecondaryClass(isDark)}>
                  Cash Flow
                </span>
                <span className="text-cyan-400 font-semibold">
                  {creditScore.cashFlowScore}/20
                </span>
              </div>
              <div
                className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${(creditScore.cashFlowScore / 20) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Events Warning */}
      {(summary.timesOverlimit > 0 ||
        summary.forcedSalesCount > 0 ||
        summary.totalOverlimitFees > 0) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span> Credit Events
          </h3>
          <div className="space-y-3">
            {summary.timesOverlimit > 0 && (
              <div
                className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
              >
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                  Times Over Credit Limit
                </span>
                <span className="text-red-400 font-bold text-lg">
                  {summary.timesOverlimit}
                </span>
              </div>
            )}
            {summary.totalOverlimitFees > 0 && (
              <div
                className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
              >
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                  Over Limit Fees
                </span>
                <span className="text-red-400 font-bold">
                  {formatCurrency(summary.totalOverlimitFees)}
                </span>
              </div>
            )}
            {summary.forcedSalesCount > 0 && (
              <div
                className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
              >
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                  Forced Sales Triggered
                </span>
                <span className="text-red-400 font-bold text-lg">
                  {summary.forcedSalesCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credit History Table */}
      {creditHistory.history && creditHistory.history.length > 0 && (
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div
            className={`px-6 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Credit History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}
                >
                  <th
                    className={`py-3 px-6 text-left text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                  >
                    Quarter
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                  >
                    Tier
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                  >
                    Score
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                  >
                    Debt
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                  >
                    Interest Charge
                  </th>
                </tr>
              </thead>
              <tbody>
                {creditHistory.history.map((entry, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${isDark ? "border-gray-700/50 hover:bg-gray-800/30" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <td
                      className={`py-3 px-6 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Q{entry.quarter}
                    </td>
                    <td
                      className={`py-3 px-6 text-right text-sm font-medium`}
                    >
                      {entry.tierName || "N/A"}
                    </td>
                    <td
                      className={`py-3 px-6 text-right text-sm font-mono ${getScoreColor(entry.creditScore?.totalScore || 0)}`}
                    >
                      {Math.round(entry.creditScore?.totalScore || 0)}
                    </td>
                    <td className="py-3 px-6 text-right text-sm font-mono text-amber-400">
                      {formatCurrency(entry.endingDebt || 0, true)}
                    </td>
                    <td className="py-3 px-6 text-right text-sm font-mono text-red-400">
                      {formatCurrency(entry.interestCharge || 0, true)}
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
