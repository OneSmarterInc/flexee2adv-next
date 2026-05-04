import {
  formatCurrency,
  formatPercent,
  getCardClass,
  getTextSecondaryClass,
  getBgSecondaryClass,
} from "../../utils";
import { TableRow } from "../sub-components";

export function ScorecardTab({
  currentData,
  isDark,
  selectedQuarter,
  firm,
  kpiReports,
  balancedScorecardData,
}) {
  if (!currentData && !balancedScorecardData) return null;

  return (
    <div className="space-y-6">
      {/* Individual Scorecard Section - Only show if currentData exists */}
      {currentData && (
        <>
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Balanced Scorecard - Q{selectedQuarter}
                </h3>
                <p className="text-gray-400 text-sm">
                  {firm?.name} Performance Assessment
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">
                    {(currentData.bscOverall || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-400">
                    {currentData.bscGrade || "N/A"}
                  </div>
                  <div className="text-xs text-gray-400">Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400">
                    #{currentData.bscRank || "—"}
                  </div>
                  <div className="text-xs text-gray-400">Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Four Perspectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Perspective */}
            <div className={`${getCardClass(isDark)} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-emerald-400">💰</span> Financial
                </h3>
                <span className="text-2xl font-bold text-emerald-400">
                  {(currentData.bscFinancial || 0).toFixed(0)}
                </span>
              </div>
              {/* FIX 4: was hardcoded bg-gray-700 — now matches the other three perspectives */}
              <div
                className="h-3 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: isDark ? "#374151" : "#d1d5db" }}
              >
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${currentData.bscFinancial || 0}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>Revenue</span>
                  <span className="font-mono">
                    {formatCurrency(currentData.revenue, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Net Income
                  </span>
                  <span className="font-mono">
                    {formatCurrency(currentData.netIncome, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Gross Margin
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.grossMarginPct)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Perspective */}
            <div className={`${getCardClass(isDark)} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-blue-400">👥</span> Customer
                </h3>
                <span className="text-2xl font-bold text-blue-400">
                  {(currentData.bscCustomer || 0).toFixed(0)}
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: isDark ? "#374151" : "#d1d5db" }}
              >
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${currentData.bscCustomer || 0}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>CSI Score</span>
                  <span className="font-mono">
                    {(currentData.csi || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Market Share
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.marketShare * 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>Fill Rate</span>
                  <span className="font-mono">
                    {formatPercent(currentData.fillRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Process Perspective */}
            <div className={`${getCardClass(isDark)} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-purple-400">⚙️</span> Internal Process
                </h3>
                <span className="text-2xl font-bold text-purple-400">
                  {(currentData.bscProcess || 0).toFixed(0)}
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: isDark ? "#374151" : "#d1d5db" }}
              >
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${currentData.bscProcess || 0}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Perfect Order
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.perfectOrder)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    On-Time Delivery
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.onTimeDelivery)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Capacity Utilization
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.capacityUtilization)}
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Perspective */}
            <div className={`${getCardClass(isDark)} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-amber-400">📚</span> Learning & Growth
                </h3>
                <span className="text-2xl font-bold text-amber-400">
                  {(currentData.bscLearning || 0).toFixed(0)}
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: isDark ? "#374151" : "#d1d5db" }}
              >
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${currentData.bscLearning || 0}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Tech Systems
                  </span>
                  <span className="font-mono">{currentData.techSystemsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>SC Maturity</span>
                  <span className="font-mono">{currentData.scMaturity}</span>
                </div>
                <div className="flex justify-between">
                  <span className={getTextSecondaryClass(isDark)}>
                    Forecast Accuracy
                  </span>
                  <span className="font-mono">
                    {formatPercent(currentData.forecastAccuracy)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scorecard Trend */}
          <div className={`${getCardClass(isDark)} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-semibold">Scorecard Trend</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                    <th
                      className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass(isDark)} uppercase`}
                    >
                      Perspective
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
                    label="Financial"
                    values={kpiReports.map((r) => r.bscFinancial)}
                    format="number"
                  />
                  <TableRow
                    label="Customer"
                    values={kpiReports.map((r) => r.bscCustomer)}
                    format="number"
                  />
                  <TableRow
                    label="Process"
                    values={kpiReports.map((r) => r.bscProcess)}
                    format="number"
                  />
                  <TableRow
                    label="Learning"
                    values={kpiReports.map((r) => r.bscLearning)}
                    format="number"
                  />
                  <TableRow
                    label="Overall Score"
                    values={kpiReports.map((r) => r.bscOverall)}
                    format="number"
                    highlight
                  />
                  {/* FIX 5: Rank row label was hardcoded text-white — invisible in light mode */}
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} bg-blue-500/5`}
                  >
                    <td
                      className={`py-3 px-4 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Rank
                    </td>
                    {kpiReports.map((r, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-4 text-sm text-right font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        #{r.bscRank}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Competitive Scorecard View */}
      {balancedScorecardData && balancedScorecardData.firms && (
        <div className={`${getCardClass(isDark)} p-6`}>
          <h3 className="text-lg font-semibold mb-4">
            Industry Balanced Scorecard - Q{selectedQuarter}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
                >
                  <th
                    className={`text-left py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Firm
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Financial
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Customer
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Process
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Learning
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Overall
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Grade
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${getTextSecondaryClass(isDark)}`}
                  >
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {balancedScorecardData.firms.map((firmData, idx) => {
                  // FIX 3: was firmData.firmId === firm?.id only
                  // MongoDB returns _id on the server but Next.js serialises it as id in some
                  // shapes — check both to avoid the highlight never firing
                  const isCurrentFirm =
                    firmData.firmId === firm?.id ||
                    firmData.firmId === firm?._id;

                  return (
                    <tr
                      key={idx}
                      className={`border-b ${
                        isDark ? "border-gray-700/30" : "border-gray-200"
                      } ${
                        isCurrentFirm
                          ? isDark
                            ? "bg-blue-500/10"
                            : "bg-blue-50"
                          : ""
                      }`}
                    >
                      <td
                        className={`py-3 px-4 font-semibold ${
                          isCurrentFirm
                            ? isDark
                              ? "text-blue-400"
                              : "text-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {firmData.firmColor && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: firmData.firmColor }}
                            />
                          )}
                          {firmData.firmName}
                          {isCurrentFirm && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-400 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 font-mono">
                        <span
                          className={
                            (firmData.financial?.score || 0) >= 85
                              ? "text-emerald-400"
                              : (firmData.financial?.score || 0) >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                          }
                        >
                          {(firmData.financial?.score || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-mono">
                        <span
                          className={
                            (firmData.customer?.score || 0) >= 85
                              ? "text-emerald-400"
                              : (firmData.customer?.score || 0) >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                          }
                        >
                          {(firmData.customer?.score || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-mono">
                        <span
                          className={
                            (firmData.process?.score || 0) >= 85
                              ? "text-emerald-400"
                              : (firmData.process?.score || 0) >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                          }
                        >
                          {(firmData.process?.score || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-mono">
                        <span
                          className={
                            (firmData.learning?.score || 0) >= 85
                              ? "text-emerald-400"
                              : (firmData.learning?.score || 0) >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                          }
                        >
                          {(firmData.learning?.score || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 font-mono font-semibold">
                        <span
                          className={
                            (firmData.overall || 0) >= 85
                              ? "text-emerald-400"
                              : (firmData.overall || 0) >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                          }
                        >
                          {(firmData.overall || 0).toFixed(1)}
                        </span>
                      </td>
                      <td
                        className={`text-center py-3 px-4 font-semibold ${
                          firmData.grade === "A"
                            ? "text-emerald-400"
                            : firmData.grade === "B"
                              ? "text-blue-400"
                              : firmData.grade === "C"
                                ? "text-amber-400"
                                : "text-red-400"
                        }`}
                      >
                        {firmData.grade}
                      </td>
                      <td className="text-center py-3 px-4 font-mono font-semibold">
                        <span className="text-yellow-400">#{firmData.rank}</span>
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