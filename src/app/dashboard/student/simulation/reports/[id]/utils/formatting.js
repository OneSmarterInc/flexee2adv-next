// Currency formatting with optional compact mode
export const formatCurrency = (value, compact = false) => {
  if (value === null || value === undefined) return "—";
  if (compact) {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Number formatting with thousand separators
export const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};

// Percentage formatting
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return "—";
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(decimals)}%`;
};

// Trend calculation helper
export const getTrendIndicator = (current, previous) => {
  if (!previous || !current) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (change > 0)
    return { direction: "up", value: change, color: "text-emerald-400" };
  if (change < 0)
    return {
      direction: "down",
      value: Math.abs(change),
      color: "text-red-400",
    };
  return { direction: "flat", value: 0, color: "text-gray-400" };
};

// Green score bracket
export const getGreenScoreBracket = (score) => {
  if (score >= 80) return "EXCELLENT";
  if (score >= 60) return "GOOD";
  if (score >= 40) return "AVERAGE";
  if (score >= 20) return "BELOW_AVERAGE";
  return "POOR";
};

// Calendar quarter calculation
export const getCalendarQuarter = (q) => ((q - 1) % 4) + 1;
