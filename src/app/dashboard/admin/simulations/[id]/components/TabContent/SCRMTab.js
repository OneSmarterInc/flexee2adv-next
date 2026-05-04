// src/app/dashboard/admin/simulations/[id]/components/TabContent/SCRMTab.js
"use client";

import { useState } from "react";
import FirmScrmHistoryModal from "./FirmScrmHistoryModal";

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const RISK_CONFIG = {
  LOW:      { badge: { dark: "bg-zinc-800 text-zinc-300 border-zinc-700",    light: "bg-zinc-100 text-zinc-600 border-zinc-300" } },
  MODERATE: { badge: { dark: "bg-slate-800 text-slate-300 border-slate-600", light: "bg-slate-100 text-slate-600 border-slate-300" } },
  ELEVATED: { badge: { dark: "bg-amber-950 text-amber-400 border-amber-800", light: "bg-amber-50  text-amber-700 border-amber-300" } },
  HIGH:     { badge: { dark: "bg-red-950   text-red-400   border-red-800",   light: "bg-red-50   text-red-600   border-red-300" } },
  CRITICAL: { badge: { dark: "bg-red-900   text-red-300   border-red-700",   light: "bg-red-100  text-red-700   border-red-400" } },
};

const getRiskBadge = (level, isDark) =>
  (RISK_CONFIG[level] || RISK_CONFIG.MODERATE).badge[isDark ? "dark" : "light"];

const getScoreText = (score) => {
  if (score >= 70) return "text-red-500";
  if (score >= 50) return "text-amber-500";
  return "text-zinc-500";
};

const getScoreBar = (score) => {
  if (score >= 70) return "bg-red-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-zinc-400";
};

// ─── Semantic tokens — one function, two outputs ─────────────────────────────
const tk = (isDark) => ({
  card:        isDark ? "bg-gray-900"     : "bg-white",
  cardInner:   isDark ? "bg-gray-800"     : "bg-gray-50",
  tableEven:   isDark ? "bg-gray-800"     : "bg-gray-50",
  tableOdd:    isDark ? "bg-gray-900"     : "bg-white",
  tableFooter: isDark ? "bg-gray-700"     : "bg-gray-100",
  inputCell:   isDark ? "bg-gray-800"     : "bg-gray-50",
  gapFill:     isDark ? "bg-gray-700"     : "bg-gray-200",
  border:      isDark ? "border-gray-700" : "border-gray-200",
  divider:     isDark ? "border-gray-700" : "border-gray-200",
  trackBar:    isDark ? "bg-gray-700"     : "bg-gray-200",
  heading:     isDark ? "text-white"      : "text-gray-900",
  body:        isDark ? "text-gray-300"   : "text-gray-700",
  muted:       isDark ? "text-gray-500"   : "text-gray-500",
  faint:       isDark ? "text-gray-400"   : "text-gray-400",
  label:       isDark ? "text-gray-400"   : "text-gray-600",
  btnBg:       isDark ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                      : "bg-white hover:bg-gray-50 border-gray-200",
  rowHover:    isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
  gaugeTrack:  isDark ? "#4b5563" : "#e4e4e7",
  loyalBar:    isDark ? "bg-gray-400" : "bg-gray-500",
  inPlayBar:   isDark ? "bg-gray-600" : "bg-gray-300",
});

// ============================================================================
// RISK GAUGE
// ============================================================================
const RiskGauge = ({ score, isDark }) => {
  const s = tk(isDark);
  const radius = 32;
  const stroke = 3;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  let arcColor = isDark ? "#71717a" : "#a1a1aa";
  if (score >= 70) arcColor = "#ef4444";
  else if (score >= 50) arcColor = "#f59e0b";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke={s.gaugeTrack} strokeWidth={stroke} />
          <circle
            cx="40" cy="40" r={radius}
            fill="none" stroke={arcColor} strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={circ - filled}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-semibold tabular-nums ${getScoreText(score)}`}>{score}</span>
          <span className={`text-[10px] leading-none ${s.faint}`}>/100</span>
        </div>
      </div>
      <span className={`text-[11px] tracking-wide uppercase ${s.muted}`}>Risk Score</span>
    </div>
  );
};

// ============================================================================
// RISK BREAKDOWN
// ============================================================================
const RiskBreakdown = ({ breakdown, isDark }) => {
  const s = tk(isDark);
  const risks = [
    { label: "Supplier Concentration", key: "supplierConcentrationRisk", weight: 25 },
    { label: "Inventory Buffer",        key: "inventoryBufferRisk",       weight: 20 },
    { label: "Demand Volatility",       key: "demandVolatilityRisk",      weight: 15 },
    { label: "Financial Health",        key: "financialHealthRisk",       weight: 15 },
    { label: "Operational",             key: "operationalRisk",           weight: 25 },
  ];

  return (
    <div className="space-y-2.5">
      {risks.map((r) => {
        const val = breakdown?.[r.key] ?? 0;
        return (
          <div key={r.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] truncate ${s.label}`}>{r.label}</span>
                <span className={`text-[10px] shrink-0 ${s.faint}`}>{r.weight}%</span>
              </div>
              <div className={`h-1 rounded-full ${s.trackBar}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getScoreBar(val)}`}
                  style={{ width: `${Math.min(val, 100)}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-semibold tabular-nums w-8 text-right ${getScoreText(val)}`}>{val}</span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// INPUTS DISPLAY
// ============================================================================
const InputsDisplay = ({ inputs, isDark }) => {
  const s = tk(isDark);
  const sections = [
    {
      title: "Supplier Conc.",
      items: [
        { label: "Global Orders",   value: inputs.globalOrders?.toLocaleString() },
        { label: "Regional Orders", value: inputs.regionalOrders?.toLocaleString() },
        { label: "Concentration",   value: `${inputs.supplierConcentration}%` },
        { label: "Suppliers",       value: inputs.numSuppliers },
      ],
    },
    {
      title: "Inventory Buffer",
      items: [
        { label: "Raw Material",    value: inputs.rawMaterialUnits?.toLocaleString() },
        { label: "Finished Goods",  value: inputs.finishedGoodsUnits?.toLocaleString() },
        { label: "Raw DoS",         value: inputs.rawDaysOfSupply },
        { label: "FG DoS",          value: inputs.fgDaysOfSupply },
      ],
    },
    {
      title: "Demand Volatility",
      items: [
        { label: "MAPE",            value: `${((inputs.demandMape || 0) * 100).toFixed(1)}%` },
        { label: "Quarter",         value: `Q${inputs.calendarQuarter}` },
      ],
    },
    {
      title: "Financial Health",
      items: [
        { label: "Cash",            value: `$${((inputs.cash || 0) / 1_000_000).toFixed(1)}M` },
        { label: "Debt Ratio",      value: `${(inputs.debtRatio || 0).toFixed(1)}%` },
        { label: "Cash Runway",     value: `${(inputs.cashRunway || 0).toFixed(1)}q` },
      ],
    },
    {
      title: "Operational",
      items: [
        { label: "Capacity Util",   value: `${(inputs.capacityUtilization || 0).toFixed(1)}%` },
        { label: "Perfect Order",   value: `${((inputs.perfectOrder || 0) * 100).toFixed(0)}%` },
        { label: "LT Exposure",     value: `${((inputs.leadTimeExposure || 0) * 100).toFixed(0)}%` },
      ],
    },
  ];

  return (
    <div className="space-y-3 pt-1">
      <p className={`text-[11px] uppercase tracking-widest font-medium ${s.faint}`}>Calculation Inputs</p>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px rounded-lg overflow-hidden border ${s.border} ${s.gapFill}`}>
        {sections.map((sec, i) => (
          <div key={i} className={`p-3 space-y-2 ${s.inputCell}`}>
            <p className={`text-[10px] uppercase tracking-wider font-semibold border-b pb-1.5 ${s.muted} ${s.divider}`}>
              {sec.title}
            </p>
            {sec.items.map((item, j) => (
              <div key={j} className="flex justify-between gap-2">
                <span className={`text-[11px] truncate ${s.faint}`}>{item.label}</span>
                <span className={`text-[11px] font-medium tabular-nums whitespace-nowrap ${s.body}`}>{item.value ?? "—"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CUSTOMER METRICS DISPLAY
// ============================================================================
const CustomerMetricsDisplay = ({ metrics, movements, isDark }) => {
  const s = tk(isDark);
  const loyal  = metrics?.loyal  || 0;
  const inPlay = metrics?.inPlay || 0;
  const total  = loyal + inPlay;

  const netChurn      = (movements?.churnedToCompetitor || 0) - (movements?.wonBackFromCompetitor || 0);
  const netLoyalDelta = (movements?.growthConverted || 0)     - (movements?.degradedFromLoyal || 0);

  return (
    <div className="space-y-5 pt-1">
      <p className={`text-[11px] uppercase tracking-widest font-medium ${s.faint}`}>Customer Pools</p>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Loyal",
            count: loyal,
            delta: netLoyalDelta,
            deltaColor: netLoyalDelta > 0 ? s.body : "text-red-500",
          },
          {
            label: "In-Play",
            count: inPlay,
            delta: movements?.degradedFromLoyal > 0 ? movements.degradedFromLoyal : null,
            deltaColor: "text-amber-500",
            deltaPrefix: "+",
          },
        ].map((pool) => (
          <div key={pool.label} className={`rounded-lg border p-4 ${s.border} ${s.cardInner}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] uppercase tracking-wider ${s.muted}`}>{pool.label}</span>
              {pool.delta !== 0 && pool.delta != null && (
                <span className={`text-[11px] tabular-nums ${pool.deltaColor}`}>
                  {pool.deltaPrefix || (pool.delta > 0 ? "+" : "")}{pool.delta?.toLocaleString()}
                </span>
              )}
            </div>
            <p className={`text-2xl font-semibold tabular-nums ${s.heading}`}>{pool.count.toLocaleString()}</p>
            <p className={`text-[11px] mt-1 ${s.faint}`}>
              {total > 0 ? `${((pool.count / total) * 100).toFixed(1)}% of base` : "—"}
            </p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <div className={`flex justify-between text-[11px] ${s.faint}`}>
            <span>Loyal / In-Play</span>
            <span className="tabular-nums">
              {((loyal / total) * 100).toFixed(0)}% / {((inPlay / total) * 100).toFixed(0)}%
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden flex ${s.trackBar}`}>
            <div className={`transition-all duration-300 ${s.loyalBar}`}  style={{ width: `${(loyal  / total) * 100}%` }} />
            <div className={`transition-all duration-300 ${s.inPlayBar}`} style={{ width: `${(inPlay / total) * 100}%` }} />
          </div>
        </div>
      )}

      {movements && (
        <div className="space-y-2">
          <p className={`text-[11px] uppercase tracking-widest font-medium ${s.faint}`}>Quarterly Movements</p>
          <div className={`rounded-lg border overflow-hidden ${s.border}`}>
            <table className="w-full text-[12px]">
              <tbody>
                {[
                  { label: "Churned to Competitor", val: -(movements.churnedToCompetitor || 0), negative: true },
                  { label: "Degraded from Loyal",   val: -(movements.degradedFromLoyal || 0),   negative: true },
                  { label: "Won Back",               val: +(movements.wonBackFromCompetitor || 0) },
                  { label: "New Entrants",           val: +(movements.newEntrants || 0) },
                  { label: "Growth Converted",       val: +(movements.growthConverted || 0) },
                  { label: "At-Risk Saved",          val: +(movements.atRiskSaved || 0) },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? s.tableEven : s.tableOdd}>
                    <td className={`px-3 py-2 ${s.muted}`}>{row.label}</td>
                    <td className={`px-3 py-2 text-right font-medium tabular-nums ${row.negative ? "text-red-500" : s.body}`}>
                      {row.val > 0 ? `+${row.val.toLocaleString()}` : row.val.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className={`border-t ${s.tableFooter} ${s.divider}`}>
                  <td className={`px-3 py-2 font-semibold ${s.label}`}>Net Change</td>
                  <td className={`px-3 py-2 text-right font-semibold tabular-nums ${
                    netChurn < 0 ? s.heading : netChurn > 0 ? "text-red-500" : s.muted
                  }`}>
                    {netChurn === 0 ? "0" : netChurn > 0 ? `-${netChurn.toLocaleString()}` : `+${Math.abs(netChurn).toLocaleString()}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FIRM SCRM CARD
// ============================================================================
const FirmScrmCard = ({ firmData, isDark, onClick, expanded, onToggleExpand }) => {
  const s     = tk(isDark);
  const score = firmData.riskAssessment?.totalRiskScore || 0;
  const level = firmData.riskAssessment?.riskLevel || "UNKNOWN";
  const badge = getRiskBadge(level, isDark);

  return (
    <div className={`rounded-xl border overflow-hidden ${s.border} ${s.card}`}>

      <button
        onClick={onClick}
        className={`w-full px-5 py-4 text-left transition-colors border-b ${s.divider} ${s.rowHover}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${s.cardInner} ${s.border}`}>
              <span className={`text-sm font-bold ${s.body}`}>{firmData.firm?.number ?? "?"}</span>
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-wider ${s.faint}`}>Firm {firmData.firm?.number}</p>
              <p className={`text-2xl font-semibold tabular-nums leading-none mt-0.5 ${getScoreText(score)}`}>
                {score}
                <span className={`text-sm font-normal ml-0.5 ${s.faint}`}>/100</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide border ${badge}`}>
              {level}
            </span>
            <span className={`text-[11px] ${s.faint}`}>History →</span>
          </div>
        </div>
      </button>

      <div className="p-5 space-y-5">
        <div className="flex gap-5 items-start">
          <div className="shrink-0">
            <RiskGauge score={score} isDark={isDark} />
          </div>
          {firmData.breakdown && (
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] uppercase tracking-widest font-medium mb-2.5 ${s.faint}`}>Risk Breakdown</p>
              <RiskBreakdown breakdown={firmData.breakdown} isDark={isDark} />
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className={`w-full py-2 text-[11px] uppercase tracking-widest border-t transition-colors pt-3 ${s.divider} ${s.faint}`}
        >
          {expanded ? "▲  collapse" : "▼  show inputs & customers"}
        </button>

        {expanded && (
          <div className={`space-y-6 border-t pt-4 ${s.divider}`}>
            {firmData.inputs && <InputsDisplay inputs={firmData.inputs} isDark={isDark} />}

            {firmData.customerMetrics && (
              <CustomerMetricsDisplay
                metrics={firmData.customerMetrics}
                movements={firmData.customerMovements}
                isDark={isDark}
              />
            )}

            {firmData.recommendations?.length > 0 && (
              <div className="space-y-2">
                <p className={`text-[11px] uppercase tracking-widest font-medium ${s.faint}`}>Recommendations</p>
                <div className="space-y-1.5">
                  {firmData.recommendations.map((rec, i) => (
                    <div key={i} className={`flex items-start gap-2.5 text-[12px] ${s.label}`}>
                      <span className={`mt-0.5 shrink-0 ${s.faint}`}>—</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {firmData.createdAt && (
              <p className={`text-[10px] ${s.faint}`}>
                Updated {new Date(firmData.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STAT TILE
// ============================================================================
const StatTile = ({ label, value, accent, isDark }) => {
  const s = tk(isDark);
  return (
    <div className={`rounded-lg border p-4 ${s.border} ${s.card}`}>
      <p className={`text-[11px] uppercase tracking-wider mb-2 ${s.faint}`}>{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${accent || s.heading}`}>{value}</p>
    </div>
  );
};

// ============================================================================
// MAIN SCRM TAB
// ============================================================================
export default function SCRMTab({
  theme,
  isDark,
  simulation,
  scrmData,
  fetchScrmData,
  fetchScrmHistory,
  selectedQuarter,
}) {
  const currentQuarter = selectedQuarter || simulation?.currentQuarter || 1;
  const [expandedFirms,    setExpandedFirms]    = useState({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [firmHistory,      setFirmHistory]      = useState(null);
  const [loadingHistory,   setLoadingHistory]   = useState(false);

  const s = tk(isDark);

  const handleLoad = async () => { await fetchScrmData(currentQuarter); };

  const handleLoadFirmHistory = async (firm) => {
    setLoadingHistory(true);
    setShowHistoryModal(true);
    if (fetchScrmHistory) {
      const history = await fetchScrmHistory(firm._id || firm.id);
      if (history) setFirmHistory(history);
    }
    setLoadingHistory(false);
  };

  const toggleFirmExpand = (id) =>
    setExpandedFirms((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!scrmData?.firms) {
    return (
      <div className={`rounded-xl border p-16 ${s.border} ${s.card}`}>
        <div className="text-center space-y-4">
          <p className={`text-4xl ${s.faint}`}>◫</p>
          <p className={`font-semibold ${s.heading}`}>No SCRM data for Quarter {currentQuarter}</p>
          <p className={`text-sm ${s.muted}`}>Run the analysis to populate supply chain risk metrics.</p>
          <button
            onClick={handleLoad}
            className={`mt-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${s.btnBg} ${s.body}`}
          >
            Load SCRM Data
          </button>
        </div>
      </div>
    );
  }

  const firms         = scrmData.firms;
  const avgRisk       = firms.length > 0
    ? firms.reduce((acc, f) => acc + (f.riskAssessment?.totalRiskScore || 0), 0) / firms.length
    : 0;
  const totalLoyal    = firms.reduce((acc, f) => acc + (f.customerMetrics?.loyal  || 0), 0);
  const totalInPlay   = firms.reduce((acc, f) => acc + (f.customerMetrics?.inPlay || 0), 0);
  const criticalFirms = firms.filter(f => f.riskAssessment?.riskLevel === "CRITICAL").length;
  const highFirms     = firms.filter(f => f.riskAssessment?.riskLevel === "HIGH").length;
  const elevFirms     = firms.filter(f => f.riskAssessment?.riskLevel === "ELEVATED").length;

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-lg font-semibold tracking-tight ${s.heading}`}>Supply Chain Risk Management</h2>
          <p className={`text-[12px] mt-0.5 ${s.faint}`}>Quarter {scrmData.quarter} · {firms.length} firms</p>
        </div>
        <button
          onClick={handleLoad}
          className={`px-3.5 py-2 rounded-lg border text-[12px] font-medium transition-colors flex items-center gap-1.5 ${s.btnBg} ${s.muted}`}
        >
          <span>↺</span> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <StatTile isDark={isDark} label="Avg Risk" value={avgRisk.toFixed(0)} accent={getScoreText(avgRisk)} />
        <StatTile isDark={isDark} label="Loyal"    value={totalLoyal.toLocaleString()} />
        <StatTile isDark={isDark} label="In-Play"  value={totalInPlay.toLocaleString()} />
        <StatTile isDark={isDark} label="Critical" value={criticalFirms} accent={criticalFirms > 0 ? "text-red-500" : s.muted} />
        <StatTile isDark={isDark} label="High"     value={highFirms}     accent={highFirms > 0     ? "text-red-500" : s.muted} />
        <StatTile isDark={isDark} label="Elevated" value={elevFirms}     accent={elevFirms > 0     ? "text-amber-500" : s.muted} />
      </div>

      <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] border-t pt-4 ${s.divider} ${s.faint}`}>
        <span className={`uppercase tracking-wider font-medium mr-1 ${s.faint}`}>Scale</span>
        <span>LOW  0–30</span>
        <span>MODERATE  31–50</span>
        <span className="text-amber-500">ELEVATED  51–70</span>
        <span className="text-red-500">HIGH  71–85</span>
        <span className="text-red-600">CRITICAL  86–100</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {firms.map((firmData, idx) => {
          const firmId = firmData.firm?.id || firmData.firm?._id || idx;
          return (
            <FirmScrmCard
              key={`firm-${firmId}`}
              firmData={firmData}
              isDark={isDark}
              onClick={() => handleLoadFirmHistory(firmData.firm)}
              expanded={expandedFirms[firmId] || false}
              onToggleExpand={() => toggleFirmExpand(firmId)}
            />
          );
        })}
      </div>

      {firms.length === 0 && (
        <div className={`rounded-xl border p-8 text-center ${s.border}`}>
          <p className={`text-sm ${s.muted}`}>No firm data available for this quarter.</p>
        </div>
      )}

      <FirmScrmHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        firmHistory={firmHistory}
        loading={loadingHistory}
        isDark={isDark}
        theme={theme}
      />
    </div>
  );
}