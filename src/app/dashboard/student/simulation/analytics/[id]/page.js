"use client";

/**
 * StudentAnalyticsPage
 *
 * Endpoint: GET /simulations/:simulationId/firms/:firmId/analytics-dashboard?quarter=X
 *
 * Response shape (from getAnalyticsDashboard in simulation.service.ts):
 *   featureEnabled    boolean
 *   panels.financial  { revenue, revenueGrowth, netIncome, netMarginPct,
 *                       grossMarginPct, cash, cogs, operatingExpenses }
 *   panels.customer   { csi, csiTrend, csiStatus, marketSharePct, fillRatePct,
 *                       fillRateStatus, returnRatePct, customersLoyal,
 *                       customersInPlay, customersChurned }
 *   panels.operations { perfectOrderPct, perfectOrderStatus, capacityUtilPct,
 *                       capacityStatus, defectRatePct, defectStatus,
 *                       onTimeDeliveryPct, forecastAccuracyPct, forecastStatus,
 *                       unitsProduced, unitsSold, totalCapacity }
 *   panels.inventory  { rawMaterialUnits, finishedGoodsUnits, inventoryValue,
 *                       inventoryTurnover, weeksOfSupply, retailerInventory,
 *                       inTransitUnits, rawMaterialStatus, finishedGoodsStatus }
 *   panels.learning   { techSystemsCount, techSystemsOwned, scMaturity,
 *                       techInvestmentTotal, forecastAccuracyPct, maturityStatus }
 *   costBreakdown     { labor, holding, marketing, quality, freight,
 *                       techMaintenance, interest, vmiSetup, vmiOngoing, total }
 *   bscSnapshot       { financial, customer, process, learning, overall, rank, grade }
 *   trendSeries[]     { quarter, revenue, netIncome, cash, csi, marketSharePct,
 *                       fillRatePct, perfectOrderPct, capacityUtilPct,
 *                       forecastAccuracyPct, defectRatePct, bscOverall }
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../../components/StudentHeader";
import StudentSidebar from "../../../components/StudentSidebar";

// ─── THEME ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6", bgSurface: "#FFFFFF", bgElevated: "#F9FAFB",
  bgHover: "#F3F4F6", border: "#E5E7EB", borderStrong: "#D1D5DB",
  textPrimary: "#111827", textSec: "#374151", textMuted: "#6B7280",
  accent: "#1D4ED8", accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  green: "#065F46", greenBg: "#D1FAE5", greenBorder: "#6EE7B7",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
  red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  purple: "#5B21B6", purpleBg: "#EDE9FE", purpleBorder: "#C4B5FD",
  teal: "#065F46", tealBg: "#CCFBF1", tealBorder: "#5EEAD4",
  shadow: "0 1px 3px rgba(0,0,0,0.08)", shadowMd: "0 4px 6px rgba(0,0,0,0.05)",
  tableHead: "#F9FAFB",
};

const DARK = {
  bgPage: "#0D1117", bgSurface: "#161B22", bgElevated: "#1C2128",
  bgHover: "#21262D", border: "#30363D", borderStrong: "#444C56",
  textPrimary: "#E6EDF3", textSec: "#8D96A0", textMuted: "#545D68",
  accent: "#4493F8", accentLight: "#1A2332", accentBorder: "#1F3A5F",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)", greenBorder: "rgba(63,185,80,0.30)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)", redBorder: "rgba(248,81,73,0.30)",
  purple: "#C4B5FD", purpleBg: "rgba(139,92,246,0.10)", purpleBorder: "rgba(139,92,246,0.30)",
  teal: "#5EEAD4", tealBg: "rgba(20,184,166,0.10)", tealBorder: "rgba(20,184,166,0.30)",
  shadow: "0 1px 3px rgba(0,0,0,0.30)", shadowMd: "0 4px 8px rgba(0,0,0,0.40)",
  tableHead: "#1C2128",
};

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const fmt = (v) => {
  if (v == null) return "—";
  const n = Number(v);
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};
const num = (v) => (v != null ? Math.round(Number(v)).toLocaleString() : "—");
const p1  = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");
const p2  = (v) => (v != null ? `${Number(v).toFixed(2)}%` : "—");

// ─── STATUS → THEME COLOUR ────────────────────────────────────────────────────
const statusColor = (s, t) => ({
  OK:           { color: t.green,  bg: t.greenBg,  border: t.greenBorder  },
  WARN:         { color: t.amber,  bg: t.amberBg,  border: t.amberBorder  },
  CRITICAL:     { color: t.red,    bg: t.redBg,    border: t.redBorder    },
  OPTIMAL:      { color: t.green,  bg: t.greenBg,  border: t.greenBorder  },
  HIGH:         { color: t.amber,  bg: t.amberBg,  border: t.amberBorder  },
  UNDERUTILISED:{ color: t.amber,  bg: t.amberBg,  border: t.amberBorder  },
  BASIC:        { color: t.textMuted, bg: t.bgElevated, border: t.border  },
  DEVELOPING:   { color: t.amber,  bg: t.amberBg,  border: t.amberBorder  },
  ADVANCED:     { color: t.green,  bg: t.greenBg,  border: t.greenBorder  },
}[s] || { color: t.textMuted, bg: t.bgElevated, border: t.border });

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Badge = ({ status, label, t }) => {
  const s = statusColor(status, t);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {label || status}
    </span>
  );
};

const Card = ({ title, headerRight, children, noPad, t }) => (
  <div style={{
    background: t.bgSurface, border: `1px solid ${t.border}`,
    borderRadius: 8, overflow: "hidden", boxShadow: t.shadow,
  }}>
    {title && (
      <div style={{
        padding: "11px 16px", borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: t.bgElevated,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{title}</span>
        {headerRight}
      </div>
    )}
    {noPad ? children : <div style={{ padding: 16 }}>{children}</div>}
  </div>
);

const KRow = ({ label, value, valueColor, t }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "6px 0", borderBottom: `1px solid ${t.border}`,
  }}>
    <span style={{ fontSize: 12, color: t.textMuted }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || t.textPrimary, fontFamily: "SF Mono,Consolas,monospace" }}>
      {value}
    </span>
  </div>
);

// Mini sparkline bar (normalised 0–100)
const Gauge = ({ value, max = 100, color, t }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height: 4, background: t.bgElevated, borderRadius: 3, border: `1px solid ${t.border}`, overflow: "hidden", marginTop: 4 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width .4s ease" }} />
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StudentAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [simulation,     setSimulation]     = useState(null);
  const [firm,           setFirm]           = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [analytics,      setAnalytics]      = useState(null);
  const [dataVisibility, setDataVisibility] = useState(null);
  const [loadingVisibility, setLoadingVisibility] = useState(false);

  const firmInitials = firm?.name
    ? firm.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const navItems = [
    { id: "dashboard",  label: "Dashboard",    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "decisions",  label: "Decisions",    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id: "results",    label: "Results",      d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "financials", label: "Financials",   d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "analytics",  label: "Analytics",    d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "risk",       label: "Risk Monitor", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  const getToken = useCallback(() => localStorage.getItem("access_token"), []);
  const apiFetch = useCallback(async (url) => {
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (r.ok) return r.json();
    } catch {}
    return null;
  }, [getToken]);

  const fetchQuarterDataVisibility = useCallback(async (quarter = null) => {
    try {
      setLoadingVisibility(true);
      let url = `${apiUrl}/simulations/${params.id}/quarter-data-visibility`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (res.ok) {
        const d = await res.json();
        setDataVisibility(d);
        return d;
      }
    } catch (err) {
      console.error("Error fetching data visibility:", err);
    } finally {
      setLoadingVisibility(false);
    }
  }, [params.id, apiUrl, getToken]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const userId   = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "student") { router.push("/login"); return; }

      const simData = await apiFetch(`${apiUrl}/simulations/${params.id}`);
      if (!simData) { setError("Failed to load simulation"); setLoading(false); return; }
      setSimulation(simData);

      let sf = null;
      for (const f of simData.firms || []) {
        const found = f.enrollments?.find(e => {
          const eid = e.user?.id || e.user?._id || e.userId;
          return eid?.toString() === userId?.toString();
        });
        if (found) { sf = f; setFirm(f); break; }
      }
      if (!sf) { setError("Firm not found"); setLoading(false); return; }

      const qData   = await apiFetch(`${apiUrl}/simulations/${params.id}/current-quarter`);
      const quarter = qData?.quarter || simData.currentQuarter;
      setCurrentQuarter(quarter);

      const fid  = sf.id || sf._id;
      const dash = await apiFetch(
        `${apiUrl}/simulations/${params.id}/firms/${fid}/analytics-dashboard?quarter=${quarter}`
      );
      setAnalytics(dash || null);
      setLoading(false);
    };
    load();
  }, [params.id, apiUrl, apiFetch, router]);

  // Fetch visibility on load and set up polling
  useEffect(() => {
    fetchQuarterDataVisibility(currentQuarter);
  }, [params.id, currentQuarter, fetchQuarterDataVisibility]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuarterDataVisibility(currentQuarter);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchQuarterDataVisibility, currentQuarter]);

  // ─── LOADING ─────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${t.border}`, borderTopColor: t.accent, margin: "0 auto 14px", animation: "spin .75s linear infinite" }} />
          <p style={{ color: t.textMuted }}>Loading analytics…</p>
        </div>
      </div>
    </>
  );

  const fin  = analytics?.panels?.financial  || {};
  const cust = analytics?.panels?.customer   || {};
  const ops  = analytics?.panels?.operations || {};
  const inv  = analytics?.panels?.inventory  || {};
  const lrn  = analytics?.panels?.learning   || {};
  const cost = analytics?.costBreakdown      || null;
  const bsc  = analytics?.bscSnapshot        || null;
  const trend= analytics?.trendSeries        || [];

  // Cost chart helpers
  const costItems = cost ? [
    { label: "Labor",            value: cost.labor,           color: t.accent  },
    { label: "Holding",          value: cost.holding,         color: t.amber   },
    { label: "Marketing",        value: cost.marketing,       color: t.purple  },
    { label: "Quality",          value: cost.quality,         color: t.teal    },
    { label: "Freight",          value: cost.freight,         color: t.green   },
    { label: "Tech Maintenance", value: cost.techMaintenance, color: "#6366F1" },
    { label: "Interest",         value: cost.interest,        color: t.red     },
    { label: "VMI Setup",        value: cost.vmiSetup,        color: "#EC4899" },
    { label: "VMI Ongoing",      value: cost.vmiOngoing,      color: "#F97316" },
  ].filter(c => c.value > 0) : [];

  const maxCost = costItems.length ? Math.max(...costItems.map(c => c.value)) : 1;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, color: t.textPrimary, fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", fontSize: 14 }}>

        <StudentHeader
          simulation={simulation}
          currentQuarter={currentQuarter}
          firm={firm}
          firmInitials={firmInitials}
          onDecisionsClick={() => router.push(`/dashboard/student/simulation/decisions/${params.id}`)}
        />

        <div style={{ display: "flex" }}>
          <StudentSidebar navItems={navItems} activeTab="analytics" simId={params.id} />

          <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: "hidden" }}>

            {/* Error */}
            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: t.redBg, border: `1px solid ${t.redBorder}`, color: t.red, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Data visibility check */}
            {(dataVisibility?.showQuarterData === false) && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <svg width="44" height="44" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>Analytics Data Not Available</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Your instructor has restricted access to analytics data for this period.</p>
              </div>
            )}

            {/* Analytics content - only show when data is visible */}
            {(dataVisibility?.showQuarterData !== false) && (
              <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>
                Analytics Dashboard
              </h1>
              <p style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                Q{currentQuarter || "—"} · {firm?.name || "—"}
                {bsc?.rank ? ` · Rank #${bsc.rank}` : ""}
              </p>
            </div>

            {/* Feature not enabled */}
            {analytics && !analytics.featureEnabled && (
              <div style={{ padding: "32px 24px", borderRadius: 8, background: t.amberBg, border: `1px solid ${t.amberBorder}`, textAlign: "center" }}>
                <svg width="40" height="40" fill="none" stroke={t.amber} viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>Analytics Not Unlocked</p>
                <p style={{ fontSize: 13, color: t.textSec }}>{analytics.message}</p>
              </div>
            )}

            {analytics?.featureEnabled && (
              <>
                {/* ── BSC SNAPSHOT STRIP ── */}
                {bsc && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "BSC Overall", value: bsc.overall?.toFixed(1) || "—", sub: `Grade ${bsc.grade || "—"}`, color: t.accent },
                      { label: "Financial",   value: bsc.financial?.toFixed(0) || "—", sub: "/ 100", color: t.green  },
                      { label: "Customer",    value: bsc.customer?.toFixed(0)  || "—", sub: "/ 100", color: t.teal   },
                      { label: "Process",     value: bsc.process?.toFixed(0)   || "—", sub: "/ 100", color: t.amber  },
                      { label: "Learning",    value: bsc.learning?.toFixed(0)  || "—", sub: "/ 100", color: t.purple },
                      { label: "Rank",        value: bsc.rank ? `#${bsc.rank}` : "—", sub: "BSC rank", color: t.red },
                    ].map(({ label, value, sub, color }) => (
                      <div key={label} style={{ background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 15px", boxShadow: t.shadow, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                        <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px", lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ROW 1: Financial + Customer ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Financial Panel */}
                  <Card title="Financial" headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter}</span>} t={t}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "Revenue",       value: fmt(fin.revenue),       color: t.accent },
                        { label: "Net Income",     value: fmt(fin.netIncome),     color: fin.netIncome >= 0 ? t.green : t.red },
                        { label: "Cash",           value: fmt(fin.cash),          color: t.teal   },
                        { label: "Rev Growth",     value: fin.revenueGrowth != null ? `${fin.revenueGrowth > 0 ? "+" : ""}${fin.revenueGrowth.toFixed(1)}%` : "—", color: fin.revenueGrowth >= 0 ? t.green : t.red },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "SF Mono,Consolas,monospace" }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <KRow label="Gross Margin"        value={p1(fin.grossMarginPct)}    t={t} />
                    <KRow label="Net Margin"          value={p1(fin.netMarginPct)}      t={t} />
                    <KRow label="COGS"                value={fmt(fin.cogs)}             t={t} />
                    <KRow label="Operating Expenses"  value={fmt(fin.operatingExpenses)} t={t} />
                  </Card>

                  {/* Customer Panel */}
                  <Card title="Customer" headerRight={<Badge status={cust.csiStatus || "OK"} t={t} />} t={t}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "CSI Score",    value: cust.csi?.toFixed(1) || "—", sub: `${cust.csiTrend >= 0 ? "+" : ""}${cust.csiTrend?.toFixed(1) || 0} vs prev`, color: t.accent },
                        { label: "Market Share", value: p1(cust.marketSharePct), sub: "% of market",  color: t.green },
                        { label: "Fill Rate",    value: p1(cust.fillRatePct),    sub: "target 95%",   color: cust.fillRatePct >= 95 ? t.green : t.amber },
                        { label: "Return Rate",  value: p2(cust.returnRatePct),  sub: "target < 2%",  color: cust.returnRatePct <= 2 ? t.green : t.red  },
                      ].map(({ label, value, sub, color }) => (
                        <div key={label} style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "SF Mono,Consolas,monospace" }}>{value}</div>
                          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{sub}</div>
                        </div>
                      ))}
                    </div>
                    <KRow label="Loyal Customers"   value={num(cust.customersLoyal)}   t={t} valueColor={t.green} />
                    <KRow label="Customers In Play" value={num(cust.customersInPlay)}  t={t} />
                    <KRow label="Churned"           value={num(cust.customersChurned)} t={t} valueColor={cust.customersChurned > 0 ? t.red : undefined} />
                    <div style={{ marginTop: 12 }}>
                      <Badge status={cust.fillRateStatus || "OK"} label={`Fill Rate: ${cust.fillRateStatus}`} t={t} />
                    </div>
                  </Card>
                </div>

                {/* ── ROW 2: Operations + Inventory ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Operations Panel */}
                  <Card title="Operations" t={t}>
                    {[
                      { label: "Perfect Order",      pct: ops.perfectOrderPct,      target: 85, status: ops.perfectOrderStatus, lowerBetter: false },
                      { label: "On-Time Delivery",   pct: ops.onTimeDeliveryPct,    target: 95, status: null, lowerBetter: false },
                      { label: "Capacity Util",      pct: ops.capacityUtilPct,      target: 77, status: ops.capacityStatus, lowerBetter: false, note: "70–85% optimal" },
                      { label: "Forecast Accuracy",  pct: ops.forecastAccuracyPct,  target: 85, status: ops.forecastStatus, lowerBetter: false },
                      { label: "Defect Rate",        pct: ops.defectRatePct,        target: 2,  status: ops.defectStatus, lowerBetter: true },
                    ].map(({ label, pct: val, target, status, note, lowerBetter }) => {
                      const ok = lowerBetter ? val <= target : val >= target;
                      const barColor = ok ? t.green : val >= (lowerBetter ? target * 1.5 : target * 0.85) ? t.amber : t.red;
                      return (
                        <div key={label} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: t.textSec }}>{label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: barColor, fontFamily: "SF Mono,Consolas,monospace" }}>
                                {val != null ? `${val.toFixed(1)}%` : "—"}
                              </span>
                              {status && <Badge status={status} t={t} />}
                            </div>
                          </div>
                          <Gauge value={val || 0} max={lowerBetter ? Math.max(val || 0, target * 2) : 100} color={barColor} t={t} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, fontSize: 10, color: t.textMuted }}>
                            <span>{note || `Target: ${lowerBetter ? "≤" : ""}${target}%`}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: 1, background: t.border, margin: "10px 0" }} />
                    <KRow label="Units Produced" value={num(ops.unitsProduced)} t={t} />
                    <KRow label="Units Sold"     value={num(ops.unitsSold)}     t={t} />
                    {ops.totalCapacity > 0 && <KRow label="Total Capacity" value={num(ops.totalCapacity)} t={t} />}
                  </Card>

                  {/* Inventory Panel */}
                  <Card title="Inventory" headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter}</span>} t={t}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "Raw Materials",    value: num(inv.rawMaterialUnits),    status: inv.rawMaterialStatus,    unit: "units" },
                        { label: "Finished Goods",   value: num(inv.finishedGoodsUnits),  status: inv.finishedGoodsStatus,  unit: "units" },
                        { label: "In Transit",       value: num(inv.inTransitUnits),      status: null,                     unit: "units" },
                        { label: "Retailer Inv",     value: num(inv.retailerInventory),   status: null,                     unit: "units" },
                      ].map(({ label, value, status, unit }) => (
                        <div key={label} style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                            {status && <Badge status={status} t={t} />}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, fontFamily: "SF Mono,Consolas,monospace" }}>{value}</div>
                          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{unit}</div>
                        </div>
                      ))}
                    </div>
                    <KRow label="Inventory Value"    value={fmt(inv.inventoryValue)}                t={t} />
                    <KRow label="Inventory Turnover" value={inv.inventoryTurnover != null ? `${inv.inventoryTurnover.toFixed(2)}×` : "—"} t={t} />
                    <KRow label="Weeks of Supply"    value={inv.weeksOfSupply    != null ? `${inv.weeksOfSupply.toFixed(1)} wks` : "—"} t={t} />
                  </Card>
                </div>

                {/* ── ROW 3: Cost Breakdown + Learning ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Cost Breakdown */}
                  {cost ? (
                    <Card title="Cost Breakdown" headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Total: {fmt(cost.total)}</span>} t={t}>
                      {costItems.map(({ label, value, color }) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: t.textSec }}>{label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, fontFamily: "SF Mono,Consolas,monospace" }}>{fmt(value)}</span>
                          </div>
                          <div style={{ height: 6, background: t.bgElevated, borderRadius: 3, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(value / maxCost) * 100}%`, background: color, borderRadius: 3, transition: "width .4s ease" }} />
                          </div>
                        </div>
                      ))}
                      {costItems.length === 0 && (
                        <p style={{ fontSize: 13, color: t.textMuted, textAlign: "center", padding: "16px 0" }}>No cost data for this quarter</p>
                      )}
                    </Card>
                  ) : (
                    <Card title="Cost Breakdown" t={t}>
                      <p style={{ fontSize: 13, color: t.textMuted, textAlign: "center", padding: "16px 0" }}>No cost data available</p>
                    </Card>
                  )}

                  {/* Learning & Growth Panel */}
                  <Card title="Learning & Growth" headerRight={<Badge status={lrn.maturityStatus === "OK" ? "ADVANCED" : lrn.maturityStatus === "WARN" ? "DEVELOPING" : "BASIC"} t={t} />} t={t}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `4px solid ${lrn.techSystemsCount >= 4 ? t.green : lrn.techSystemsCount >= 2 ? t.amber : t.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{lrn.techSystemsCount || 0}</span>
                        <span style={{ fontSize: 9, color: t.textMuted }}>TECH</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 2 }}>
                          {lrn.scMaturity || "BASIC"} SC Maturity
                        </div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>
                          {lrn.techSystemsCount >= 4 ? "Advanced: 4+ systems, high PO" : lrn.techSystemsCount >= 2 ? "Developing: 2+ systems" : "Basic: invest in technology"}
                        </div>
                        <div style={{ height: 5, background: t.bgElevated, borderRadius: 3, overflow: "hidden", border: `1px solid ${t.border}` }}>
                          <div style={{ height: "100%", width: `${Math.min((lrn.techSystemsCount || 0) / 8 * 100, 100)}%`, background: lrn.techSystemsCount >= 4 ? t.green : t.amber, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{lrn.techSystemsCount || 0} / 8 systems owned</div>
                      </div>
                    </div>

                    {/* Tech owned list */}
                    {lrn.techSystemsOwned?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Owned Systems</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {lrn.techSystemsOwned.map(tech => (
                            <span key={tech} style={{ padding: "2px 8px", borderRadius: 4, background: t.greenBg, border: `1px solid ${t.greenBorder}`, fontSize: 11, fontWeight: 600, color: t.green }}>
                              {tech.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <KRow label="Forecast Accuracy" value={p1(lrn.forecastAccuracyPct)} t={t} />
                    {lrn.techInvestmentTotal > 0 && (
                      <KRow label="Total Tech Investment" value={fmt(lrn.techInvestmentTotal)} t={t} />
                    )}
                  </Card>
                </div>

                {/* ── TREND TABLE ── */}
                {trend.length > 0 && (
                  <Card title="Quarter-over-Quarter Trend" headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>{trend.length} quarters</span>} noPad t={t}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: t.tableHead }}>
                            {[
                              { label: "Quarter",       align: "left"  },
                              { label: "Revenue",       align: "right" },
                              { label: "Net Income",    align: "right" },
                              { label: "Cash",          align: "right" },
                              { label: "CSI",           align: "right" },
                              { label: "Market Share",  align: "right" },
                              { label: "Fill Rate",     align: "right" },
                              { label: "Perfect Order", align: "right" },
                              { label: "Capacity Util", align: "right" },
                              { label: "Forecast Acc",  align: "right" },
                              { label: "BSC",           align: "right" },
                            ].map(h => (
                              <th key={h.label} style={{ padding: "9px 12px", textAlign: h.align, fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                                {h.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...trend].sort((a, b) => (a.quarter || 0) - (b.quarter || 0)).map((row, i) => {
                            const isCurrent = row.quarter === currentQuarter;
                            return (
                              <tr key={i} style={{
                                borderBottom: `1px solid ${t.border}`,
                                background: isCurrent
                                  ? isDark ? "rgba(68,147,248,0.08)" : "rgba(29,78,216,0.04)"
                                  : i % 2 === 1 ? t.bgElevated : t.bgSurface,
                              }}>
                                <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? t.accent : t.textPrimary, whiteSpace: "nowrap" }}>
                                  Q{row.quarter}
                                  {isCurrent && <span style={{ marginLeft: 5, fontSize: 10, background: t.accent, color: "#fff", padding: "1px 4px", borderRadius: 3 }}>Now</span>}
                                </td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>{fmt(row.revenue)}</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: row.netIncome >= 0 ? t.green : t.red }}>{fmt(row.netIncome)}</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>{fmt(row.cash)}</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: row.csi >= 80 ? t.green : row.csi >= 70 ? t.amber : t.red, fontWeight: 600 }}>{row.csi?.toFixed(1) || "—"}</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: t.textSec }}>{row.marketSharePct?.toFixed(1) || "—"}%</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: row.fillRatePct >= 95 ? t.green : row.fillRatePct >= 85 ? t.amber : t.red }}>{row.fillRatePct?.toFixed(1) || "—"}%</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: row.perfectOrderPct >= 85 ? t.green : row.perfectOrderPct >= 75 ? t.amber : t.red }}>{row.perfectOrderPct?.toFixed(1) || "—"}%</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: row.capacityUtilPct >= 70 && row.capacityUtilPct <= 85 ? t.green : t.amber }}>{row.capacityUtilPct?.toFixed(1) || "—"}%</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", color: row.forecastAccuracyPct >= 85 ? t.green : row.forecastAccuracyPct >= 75 ? t.amber : t.red }}>{row.forecastAccuracyPct?.toFixed(1) || "—"}%</td>
                                <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontWeight: 700, color: t.textPrimary }}>{row.bscOverall?.toFixed(1) || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: "8px 14px", borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.textMuted }}>
                      Colour coding: green = on target · amber = at risk · red = below threshold
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}
          </main>
        </div>
      </div>
    </>
  );
}