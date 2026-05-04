"use client";

import VmiPanel from "./VmiPanel";

export default function VmiTab({
  theme,
  isDark,
  simulation,
  vmiHistory,
  loadingVmiHistory,
  fetchAllVmiHistory,
  selectedQuarter,
  formatCurrency,
  formatNumber,
  formatPercent,
}) {
  return (
    <VmiPanel
      theme={theme}
      isDark={isDark}
      simulation={simulation}
      vmiHistory={vmiHistory}
      loadingVmiHistory={loadingVmiHistory}
      fetchAllVmiHistory={fetchAllVmiHistory}
      selectedQuarter={selectedQuarter}
      formatCurrency={formatCurrency}
      formatNumber={formatNumber}
      formatPercent={formatPercent}
    />
  );
}
