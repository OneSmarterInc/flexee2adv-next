// Theme color mapping
export const getThemeColor = (semantic, isDark) => {
  const colorMap = {
    blue: isDark ? "text-blue-400" : "text-blue-600",
    pink: isDark ? "text-pink-400" : "text-pink-600",
    amber: isDark ? "text-amber-400" : "text-amber-600",
    emerald: isDark ? "text-emerald-400" : "text-emerald-600",
    red: isDark ? "text-red-400" : "text-red-600",
    green: isDark ? "text-green-400" : "text-green-600",
    purple: isDark ? "text-purple-400" : "text-purple-600",
    cyan: isDark ? "text-cyan-400" : "text-cyan-600",
  };
  return colorMap[semantic] || colorMap.blue;
};

// Theme background color mapping
export const getThemeBgColor = (semantic, isDark) => {
  const bgMap = {
    blue: isDark
      ? "bg-blue-500/15 border-blue-500/30"
      : "bg-blue-100 border-blue-300",
    pink: isDark
      ? "bg-pink-500/15 border-pink-500/30"
      : "bg-pink-100 border-pink-300",
    amber: isDark
      ? "bg-amber-500/15 border-amber-500/30"
      : "bg-amber-100 border-amber-300",
    emerald: isDark
      ? "bg-emerald-500/15 border-emerald-500/30"
      : "bg-emerald-100 border-emerald-300",
    red: isDark
      ? "bg-red-500/15 border-red-500/30"
      : "bg-red-100 border-red-300",
    green: isDark
      ? "bg-green-500/15 border-green-500/30"
      : "bg-green-100 border-green-300",
    purple: isDark
      ? "bg-purple-500/15 border-purple-500/30"
      : "bg-purple-100 border-purple-300",
    cyan: isDark
      ? "bg-cyan-500/15 border-cyan-500/30"
      : "bg-cyan-100 border-cyan-300",
  };
  return bgMap[semantic] || bgMap.blue;
};

// Score color determination
export const getScoreColorClass = (score, isCredit = false, isDark) => {
  if (isCredit) {
    if (score >= 850) return getThemeColor("emerald", isDark);
    if (score >= 750) return getThemeColor("blue", isDark);
    if (score >= 650) return getThemeColor("amber", isDark);
    return getThemeColor("red", isDark);
  }
  // Green score or other metrics
  if (score >= 80) return getThemeColor("emerald", isDark);
  if (score >= 60) return getThemeColor("green", isDark);
  if (score >= 40) return getThemeColor("amber", isDark);
  if (score >= 20) return getThemeColor("red", isDark);
  return getThemeColor("red", isDark);
};

// Theme configuration object
export const getThemeConfig = (isDark) => ({
  bg: isDark ? "bg-gray-900" : "bg-white",
  bgSecondary: isDark ? "bg-gray-800/30" : "bg-gray-50",
  border: isDark ? "border-gray-700/50" : "border-gray-200",
  text: isDark ? "text-white" : "text-gray-900",
  textSecondary: isDark ? "text-gray-400" : "text-gray-600",
  textMuted: isDark ? "text-gray-500" : "text-gray-700",
  card: isDark
    ? "bg-gray-800/50 border-gray-700/50"
    : "bg-white border-gray-200",
  cardHover: isDark
    ? "hover:bg-gray-750 hover:border-gray-600"
    : "hover:bg-gray-50 hover:border-gray-300",
  table: isDark ? "bg-gray-800/50" : "bg-white",
  tableRow: isDark
    ? "divide-gray-700/30 hover:bg-gray-800/30"
    : "divide-gray-200 hover:bg-gray-50",
  tabActive: isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white",
  tabInactive: isDark
    ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200",
});

// Helper methods for common card classes
export const getCardClass = (isDark) =>
  `${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"} border rounded-xl shadow-sm`;

export const getBgSecondaryClass = (isDark) =>
  isDark ? "bg-gray-700/30" : "bg-gray-100";

export const getTextSecondaryClass = (isDark) =>
  isDark ? "text-gray-400" : "text-gray-600";

export const getTextTertiaryClass = (isDark) =>
  isDark ? "text-gray-300" : "text-gray-700";
