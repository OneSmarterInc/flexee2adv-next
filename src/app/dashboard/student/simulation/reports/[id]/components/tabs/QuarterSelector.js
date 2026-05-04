export function QuarterSelector({
  kpiReports,
  selectedQuarter,
  onSelectQuarter,
  getSeason,
  isDark,
}) {
  return (
    <div
      className={`flex items-center gap-1 p-1 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg`}
    >
      {kpiReports.map((report) => {
        const season = getSeason(report.quarter);
        const isSelected = selectedQuarter === report.quarter;
        return (
          <button
            key={report.quarter}
            onClick={() => onSelectQuarter(report.quarter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-lg"
                : isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-300"
            }`}
          >
            <span className="mr-1.5">{season.icon}</span>Q{report.quarter}
          </button>
        );
      })}
    </div>
  );
}
