import {
  getTrendIndicator,
  formatCurrency,
  formatPercent,
  formatNumber,
} from "../utils";

export function MetricCard({
  label,
  value,
  previousValue,
  format = "currency",
  icon,
  highlight = false,
  isDark,
  theme,
}) {
  const trend = getTrendIndicator(
    typeof value === "number" ? value : 0,
    typeof previousValue === "number" ? previousValue : null
  );

  let displayValue = value;
  if (format === "currency") displayValue = formatCurrency(value, true);
  else if (format === "percent") displayValue = formatPercent(value);
  else if (format === "number") displayValue = formatNumber(value);

  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight
          ? isDark
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-blue-50 border-blue-200"
          : isDark
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} uppercase tracking-wide`}
        >
          {label}
        </span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span
          className={`text-2xl font-bold ${
            highlight
              ? isDark
                ? "text-blue-400"
                : "text-blue-600"
              : isDark
                ? "text-white"
                : "text-gray-900"
          }`}
        >
          {displayValue}
        </span>
        {trend && (
          <span
            className={`text-xs ${trend.color || (isDark ? "text-gray-400" : "text-gray-600")} flex items-center gap-0.5 mb-1`}
          >
            {trend.direction === "up"
              ? "↑"
              : trend.direction === "down"
                ? "↓"
                : "→"}
            {trend.value.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function TableRow({
  label,
  values,
  format = "currency",
  highlight = false,
  isDark,
}) {
  return (
    <tr
      className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} ${
        highlight
          ? isDark
            ? "bg-blue-500/5"
            : "bg-blue-50"
          : isDark
            ? "hover:bg-gray-800/30"
            : "hover:bg-gray-50"
      }`}
    >
      <td
        className={`py-3 px-4 text-sm ${
          highlight
            ? isDark
              ? "font-semibold text-white"
              : "font-semibold text-gray-900"
            : isDark
              ? "text-gray-300"
              : "text-gray-700"
        }`}
      >
        {label}
      </td>
      {values.map((val, idx) => {
        let displayVal = val;
        if (format === "currency") displayVal = formatCurrency(val);
        else if (format === "percent") displayVal = formatPercent(val);
        else if (format === "number") displayVal = formatNumber(val);

        return (
          <td
            key={idx}
            className={`py-3 px-4 text-sm text-right font-mono ${
              highlight
                ? isDark
                  ? "font-semibold text-white"
                  : "font-semibold text-gray-900"
                : isDark
                  ? "text-gray-300"
                  : "text-gray-700"
            }`}
          >
            {displayVal}
          </td>
        );
      })}
    </tr>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = "blue",
  showLabel = true,
  isDark = true,
}) {
  const pct = Math.min((value / max) * 100, 100);
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-1 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${colorClasses[color] || colorClasses.blue} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={`text-sm font-mono ${isDark ? "text-gray-300" : "text-gray-700"} w-16 text-right`}
        >
          {formatPercent(value / 100)}
        </span>
      )}
    </div>
  );
}
