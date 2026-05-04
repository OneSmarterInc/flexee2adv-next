import {
  formatCurrency,
  formatNumber,
  getGreenScoreBracket,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";

// Helper for tertiary text color
const getTextTertiaryClass = (isDark) =>
  isDark ? "text-gray-500" : "text-gray-600";

export function GreenScoreReportTab({
  greenScoreHistory,
  isDark,
}) {
  if (
    !greenScoreHistory ||
    !greenScoreHistory.greenScoreHistory ||
    greenScoreHistory.greenScoreHistory.length === 0
  ) {
    return (
      <div className={`${getCardClass(isDark)} p-12 text-center`}>
        <div className="text-5xl mb-4">♻️</div>
        <h3 className="text-lg font-semibold mb-2">Green Score</h3>
        <p className={getTextSecondaryClass(isDark)}>
          Green score tracking is not enabled for this simulation
        </p>
      </div>
    );
  }

  const history = greenScoreHistory.greenScoreHistory;
  const latestRecord = history[history.length - 1] || {};

  // Build theme object
  const theme = {
    text: isDark ? "text-white" : "text-gray-900",
    textSecondary: getTextSecondaryClass(isDark),
    border: isDark ? "border-gray-700/50" : "border-gray-200",
  };

  const BRACKET_CONFIG = {
    POOR: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "Poor",
    },
    BELOW_AVERAGE: {
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      label: "Below Average",
    },
    AVERAGE: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      label: "Average",
    },
    GOOD: {
      color: "text-lime-400",
      bg: "bg-lime-500/10",
      border: "border-lime-500/30",
      label: "Good",
    },
    EXCELLENT: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      label: "Excellent",
    },
  };

  const getBracketConfig = (bracket) =>
    BRACKET_CONFIG[bracket] || BRACKET_CONFIG.AVERAGE;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-lime-400";
    if (score >= 40) return "text-yellow-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
  };

  const disposalConfig = {
    RECYCLE: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      label: "♻️ Recycle",
    },
    LANDFILL: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      label: "🏭 Landfill",
    },
    INCINERATE: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      label: "🔥 Incinerate",
    },
    COMPOST: {
      bg: "bg-lime-500/20",
      text: "text-lime-400",
      label: "🌱 Compost",
    },
  };

  const getDiposalBadgeConfig = (method) =>
    disposalConfig[method] || disposalConfig.RECYCLE;

  // Calculate stats
  const totalImprovement =
    (latestRecord.newScore || 0) - (history[0]?.previousScore || 0);
  const avgScore =
    history.length > 0
      ? history.reduce((sum, h) => sum + (h.newScore || 0), 0) /
        history.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className={`${getCardClass(isDark)} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme.text}`}>
            <span>♻️</span> Green Score
          </h3>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getBracketConfig(getGreenScoreBracket(latestRecord.newScore || 0)).bg} ${getBracketConfig(getGreenScoreBracket(latestRecord.newScore || 0)).color}`}
          >
            {
              getBracketConfig(
                getGreenScoreBracket(latestRecord.newScore || 0),
              ).label
            }
          </span>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4 text-center`}>
            <div
              className={`text-4xl font-bold ${getScoreColor(latestRecord.newScore || 0)} mb-2`}
            >
              {latestRecord.newScore || 0}
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>
              Current Score
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4 text-center`}>
            <div
              className={`text-2xl font-bold ${totalImprovement >= 0 ? "text-emerald-400" : "text-red-400"} mb-2`}
            >
              {totalImprovement >= 0 ? "+" : ""}
              {totalImprovement}
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>
              Total Improvement
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {formatNumber(avgScore)}
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>
              Average Score
            </div>
          </div>
          <div className={`${getBgSecondaryClass(isDark)} rounded-lg p-4 text-center`}>
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {history.length}
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>
              Quarters Tracked
            </div>
          </div>
        </div>
      </div>

      {/* Latest Quarter Details */}
      {latestRecord && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
            <span>Q{latestRecord.quarter}</span> Latest Quarter
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                Disposal Method
              </div>
              <div
                className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-block ${getDiposalBadgeConfig(latestRecord.disposalMethod).bg} ${getDiposalBadgeConfig(latestRecord.disposalMethod).text}`}
              >
                {getDiposalBadgeConfig(latestRecord.disposalMethod).label}
              </div>
            </div>
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                Score Change
              </div>
              <div
                className={`text-lg font-bold ${latestRecord.scoreChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {latestRecord.scoreChange >= 0 ? "+" : ""}
                {latestRecord.scoreChange}
              </div>
            </div>
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                Disposal Cost
              </div>
              <div className="text-lg font-bold text-red-400">
                {formatCurrency(latestRecord.disposalCost || 0, true)}
              </div>
            </div>
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                Recovery Value
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {formatCurrency(latestRecord.disposalRecovery || 0, true)}
              </div>
            </div>
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                CSI Effect
              </div>
              <div
                className={`text-lg font-bold ${latestRecord.csiEffect > 0 ? "text-emerald-400" : latestRecord.csiEffect < 0 ? "text-red-400" : "text-gray-400"}`}
              >
                {latestRecord.csiEffect > 0 ? "+" : ""}
                {latestRecord.csiEffect}
              </div>
            </div>
            <div className={getBgSecondaryClass(isDark) + " rounded-lg p-4"}>
              <div className={`text-xs ${theme.textSecondary} mb-2`}>
                Churn Impact
              </div>
              <div className="text-lg font-bold text-purple-400">
                {(
                  latestRecord.churnMultiplier * 100
                ).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div className={`${getCardClass(isDark)} overflow-hidden`}>
          <div
            className={`px-6 py-4 border-b ${theme.border}`}
          >
            <h3 className={`text-lg font-semibold ${theme.text}`}>
              Green Score History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? "bg-gray-800/50" : "bg-gray-100"}>
                  <th
                    className={`py-3 px-6 text-left text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Quarter
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Previous
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    New Score
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Change
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Method
                  </th>
                  <th
                    className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}
                  >
                    Net Cost
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${isDark ? "divide-gray-700/50" : "divide-gray-200"}`}
              >
                {history.map((record, idx) => {
                  const netCost =
                    (record.disposalCost || 0) -
                    (record.disposalRecovery || 0);
                  return (
                    <tr
                      key={idx}
                      className={`${isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"}`}
                    >
                      <td
                        className={`py-3 px-6 text-sm ${getTextTertiaryClass(isDark)} font-medium`}
                      >
                        Q{record.quarter}
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-mono ${theme.textSecondary}`}
                      >
                        {record.previousScore || 0}
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-mono ${getScoreColor(record.newScore || 0)}`}
                      >
                        {record.newScore || 0}
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-mono ${record.scoreChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {record.scoreChange >= 0 ? "+" : ""}
                        {record.scoreChange}
                      </td>
                      <td className="py-3 px-6 text-right text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getDiposalBadgeConfig(record.disposalMethod).bg} ${getDiposalBadgeConfig(record.disposalMethod).text}`}
                        >
                          {getDiposalBadgeConfig(record.disposalMethod).label}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-mono ${netCost >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {formatCurrency(netCost, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
