// src/app/dashboard/student/reports/[id]/IntelligenceReportsPanel.js
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
          content.trend === "INCREASING" ? "text-green-600" :
          content.trend === "DECREASING" ? "text-red-600" :
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
                <td className={`py-1.5 pr-3 ${f.isYou ? `font-semibold ${theme.text}` : theme.text}`}>
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
        <div className={`px-3 py-2 rounded-lg ${isDark ? "bg-red-500/20" : "bg-red-100"} text-red-600 text-xs font-medium`}>
          Firm {content.undercutAlert.firmNumber} undercutting at ${content.undercutAlert.price}
        </div>
      )}
    </div>
  );
}

function RegionalDemandCard({ content, theme, isDark }) {
  if (!content?.regions) return null;
  const regions = Array.isArray(content.regions)
    ? content.regions
    : Object.values(content.regions);
  
  return (
    <div className="space-y-2">
      {regions.map((r, idx) => (
        <div key={r.name || idx} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${theme.text}`}>{r.name || r.region}</span>
            <span className={`text-xs font-semibold ${r.growthRate?.includes("-") || r.trend === "DECREASING" ? "text-red-600" : "text-green-600"}`}>
              {r.growthRate || (r.trend === "INCREASING" ? "↑" : "↓")}
            </span>
          </div>
          <div className={`text-xs ${theme.textMuted}`}>{r.demandK || r.demand}K units</div>
        </div>
      ))}
    </div>
  );
}

function RetailChannelCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  
  const yourFirm = content.firms.find((f) => f.isYou);
  const otherFirms = content.firms.filter((f) => !f.isYou);
  
  return (
    <div className="space-y-3">
      {yourFirm && (
        <div className={`p-3 rounded-lg border ${isDark ? "bg-white/10 border-white/20" : "bg-blue-50 border-blue-200"}`}>
          <div className={`text-xs font-semibold ${theme.text} mb-2`}>Your Firm</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className={theme.textMuted}>Retailer Inventory</div>
              <div className={`font-bold ${theme.text}`}>
                {yourFirm.retailerInventoryK || yourFirm.retailerInventory}K
              </div>
            </div>
            <div>
              <div className={theme.textMuted}>Coverage</div>
              <div className={`font-bold ${theme.text}`}>{yourFirm.coverageMonths} months</div>
            </div>
            <div className="col-span-2">
              <div className={theme.textMuted}>Mode</div>
              <div className={`font-bold ${theme.text}`}>{yourFirm.retailerMode || "RETAILER"}</div>
            </div>
          </div>
        </div>
      )}
      {otherFirms && otherFirms.length > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>Competitors</div>
          <div className="space-y-1">
            {otherFirms.map((firm, i) => (
              <div key={i} className="text-xs flex justify-between">
                <span>Firm {firm.firmNumber}:</span>
                <span className="font-medium">{firm.retailerInventoryK || firm.retailerInventory}K inv • {firm.coverageMonths}mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorCapacityCard({ content, theme, isDark }) {
  if (!content?.firms) return null;
  return (
    <div className="space-y-2">
      {content.firms.map((c) => (
        <div key={c.firmNumber} className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${c.isYou ? theme.text : ""}`}>
              Firm {c.firmNumber}{c.isYou ? " (You)" : ""}
            </span>
            <span className={`text-xs font-mono ${theme.textMuted}`}>{c.utilization || c.utilizationPct}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
            <div 
              className={`h-full ${(c.utilization || c.utilizationPct) > 85 ? "bg-red-600" : "bg-orange-500"}`} 
              style={{ width: `${c.utilization || c.utilizationPct}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SupplierRiskCard({ content, theme, isDark }) {
  if (!content) return null;
  
  const getRiskColor = (level) => {
    const colors = {
      HIGH: { bg: isDark ? "bg-red-500/20" : "bg-red-100", text: "text-red-600", dot: "bg-red-600" },
      MEDIUM: { bg: isDark ? "bg-yellow-500/20" : "bg-yellow-100", text: "text-yellow-600", dot: "bg-yellow-600" },
      LOW: { bg: isDark ? "bg-green-500/20" : "bg-green-100", text: "text-green-600", dot: "bg-green-600" }
    };
    return colors[level] || colors.LOW;
  };
  
  const riskColor = getRiskColor(content.riskLevel);
  
  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${riskColor.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-semibold ${riskColor.text}`}>Overall Risk</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${riskColor.dot}`} />
            <span className={`text-xs font-bold ${riskColor.text}`}>{content.riskLevel}</span>
          </div>
        </div>
      </div>
      
      {content.conditions && content.conditions.length > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>Risk Conditions</div>
          <ul className="text-xs space-y-1">
            {content.conditions.map((cond, i) => (
              <li key={i} className={theme.text}>• {cond}</li>
            ))}
          </ul>
        </div>
      )}
      
      {content.supplierComparison && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>Supplier Comparison</div>
          {content.supplierComparison.global && (
            <div className="text-xs mb-2">
              <div className={`font-semibold ${theme.text} mb-1`}>Global</div>
              <div className={`${theme.textMuted} ml-2`}>Cost: {content.supplierComparison.global.cost || "N/A"}</div>
              <div className={`${theme.textMuted} ml-2`}>Lead Time: {content.supplierComparison.global.leadTime || "N/A"}</div>
            </div>
          )}
          {content.supplierComparison.regional && (
            <div className="text-xs">
              <div className={`font-semibold ${theme.text}`}>Regional</div>
              <div className={`${theme.textMuted} ml-2`}>Cost: {content.supplierComparison.regional.cost || "N/A"}</div>
              <div className={`${theme.textMuted} ml-2`}>Lead Time: {content.supplierComparison.regional.leadTime || "N/A"}</div>
            </div>
          )}
        </div>
      )}
      
      {content.mitigationStrategies && content.mitigationStrategies.length > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>Mitigation Strategies</div>
          <ul className="text-xs space-y-1">
            {content.mitigationStrategies.map((strategy, i) => (
              <li key={i} className={theme.text}>✓ {strategy}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CustomerSentimentCard({ content, theme, isDark }) {
  if (!content) return null;
  
  const yourFirm = content.firms?.find((f) => f.isYou);
  const sentimentScore = yourFirm?.csi || 50;
  const trend = yourFirm?.trend || "STABLE";
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-1`}>Your CSI Score</div>
          <div className={`text-xl font-bold ${theme.text}`}>
            {sentimentScore.toFixed(1)}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-1`}>Trend</div>
          <div className={`text-sm font-semibold ${
            trend === "UP" ? "text-green-500" :
            trend === "DOWN" ? "text-red-500" :
            theme.text
          }`}>
            {trend === "UP" ? "↑" : trend === "DOWN" ? "↓" : "→"} {trend}
          </div>
        </div>
      </div>
      {content.customerPool && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>Your Customer Base</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={theme.textMuted}>Loyal Customers:</span>
              <span className={`font-medium ${theme.text}`}>{content.customerPool.loyalCustomersK || content.customerPool.loyalCustomers}K</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={theme.textMuted}>At-Risk:</span>
              <span className={`font-medium ${theme.text}`}>{content.customerPool.atRiskPoolK || content.customerPool.atRiskPool}K</span>
            </div>
          </div>
        </div>
      )}
      {content.csiDrivers && content.csiDrivers.length > 0 && (
        <div className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
          <div className={`text-xs ${theme.textMuted} mb-2`}>CSI Drivers</div>
          <ul className="text-xs space-y-1">
            {content.csiDrivers.map((driver, i) => (
              <li key={i} className={theme.text}>• {driver}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Report Card Component
// ============================================================================
function ReportCard({ report, theme, isDark, isExpanded, onToggle }) {
  const meta = REPORT_META[report.reportType] || { icon: "📋", label: report.reportType };
  const content = report.content;

  return (
    <div className={`rounded-lg border transition-all ${
      isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-white"
    }`}>
      {/* Report header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
          isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">{meta.icon}</span>
          <div className="flex-1">
            <div className={`text-sm font-medium ${theme.text}`}>
              {meta.label}
            </div>
            {report.subtitle && (
              <div className={`text-xs ${theme.textMuted}`}>{report.subtitle}</div>
            )}
          </div>
          {report.cost > 0 && (
            <div className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 ml-2">
              Premium
            </div>
          )}
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

        // Filter reports by selected quarter
        const allReports = firmData.intelligenceReports || [];
        const reports = selectedQuarter
          ? allReports.filter((r) => r.quarter === selectedQuarter)
          : allReports;
        
        const totalCost = firmData.totalSubscriptionCost || 0;
        const reportCount = selectedQuarter
          ? reports.length
          : firmData.reportsAvailable || allReports.length;
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
