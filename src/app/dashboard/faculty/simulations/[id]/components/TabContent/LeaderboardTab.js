// src/app/dashboard/faculty/simulations/[id]/components/TabContent/LeaderboardTab.js

import { getGradeColor, formatPercent } from "../../utils";

export default function LeaderboardTab({ theme, simulation, leaderboard }) {
  return (
    <div className={`${theme.card} border rounded-xl overflow-hidden`}>
      <div className="p-5 border-b border-gray-700/50">
        <h3 className="font-semibold flex items-center gap-2">
          🏆 Quarter {leaderboard?.quarter || simulation.currentQuarter} Rankings
        </h3>
      </div>
      {leaderboard?.rankings?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme.cardInner} text-xs uppercase tracking-wide`}>
              <tr>
                <th className="px-5 py-3 text-left">Rank</th>
                <th className="px-5 py-3 text-left">Firm</th>
                <th className="px-5 py-3 text-center">BSC Overall</th>
                <th className="px-5 py-3 text-center">Grade</th>
                <th className="px-5 py-3 text-center">Financial</th>
                <th className="px-5 py-3 text-center">Customer</th>
                <th className="px-5 py-3 text-center">Process</th>
                <th className="px-5 py-3 text-center">Learning</th>
                <th className="px-5 py-3 text-right">CSI</th>
                <th className="px-5 py-3 text-right">Market Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {leaderboard.rankings.map((r, idx) => (
                <tr
                  key={r.firmId}
                  className={`transition ${idx === 0 ? "bg-yellow-500/5" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span
                      className={`text-lg ${
                        idx === 0
                          ? "text-yellow-400"
                          : idx === 1
                          ? "text-gray-300"
                          : idx === 2
                          ? "text-orange-400"
                          : ""
                      }`}
                    >
                      {idx === 0
                        ? "🥇"
                        : idx === 1
                        ? "🥈"
                        : idx === 2
                        ? "🥉"
                        : `#${r.rank}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: r.firmColor }}
                      >
                        {r.firmNumber}
                      </div>
                      <span className="font-medium">{r.firmName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-lg">
                    {r.bscOverall?.toFixed(1)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`font-bold text-lg ${getGradeColor(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {r.bscFinancial?.toFixed(1)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {r.bscCustomer?.toFixed(1)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {r.bscProcess?.toFixed(1)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {r.bscLearning?.toFixed(1)}
                  </td>
                  <td className="px-5 py-4 text-right">{r.csi?.toFixed(1)}</td>
                  <td className="px-5 py-4 text-right">
                    {formatPercent(r.marketShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <span className="text-4xl">📊</span>
          <p className={`mt-3 ${theme.textMuted}`}>
            No ranking data available yet
          </p>
          <p className={`text-sm ${theme.textMuted}`}>
            Rankings appear after the first quarter is processed
          </p>
        </div>
      )}
    </div>
  );
}