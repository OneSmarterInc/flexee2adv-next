// src/app/dashboard/faculty/simulations/[id]/utils.js

export const getTheme = (isDark) => ({
  bg: isDark ? "bg-gray-900" : "bg-gray-50",
  text: isDark ? "text-white" : "text-gray-900",
  textMuted: isDark ? "text-gray-400" : "text-gray-600",
  card: isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
  cardInner: isDark ? "bg-gray-700/50" : "bg-gray-100",
  nav: isDark
    ? "bg-gray-800/95 border-gray-700"
    : "bg-white/95 border-gray-200",
  input: isDark
    ? "bg-gray-700 border-gray-600 text-white"
    : "bg-white border-gray-300 text-gray-900",
  accent: isDark ? "blue" : "red",
  accentBg: isDark
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-red-600 hover:bg-red-700",
  accentText: isDark ? "text-blue-400" : "text-red-600",
  secondaryBg: isDark
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300",
});

export const formatCurrency = (value) => {
  if (!value && value !== 0) return "—";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export const formatNumber = (value) => {
  if (!value && value !== 0) return "—";
  return value.toLocaleString();
};

export const formatPercent = (value) => {
  if (!value && value !== 0) return "—";
  return `${(value * 100).toFixed(1)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const SEASON_CONFIG = {
  1: { name: "Q1 Post-Holiday", icon: "❄️", color: "text-blue-400" },
  2: { name: "Q2 Spring", icon: "🌸", color: "text-pink-400" },
  3: { name: "Q3 Summer", icon: "☀️", color: "text-yellow-400" },
  4: { name: "Q4 Holiday", icon: "🎄", color: "text-green-400" },
};

export const getCalendarQuarter = (q) => ((q - 1) % 4) + 1;

export const getSeason = (q) =>
  SEASON_CONFIG[getCalendarQuarter(q)] || SEASON_CONFIG[1];

export const countEnabledAdvanced = (features, ADVANCED_MODULES) => {
  if (!features) return 0;
  return Object.keys(ADVANCED_MODULES).filter((k) => features[k]).length;
};

export const getGradeColor = (grade) => {
  const colors = {
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };
  return colors[grade] || "text-gray-400";
};

export const getGreenScoreBracket = (score) => {
  if (score >= 80)
    return {
      label: "Leader",
      color: "text-green-400",
      bg: "bg-green-500/10",
    };
  if (score >= 60)
    return { label: "Good", color: "text-blue-400", bg: "bg-blue-500/10" };
  if (score >= 40)
    return {
      label: "Average",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    };
  if (score >= 20)
    return {
      label: "Lagging",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    };
  return { label: "Poor", color: "text-red-400", bg: "bg-red-500/10" };
};

export const getEnrolledStudentIds = (simulation) => {
  const enrolledIds = new Set();
  if (simulation?.firms) {
    simulation.firms.forEach((firm) => {
      if (firm.enrollments) {
        firm.enrollments.forEach((enrollment) => {
          enrolledIds.add(
            enrollment.user?.id || enrollment.user?._id || enrollment.userId,
          );
        });
      }
    });
  }
  return enrolledIds;
};
