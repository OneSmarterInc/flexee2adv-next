// src/app/dashboard/faculty/simulations/[id]/components/TabContent/IntelligenceReportsPanel.js
"use client";

import { useState } from "react";

// ============================================================================
// Report type metadata for rendering
// ============================================================================
const REPORT_META = {
  MARKET_TRENDS: {
    icon: "📈",
    color: "blue",
    label: "Market Trends",
  },
  COMPETITOR_PRICING: {
    icon: "💰",
    color: "amber",
    label: "Competitor Pricing",
  },
  REGIONAL_DEMAND: {
    icon: "🗺️",
    color: "green",
    label: "Regional Demand",
  },
  RETAIL_CHANNEL: {
    icon: "🏪",
    color: "purple",
    label: "Retail Channel",
  },
  COMPETITOR_CAPACITY: {
    icon: "🏭",
    color: "orange",
    label: "Competitor Capacity",
  },
  SUPPLIER_RISK: {
    icon: "⚠️",
    color: "red",
    label: "Supplier Risk",
  },
  CUSTOMER_SENTIMENT: {
    icon: "😊",
    color: "teal",
    label: "Customer Sentiment",
  },
};

const RISK_COLORS = {
  LOW: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400" },
  ELEVATED: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
  HIGH: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
};

const TREND_ICONS = {
  UP: "↑",
  DOWN: "↓",
  STABLE: "→",
  FLAT: "→",
  INCREASING: "↑",
  DECREASING: "↓",
};

// ============================================================================
// Sub-components for each report type
// ============================================================================

function MarketTrendsCard({ content, theme, isDark }) {
  if (!content) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-1`}>Current Season</div>
          <div className={`text-sm font-medium ${theme.text}`}>
            {content.currentSeason || "N/A"}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-1`}>Next Quarter</div>
          <div className={`text-sm font-medium ${theme.text}`}>
            {content.nextQuarterSeason || "N/A"}
          </div>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
        <div className={`text-xs ${theme.textMuted} mb-1`}>Trend</div>
        <div className={`text-sm font-semibold ${
          content.trend === "INCREASING" ? "text-green-400" :
          content.trend === "DECREASING" ? "text-red-400" :
          theme.text
        }`}>
          {TREND_ICONS[content.trend] || ""} {content.trendLabel || content.trend || "Stable"}
        </div>
      </div>
      {content.lastQuarterDemandK > 0 && (
        <div className={`text-xs ${theme.textMuted}`}>
          Last quarter demand: {content.lastQuarterDemandK}K units
        </div>
      )}
    </div>
  );
}

function CompetitorPricingCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${theme.textMuted} text-xs`}>
              <th className="text-left py-1 pr-3">Firm</th>
              <th className="text-right py-1 px-2">P1</th>
              <th className="text-right py-1 pl-2">P2</th>
            </tr>
          </thead>
          <tbody>
            {content.firms.map((f) => (
              <tr key={f.firmNumber} className={`border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                <td className={`py-1.5 pr-3 ${f.isYou ? "font-semibold text-blue-400" : theme.text}`}>
                  Firm {f.firmNumber}{f.isYou ? " (You)" : ""}
                </td>
                <td className={`py-1.5 px-2 text-right ${theme.text}`}>${f.priceP1}</td>
                <td className={`py-1.5 pl-2 text-right ${theme.text}`}>${f.priceP2}</td>
              </tr>
            ))}
            {content.marketAverage && (
              <tr className={`border-t-2 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <td className={`py-1.5 pr-3 font-medium ${theme.textMuted}`}>Avg</td>
                <td className={`py-1.5 px-2 text-right font-medium ${theme.textMuted}`}>
                  ${content.marketAverage.p1}
                </td>
                <td className={`py-1.5 pl-2 text-right font-medium ${theme.textMuted}`}>
                  ${content.marketAverage.p2}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {content.undercutAlert && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">
          Firm {content.undercutAlert.firmNumber} undercutting at ${content.undercutAlert.price}
        </div>
      )}
    </div>
  );
}

function RegionalDemandCard({ content, theme, isDark }) {
  if (!content?.regions) return null;
  const regions = content.regions;
  return (
    <div className="space-y-3">
      {Object.entries(regions).map(([key, r]) => (
        <div key={key} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${theme.text}`}>
              {key} {r.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"} ${theme.textMuted}`}>
              {r.share}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className={theme.textMuted}>{r.demandK}K units</span>
            <span className="text-green-400">+{r.growthRate} growth</span>
          </div>
          <div className={`text-xs mt-1 ${theme.textMuted} italic`}>{r.characteristic}</div>
        </div>
      ))}
      {content.tips?.length > 0 && (
        <div className={`text-xs ${theme.textMuted} space-y-1`}>
          {content.tips.map((tip, i) => (
            <div key={i}>💡 {tip}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function RetailChannelCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  return (
    <div className="space-y-3">
      {content.firms.map((f) => {
        const modeColor = f.retailerMode === "PANIC"
          ? "text-red-400"
          : f.retailerMode === "CLEARANCE"
            ? "text-yellow-400"
            : "text-green-400";
        return (
          <div key={f.firmNumber} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${f.isYou ? "text-blue-400" : theme.text}`}>
                Firm {f.firmNumber}{f.isYou ? " (You)" : ""}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${modeColor} ${
                f.retailerMode === "PANIC" ? "bg-red-500/10" :
                f.retailerMode === "CLEARANCE" ? "bg-yellow-500/10" :
                "bg-green-500/10"
              }`}>
                {f.retailerMode}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={theme.textMuted}>Inv: {f.retailerInventoryK}K</span>
              <span className={theme.textMuted}>Coverage: {f.coverageMonths} mo</span>
            </div>
          </div>
        );
      })}
      {content.alerts?.length > 0 && (
        <div className="space-y-1">
          {content.alerts.map((a, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-xs font-medium ${
              a.type === "PANIC" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
            }`}>
              {a.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompetitorCapacityCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  return (
    <div className="space-y-3">
      {content.firms.map((f) => (
        <div key={f.firmNumber} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${f.isYou ? "text-blue-400" : theme.text}`}>
              Firm {f.firmNumber}{f.isYou ? " (You)" : ""}
            </span>
            <span className={`text-xs font-mono ${
              f.utilization > 90 ? "text-red-400" :
              f.utilization > 75 ? "text-yellow-400" :
              "text-green-400"
            }`}>
              {f.utilization}% util
            </span>
          </div>
          {/* Utilization bar */}
          <div className={`w-full h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
            <div
              className={`h-full rounded-full transition-all ${
                f.utilization > 90 ? "bg-red-400" :
                f.utilization > 75 ? "bg-yellow-400" :
                "bg-green-400"
              }`}
              style={{ width: `${Math.min(f.utilization, 100)}%` }}
            />
          </div>
          <div className={`flex justify-between text-xs mt-1.5 ${theme.textMuted}`}>
            <span>Base: {f.baseCapacityK}K</span>
            {f.additionalCapacityK > 0 && <span>+{f.additionalCapacityK}K expanded</span>}
            <span>Total: {f.totalCapacityK}K</span>
          </div>
        </div>
      ))}
      {content.expansionAlerts?.length > 0 && (
        <div className="space-y-1">
          {content.expansionAlerts.map((a, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium">
              🏗️ {a.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupplierRiskCard({ content, theme, isDark }) {
  if (!content) return null;
  const riskStyle = RISK_COLORS[content.riskLevel] || RISK_COLORS.LOW;
  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-lg ${riskStyle.bg}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2.5 h-2.5 rounded-full ${riskStyle.dot}`} />
          <span className={`text-sm font-semibold ${riskStyle.text}`}>
            Risk Level: {content.riskLevel}
          </span>
        </div>
        <div className={`text-xs ${theme.textMuted} space-y-0.5 mt-2`}>
          {content.conditions?.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      </div>
      {content.supplierComparison && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div className={`text-xs ${theme.textMuted}`}>Global</div>
            <div className={`text-sm font-medium ${theme.text}`}>
              ${content.supplierComparison.global?.costPerUnit}/unit
            </div>
            <div className={`text-xs ${theme.textMuted}`}>{content.supplierComparison.global?.leadTime}</div>
          </div>
          <div className={`p-2.5 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <div className={`text-xs ${theme.textMuted}`}>Regional</div>
            <div className={`text-sm font-medium ${theme.text}`}>
              ${content.supplierComparison.regional?.costPerUnit}/unit
            </div>
            <div className={`text-xs ${theme.textMuted}`}>{content.supplierComparison.regional?.leadTime}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerSentimentCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  return (
    <div className="space-y-3">
      {content.firms.map((f) => (
        <div key={f.firmNumber} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${f.isYou ? "text-blue-400" : theme.text}`}>
              Firm {f.firmNumber}{f.isYou ? " (You)" : ""}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              f.status === "Strong" ? "bg-green-500/10 text-green-400" :
              f.status === "At Risk" ? "bg-red-500/10 text-red-400" :
              `${isDark ? "bg-white/10" : "bg-gray-200"} ${theme.textMuted}`
            }`}>
              {f.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className={theme.text}>
              CSI: <span className="font-semibold">{f.csi}</span>
            </span>
            <span className={
              f.trend === "UP" ? "text-green-400" :
              f.trend === "DOWN" ? "text-red-400" :
              theme.textMuted
            }>
              {TREND_ICONS[f.trend] || "→"} {f.trend}
            </span>
            <span className={theme.textMuted}>Churn: {f.churnedK}K</span>
          </div>
        </div>
      ))}
      {content.customerPool && (
        <div className={`p-3 rounded-lg border ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-200 bg-blue-50"}`}>
          <div className={`text-xs font-medium mb-1 ${theme.text}`}>Your Customer Pool</div>
          <div className="flex gap-4 text-xs">
            <span className="text-green-400">
              Loyal: {content.customerPool.loyalCustomersK}K
            </span>
            <span className="text-yellow-400">
              At-Risk: {content.customerPool.atRiskPoolK}K
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Report Card Renderer (dispatches to the correct sub-component)
// ============================================================================
function ReportCard({ report, theme, isDark, isExpanded, onToggle }) {
  const meta = REPORT_META[report.reportType] || {
    icon: "📄",
    color: "gray",
    label: report.reportType,
  };

  const content = report.content || {};

  return (
    <div className={`rounded-xl border transition-all ${
      isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"
    } ${isExpanded ? "ring-1 ring-blue-500/30" : ""}`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-xl ${
          isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <div className={`text-sm font-semibold ${theme.text}`}>
              {report.title || meta.label}
            </div>
            <div className={`text-xs ${theme.textMuted}`}>
              {report.subtitle || (report.isFree ? "Free" : `$${(report.cost / 1000).toFixed(0)}K`)}
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${theme.textMuted} ${isExpanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`px-4 pb-4 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <div className="pt-3">
            {report.reportType === "MARKET_TRENDS" && (
              <MarketTrendsCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "COMPETITOR_PRICING" && (
              <CompetitorPricingCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "REGIONAL_DEMAND" && (
              <RegionalDemandCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "RETAIL_CHANNEL" && (
              <RetailChannelCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "COMPETITOR_CAPACITY" && (
              <CompetitorCapacityCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "SUPPLIER_RISK" && (
              <SupplierRiskCard content={content} theme={theme} isDark={isDark} />
            )}
            {report.reportType === "CUSTOMER_SENTIMENT" && (
              <CustomerSentimentCard content={content} theme={theme} isDark={isDark} />
            )}

            {/* Fallback: render lines if no structured renderer matched */}
            {!REPORT_META[report.reportType] && report.lines?.length > 0 && (
              <pre className={`text-xs font-mono whitespace-pre-wrap ${theme.textMuted}`}>
                {report.lines.join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Panel Component
// ============================================================================
export default function IntelligenceReportsPanel({
  theme,
  isDark,
  simulation,
  intelReports,
  loadingIntelReports,
  selectedQuarter,
  formatCurrency,
}) {
  const [expandedFirm, setExpandedFirm] = useState(null);
  const [expandedReports, setExpandedReports] = useState({});

  if (!simulation?.features?.intelligenceCenter) {
    return (
      <div className={`p-6 rounded-xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
        <div className="text-center py-8">
          <span className="text-3xl mb-3 block">🔒</span>
          <p className={`text-sm font-medium ${theme.text}`}>Intelligence Center Disabled</p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Enable the Intelligence Center feature to view market research and competitor intel.
          </p>
        </div>
      </div>
    );
  }

  const firms = simulation.firms || [];
  const hasFirmData = Object.keys(intelReports).length > 0;

  const toggleReport = (firmId, reportType) => {
    const key = `${firmId}-${reportType}`;
    setExpandedReports((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getFirmId = (f) => f._id || f.firm?._id || f.firmId || f.id;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕵️</span>
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            Intelligence Briefing
          </h3>
          {selectedQuarter && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-white/10" : "bg-gray-200"} ${theme.textMuted}`}>
              Q{selectedQuarter}
            </span>
          )}
        </div>
        {loadingIntelReports && (
          <div className={`text-xs ${theme.textMuted} flex items-center gap-1`}>
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </div>
        )}
      </div>

      {!hasFirmData && !loadingIntelReports && (
        <div className={`p-6 rounded-xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"}`}>
          <div className="text-center py-4">
            <p className={`text-sm ${theme.textMuted}`}>
              No intelligence reports available for this quarter. Reports are generated when firms subscribe and a quarter is processed.
            </p>
          </div>
        </div>
      )}

      {/* Per-firm intelligence briefings */}
      {firms.map((firmEntry) => {
        const firmId = getFirmId(firmEntry);
        const firmName = firmEntry.name || firmEntry.firm?.name || `Firm ${firmEntry.firmNumber || "?"}`;
        const firmNumber = firmEntry.firmNumber || firmEntry.firm?.firmNumber;
        const firmColor = firmEntry.color || firmEntry.firm?.color || "#3B82F6";
        const firmData = intelReports[firmId];

        if (!firmData) return null;

        const reports = firmData.intelligenceReports || [];
        const totalCost = firmData.totalSubscriptionCost || 0;
        const reportCount = firmData.reportsAvailable || reports.length;
        const isOpen = expandedFirm === firmId;

        // Separate free and paid reports
        const freeReports = reports.filter((r) => r.isFree || r.cost === 0);
        const paidReports = reports.filter((r) => !r.isFree && r.cost > 0);

        return (
          <div
            key={firmId}
            className={`rounded-xl border overflow-hidden ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"
            }`}
          >
            {/* Firm header */}
            <button
              onClick={() => setExpandedFirm(isOpen ? null : firmId)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: firmColor }}
                />
                <div>
                  <span className={`text-sm font-semibold ${theme.text}`}>
                    {firmName}
                  </span>
                  <span className={`text-xs ml-2 ${theme.textMuted}`}>
                    {reportCount} report{reportCount !== 1 ? "s" : ""}
                    {totalCost > 0 && ` · ${formatCurrency ? formatCurrency(totalCost) : `$${(totalCost / 1000).toFixed(0)}K`} spent`}
                  </span>
                </div>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${theme.textMuted} ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded: show reports */}
            {isOpen && (
              <div className={`px-4 pb-4 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                {reports.length === 0 ? (
                  <div className={`text-center py-4 text-xs ${theme.textMuted}`}>
                    No reports subscribed this quarter.
                  </div>
                ) : (
                  <div className="space-y-2 pt-3">
                    {/* Free reports section */}
                    {freeReports.length > 0 && (
                      <>
                        <div className={`text-xs font-medium uppercase tracking-wider ${theme.textMuted} mb-1`}>
                          Free Reports
                        </div>
                        {freeReports.map((report) => (
                          <ReportCard
                            key={report._id || report.reportType}
                            report={report}
                            theme={theme}
                            isDark={isDark}
                            isExpanded={!!expandedReports[`${firmId}-${report.reportType}`]}
                            onToggle={() => toggleReport(firmId, report.reportType)}
                          />
                        ))}
                      </>
                    )}

                    {/* Paid reports section */}
                    {paidReports.length > 0 && (
                      <>
                        <div className={`text-xs font-medium uppercase tracking-wider ${theme.textMuted} mb-1 ${freeReports.length > 0 ? "mt-3" : ""}`}>
                          Subscriptions
                        </div>
                        {paidReports.map((report) => (
                          <ReportCard
                            key={report._id || report.reportType}
                            report={report}
                            theme={theme}
                            isDark={isDark}
                            isExpanded={!!expandedReports[`${firmId}-${report.reportType}`]}
                            onToggle={() => toggleReport(firmId, report.reportType)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
