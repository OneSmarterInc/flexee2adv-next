// components/tabs/IntelligenceTab.js
// Intelligence Center tab for purchasing market intelligence reports

import { useState } from "react";

// Intelligence report definitions
const INTEL_REPORTS = [
  {
    id: "intelRegionalDemand",
    type: "REGIONAL_DEMAND",
    name: "Regional Demand Forecast",
    description: "Detailed demand projections for each region including growth trends, seasonality patterns, and competitive dynamics.",
    icon: "📊",
    cost: 250000,
    insights: [
      "Region-specific demand forecasts for next 2 quarters",
      "Seasonal adjustment factors by region",
      "Competitive market share trends",
    ],
  },
  {
    id: "intelRetailChannel",
    type: "RETAIL_CHANNEL",
    name: "Retail Channel Analysis",
    description: "Comprehensive analysis of retailer behavior, inventory levels, and ordering patterns across your distribution network.",
    icon: "🏪",
    cost: 250000,
    insights: [
      "Retailer inventory health assessment",
      "Panic/clearance mode predictions",
      "Optimal replenishment recommendations",
    ],
  },
  {
    id: "intelCompetitorCapacity",
    type: "COMPETITOR_CAPACITY",
    name: "Competitor Intelligence",
    description: "Strategic intelligence on competitor capacity utilization, expansion plans, and market positioning.",
    icon: "🔍",
    cost: 250000,
    insights: [
      "Competitor capacity utilization rates",
      "Recent capacity expansion activities",
      "Pricing strategy analysis",
    ],
  },
  {
    id: "intelSupplierRisk",
    type: "SUPPLIER_RISK",
    name: "Supplier Risk Assessment",
    description: "Risk analysis of your supplier base including delivery performance, quality metrics, and financial health indicators.",
    icon: "⚠️",
    cost: 250000,
    insights: [
      "Supplier reliability scores",
      "Lead time variability analysis",
      "Alternative supplier recommendations",
    ],
  },
  {
    id: "intelCustomerSentiment",
    type: "CUSTOMER_SENTIMENT",
    name: "Customer Sentiment Report",
    description: "Deep analysis of customer satisfaction drivers, churn risk factors, and loyalty program effectiveness.",
    icon: "💬",
    cost: 250000,
    insights: [
      "CSI driver analysis",
      "Churn risk by customer segment",
      "Service level impact assessment",
    ],
  },
];

export default function IntelligenceTab({
  theme,
  decisions,
  setDecisions,
  isSubmitted,
  formatCurrency,
  intelReports,
}) {
  const [selectedReport, setSelectedReport] = useState(null);

  const handleToggleSubscription = (reportId) => {
    if (isSubmitted) return;
    setDecisions((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const calculateTotalCost = () => {
    return INTEL_REPORTS.reduce((total, report) => {
      return total + (decisions[report.id] ? report.cost : 0);
    }, 0);
  };

  const subscribedCount = INTEL_REPORTS.filter((r) => decisions[r.id]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${theme.card} border rounded-xl p-6`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              🔍 Intelligence Center
            </h2>
            <p className={`mt-1 ${theme.textMuted}`}>
              Subscribe to market intelligence reports to gain strategic insights for better decision-making.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${theme.cardInner} text-right`}>
            <p className={`text-xs ${theme.textMuted}`}>Total Subscription Cost</p>
            <p className="text-xl font-bold text-orange-400">
              {formatCurrency(calculateTotalCost())}
            </p>
            <p className={`text-xs ${theme.textMuted}`}>
              {subscribedCount} of {INTEL_REPORTS.length} reports
            </p>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEL_REPORTS.map((report) => {
          const isSubscribed = decisions[report.id];
          
          return (
            <div
              key={report.id}
              className={`${theme.card} border rounded-xl overflow-hidden transition-all ${
                isSubscribed ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Report Header */}
              <div className={`p-4 ${isSubscribed ? "bg-blue-500/10" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{report.icon}</span>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className={`text-sm ${theme.textMuted}`}>
                        {formatCurrency(report.cost)}/quarter
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSubscription(report.id)}
                    disabled={isSubmitted}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isSubscribed
                        ? "bg-blue-600 text-white"
                        : `${theme.secondaryBg} ${theme.text}`
                    } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSubscribed ? "✓ Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>

              {/* Report Description */}
              <div className="p-4 border-t border-gray-700">
                <p className={`text-sm ${theme.textMuted} mb-3`}>
                  {report.description}
                </p>

                {/* Insights Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-400">
                    Report Includes:
                  </p>
                  <ul className="space-y-1">
                    {report.insights.map((insight, idx) => (
                      <li
                        key={idx}
                        className={`text-xs ${theme.textMuted} flex items-start gap-2`}
                      >
                        <span className="text-green-400 mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Status Badge */}
              {isSubscribed && (
                <div className="px-4 py-2 bg-blue-500/10 border-t border-blue-500/30">
                  <p className="text-xs text-blue-400 flex items-center gap-1">
                    <span>📬</span>
                    Report will be delivered after quarter processing
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bundle Offer */}
      <div className={`${theme.card} border rounded-xl p-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              📦 Full Intelligence Bundle
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            </h3>
            <p className={`text-sm ${theme.textMuted} mt-1`}>
              Subscribe to all 5 reports and save {formatCurrency(250000)} per quarter
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-xs ${theme.textMuted} line-through`}>
                {formatCurrency(1250000)}
              </p>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(1000000)}
              </p>
            </div>
            <button
              onClick={() => {
                if (isSubmitted) return;
                const allSubscribed = INTEL_REPORTS.every((r) => decisions[r.id]);
                setDecisions((prev) => {
                  const newState = { ...prev };
                  INTEL_REPORTS.forEach((r) => {
                    newState[r.id] = !allSubscribed;
                  });
                  return newState;
                });
              }}
              disabled={isSubmitted}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                INTEL_REPORTS.every((r) => decisions[r.id])
                  ? "bg-green-600 text-white"
                  : `${theme.secondaryBg} ${theme.text}`
              } ${isSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {INTEL_REPORTS.every((r) => decisions[r.id])
                ? "✓ Bundle Active"
                : "Subscribe All"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className={`p-4 rounded-lg ${theme.cardInner} flex items-start gap-3`}>
        <span className="text-xl">💡</span>
        <div>
          <p className={`text-sm ${theme.textMuted}`}>
            <strong className={theme.text}>How Intelligence Reports Work:</strong>{" "}
            Subscribe to reports this quarter and receive detailed analysis after the quarter processes. 
            Reports provide actionable insights based on actual simulation data, helping you make 
            more informed decisions in subsequent quarters.
          </p>
        </div>
      </div>

      {/* Submitted State */}
      {isSubmitted && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <span>🔒</span>
          <p className="text-yellow-400 text-sm">
            Intelligence subscriptions are locked after submission. Your reports will be generated
            when the quarter advances.
          </p>
        </div>
      )}
    </div>
  );
}