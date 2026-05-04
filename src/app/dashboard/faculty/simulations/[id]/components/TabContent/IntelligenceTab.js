// src/app/dashboard/faculty/simulations/[id]/components/TabContent/IntelligenceTab.js
"use client";

import IntelligenceReportsPanel from "./IntelligenceReportsPanel";

export default function IntelligenceTab({
  theme,
  isDark,
  simulation,
  intelReports,
  loadingIntelReports,
  selectedQuarter,
  formatCurrency,
}) {
  return (
    <IntelligenceReportsPanel
      theme={theme}
      isDark={isDark}
      simulation={simulation}
      intelReports={intelReports}
      loadingIntelReports={loadingIntelReports}
      selectedQuarter={selectedQuarter}
      formatCurrency={formatCurrency}
    />
  );
}
