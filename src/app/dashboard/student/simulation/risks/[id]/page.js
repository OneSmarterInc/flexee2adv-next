"use client";

/**
 * StudentRiskPage — Supply Chain Risk Monitor
 *
 * Endpoints:
 *   GET /simulations/:id/scrm?quarter=X
 *     → { simulation, quarter, firms: [{ firm, riskAssessment, breakdown,
 *          customerMetrics, customerMovements, segmentAllocation,
 *          retentionMetrics, inputs, recommendations }] }
 *
 *   GET /simulations/:id/firms/:firmId/scrm-history
 *     → { simulation, firm, quarters: [{ quarter, riskAssessment, breakdown,
 *          customerMetrics, customerMovements, retentionMetrics, recommendations }] }
 *
 * riskAssessment:   { totalRiskScore, riskLevel, riskColor, riskDescription }
 * breakdown:        { supplierConcentration, inventoryBuffer, demandVolatility,
 *                     financialHealth, operational }  — each with score, weight, level
 * customerMetrics:  { loyal, inPlay, competitor }
 * customerMovements:{ churnedToCompetitor, degradedFromLoyal, wonBackFromCompetitor,
 *                     newEntrants, growthConverted, atRiskSaved }
 * recommendations:  string[]
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../../components/StudentHeader";
import StudentSidebar from "../../../components/StudentSidebar";

// ─── THEME ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage:"#F3F4F6", bgSurface:"#FFFFFF", bgElevated:"#F9FAFB",
  border:"#E5E7EB", borderStrong:"#D1D5DB",
  textPrimary:"#111827", textSec:"#374151", textMuted:"#6B7280",
  accent:"#1D4ED8", accentLight:"#EFF6FF", accentBorder:"#BFDBFE",
  green:"#065F46", greenBg:"#D1FAE5", greenBorder:"#6EE7B7",
  amber:"#92400E", amberBg:"#FEF3C7", amberBorder:"#FCD34D",
  red:"#991B1B", redBg:"#FEE2E2", redBorder:"#FECACA",
  purple:"#5B21B6", purpleBg:"#EDE9FE", purpleBorder:"#C4B5FD",
  shadow:"0 1px 3px rgba(0,0,0,0.08)", tableHead:"#F9FAFB",
};
const DARK = {
  bgPage:"#0D1117", bgSurface:"#161B22", bgElevated:"#1C2128",
  border:"#30363D", borderStrong:"#444C56",
  textPrimary:"#E6EDF3", textSec:"#8D96A0", textMuted:"#545D68",
  accent:"#4493F8", accentLight:"#1A2332", accentBorder:"#1F3A5F",
  green:"#3FB950", greenBg:"rgba(63,185,80,0.10)", greenBorder:"rgba(63,185,80,0.30)",
  amber:"#D29922", amberBg:"rgba(210,153,34,0.10)", amberBorder:"rgba(210,153,34,0.30)",
  red:"#F85149", redBg:"rgba(248,81,73,0.10)", redBorder:"rgba(248,81,73,0.30)",
  purple:"#C4B5FD", purpleBg:"rgba(139,92,246,0.10)", purpleBorder:"rgba(139,92,246,0.30)",
  shadow:"0 1px 3px rgba(0,0,0,0.30)", tableHead:"#1C2128",
};

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const num  = (v) => (v != null ? Math.round(Number(v)).toLocaleString() : "—");
const pct  = (v, dp = 1) => (v != null ? `${Number(v).toFixed(dp)}%` : "—");

// Risk level → theme colours
const riskPalette = (level, t) => ({
  LOW:      { color: t.green,  bg: t.greenBg,  border: t.greenBorder,  label: "Low Risk"    },
  MEDIUM:   { color: t.amber,  bg: t.amberBg,  border: t.amberBorder,  label: "Medium Risk" },
  HIGH:     { color: t.red,    bg: t.redBg,    border: t.redBorder,    label: "High Risk"   },
  CRITICAL: { color: t.red,    bg: t.redBg,    border: t.redBorder,    label: "Critical"    },
}[level?.toUpperCase()] || { color: t.textMuted, bg: t.bgElevated, border: t.border, label: level || "—" });

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Card = ({ title, headerRight, children, noPad, t }) => (
  <div style={{ background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8, overflow: "hidden", boxShadow: t.shadow }}>
    {title && (
      <div style={{ padding: "11px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: t.bgElevated }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{title}</span>
        {headerRight}
      </div>
    )}
    {noPad ? children : <div style={{ padding: 16 }}>{children}</div>}
  </div>
);

const RiskBadge = ({ level, t }) => {
  const p = riskPalette(level, t);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: p.color, background: p.bg, border: `1px solid ${p.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
      {p.label}
    </span>
  );
};

// Radial-style risk score dial (SVG donut)
const RiskDial = ({ score, level, t }) => {
  const p     = riskPalette(level, t);
  const pctV  = Math.min(100, Math.max(0, score || 0));
  const dash  = `${pctV}, 100`;
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke={t.border} strokeWidth="3.5" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke={p.color} strokeWidth="3.5"
          strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, lineHeight: 1 }}>{score != null ? Math.round(score) : "—"}</span>
        <span style={{ fontSize: 9, color: t.textMuted, fontWeight: 600 }}>/ 100</span>
      </div>
    </div>
  );
};

// Breakdown category row with mini bar
const BreakdownRow = ({ label, score, weight, level, t }) => {
  const p = riskPalette(level, t);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 12, color: t.textSec }}>{label}</span>
          {weight != null && <span style={{ fontSize: 10, color: t.textMuted, marginLeft: 6 }}>({(weight * 100).toFixed(0)}% weight)</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: "SF Mono,Consolas,monospace" }}>
            {score != null ? Math.round(score) : "—"}
          </span>
          <span style={{ padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, color: p.color, background: p.bg, border: `1px solid ${p.border}` }}>{level || "—"}</span>
        </div>
      </div>
      <div style={{ height: 5, background: t.bgElevated, borderRadius: 3, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(score || 0, 100)}%`, background: p.color, borderRadius: 3, transition: "width .4s ease" }} />
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StudentRiskPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [simulation,     setSimulation]     = useState(null);
  const [firm,           setFirm]           = useState(null);
  const [firmId,         setFirmId]         = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [scrmCurrent,    setScrmCurrent]    = useState(null);   // all firms, current Q
  const [scrmHistory,    setScrmHistory]    = useState(null);   // this firm, all Q
  const [activeTab,      setActiveTab]      = useState("overview"); // overview | history
  const [dataVisibility, setDataVisibility] = useState(null);
  const [loadingVisibility, setLoadingVisibility] = useState(false);

  const firmInitials = firm?.name
    ? firm.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const navItems = [
    { id:"dashboard",  label:"Dashboard",    d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id:"decisions",  label:"Decisions",    d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id:"results",    label:"Results",      d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id:"financials", label:"Financials",   d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id:"analytics",  label:"Analytics",   d:"M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id:"risk",       label:"Risk Monitor", d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  const getToken = useCallback(() => localStorage.getItem("access_token"), []);
  const apiFetch = useCallback(async (url) => {
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (r.ok) return r.json();
    } catch {}
    return null;
  }, [getToken]);

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

      const fid = sf.id || sf._id;
      setFirmId(fid);

      const qData   = await apiFetch(`${apiUrl}/simulations/${params.id}/current-quarter`);
      const quarter = qData?.quarter || simData.currentQuarter;
      setCurrentQuarter(quarter);

      // Fire both endpoints in parallel; both may 404 if no data yet — that's fine
      const [current, history] = await Promise.all([
        apiFetch(`${apiUrl}/simulations/${params.id}/scrm?quarter=${quarter-1}`),
        apiFetch(`${apiUrl}/simulations/${params.id}/firms/${fid}/scrm-history`),
      ]);

      setScrmCurrent(current || null);
      setScrmHistory(history || null);
      setLoading(false);
    };
    load();
  }, [params.id, apiUrl, apiFetch, router]);

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

  // Fetch visibility on load
  useEffect(() => {
    fetchQuarterDataVisibility(currentQuarter);
  }, [params.id, currentQuarter, fetchQuarterDataVisibility]);

  // 5-second polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuarterDataVisibility(currentQuarter);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchQuarterDataVisibility, currentQuarter]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  // Find this firm's row in the current-quarter SCRM response
  const myFirmRow = scrmCurrent?.firms?.find(
    f => f.firm?.id?.toString() === firmId?.toString() ||
         f.firm?.number?.toString() === firm?.firmNumber?.toString()
  );

  // Normalise breakdown into a consistent array regardless of backend key naming
  const parseBreakdown = (bd) => {
    if (!bd) return [];
    const LABELS = {
      supplierConcentration: "Supplier Concentration",
      inventoryBuffer:       "Inventory Buffer",
      demandVolatility:      "Demand Volatility",
      financialHealth:       "Financial Health",
      operational:           "Operational",
    };
    return Object.entries(bd).map(([key, val]) => {
      const v = typeof val === "object" && val !== null ? val : { score: val };
      return {
        key,
        label:  LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
        score:  v.score  ?? v.value  ?? null,
        weight: v.weight ?? null,
        level:  v.level  ?? null,
      };
    });
  };

  if (loading) return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${t.border}`, borderTopColor: t.accent, margin: "0 auto 14px", animation: "spin .75s linear infinite" }} />
          <p style={{ color: t.textMuted }}>Loading risk data…</p>
        </div>
      </div>
    </>
  );

  const noData = !scrmCurrent && !scrmHistory;

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
          <StudentSidebar navItems={navItems} activeTab="risk" simId={params.id} />

          <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: "hidden" }}>

            {/* Error banner */}
            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: t.redBg, border: `1px solid ${t.redBorder}`, color: t.red, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>Risk Monitor</h1>
                <p style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                  Q{currentQuarter || "—"} · {firm?.name || "—"} · Supply Chain Risk Assessment
                </p>
              </div>
              {/* Tab switcher */}
              <div style={{ display: "flex", gap: 0, border: `1px solid ${t.border}`, borderRadius: 6, overflow: "hidden" }}>
                {[
                  { id: "overview", label: "Q Overview"   },
                  { id: "history",  label: "My History"   },
                  { id: "peers",    label: "Peer Compare" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, background: activeTab === tab.id ? t.accent : t.bgSurface, color: activeTab === tab.id ? "#fff" : t.textSec, transition: "all .12s" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data visibility check - only show if instructor hasn't hidden data */}
            {(dataVisibility?.showQuarterData === false) && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <svg width="44" height="44" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>Risk Data Not Available</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Your instructor has restricted access to risk monitoring data for this period.</p>
              </div>
            )}

            {/* No data yet */}
            {(dataVisibility?.showQuarterData !== false) && noData && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <svg width="44" height="44" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>No SCRM data yet</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Risk data is generated after the first quarter is processed. Submit your decisions to begin.</p>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: OVERVIEW — my firm's current quarter SCRM                */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {(dataVisibility?.showQuarterData !== false) && activeTab === "overview" && myFirmRow && (
              <>
                {/* Top row: dial + risk breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Score dial card */}
                  <Card title="Risk Score" headerRight={<RiskBadge level={myFirmRow.riskAssessment?.riskLevel} t={t} />} t={t}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" }}>
                      <RiskDial score={myFirmRow.riskAssessment?.totalRiskScore} level={myFirmRow.riskAssessment?.riskLevel} t={t} />
                      <p style={{ fontSize: 12, color: t.textSec, textAlign: "center", lineHeight: 1.5 }}>
                        {myFirmRow.riskAssessment?.riskDescription || "No description available"}
                      </p>
                    </div>
                  </Card>

                  {/* Breakdown */}
                  <Card title="Risk Breakdown" t={t}>
                    {parseBreakdown(myFirmRow.breakdown).length > 0
                      ? parseBreakdown(myFirmRow.breakdown).map(cat => (
                          <BreakdownRow key={cat.key} label={cat.label} score={cat.score} weight={cat.weight} level={cat.level} t={t} />
                        ))
                      : <p style={{ fontSize: 13, color: t.textMuted }}>No breakdown data available</p>
                    }
                  </Card>
                </div>

                {/* Middle row: customer metrics + movements */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                  {/* Customer Pool */}
                  <Card title="Customer Pool" t={t}>
                    {(() => {
                      const cm = myFirmRow.customerMetrics || {};
                      const total = (cm.loyal || 0) + (cm.inPlay || 0) + (cm.competitor || 0);
                      const loyalPct  = total > 0 ? (cm.loyal    / total) * 100 : 0;
                      const inPlayPct = total > 0 ? (cm.inPlay   / total) * 100 : 0;
                      const compPct   = total > 0 ? (cm.competitor / total) * 100 : 0;
                      return (
                        <>
                          {/* Stacked bar */}
                          <div style={{ height: 18, borderRadius: 4, overflow: "hidden", display: "flex", marginBottom: 12 }}>
                            {[
                              { pct: loyalPct,  color: t.green  },
                              { pct: inPlayPct, color: t.amber  },
                              { pct: compPct,   color: t.red    },
                            ].filter(s => s.pct > 0).map((s, i) => (
                              <div key={i} style={{ width: `${s.pct}%`, background: s.color }} />
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                            {[
                              { label: "Loyal",      value: cm.loyal,      color: t.green },
                              { label: "In Play",    value: cm.inPlay,     color: t.amber },
                              { label: "Competitor", value: cm.competitor, color: t.red   },
                            ].map(({ label, value, color }) => (
                              <div key={label} style={{ flex: 1, minWidth: 80, background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "SF Mono,Consolas,monospace" }}>{num(value)}</div>
                              </div>
                            ))}
                          </div>
                          {/* Retention metrics if available */}
                          {myFirmRow.retentionMetrics && (
                            <div style={{ display: "flex", gap: 8 }}>
                              {myFirmRow.retentionMetrics.retentionBonus != null && (
                                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 6, background: t.greenBg, border: `1px solid ${t.greenBorder}`, textAlign: "center" }}>
                                  <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 2 }}>Retention Bonus</div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: t.green }}>+{num(myFirmRow.retentionMetrics.retentionBonus)}</div>
                                </div>
                              )}
                              {myFirmRow.retentionMetrics.csiImpact != null && (
                                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 6, background: t.accentLight, border: `1px solid ${t.accentBorder}`, textAlign: "center" }}>
                                  <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 2 }}>CSI Impact</div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: t.accent }}>{myFirmRow.retentionMetrics.csiImpact > 0 ? "+" : ""}{myFirmRow.retentionMetrics.csiImpact?.toFixed(1) || "—"}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </Card>

                  {/* Customer Movements */}
                  <Card title="Customer Movements" t={t}>
                    {(() => {
                      const mv = myFirmRow.customerMovements || {};
                      const items = [
                        { label: "Churned to Competitor",    value: mv.churnedToCompetitor,    icon: "↗", color: t.red   },
                        { label: "Loyal → In Play",          value: mv.degradedFromLoyal,      icon: "↓", color: t.amber },
                        { label: "Won Back from Competitor", value: mv.wonBackFromCompetitor,  icon: "↙", color: t.green },
                        { label: "New Entrants",             value: mv.newEntrants,            icon: "★", color: t.accent },
                        { label: "Growth Converted",         value: mv.growthConverted,        icon: "↑", color: t.green },
                        { label: "At-Risk Saved",            value: mv.atRiskSaved,            icon: "✓", color: t.green },
                      ].filter(item => item.value != null);

                      if (items.length === 0) {
                        return <p style={{ fontSize: 13, color: t.textMuted }}>No movement data available</p>;
                      }

                      return items.map(({ label, value, icon, color }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${t.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, color, lineHeight: 1 }}>{icon}</span>
                            <span style={{ fontSize: 12, color: t.textSec }}>{label}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "SF Mono,Consolas,monospace" }}>
                            {value > 0 ? "+" : ""}{num(value)}
                          </span>
                        </div>
                      ));
                    })()}
                  </Card>
                </div>

                {/* Recommendations */}
                {myFirmRow.recommendations?.length > 0 && (
                  <Card title="Risk Recommendations" t={t}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {myFirmRow.recommendations.map((rec, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 6, background: t.bgElevated, border: `1px solid ${t.border}` }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.accentLight, border: `1px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: t.accent }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* No data for overview tab */}
            {(dataVisibility?.showQuarterData !== false) && activeTab === "overview" && !noData && !myFirmRow && (
              <div style={{ padding: "32px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <p style={{ fontSize: 13, color: t.textMuted }}>No SCRM data available for your firm this quarter.</p>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: HISTORY — this firm's risk score across all quarters      */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {(dataVisibility?.showQuarterData !== false) && activeTab === "history" && (
              <>
                {scrmHistory?.quarters?.length > 0 ? (
                  <>
                    {/* Trend table */}
                    <Card title="Risk History" headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>{scrmHistory.quarters.length} quarters</span>} noPad t={t}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: t.tableHead }}>
                              {["Quarter","Risk Score","Level","Loyal","In Play","Competitor","Churn","Won Back"].map((h, i) => (
                                <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...scrmHistory.quarters].sort((a, b) => (a.quarter || 0) - (b.quarter || 0)).map((row, i) => {
                              const ra = row.riskAssessment || {};
                              const cm = row.customerMetrics || {};
                              const mv = row.customerMovements || {};
                              const p  = riskPalette(ra.riskLevel, t);
                              const isCurrent = row.quarter === currentQuarter;
                              return (
                                <tr key={i} style={{ borderBottom: `1px solid ${t.border}`, background: isCurrent ? (isDark ? "rgba(68,147,248,0.08)" : "rgba(29,78,216,0.04)") : i % 2 === 1 ? t.bgElevated : t.bgSurface }}>
                                  <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? t.accent : t.textPrimary }}>
                                    Q{row.quarter}{isCurrent && <span style={{ marginLeft: 6, fontSize: 10, background: t.accent, color: "#fff", padding: "1px 5px", borderRadius: 3 }}>Now</span>}
                                  </td>
                                  <td style={{ padding: "9px 14px", fontSize: 13, textAlign: "right", fontWeight: 700, color: p.color, fontFamily: "SF Mono,Consolas,monospace" }}>
                                    {ra.totalRiskScore != null ? Math.round(ra.totalRiskScore) : "—"}
                                  </td>
                                  <td style={{ padding: "9px 14px", textAlign: "right" }}>
                                    <RiskBadge level={ra.riskLevel} t={t} />
                                  </td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.green }}>{num(cm.loyal)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.amber }}>{num(cm.inPlay)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.red   }}>{num(cm.competitor)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.red   }}>{mv.churnedToCompetitor > 0 ? `-${num(mv.churnedToCompetitor)}` : "—"}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.green }}>{mv.wonBackFromCompetitor > 0 ? `+${num(mv.wonBackFromCompetitor)}` : "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Per-quarter recommendations (most recent) */}
                    {scrmHistory.quarters.slice(-1)[0]?.recommendations?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Card title={`Q${scrmHistory.quarters.slice(-1)[0].quarter} Recommendations`} t={t}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {scrmHistory.quarters.slice(-1)[0].recommendations.map((rec, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 6, background: t.bgElevated, border: `1px solid ${t.border}` }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.accentLight, border: `1px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: t.accent }}>{i + 1}</span>
                                </div>
                                <p style={{ fontSize: 13, color: t.textSec, lineHeight: 1.5 }}>{rec}</p>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "32px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 13, color: t.textMuted }}>No historical SCRM data available for your firm yet.</p>
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB: PEERS — all firms' risk scores this quarter               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {(dataVisibility?.showQuarterData !== false) && activeTab === "peers" && (
              <>
                {scrmCurrent?.firms?.length > 0 ? (
                  <Card title={`All Firms — Q${currentQuarter} Risk Comparison`} noPad t={t}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: t.tableHead }}>
                            {["Firm","Risk Score","Level","Loyal","In Play","Competitor","Top Risk Area"].map((h, i) => (
                              <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : i < 3 ? "right" : "right", fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...scrmCurrent.firms]
                            .sort((a, b) => (b.riskAssessment?.totalRiskScore || 0) - (a.riskAssessment?.totalRiskScore || 0))
                            .map((row, i) => {
                              const ra  = row.riskAssessment || {};
                              const cm  = row.customerMetrics || {};
                              const bd  = parseBreakdown(row.breakdown);
                              const p   = riskPalette(ra.riskLevel, t);
                              const isMe = row.firm?.id?.toString() === firmId?.toString() ||
                                           row.firm?.number?.toString() === firm?.firmNumber?.toString();
                              // Highest-scoring (worst) category
                              const topRisk = bd.length
                                ? bd.reduce((max, c) => (c.score || 0) > (max.score || 0) ? c : max, bd[0])
                                : null;
                              return (
                                <tr key={i} style={{ borderBottom: `1px solid ${t.border}`, background: isMe ? (isDark ? "rgba(68,147,248,0.08)" : "rgba(29,78,216,0.04)") : i % 2 === 1 ? t.bgElevated : t.bgSurface }}>
                                  <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: isMe ? 600 : 400, color: isMe ? t.accent : t.textPrimary }}>
                                    {row.firm?.name || `Firm ${row.firm?.number || i + 1}`}
                                    {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: t.accent, fontWeight: 500 }}>(You)</span>}
                                  </td>
                                  <td style={{ padding: "9px 14px", textAlign: "right", fontSize: 13, fontWeight: 700, color: p.color, fontFamily: "SF Mono,Consolas,monospace" }}>
                                    {ra.totalRiskScore != null ? Math.round(ra.totalRiskScore) : "—"}
                                  </td>
                                  <td style={{ padding: "9px 14px", textAlign: "right" }}>
                                    <RiskBadge level={ra.riskLevel} t={t} />
                                  </td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", color: t.green, fontFamily: "SF Mono,Consolas,monospace" }}>{num(cm.loyal)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", color: t.amber, fontFamily: "SF Mono,Consolas,monospace" }}>{num(cm.inPlay)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", color: t.red,   fontFamily: "SF Mono,Consolas,monospace" }}>{num(cm.competitor)}</td>
                                  <td style={{ padding: "9px 14px", fontSize: 12, textAlign: "right", color: t.textSec }}>
                                    {topRisk ? (
                                      <span style={{ padding: "2px 7px", borderRadius: 4, background: riskPalette(topRisk.level, t).bg, border: `1px solid ${riskPalette(topRisk.level, t).border}`, color: riskPalette(topRisk.level, t).color, fontSize: 11, fontWeight: 600 }}>
                                        {topRisk.label}
                                      </span>
                                    ) : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: "8px 14px", borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.textMuted }}>
                      Higher risk score = higher risk. Your row is highlighted in blue.
                    </div>
                  </Card>
                ) : (
                  <div style={{ padding: "32px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 13, color: t.textMuted }}>Peer comparison data not available for this quarter.</p>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}