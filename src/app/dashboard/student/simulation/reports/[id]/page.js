"use client";

/**
 * StudentResultsPage — Wired to 10-Q Report endpoints
 *
 * SIDEBAR FIX: Replaced inline <aside> with shared StudentSidebar component.
 *   - Removed NAV array with hardcoded/broken hrefs
 *   - Removed inline <aside> block entirely
 *   - Added navItems array (same shape as dashboard)
 *   - activeTab="results" passed to StudentSidebar
 *   - All routing now lives in StudentSidebar's ROUTES map (correct paths,
 *     disabled analytics/risk get "SOON" labels automatically)
 *
 * PRIMARY ENDPOINTS (from TenqReportController):
 *  GET /reports/tenq/:simId/:firmId                        → allReports[]
 *  GET /reports/tenq/:simId/:firmId/trend?start=&end=      → trendData
 *  GET /reports/tenq/:simId/:firmId/:q/summary             → summary
 *  GET /reports/tenq/:simId/:firmId/:q/inventory           → inventory
 *  GET /reports/tenq/:simId/:firmId/:q/compare             → compare
 *  GET /reports/tenq/:simId/:firmId/:q/ytd                 → ytd
 *  GET /reports/tenq/:simId/:firmId/:q                     → fullReport
 *
 * DARK / LIGHT FIXES (retained from previous version):
 *  FIX 1 — QoQ trend table selected-row highlight
 *  FIX 2 — Peer comparison "You" row
 *  FIX 3 — YTD cumulative table selected-row
 *  FIX 4 — Inventory stacked-bar segment colours
 *  FIX 5 — Inventory legend dots
 *  FIX 6 — Header theme toggle wired up
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../../components/StudentHeader";
import StudentSidebar from "../../../components/StudentSidebar";

// ─── LIGHT THEME ──────────────────────────────────────────────────────────────
const LIGHT_THEME = {
  primary: "#0176D3",
  primaryDark: "#014486",
  primaryLight: "#E0F2FE",
  bg: "#F3F3F3",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  border: "#E5E5E5",
  borderStrong: "#D0D0D0",
  text: "#181818",
  textSec: "#444444",
  textMuted: "#706E6B",
  success: "#2E844A",
  successBg: "#EBF7EE",
  successBdr: "#A3D9B1",
  warning: "#DD7A01",
  warningBg: "#FEF3E2",
  warningBdr: "#F5C87A",
  error: "#BA0517",
  errorBg: "#FEE6E9",
  errorBdr: "#F5A3AB",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.07)",
};

// ─── DARK THEME ────────────────────────────────────────────────────────────────
const DARK_THEME = {
  primary: "#4A9EFF",
  primaryDark: "#2E7FD9",
  primaryLight: "#1E3E52",
  bg: "#0D1117",
  surface: "#161B22",
  surfaceAlt: "#21262D",
  border: "#30363D",
  borderStrong: "#444C56",
  text: "#E6EDF3",
  textSec: "#C9D1D9",
  textMuted: "#8B949E",
  success: "#3FB950",
  successBg: "#0D3920",
  successBdr: "#238636",
  warning: "#FFA657",
  warningBg: "#3D2817",
  warningBdr: "#845D1F",
  error: "#F85149",
  errorBg: "#3D0E0A",
  errorBdr: "#8B2C2C",
  shadow: "0 1px 3px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.4)",
};

// ─── THEME-AWARE CSS ───────────────────────────────────────────────────────────
const getThemeCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:${T.bg}}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${T.bg}}
  ::-webkit-scrollbar-thumb{background:${T.borderStrong};border-radius:3px}
  .ni{transition:background-color .12s;text-decoration:none!important}
  .ni:hover{background-color:${T.surfaceAlt}!important}
  .ni.act{background-color:${T.primaryLight}!important;color:${T.primary}!important;font-weight:500}
  .card{transition:box-shadow .15s,border-color .15s}
  .card:hover{box-shadow:${T.shadowMd}!important}
  .tab-btn{transition:color .12s,border-color .12s;cursor:pointer;border:none;background:transparent}
  .tab-btn:hover{color:${T.primary}!important}
  .tab-btn.active{color:${T.primary}!important;border-bottom:2px solid ${T.primary}!important}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .7s linear infinite}
  @keyframes fu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .fu{animation:fu .2s ease both}
  select option{background:${T.surface};color:${T.text}}
  .trow:hover{background:${T.primaryLight}!important;cursor:pointer}
`;

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const fmtC = (v) => {
  if (v === null || v === undefined || isNaN(v) || Number(v) === 0) return "—";
  const n = Number(v);
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};
const fmtN = (v) =>
  v === null || v === undefined || Number(v) === 0
    ? "—"
    : Math.round(Number(v)).toLocaleString();
const fmtP = (v) =>
  v === null || v === undefined || Number(v) === 0
    ? "—"
    : `${(Number(v) * 100).toFixed(1)}%`;
const fmtPct = (v) =>
  v === null || v === undefined || Number(v) === 0
    ? "—"
    : `${Number(v).toFixed(1)}%`;
const fmtD = (cur, prev) => {
  if (!prev || !cur || prev === 0) return null;
  const d = ((Number(cur) - Number(prev)) / Math.abs(Number(prev))) * 100;
  return { pct: Math.abs(d).toFixed(1), pos: d >= 0 };
};
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

// ─── SAFE FETCH ───────────────────────────────────────────────────────────────
const sf = async (url, token) => {
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
    });
    if (!r.ok) return null;
    return r.json().catch(() => null);
  } catch {
    return null;
  }
};

// ─── PAGE TABS ────────────────────────────────────────────────────────────────
const TABS = [
  "Overview",
  "Income Statement",
  "Inventory",
  "Peer Comparison",
  "YTD",
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StudentResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, toggleTheme } = useTheme();
  const T = isDark ? DARK_THEME : LIGHT_THEME;
  const CSS = getThemeCSS(T);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ─── MICRO-COMPONENTS ─────────────────────────────────────────────────────
  const Spinner = ({ small }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: small ? 16 : 60,
      }}
    >
      <div
        className="spin"
        style={{
          width: small ? 22 : 36,
          height: small ? 22 : 36,
          borderRadius: "50%",
          border: `2.5px solid ${T.border}`,
          borderTopColor: T.primary,
        }}
      />
    </div>
  );

  const Card = ({ title, badge, action, onAction, pad = true, children }) => (
    <div
      className="card fu"
      style={{
        background: T.surface,
        borderRadius: 8,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: T.shadow,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          padding: "13px 20px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: T.surfaceAlt,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            {title}
          </span>
          {badge && (
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 12,
                background: T.primaryLight,
                color: T.primary,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {action && (
          <button
            onClick={onAction}
            className="tab-btn"
            style={{ fontSize: 12, color: T.primary, padding: "3px 0" }}
          >
            {action}
          </button>
        )}
      </div>
      {pad ? <div style={{ padding: "18px 20px" }}>{children}</div> : children}
    </div>
  );

  const KPITile = ({ label, value, sub, delta: d, color }) => (
    <div
      className="card fu"
      style={{
        background: T.surface,
        borderRadius: 8,
        border: `1px solid ${T.border}`,
        padding: "16px 18px",
        boxShadow: T.shadow,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: color || T.text,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 7,
          display: "flex",
          alignItems: "center",
          gap: 5,
          minHeight: 18,
        }}
      >
        {d && (
          <>
            <svg
              width="12"
              height="12"
              fill="none"
              stroke={d.pos ? T.success : T.error}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={d.pos ? "M5 10l7-7 7 7" : "M19 14l-7 7-7-7"}
              />
            </svg>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: d.pos ? T.success : T.error,
              }}
            >
              {d.pos ? "+" : "-"}
              {d.pct}%
            </span>
            <span style={{ fontSize: 11, color: T.textMuted }}>vs prev Q</span>
          </>
        )}
        {!d && sub && (
          <span style={{ fontSize: 12, color: T.textMuted }}>{sub}</span>
        )}
      </div>
    </div>
  );

  const TH = ({ children, right }) => (
    <th
      style={{
        padding: "9px 14px",
        textAlign: right ? "right" : "left",
        fontSize: 10,
        fontWeight: 600,
        color: T.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        background: T.surfaceAlt,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );

  const TD = ({ children, right, bold, color, mono }) => (
    <td
      style={{
        padding: "10px 14px",
        textAlign: right ? "right" : "left",
        fontSize: 13,
        fontWeight: bold ? 600 : 400,
        color: color || T.textSec,
        fontFamily: mono ? "SF Mono,Consolas,monospace" : "inherit",
      }}
    >
      {children}
    </td>
  );

  const FinRow = ({ label, value, prev, indent, bold }) => {
    const d = fmtD(value, prev);
    return (
      <tr style={{ borderTop: `1px solid ${T.border}` }}>
        <td
          style={{
            padding: bold
              ? "10px 16px"
              : "8px 16px 8px " + (indent ? "28px" : "16px"),
            fontSize: 13,
            fontWeight: bold ? 600 : 400,
            color: bold ? T.text : T.textSec,
          }}
        >
          {label}
        </td>
        <td
          style={{
            padding: "8px 16px",
            textAlign: "right",
            fontSize: 13,
            fontWeight: bold ? 700 : 400,
            color: bold ? T.text : T.textSec,
            fontFamily: "SF Mono,Consolas,monospace",
          }}
        >
          {fmtC(value)}
        </td>
        <td
          style={{
            padding: "8px 16px",
            textAlign: "right",
            fontSize: 12,
            color: T.textMuted,
            fontFamily: "SF Mono,Consolas,monospace",
          }}
        >
          {fmtC(prev)}
        </td>
        <td style={{ padding: "8px 16px", textAlign: "right" }}>
          {d && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: d.pos ? T.success : T.error,
              }}
            >
              {d.pos ? "+" : "-"}
              {d.pct}%
            </span>
          )}
        </td>
      </tr>
    );
  };

  const BarRow = ({ label, value, color }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
      }}
    >
      <span
        style={{ fontSize: 12, color: T.textSec, width: 132, flexShrink: 0 }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          background: T.bg,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(value || 0, 100)}%`,
            background: color || T.primary,
            borderRadius: 3,
            transition: "width .5s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: T.text,
          width: 44,
          textAlign: "right",
        }}
      >
        {(value || 0).toFixed(1)}%
      </span>
    </div>
  );

  const MEDALS = ["🥇", "🥈", "🥉"];
  const Rank = ({ r }) =>
    MEDALS[r - 1] ? (
      <span style={{ fontSize: 16 }}>{MEDALS[r - 1]}</span>
    ) : (
      <span style={{ fontSize: 13, color: T.textMuted }}>{r}</span>
    );

  const mapeC = (v) =>
    !v ? T.textMuted : v < 10 ? T.success : v < 20 ? T.warning : T.error;
  const mapeBg = (v) =>
    !v ? T.surfaceAlt : v < 10 ? T.successBg : v < 20 ? T.warningBg : T.errorBg;

  // ─── STATE ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [loadingQ, setLoadingQ] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [firm, setFirm] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [selectedQ, setSelectedQ] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [qSummary, setQSummary] = useState(null);
  const [qInventory, setQInventory] = useState(null);
  const [qCompare, setQCompare] = useState(null);
  const [qYtd, setQYtd] = useState(null);
  const [qFull, setQFull] = useState(null);
  const [kpiHistory, setKpiHistory] = useState([]);
  const [error, setError] = useState("");
  const [dataVisibility, setDataVisibility] = useState({ showQuarterData: true });
  const [loadingVisibility, setLoadingVisibility] = useState(false);

  // ─── INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    init();
  }, [params.id]);

  const init = async () => {
    const token = getToken();
    if (!token || localStorage.getItem("userRole") !== "student") {
      router.push("/login");
      return;
    }

    const simData = await sf(`${apiUrl}/simulations/${params.id}`, token);
    if (!simData) {
      setError("Failed to load simulation");
      setLoading(false);
      return;
    }
    setSimulation(simData);

    const userId = localStorage.getItem("userId");
    let sf2 = null;
    for (const f of simData.firms || []) {
      const found = f.enrollments?.find((e) => {
        const eid = e.user?.id || e.user?._id || e.userId;
        return eid?.toString() === userId?.toString();
      });
      if (found) {
        sf2 = f;
        break;
      }
    }
    if (!sf2) {
      setError("You are not enrolled in any firm");
      setLoading(false);
      return;
    }
    setFirm(sf2);

    const allR = await sf(
      `${apiUrl}/reports/tenq/${params.id}/${sf2.id}`,
      token,
    );
    const reportsArr = Array.isArray(allR)
      ? allR
      : allR?.reports || allR?.data || [];
    setAllReports(reportsArr);

    const kpiRaw = await sf(
      `${apiUrl}/reports/kpi-history/${params.id}/${sf2.id}`,
      token,
    );
    const kpiArr = Array.isArray(kpiRaw) ? kpiRaw : kpiRaw?.history || [];
    setKpiHistory(kpiArr);

    const trend = await sf(
      `${apiUrl}/reports/tenq/${params.id}/${sf2.id}/trend`,
      token,
    );
    setTrendData(trend);

    const qs = reportsArr
      .map((r) => r.quarter || r.Quarter)
      .filter(Boolean)
      .sort((a, b) => b - a);
    const availQs =
      qs.length > 0
        ? qs
        : Array.from(
            { length: Math.max(0, (simData.currentQuarter || 1) - 1) },
            (_, i) => simData.currentQuarter - 1 - i,
          ).filter((q) => q > 0);

    setQuarters(availQs);

    if (availQs.length > 0) {
      setSelectedQ(availQs[0]);
      await loadQuarterData(params.id, sf2.id, availQs[0]);
    }

    setLoading(false);
  };

  // ─── LOAD PER-QUARTER DATA ─────────────────────────────────────────────────
  const loadQuarterData = async (simId, firmId, q) => {
    setLoadingQ(true);
    const token = getToken();

    const [summary, inventory, tenqCompare, ytd, full, kpiCompare, finSummary] =
      await Promise.all([
        sf(`${apiUrl}/reports/tenq/${simId}/${firmId}/${q}/summary`, token),
        sf(`${apiUrl}/reports/tenq/${simId}/${firmId}/${q}/inventory`, token),
        sf(`${apiUrl}/reports/tenq/${simId}/${firmId}/${q}/compare`, token),
        sf(`${apiUrl}/reports/tenq/${simId}/${firmId}/${q}/ytd`, token),
        sf(`${apiUrl}/reports/tenq/${simId}/${firmId}/${q}`, token),
        sf(
          `${apiUrl}/reports/competitor-comparison/${simId}/${firmId}/${q}`,
          token,
        ),
        sf(`${apiUrl}/reports/financial-summary/${simId}/${q}`, token),
      ]);

    let resolvedCompare = tenqCompare;
    const tenqHasPeers =
      Array.isArray(tenqCompare?.peers) && tenqCompare.peers.length > 0;

    if (!tenqHasPeers && kpiCompare?.benchmarks) {
      const bm = kpiCompare.benchmarks;
      const firmMap = {};
      const merge = (arr, fields) =>
        arr?.forEach((item) => {
          if (!firmMap[item.firmId])
            firmMap[item.firmId] = {
              firmId: item.firmId,
              isCurrentFirm: item.isCurrentFirm,
              isYou: item.isCurrentFirm,
            };
          fields.forEach((f) => {
            if (item[f] != null) firmMap[item.firmId][f] = item[f];
          });
          if (item.rank != null)
            firmMap[item.firmId].rank = firmMap[item.firmId].rank || item.rank;
        });
      merge(bm.byRevenue, ["revenue"]);
      merge(bm.byMarketShare, ["marketShare"]);
      merge(bm.byCsi, ["csi"]);
      merge(bm.byFillRate, ["fillRate"]);

      const finMap = {};
      (finSummary?.firmSummaries || []).forEach((fs) => {
        finMap[fs.firmId] = fs;
      });

      const enrichFromKpi = (peer) => {
        const fs = finMap[peer.firmId] || {};
        const isCurrent =
          kpiCompare.firmData?.firm?.toString() === peer.firmId ||
          kpiCompare.firmData?.firm === peer.firmId;
        const kpi = isCurrent ? kpiCompare.firmData : null;
        return {
          ...peer,
          netIncome:
            fs.netIncome ?? kpi?.financial?.netIncome ?? peer.netIncome,
          grossMarginPct:
            fs.grossMarginPct ??
            kpi?.financial?.grossMarginPct ??
            peer.grossMarginPct,
          perfectOrder: kpi?.operations?.perfectOrder ?? peer.perfectOrder,
          mape: kpi?.operations?.mape ?? peer.mape,
          score: kpi?.bsc?.overall ?? peer.score,
          bscOverall: kpi?.bsc?.overall ?? peer.bscOverall,
        };
      };

      const peers = Object.values(firmMap)
        .sort((a, b) => (a.rank || 99) - (b.rank || 99))
        .map(enrichFromKpi);

      resolvedCompare = {
        peers,
        benchmarks: bm,
        totalFirms: kpiCompare.totalFirms,
        events: kpiCompare.events || [],
        quarterEvents: kpiCompare.quarterEvents || [],
      };
    }

    setQSummary(summary);
    setQInventory(inventory);
    setQCompare(resolvedCompare);
    setQYtd(ytd);
    setQFull(full);
    setLoadingQ(false);
  };

  // Fetch visibility on load and set up polling
  const fetchQuarterDataVisibility = useCallback(async (quarter = null) => {
    try {
      setLoadingVisibility(true);
      const token = getToken();
      let url = `${apiUrl}/simulations/${params.id}/quarter-data-visibility`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "*/*" } });
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
  }, [params.id, apiUrl]);

  useEffect(() => {
    if (selectedQ && params.id) {
      fetchQuarterDataVisibility(selectedQ);
    }
  }, [selectedQ, params.id]);

  const switchQuarter = async (q) => {
    const qi = parseInt(q);
    setSelectedQ(qi);
    setActiveTab("Overview");
    await loadQuarterData(params.id, firm.id, qi);
  };

  const handleLogout = () => {
    ["access_token", "refresh_token", "user", "userId", "userRole"].forEach(
      (k) => localStorage.removeItem(k),
    );
    router.push("/");
  };

  // ─── DERIVED VALUES ────────────────────────────────────────────────────────
  const F = qFull || {};
  const S = qSummary || F.summary || {};
  const IS = F.incomeStatement || S.incomeStatement || S || {};
  const BS = F.balanceSheet || {};
  const CF = F.cashFlow || {};
  const OP =
    F.operationalMetrics ||
    S.operationalMetrics ||
    S.keyMetrics ||
    F.keyMetrics ||
    {};

  const curReport = allReports.find(
    (r) => (r.quarter || r.Quarter) === selectedQ,
  );
  const prevReport = allReports.find(
    (r) => (r.quarter || r.Quarter) === (selectedQ || 0) - 1,
  );

  const kpiCurrent = kpiHistory.find((k) => k.quarter === selectedQ);
  const kpiPrev = kpiHistory.find((k) => k.quarter === (selectedQ || 0) - 1);
  const _kpf = kpiPrev?.financial || {};
  const _kpPrevRev = _kpf.revenue || 0;
  const _kpPrevCogs = _kpf.cogs || 0;
  const _kpPrevGP = _kpPrevRev - _kpPrevCogs;
  const _kpPrevOpEx = _kpf.operatingExpenses || 0;
  const _kpPrevOpI = _kpPrevGP - _kpPrevOpEx;
  const _kpPrevNI = _kpf.netIncome || 0;

  const revenue = IS.revenue || IS.totalRevenue || S.revenue || 0;
  const prevRev =
    prevReport?.summary?.revenue || prevReport?.revenue || _kpPrevRev || 0;
  const cogs = IS.cogs || IS.costOfGoodsSold || S.cogs || 0;
  const grossProfit = IS.grossProfit || revenue - cogs || 0;
  const opEx = IS.operatingExpenses || IS.totalOpex || IS.opex || 0;
  const _opIncomeComputed =
    grossProfit > 0 && opEx >= 0 ? grossProfit - opEx : null;
  const opIncome =
    _opIncomeComputed ??
    IS.operatingIncome ??
    IS.operatingProfit ??
    S.operatingIncome ??
    0;
  const prevOpI = prevReport?.summary?.operatingIncome || _kpPrevOpI || 0;
  const netIncome = IS.netIncome || IS.net_income || S.netIncome || 0;
  const prevNI = prevReport?.summary?.netIncome || _kpPrevNI || 0;
  const ebitda =
    IS.ebitda ||
    opIncome + (IS.depreciation || 0) + (IS.amortization || 0) ||
    0;

  const csi = OP.csi || S.csi || F.csi || 0;
  const fillRate = OP.fillRate || S.fillRate || F.fillRate || 0;
  const perfectOrder = OP.perfectOrder || S.perfectOrder || F.perfectOrder || 0;
  const _fAcc = OP.forecastAccuracy ?? S.forecastAccuracy ?? null;
  const mape =
    (OP.mape || S.mape || F.mape || (_fAcc != null ? 1 - _fAcc : 0) || 0) * 100;
  const marketShare = OP.marketShare || S.marketShare || F.marketShare || 0;
  const unitsSold = OP.unitsSold || S.unitsSold || F.unitsSold || 0;

  const _kpiOps = kpiCurrent?.operations || {};
  const POC =
    OP.poComponents ||
    OP.perfectOrderComponents ||
    F.poComponents ||
    F.perfectOrderComponents ||
    F.keyMetrics?.poComponents ||
    F.keyMetrics?.perfectOrderComponents ||
    {};
  const poOnTime =
    (POC.onTime || OP.poOnTime || _kpiOps.onTimeDelivery || 0) * 100;
  const poInFull = (POC.inFull || OP.poInFull || _kpiOps.inFull || 0) * 100;
  const poDmgFree =
    (POC.damageFree || OP.poDamageFree || _kpiOps.damageFree || 0) * 100;
  const poDoc =
    (POC.documentation || OP.poDocumentation || _kpiOps.documentation || 0) *
    100;
  const poOverall = perfectOrder * 100;

  const INV = qInventory?.inventoryReport || qInventory || F.inventory || {};
  const rawMats = INV.rawMaterials || INV.rawMaterialUnits || INV.raw || 0;
  const wip = INV.workInProgress || INV.wip || 0;
  const finGoods =
    INV.finishedGoods || INV.finishedGoodsUnits || INV.finished || 0;
  const inTransit = INV.inTransit || INV.inTransitUnits || INV.transit || 0;
  const retailerInv = INV.retailerInventory || INV.retailer || 0;
  const totalInv = rawMats + finGoods + inTransit;
  const invValue =
    INV.totalInventoryValue ||
    INV.totalValue ||
    rawMats * 150 + finGoods * 250 ||
    0;
  const daysInv =
    INV.daysInventory ||
    INV.doi ||
    (INV.weeksOfSupply ? INV.weeksOfSupply * 7 : 0);
  const turnover = INV.inventoryTurnover || INV.turns || 0;

  const YTD_RAW = qYtd || {};
  const YTD = YTD_RAW.ytdTotals || YTD_RAW;
  const YTD_QS = YTD_RAW.quarterlySummary || [];
  const ytdRev = YTD.revenue || YTD.ytdRevenue || 0;
  const ytdNI = YTD.netIncome || YTD.ytdNetIncome || 0;
  const ytdUnits = YTD.unitsSold || YTD.ytdUnitsSold || 0;
  const ytdCash = YTD.cashGenerated || YTD.operatingCashFlow || 0;

  const CMP = qCompare || {};
  const peers = CMP.peers || CMP.firms || CMP.comparison || [];
  const myPeerRow =
    peers.find(
      (p) => p.firmId?.toString() === firm?.id?.toString() || p.isCurrentFirm,
    ) || {};
  const peerBenchRaw = CMP.benchmarks || CMP.industry || {};
  const peerBench =
    Object.keys(peerBenchRaw).length > 0
      ? peerBenchRaw
      : (() => {
          if (peers.length < 2) return null;
          const avg = (arr, fn) =>
            arr.reduce((s, p) => s + (fn(p) || 0), 0) / arr.length;
          return {
            avgRevenue: avg(peers, (p) => p.revenue || 0),
            avgMarketShare: avg(peers, (p) => p.marketShare || 0),
            avgGrossMargin: avg(
              peers,
              (p) => p.grossMargin || p.grossMarginPct || 0,
            ),
            avgPerfectOrder: avg(peers, (p) => p.perfectOrder || 0),
            avgCsi: avg(peers, (p) => p.csi || 0),
            avgMape: avg(peers, (p) => p.mape || 0),
          };
        })();

  const cash = BS.cash || BS.cashAndEquivalents || 0;
  const totalAssets = BS.totalAssets || 0;
  const totalDebt =
    BS.totalDebt || (BS.shortTermDebt || 0) + (BS.longTermDebt || 0) || 0;
  const equity = BS.equity || BS.totalEquity || 0;

  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const opMarginPct = revenue > 0 ? (opIncome / revenue) * 100 : 0;
  const netMarginPct = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  const trendArr = Array.isArray(trendData)
    ? trendData
    : trendData?.trend || trendData?.history || [];

  const firmInitials =
    firm?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TM";

  // ─── SIDEBAR NAV ITEMS (same shape as dashboard) ──────────────────────────
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "decisions",
      label: "Decisions",
      d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
    {
      id: "results",
      label: "Results",
      d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      id: "financials",
      label: "Financials",
      d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "analytics",
      label: "Analytics",
      d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      id: "risk",
      label: "Risk Monitor",
      d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
  ];

  // ─── LOADING SCREEN ────────────────────────────────────────────────────────
  if (loading)
    return (
      <>
        <style>{CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: T.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            className="spin"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: `3px solid ${T.border}`,
              borderTopColor: T.primary,
            }}
          />
          <p style={{ fontSize: 13, color: T.textMuted }}>
            Loading quarterly report…
          </p>
        </div>
      </>
    );

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          background: T.bg,
          minHeight: "100vh",
          color: T.text,
          fontFamily: "Inter,-apple-system,sans-serif",
          fontSize: 14,
        }}
      >
        {/* ── HEADER — using StudentHeader component ── */}
        <StudentHeader
          simulation={simulation}
          currentQuarter={simulation?.currentQuarter}
          firm={firm}
          firmInitials={firmInitials}
          greenScoreVal={kpiCurrent?.overall}
          onDecisionsClick={() =>
            router.push(`/dashboard/student/simulation/decisions/${params.id}`)
          }
        />

        <div style={{ display: "flex" }}>
          {/* ── SIDEBAR — now uses shared StudentSidebar component ── */}
          <StudentSidebar
            navItems={navItems}
            activeTab="results"
            simId={params.id}
          />

          {/* ── MAIN ── */}
          <main
            style={{ flex: 1, padding: "24px", maxWidth: 1200, minWidth: 0 }}
          >
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: T.errorBg,
                  border: `1px solid ${T.errorBdr}`,
                  color: T.error,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            {/* Data visibility check */}
            {(dataVisibility?.showQuarterData === false) && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}` }}>
                <svg width="44" height="44" fill="none" stroke={T.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>Report Data Not Available</p>
                <p style={{ fontSize: 13, color: T.textMuted }}>Your instructor has restricted access to report data for this period.</p>
              </div>
            )}

            {/* Reports content - only show when data is visible */}
            {(dataVisibility?.showQuarterData !== false) && (
              <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <div>
                <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text }}>
                  {quarters.length === 0
                    ? "Quarterly Results"
                    : `Quarter ${selectedQ} — 10-Q Report`}
                </h1>
                <p style={{ fontSize: 13, color: T.textMuted, marginTop: 3 }}>
                  {quarters.length === 0
                    ? "No processed quarters yet"
                    : `${simulation?.name} · ${firm?.name} · Q${selectedQ} of Q${(simulation?.currentQuarter || 1) - 1} processed`}
                </p>
              </div>
              {quarters.length > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={selectedQ || ""}
                    onChange={(e) => switchQuarter(e.target.value)}
                    style={{
                      padding: "7px 12px",
                      border: `1px solid ${T.border}`,
                      borderRadius: 6,
                      fontSize: 13,
                      background: T.surface,
                      color: T.text,
                      cursor: "pointer",
                    }}
                  >
                    {quarters.map((q) => (
                      <option key={q} value={q}>
                        Quarter {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {quarters.length === 0 ? (
              <div
                style={{
                  padding: 56,
                  textAlign: "center",
                  background: T.surface,
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                }}
              >
                <svg
                  width="44"
                  height="44"
                  fill="none"
                  stroke={T.textMuted}
                  viewBox="0 0 24 24"
                  style={{ margin: "0 auto 14px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 6,
                  }}
                >
                  No quarterly reports yet
                </p>
                <p style={{ fontSize: 13, color: T.textMuted }}>
                  Submit your Quarter 1 decisions — the 10-Q report generates
                  automatically after processing.
                </p>
              </div>
            ) : loadingQ ? (
              <Spinner />
            ) : (
              <>
                {/* ── TAB BAR ── */}
                <div
                  style={{
                    display: "flex",
                    gap: 0,
                    borderBottom: `1px solid ${T.border}`,
                    marginBottom: 20,
                    background: T.surface,
                    borderRadius: "8px 8px 0 0",
                    border: `1px solid ${T.border}`,
                    overflow: "hidden",
                  }}
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                      style={{
                        padding: "11px 20px",
                        fontSize: 13,
                        fontWeight: activeTab === tab ? 600 : 400,
                        color: activeTab === tab ? T.primary : T.textSec,
                        borderBottom:
                          activeTab === tab
                            ? `2px solid ${T.primary}`
                            : "2px solid transparent",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB: OVERVIEW                                      */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === "Overview" && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 16,
                      }}
                    >
                      <KPITile
                        label="Revenue"
                        value={fmtC(revenue)}
                        delta={fmtD(revenue, prevRev)}
                      />
                      <KPITile
                        label="Gross Profit"
                        value={fmtC(grossProfit)}
                        sub={`${grossMarginPct.toFixed(1)}% margin`}
                      />
                      <KPITile
                        label="Net Income"
                        value={fmtC(netIncome)}
                        delta={fmtD(netIncome, prevNI)}
                        color={netIncome < 0 ? T.error : T.text}
                      />
                      <KPITile
                        label="Cash Position"
                        value={fmtC(cash)}
                        sub={totalDebt ? `Debt: ${fmtC(totalDebt)}` : "No debt"}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 20,
                      }}
                    >
                      <KPITile
                        label="Market Share"
                        value={fmtP(marketShare)}
                        sub="% of total demand"
                      />
                      <KPITile
                        label="CSI Score"
                        value={csi ? csi.toFixed(1) : "—"}
                        sub="Target ≥ 80"
                        color={
                          csi >= 80
                            ? T.success
                            : csi >= 70
                              ? T.warning
                              : T.error
                        }
                      />
                      <KPITile
                        label="Perfect Order"
                        value={poOverall ? `${poOverall.toFixed(1)}%` : "—"}
                        sub="Target ≥ 85%"
                      />
                      <KPITile
                        label="Forecast MAPE"
                        value={mape ? `${mape.toFixed(1)}%` : "—"}
                        sub="Target < 10%"
                        color={
                          mape && mape < 10
                            ? T.success
                            : mape < 20
                              ? T.warning
                              : T.error
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                        marginBottom: 20,
                      }}
                    >
                      {/* Perfect Order */}
                      <Card
                        title="Perfect Order"
                        badge={
                          poOverall ? `${poOverall.toFixed(1)}%` : undefined
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: 18,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: 108,
                              height: 108,
                            }}
                          >
                            <svg
                              viewBox="0 0 36 36"
                              style={{
                                width: 108,
                                height: 108,
                                transform: "rotate(-90deg)",
                              }}
                            >
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={T.border}
                                strokeWidth="3.5"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={
                                  poOverall >= 85
                                    ? T.success
                                    : poOverall >= 75
                                      ? T.warning
                                      : T.error
                                }
                                strokeWidth="3.5"
                                strokeDasharray={`${(poOverall || 0).toFixed(1)}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 700,
                                  color: T.text,
                                }}
                              >
                                {poOverall ? `${poOverall.toFixed(1)}%` : "—"}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: T.textMuted,
                                  fontWeight: 600,
                                }}
                              >
                                PERFECT ORDER
                              </div>
                            </div>
                          </div>
                        </div>
                        <BarRow
                          label="On-Time Delivery"
                          value={poOnTime}
                          color={poOnTime >= 92 ? T.success : T.warning}
                        />
                        <BarRow
                          label="In-Full Delivery"
                          value={poInFull}
                          color={poInFull >= 95 ? T.success : T.warning}
                        />
                        <BarRow
                          label="Damage-Free"
                          value={poDmgFree}
                          color={poDmgFree >= 97 ? T.success : T.warning}
                        />
                        <BarRow
                          label="Documentation"
                          value={poDoc}
                          color={poDoc >= 99 ? T.success : T.primary}
                        />
                      </Card>

                      {/* P&L Summary */}
                      <Card title="P&L Summary" pad={false}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr>
                              <TH>Line Item</TH>
                              <TH right>Q{selectedQ}</TH>
                              <TH right>Q{(selectedQ || 1) - 1}</TH>
                              <TH right>Δ</TH>
                            </tr>
                          </thead>
                          <tbody>
                            <FinRow
                              label="Revenue"
                              value={revenue}
                              prev={prevRev}
                              bold
                            />
                            <FinRow
                              label="Cost of Goods Sold"
                              value={cogs}
                              prev={IS.prevCogs || _kpPrevCogs || 0}
                              indent
                            />
                            <FinRow
                              label="Gross Profit"
                              value={grossProfit}
                              prev={
                                prevReport?.summary?.grossProfit ||
                                _kpPrevGP ||
                                0
                              }
                              bold
                            />
                            <FinRow
                              label="Operating Expenses"
                              value={opEx}
                              prev={IS.prevOpex || _kpPrevOpEx || 0}
                              indent
                            />
                            <FinRow
                              label="Operating Income"
                              value={opIncome}
                              prev={prevOpI}
                              bold
                            />
                            {(IS.interestExpense || IS.interest) && (
                              <FinRow
                                label="Interest Expense"
                                value={IS.interestExpense || IS.interest || 0}
                                prev={kpiPrev?.costs?.interest || 0}
                                indent
                              />
                            )}
                            <FinRow
                              label="Net Income"
                              value={netIncome}
                              prev={prevNI}
                              bold
                            />
                          </tbody>
                          <tfoot>
                            <tr
                              style={{
                                borderTop: `2px solid ${T.border}`,
                                background: T.surfaceAlt,
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 16px",
                                  fontSize: 12,
                                  color: T.textMuted,
                                }}
                                colSpan={4}
                              >
                                EBITDA: {fmtC(ebitda)} &nbsp;·&nbsp; Op Margin:{" "}
                                {opMarginPct.toFixed(1)}% &nbsp;·&nbsp; Net
                                Margin: {netMarginPct.toFixed(1)}%
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </Card>
                    </div>

                    {/* YTD strip */}
                    {(ytdRev > 0 || ytdNI !== 0 || ytdUnits > 0) && (
                      <Card title={`YTD Totals — Through Q${selectedQ}`}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            gap: 16,
                          }}
                        >
                          {[
                            {
                              label: "YTD Revenue",
                              value: fmtC(ytdRev),
                              sub: "cumulative",
                            },
                            {
                              label: "YTD Net Income",
                              value: fmtC(ytdNI),
                              sub: "cumulative",
                              color: ytdNI < 0 ? T.error : T.success,
                            },
                            {
                              label: "YTD Units Sold",
                              value: fmtN(ytdUnits),
                              sub: "cumulative",
                            },
                            {
                              label: "Operating Cash",
                              value: fmtC(ytdCash),
                              sub: "YTD generated",
                            },
                          ].map(({ label, value, sub, color }) => (
                            <div
                              key={label}
                              style={{
                                padding: "14px 16px",
                                borderRadius: 6,
                                border: `1px solid ${T.border}`,
                                background: T.surfaceAlt,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: T.textMuted,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  marginBottom: 5,
                                }}
                              >
                                {label}
                              </div>
                              <div
                                style={{
                                  fontSize: 22,
                                  fontWeight: 700,
                                  color: color || T.text,
                                }}
                              >
                                {value}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: T.textMuted,
                                  marginTop: 4,
                                }}
                              >
                                {sub}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* QoQ trend table */}
                    {(allReports.length > 1 ||
                      trendArr.length > 1 ||
                      kpiHistory.length > 1) && (
                      <Card title="Quarter-over-Quarter Trend" pad={false}>
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <TH>Quarter</TH>
                                <TH right>Revenue</TH>
                                <TH right>Gross Profit</TH>
                                <TH right>Net Income</TH>
                                <TH right>Op Margin</TH>
                                <TH right>Units Sold</TH>
                                <TH right>Market Share</TH>
                                <TH right>CSI</TH>
                                <TH right>MAPE</TH>
                              </tr>
                            </thead>
                            <tbody>
                              {(trendArr.length > 0
                                ? trendArr
                                : allReports.length > 0
                                  ? allReports
                                  : kpiHistory
                              )
                                .map((r) => r.quarter || r.Quarter)
                                .filter(Boolean)
                                .sort((a, b) => b - a)
                                .map((q) => {
                                  const r =
                                    trendArr.find(
                                      (x) => (x.quarter || x.Quarter) === q,
                                    ) ||
                                    allReports.find(
                                      (x) => (x.quarter || x.Quarter) === q,
                                    ) ||
                                    {};
                                  const rs = r.summary || r;
                                  const arFull =
                                    allReports.find(
                                      (x) => (x.quarter || x.Quarter) === q,
                                    ) || {};
                                  const kpiR =
                                    kpiHistory.find((k) => k.quarter === q) ||
                                    {};
                                  const kpiF = kpiR.financial || {};
                                  const kpiO = kpiR.operations || {};
                                  const kpiC = kpiR.customer || {};
                                  const rRev =
                                    rs.revenue ||
                                    arFull.incomeStatement?.revenue ||
                                    kpiF.revenue ||
                                    0;
                                  const rNI =
                                    rs.netIncome ||
                                    arFull.incomeStatement?.netIncome ||
                                    kpiF.netIncome ||
                                    0;
                                  const _rCogs =
                                    arFull.incomeStatement?.cogs ||
                                    kpiF.cogs ||
                                    0;
                                  const rGP =
                                    rs.grossProfit ||
                                    arFull.incomeStatement?.grossProfit ||
                                    rRev - _rCogs ||
                                    0;
                                  const _rOpI =
                                    rs.operatingIncome ||
                                    arFull.incomeStatement?.operatingIncome ||
                                    rGP -
                                      (arFull.incomeStatement?.totalOpex ||
                                        kpiF.operatingExpenses ||
                                        0) ||
                                    0;
                                  const rOM =
                                    rRev > 0 ? (_rOpI / rRev) * 100 : 0;
                                  const rU =
                                    rs.unitsSold ||
                                    arFull.keyMetrics?.unitsSold ||
                                    kpiO.unitsSold ||
                                    0;
                                  const rMS =
                                    rs.marketShare ||
                                    arFull.keyMetrics?.marketShare ||
                                    kpiC.marketShare ||
                                    0;
                                  const rCSI =
                                    rs.csi ||
                                    arFull.keyMetrics?.csi ||
                                    kpiC.csi ||
                                    0;
                                  const _kpiMape =
                                    kpiO.mape != null
                                      ? kpiO.mape * 100
                                      : kpiO.forecastAccuracy != null
                                        ? (1 - kpiO.forecastAccuracy) * 100
                                        : null;
                                  const _fAccR =
                                    arFull.keyMetrics?.forecastAccuracy;
                                  const rMAPE = rs.mape
                                    ? rs.mape * 100
                                    : arFull.keyMetrics?.mape
                                      ? arFull.keyMetrics.mape * 100
                                      : _fAccR != null
                                        ? (1 - _fAccR) * 100
                                        : (_kpiMape ?? 0);
                                  const isSel = q === selectedQ;
                                  return (
                                    <tr
                                      key={q}
                                      className="trow"
                                      onClick={() => switchQuarter(q)}
                                      style={{
                                        borderTop: `1px solid ${T.border}`,
                                        background: isSel
                                          ? T.primaryLight
                                          : "transparent",
                                      }}
                                    >
                                      <TD
                                        bold={isSel}
                                        color={isSel ? T.primary : T.text}
                                      >
                                        Q{q}
                                        {isSel && (
                                          <span
                                            style={{
                                              marginLeft: 6,
                                              fontSize: 10,
                                              background: T.primary,
                                              color: "#fff",
                                              padding: "1px 5px",
                                              borderRadius: 3,
                                            }}
                                          >
                                            Active
                                          </span>
                                        )}
                                      </TD>
                                      <TD right mono>
                                        {fmtC(rRev)}
                                      </TD>
                                      <TD
                                        right
                                        mono
                                        color={rGP >= 0 ? T.success : T.error}
                                      >
                                        {fmtC(rGP)}
                                      </TD>
                                      <TD
                                        right
                                        mono
                                        color={rNI >= 0 ? T.success : T.error}
                                      >
                                        {fmtC(rNI)}
                                      </TD>
                                      <TD
                                        right
                                        color={
                                          rOM >= 15
                                            ? T.success
                                            : rOM >= 8
                                              ? T.warning
                                              : T.error
                                        }
                                      >
                                        {rOM.toFixed(1)}%
                                      </TD>
                                      <TD right mono>
                                        {fmtN(rU)}
                                      </TD>
                                      <TD right>{fmtP(rMS)}</TD>
                                      <TD
                                        right
                                        color={
                                          rCSI >= 80
                                            ? T.success
                                            : rCSI >= 70
                                              ? T.warning
                                              : T.error
                                        }
                                      >
                                        {rCSI.toFixed(1)}
                                      </TD>
                                      <TD right>
                                        <span
                                          style={{
                                            padding: "1px 7px",
                                            borderRadius: 3,
                                            background: mapeBg(rMAPE),
                                            color: mapeC(rMAPE),
                                            fontSize: 11,
                                            fontWeight: 600,
                                          }}
                                        >
                                          {rMAPE > 0
                                            ? `${rMAPE.toFixed(1)}%`
                                            : "—"}
                                        </span>
                                      </TD>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                        <div
                          style={{
                            padding: "9px 16px",
                            borderTop: `1px solid ${T.border}`,
                            fontSize: 11,
                            color: T.textMuted,
                          }}
                        >
                          Click a row to switch quarters
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB: INCOME STATEMENT                              */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === "Income Statement" && (
                  <>
                    <Card
                      title={`Income Statement — Q${selectedQ}`}
                      pad={false}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            <TH>Line Item</TH>
                            <TH right>Q{selectedQ} Amount</TH>
                            <TH right>Q{(selectedQ || 1) - 1} Amount</TH>
                            <TH right>Change</TH>
                          </tr>
                        </thead>
                        <tbody>
                          <FinRow
                            label="Net Revenue"
                            value={revenue}
                            prev={prevRev}
                            bold
                          />
                          <FinRow
                            label="Cost of Goods Sold"
                            value={cogs}
                            prev={IS.prevCogs || _kpPrevCogs || 0}
                            indent
                          />
                          <FinRow
                            label="Gross Profit"
                            value={grossProfit}
                            prev={
                              prevReport?.summary?.grossProfit || _kpPrevGP || 0
                            }
                            bold
                          />
                          <FinRow
                            label="Operating Expenses"
                            value={opEx}
                            prev={IS.prevOpex || _kpPrevOpEx || 0}
                          />
                          {(IS.marketingExpenses || IS.marketing) > 0 && (
                            <FinRow
                              label="  Marketing"
                              value={IS.marketingExpenses || IS.marketing}
                              prev={kpiPrev?.costs?.marketing || 0}
                              indent
                            />
                          )}
                          {IS.rdExpenses > 0 && (
                            <FinRow
                              label="  R&D"
                              value={IS.rdExpenses}
                              prev={0}
                              indent
                            />
                          )}
                          {IS.techMaintenance > 0 && (
                            <FinRow
                              label="  Tech Maintenance"
                              value={IS.techMaintenance}
                              prev={kpiPrev?.costs?.techMaintenance || 0}
                              indent
                            />
                          )}
                          {IS.dcOpex > 0 && (
                            <FinRow
                              label="  DC OpEx"
                              value={IS.dcOpex}
                              prev={kpiPrev?.costs?.holding || 0}
                              indent
                            />
                          )}
                          {IS.warrantyExpense > 0 && (
                            <FinRow
                              label="  Warranty"
                              value={IS.warrantyExpense}
                              prev={kpiPrev?.costs?.quality || 0}
                              indent
                            />
                          )}
                          <FinRow
                            label="Operating Income"
                            value={opIncome}
                            prev={prevOpI}
                            bold
                          />
                          {(IS.interestExpense || IS.interest) > 0 && (
                            <FinRow
                              label="  Interest Expense"
                              value={IS.interestExpense || IS.interest}
                              prev={kpiPrev?.costs?.interest || 0}
                              indent
                            />
                          )}
                          {IS.interestIncome > 0 && (
                            <FinRow
                              label="  Interest Income"
                              value={IS.interestIncome}
                              prev={0}
                              indent
                            />
                          )}
                          <FinRow
                            label="Net Income"
                            value={netIncome}
                            prev={prevNI}
                            bold
                          />
                          <FinRow
                            label="EBITDA"
                            value={ebitda}
                            prev={_kpPrevOpI || 0}
                          />
                        </tbody>
                        <tfoot>
                          <tr
                            style={{
                              borderTop: `2px solid ${T.border}`,
                              background: T.surfaceAlt,
                            }}
                          >
                            <td
                              colSpan={4}
                              style={{
                                padding: "10px 16px",
                                fontSize: 12,
                                color: T.textMuted,
                              }}
                            >
                              Gross Margin: {grossMarginPct.toFixed(1)}%
                              &nbsp;·&nbsp; Operating Margin:{" "}
                              {opMarginPct.toFixed(1)}% &nbsp;·&nbsp; Net
                              Margin: {netMarginPct.toFixed(1)}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </Card>

                    {(totalAssets > 0 || cash > 0) && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 20,
                        }}
                      >
                        <Card title="Balance Sheet — Assets" pad={false}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <TH>Asset</TH>
                                <TH right>Value</TH>
                              </tr>
                            </thead>
                            <tbody>
                              {cash && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Cash & Equivalents</TD>
                                  <TD right mono>
                                    {fmtC(cash)}
                                  </TD>
                                </tr>
                              )}
                              {BS.accountsReceivable && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Accounts Receivable</TD>
                                  <TD right mono>
                                    {fmtC(BS.accountsReceivable)}
                                  </TD>
                                </tr>
                              )}
                              {invValue && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Inventory</TD>
                                  <TD right mono>
                                    {fmtC(invValue)}
                                  </TD>
                                </tr>
                              )}
                              {BS.fixedAssets && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Fixed Assets</TD>
                                  <TD right mono>
                                    {fmtC(BS.fixedAssets)}
                                  </TD>
                                </tr>
                              )}
                              {totalAssets && (
                                <tr
                                  style={{
                                    borderTop: `2px solid ${T.border}`,
                                    background: T.surfaceAlt,
                                  }}
                                >
                                  <TD bold>Total Assets</TD>
                                  <TD right mono bold>
                                    {fmtC(totalAssets)}
                                  </TD>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </Card>
                        <Card
                          title="Balance Sheet — Liabilities & Equity"
                          pad={false}
                        >
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <TH>Item</TH>
                                <TH right>Value</TH>
                              </tr>
                            </thead>
                            <tbody>
                              {BS.accountsPayable && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Accounts Payable</TD>
                                  <TD right mono>
                                    {fmtC(BS.accountsPayable)}
                                  </TD>
                                </tr>
                              )}
                              {BS.shortTermDebt && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Short-Term Debt</TD>
                                  <TD right mono>
                                    {fmtC(BS.shortTermDebt)}
                                  </TD>
                                </tr>
                              )}
                              {BS.longTermDebt && (
                                <tr
                                  style={{ borderTop: `1px solid ${T.border}` }}
                                >
                                  <TD>Long-Term Debt</TD>
                                  <TD right mono>
                                    {fmtC(BS.longTermDebt)}
                                  </TD>
                                </tr>
                              )}
                              {equity && (
                                <tr
                                  style={{
                                    borderTop: `2px solid ${T.border}`,
                                    background: T.surfaceAlt,
                                  }}
                                >
                                  <TD bold>Stockholders' Equity</TD>
                                  <TD right mono bold>
                                    {fmtC(equity)}
                                  </TD>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </Card>
                      </div>
                    )}

                    {(CF.operatingCashFlow ||
                      CF.cashFromOperations ||
                      CF.investingCashFlow ||
                      CF.cashUsedInvesting ||
                      CF.financingCashFlow ||
                      CF.cashFromFinancing) && (
                      <Card title="Cash Flow Statement" pad={false}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr>
                              <TH>Activity</TH>
                              <TH right>Q{selectedQ}</TH>
                            </tr>
                          </thead>
                          <tbody>
                            {(CF.operatingCashFlow ||
                              CF.cashFromOperations) > 0 && (
                              <tr
                                style={{ borderTop: `1px solid ${T.border}` }}
                              >
                                <TD>Operating Activities</TD>
                                <TD
                                  right
                                  mono
                                  color={
                                    (CF.operatingCashFlow ||
                                      CF.cashFromOperations) >= 0
                                      ? T.success
                                      : T.error
                                  }
                                >
                                  {fmtC(
                                    CF.operatingCashFlow ||
                                      CF.cashFromOperations,
                                  )}
                                </TD>
                              </tr>
                            )}
                            {(CF.investingCashFlow || CF.cashUsedInvesting) > 0 && (
                              <tr
                                style={{ borderTop: `1px solid ${T.border}` }}
                              >
                                <TD>Investing Activities</TD>
                                <TD
                                  right
                                  mono
                                  color={
                                    (CF.investingCashFlow ||
                                      CF.cashUsedInvesting) >= 0
                                      ? T.success
                                      : T.error
                                  }
                                >
                                  {fmtC(
                                    CF.investingCashFlow ||
                                      CF.cashUsedInvesting,
                                  )}
                                </TD>
                              </tr>
                            )}
                            {(CF.financingCashFlow || CF.cashFromFinancing) > 0 && (
                              <tr
                                style={{ borderTop: `1px solid ${T.border}` }}
                              >
                                <TD>Financing Activities</TD>
                                <TD
                                  right
                                  mono
                                  color={
                                    (CF.financingCashFlow ||
                                      CF.cashFromFinancing) >= 0
                                      ? T.success
                                      : T.error
                                  }
                                >
                                  {fmtC(
                                    CF.financingCashFlow ||
                                      CF.cashFromFinancing,
                                  )}
                                </TD>
                              </tr>
                            )}
                            {CF.netCashChange != 0 && (
                              <tr
                                style={{
                                  borderTop: `2px solid ${T.border}`,
                                  background: T.surfaceAlt,
                                }}
                              >
                                <TD bold>Net Change in Cash</TD>
                                <TD
                                  right
                                  mono
                                  bold
                                  color={
                                    CF.netCashChange >= 0 ? T.success : T.error
                                  }
                                >
                                  {fmtC(CF.netCashChange)}
                                </TD>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </Card>
                    )}
                  </>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB: INVENTORY                                     */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === "Inventory" && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 20,
                      }}
                    >
                      {[
                        {
                          label: "Raw Materials",
                          value: fmtN(rawMats),
                          sub: "units on hand",
                          color: rawMats > 0 ? T.text : T.textMuted,
                        },
                        {
                          label: "Finished Goods",
                          value: fmtN(finGoods),
                          sub: "units ready to ship",
                          color: T.text,
                        },
                        {
                          label: "In Transit",
                          value: fmtN(inTransit),
                          sub: "units en route",
                          color: T.text,
                        },
                        {
                          label: "Retailer Inventory",
                          value: fmtN(retailerInv),
                          sub: "units at retail",
                          color: T.text,
                        },
                      ].map(({ label, value, sub, color }) => (
                        <KPITile
                          key={label}
                          label={label}
                          value={value}
                          sub={sub}
                          color={color}
                        />
                      ))}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                        marginBottom: 20,
                      }}
                    >
                      <Card title="Inventory Breakdown">
                        {totalInv > 0 &&
                          (() => {
                            const segments = [
                              {
                                label: "Raw Materials",
                                val: rawMats,
                                color: T.primary,
                              },
                              {
                                label: "Finished Goods",
                                val: finGoods,
                                color: T.success,
                              },
                              {
                                label: "In Transit",
                                val: inTransit,
                                color: T.warning,
                              },
                            ];
                            return (
                              <div style={{ marginBottom: 18 }}>
                                <div
                                  style={{
                                    height: 20,
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    display: "flex",
                                    marginBottom: 10,
                                  }}
                                >
                                  {segments
                                    .filter((s) => s.val > 0)
                                    .map((s) => (
                                      <div
                                        key={s.label}
                                        style={{
                                          width: `${(s.val / totalInv) * 100}%`,
                                          background: s.color,
                                          transition: "width .5s",
                                        }}
                                      />
                                    ))}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 16,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {segments.map((s) => (
                                    <div
                                      key={s.label}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: 2,
                                          background: s.color,
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: 11,
                                          color: T.textSec,
                                        }}
                                      >
                                        {s.label}: {fmtN(s.val)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {[
                            {
                              label: "Total Inventory Units",
                              value: fmtN(totalInv),
                            },
                            { label: "Inventory Value", value: fmtC(invValue) },
                            {
                              label: "Days Inventory On-Hand",
                              value: daysInv
                                ? `${daysInv.toFixed(1)} days`
                                : "—",
                            },
                            {
                              label: "Inventory Turnover",
                              value: turnover ? `${turnover.toFixed(2)}×` : "—",
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "7px 0",
                                borderBottom: `1px solid ${T.border}`,
                              }}
                            >
                              <span
                                style={{ fontSize: 13, color: T.textMuted }}
                              >
                                {label}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: T.text,
                                }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card title="Inventory Health">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {(() => {
                            const weeks =
                              totalInv > 0 && unitsSold > 0
                                ? (totalInv / (unitsSold / 13)).toFixed(1)
                                : null;
                            const risk = weeks
                              ? weeks < 2
                                ? "HIGH"
                                : weeks < 4
                                  ? "MEDIUM"
                                  : "LOW"
                              : null;
                            const rColor =
                              risk === "HIGH"
                                ? T.error
                                : risk === "MEDIUM"
                                  ? T.warning
                                  : T.success;
                            return (
                              <div
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: 6,
                                  border: `1px solid ${risk === "HIGH" ? T.errorBdr : risk === "MEDIUM" ? T.warningBdr : T.successBdr}`,
                                  background:
                                    risk === "HIGH"
                                      ? T.errorBg
                                      : risk === "MEDIUM"
                                        ? T.warningBg
                                        : T.successBg,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: rColor,
                                    textTransform: "uppercase",
                                    marginBottom: 4,
                                  }}
                                >
                                  Stockout Risk: {risk || "—"}
                                </div>
                                <div style={{ fontSize: 13, color: T.textSec }}>
                                  {weeks
                                    ? `~${weeks} weeks of coverage at current sell rate`
                                    : "Insufficient data to estimate"}
                                </div>
                              </div>
                            );
                          })()}
                          {wip > 0 && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "7px 0",
                                borderBottom: `1px solid ${T.border}`,
                              }}
                            >
                              <span
                                style={{ fontSize: 13, color: T.textMuted }}
                              >
                                Work In Progress
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: T.text,
                                }}
                              >
                                {fmtN(wip)} units
                              </span>
                            </div>
                          )}
                          {Object.entries(INV)
                            .filter(
                              ([k, v]) =>
                                ![
                                  "rawMaterials",
                                  "finishedGoods",
                                  "inTransit",
                                  "retailerInventory",
                                  "wip",
                                  "totalInventoryValue",
                                  "totalValue",
                                  "inventoryTurnover",
                                  "turns",
                                  "daysInventory",
                                  "doi",
                                  "raw",
                                  "finished",
                                  "transit",
                                  "retailer",
                                  "firmId",
                                  "quarter",
                                  "inventoryReport",
                                  "firm",
                                  "simulation",
                                ].includes(k) &&
                                typeof v !== "object" &&
                                v !== null &&
                                v !== undefined,
                            )
                            .slice(0, 6)
                            .map(([k, v]) => (
                              <div
                                key={k}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "7px 0",
                                  borderBottom: `1px solid ${T.border}`,
                                }}
                              >
                                <span
                                  style={{ fontSize: 13, color: T.textMuted }}
                                >
                                  {k
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: T.text,
                                  }}
                                >
                                  {typeof v === "number"
                                    ? v > 1000
                                      ? fmtN(v)
                                      : v.toFixed(2)
                                    : String(v)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </Card>
                    </div>
                  </>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB: PEER COMPARISON                               */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === "Peer Comparison" && (
                  <>
                    {peers.length > 0 ? (
                      <Card
                        title={`Competitive Comparison — Q${selectedQ}`}
                        pad={false}
                      >
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <TH>Rank</TH>
                                <TH>Team</TH>
                                <TH right>Revenue</TH>
                                <TH right>Gross Margin</TH>
                                <TH right>Net Income</TH>
                                <TH right>Market Share</TH>
                                <TH right>Perfect Order</TH>
                                <TH right>MAPE</TH>
                                <TH right>CSI</TH>
                                <TH right>Score</TH>
                              </tr>
                            </thead>
                            <tbody>
                              {peers.map((p, i) => {
                                const pFin = p.financial || {};
                                const pOps = p.operations || {};
                                const pBsc = p.bsc || {};
                                const pCust = p.customer || {};
                                const rank =
                                  p.rank || p.bscRank || pBsc.rank || i + 1;
                                const isYou =
                                  p.firmId?.toString() ===
                                    firm?.id?.toString() ||
                                  p.isYou ||
                                  p.isCurrentFirm;
                                const pRev = p.revenue || pFin.revenue || 0;
                                const _pGMpct =
                                  p.grossMarginPct ||
                                  p.grossMargin ||
                                  pFin.grossMarginPct ||
                                  pFin.grossMargin ||
                                  (pFin.revenue && pFin.cogs
                                    ? ((pFin.revenue - pFin.cogs) /
                                        pFin.revenue) *
                                      100
                                    : 0);
                                const pNI = p.netIncome || pFin.netIncome || 0;
                                const pMS =
                                  p.marketShare || pCust.marketShare || 0;
                                const pCSI = p.csi || pCust.csi || 0;
                                const pPO =
                                  (p.perfectOrder || pOps.perfectOrder || 0) *
                                  100;
                                const _pMapeRaw =
                                  p.mape ??
                                  pOps.mape ??
                                  (pOps.forecastAccuracy != null
                                    ? 1 - pOps.forecastAccuracy
                                    : null) ??
                                  0;
                                const pMAPE = _pMapeRaw * 100;
                                const pScore =
                                  p.score ||
                                  p.bscOverall ||
                                  p.bscScore ||
                                  pBsc.overall ||
                                  0;
                                return (
                                  <tr
                                    key={p.firmId || i}
                                    style={{
                                      borderTop: `1px solid ${T.border}`,
                                      background: isYou
                                        ? T.primaryLight
                                        : "transparent",
                                    }}
                                  >
                                    <td style={{ padding: "11px 14px" }}>
                                      <Rank r={rank} />
                                    </td>
                                    <td
                                      style={{
                                        padding: "11px 14px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: isYou ? T.primary : T.text,
                                      }}
                                    >
                                      {p.name ||
                                        p.firmName ||
                                        `Firm ${p.firmNumber || i + 1}`}
                                      {isYou && (
                                        <span
                                          style={{
                                            marginLeft: 6,
                                            fontSize: 10,
                                            color: T.primary,
                                            fontWeight: 500,
                                          }}
                                        >
                                          (You)
                                        </span>
                                      )}
                                    </td>
                                    <TD right mono>
                                      {fmtC(pRev)}
                                    </TD>
                                    <td
                                      style={{
                                        padding: "11px 14px",
                                        textAlign: "right",
                                        fontSize: 13,
                                        color:
                                          _pGMpct * 100 >= 15
                                            ? T.success
                                            : _pGMpct * 100 >= 8
                                              ? T.warning
                                              : T.error,
                                      }}
                                    >
                                      {_pGMpct > 0
                                        ? _pGMpct < 1
                                          ? `${(_pGMpct * 100).toFixed(1)}%`
                                          : `${_pGMpct.toFixed(1)}%`
                                        : "—"}
                                    </td>
                                    <TD
                                      right
                                      mono
                                      color={pNI >= 0 ? T.success : T.error}
                                    >
                                      {fmtC(pNI)}
                                    </TD>
                                    <TD right>{fmtP(pMS)}</TD>
                                    <TD
                                      right
                                      color={
                                        pPO >= 85
                                          ? T.success
                                          : pPO >= 75
                                            ? T.warning
                                            : T.error
                                      }
                                    >
                                      {pPO > 0 ? `${pPO.toFixed(1)}%` : "—"}
                                    </TD>
                                    <td
                                      style={{
                                        padding: "11px 14px",
                                        textAlign: "right",
                                      }}
                                    >
                                      <span
                                        style={{
                                          padding: "1px 7px",
                                          borderRadius: 3,
                                          background: mapeBg(pMAPE),
                                          color: mapeC(pMAPE),
                                          fontSize: 11,
                                          fontWeight: 600,
                                        }}
                                      >
                                        {pMAPE > 0
                                          ? `${pMAPE.toFixed(1)}%`
                                          : "—"}
                                      </span>
                                    </td>
                                    <TD
                                      right
                                      color={
                                        pCSI >= 80
                                          ? T.success
                                          : pCSI >= 70
                                            ? T.warning
                                            : T.error
                                      }
                                    >
                                      {pCSI > 0 ? pCSI.toFixed(1) : "—"}
                                    </TD>
                                    <td
                                      style={{
                                        padding: "11px 14px",
                                        textAlign: "right",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: T.text,
                                      }}
                                    >
                                      {pScore > 0 ? pScore.toFixed(1) : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ) : (
                      <Card title={`Competitive Comparison — Q${selectedQ}`}>
                        {peerBench && Object.keys(peerBench).length > 0 ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
                              gap: 16,
                            }}
                          >
                            {Object.entries(peerBench)
                              .slice(0, 6)
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  style={{
                                    padding: "12px 14px",
                                    borderRadius: 6,
                                    border: `1px solid ${T.border}`,
                                    background: T.surfaceAlt,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: T.textMuted,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em",
                                      marginBottom: 4,
                                    }}
                                  >
                                    {k
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (s) => s.toUpperCase())}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 700,
                                      color: T.text,
                                    }}
                                  >
                                    {typeof v === "number"
                                      ? v < 1
                                        ? fmtP(v)
                                        : v > 1000
                                          ? fmtC(v)
                                          : v.toFixed(2)
                                      : String(v)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 13,
                              color: T.textMuted,
                              textAlign: "center",
                              padding: "20px 0",
                            }}
                          >
                            Peer comparison data not available for this quarter.
                          </p>
                        )}
                      </Card>
                    )}

                    {peerBench && (
                      <Card title="Your Performance vs Industry Benchmarks">
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 16,
                          }}
                        >
                          {[
                            {
                              label: "Revenue",
                              yours: fmtC(revenue),
                              avg: fmtC(
                                peerBench.avgRevenue || peerBench.revenue,
                              ),
                            },
                            {
                              label: "Market Share",
                              yours: fmtP(marketShare),
                              avg: fmtP(
                                peerBench.avgMarketShare ||
                                  peerBench.marketShare,
                              ),
                            },
                            {
                              label: "Gross Margin",
                              yours: `${grossMarginPct.toFixed(1)}%`,
                              avg:
                                peerBench.avgGrossMargin ||
                                peerBench.grossMargin
                                  ? fmtPct(
                                      (peerBench.avgGrossMargin ||
                                        peerBench.grossMargin) * 100 ||
                                        peerBench.avgGrossMargin,
                                    )
                                  : "—",
                            },
                            {
                              label: "Perfect Order",
                              yours: fmtP(perfectOrder),
                              avg: fmtP(
                                peerBench.avgPerfectOrder ||
                                  peerBench.perfectOrder,
                              ),
                            },
                            {
                              label: "CSI Score",
                              yours: csi ? csi.toFixed(1) : "—",
                              avg:
                                peerBench.avgCsi || peerBench.csi
                                  ? (peerBench.avgCsi || peerBench.csi).toFixed(
                                      1,
                                    )
                                  : "—",
                            },
                            {
                              label: "Forecast MAPE",
                              yours: mape ? `${mape.toFixed(1)}%` : "—",
                              avg:
                                peerBench.avgMape || peerBench.mape
                                  ? `${((peerBench.avgMape || peerBench.mape) * 100).toFixed(1)}%`
                                  : "—",
                            },
                          ]
                            .filter((r) => r.avg && r.avg !== "—")
                            .map(({ label, yours, avg }) => (
                              <div
                                key={label}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "10px 14px",
                                  borderRadius: 6,
                                  border: `1px solid ${T.border}`,
                                  background: T.surfaceAlt,
                                }}
                              >
                                <span
                                  style={{ fontSize: 13, color: T.textSec }}
                                >
                                  {label}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 20,
                                    alignItems: "center",
                                  }}
                                >
                                  <div style={{ textAlign: "right" }}>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: T.textMuted,
                                        marginBottom: 1,
                                      }}
                                    >
                                      You
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: T.primary,
                                      }}
                                    >
                                      {yours}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      width: 1,
                                      height: 28,
                                      background: T.border,
                                    }}
                                  />
                                  <div style={{ textAlign: "right" }}>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: T.textMuted,
                                        marginBottom: 1,
                                      }}
                                    >
                                      Avg
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: T.textSec,
                                      }}
                                    >
                                      {avg}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </Card>
                    )}

                    {(CMP.events || CMP.quarterEvents || []).length > 0 && (
                      <Card title={`Quarter ${selectedQ} Events`}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          {(CMP.events || CMP.quarterEvents).map((evt, i) => {
                            const isGood = [
                              "DEMAND_SURGE",
                              "COMPETITOR_STUMBLE",
                              "POSITIVE",
                            ].some(
                              (e) =>
                                evt.effect?.includes(e) ||
                                evt.type?.includes(e),
                            );
                            return (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 12,
                                  padding: "14px 16px",
                                  borderRadius: 8,
                                  background: isGood
                                    ? T.successBg
                                    : T.warningBg,
                                }}
                              >
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: isGood ? T.success : T.warning,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    fill="none"
                                    stroke="#fff"
                                    viewBox="0 0 24 24"
                                  >
                                    {isGood ? (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                      />
                                    ) : (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                      />
                                    )}
                                  </svg>
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: T.text,
                                      marginBottom: 3,
                                    }}
                                  >
                                    {evt.type?.replace(/_/g, " ") || "Event"}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      color: T.textSec,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {evt.description ||
                                      evt.message ||
                                      `Effect: ${evt.effect || "—"}`}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {/* ══════════════════════════════════════════════════ */}
                {/* TAB: YTD                                           */}
                {/* ══════════════════════════════════════════════════ */}
                {activeTab === "YTD" && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        gap: 14,
                        marginBottom: 20,
                      }}
                    >
                      {[
                        {
                          label: "YTD Revenue",
                          value: fmtC(ytdRev),
                          sub: "cumulative",
                        },
                        {
                          label: "YTD Net Income",
                          value: fmtC(ytdNI),
                          sub: "cumulative",
                          color:
                            ytdNI < 0
                              ? T.error
                              : ytdNI > 0
                                ? T.success
                                : T.text,
                        },
                        {
                          label: "YTD Units Sold",
                          value: fmtN(ytdUnits),
                          sub: "cumulative",
                        },
                        {
                          label: "YTD Cash Flow",
                          value: fmtC(ytdCash),
                          sub: "operating activities",
                        },
                      ].map(({ label, value, sub, color }) => (
                        <KPITile
                          key={label}
                          label={label}
                          value={value}
                          sub={sub}
                          color={color}
                        />
                      ))}
                    </div>

                    <Card
                      title={`Year-to-Date Detail — Q1 through Q${selectedQ}`}
                      pad={false}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            <TH>Metric</TH>
                            <TH right>YTD Value</TH>
                            <TH right>Per Quarter Avg</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              label: "Revenue",
                              value: ytdRev,
                              avg: selectedQ ? ytdRev / selectedQ : 0,
                            },
                            {
                              label: "Gross Profit",
                              value: YTD.grossProfit || 0,
                              avg: selectedQ
                                ? (YTD.grossProfit || 0) / selectedQ
                                : 0,
                            },
                            {
                              label: "Operating Income",
                              value: YTD.operatingIncome || 0,
                              avg: selectedQ
                                ? (YTD.operatingIncome || 0) / selectedQ
                                : 0,
                            },
                            {
                              label: "Net Income",
                              value: ytdNI,
                              avg: selectedQ ? ytdNI / selectedQ : 0,
                            },
                            {
                              label: "Units Sold",
                              value: ytdUnits,
                              avg: selectedQ ? ytdUnits / selectedQ : 0,
                              isUnits: true,
                            },
                            {
                              label: "Marketing Spend",
                              value:
                                YTD.marketingBudget || YTD.marketingSpend || 0,
                              avg: 0,
                            },
                            { label: "Cash Generated", value: ytdCash, avg: 0 },
                          ]
                            .filter((r) => r.value !== 0)
                            .map(({ label, value, avg, isUnits }) => (
                              <tr
                                key={label}
                                style={{ borderTop: `1px solid ${T.border}` }}
                              >
                                <TD>{label}</TD>
                                <TD right mono bold>
                                  {isUnits ? fmtN(value) : fmtC(value)}
                                </TD>
                                <TD right mono color={T.textMuted}>
                                  {avg
                                    ? isUnits
                                      ? fmtN(avg)
                                      : fmtC(avg)
                                    : "—"}
                                </TD>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {Object.entries(YTD).filter(
                        ([k, v]) =>
                          ![
                            "revenue",
                            "netIncome",
                            "unitsSold",
                            "cashGenerated",
                            "operatingCashFlow",
                            "grossProfit",
                            "operatingIncome",
                            "marketingBudget",
                            "marketingSpend",
                            "firmId",
                            "throughQuarter",
                            "ytdTotals",
                            "quarterlySummary",
                            "firm",
                            "simulation",
                          ].includes(k) &&
                          typeof v !== "object" &&
                          v !== null &&
                          v !== undefined,
                      ).length > 0 && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderTop: `1px solid ${T.border}`,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 16,
                          }}
                        >
                          {Object.entries(YTD)
                            .filter(
                              ([k, v]) =>
                                ![
                                  "revenue",
                                  "netIncome",
                                  "unitsSold",
                                  "cashGenerated",
                                  "operatingCashFlow",
                                  "grossProfit",
                                  "operatingIncome",
                                  "marketingBudget",
                                  "marketingSpend",
                                  "firmId",
                                  "throughQuarter",
                                  "ytdTotals",
                                  "quarterlySummary",
                                  "firm",
                                  "simulation",
                                ].includes(k) &&
                                typeof v !== "object" &&
                                v !== null &&
                                v !== undefined,
                            )
                            .slice(0, 8)
                            .map(([k, v]) => (
                              <div key={k}>
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: T.textMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  {k.replace(/([A-Z])/g, " $1")}
                                </div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: T.text,
                                  }}
                                >
                                  {typeof v === "number"
                                    ? v > 1000
                                      ? fmtC(v)
                                      : v.toFixed(2)
                                    : String(v)}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </Card>

                    {(YTD_QS.length > 0 ||
                      trendArr.length > 1 ||
                      allReports.length > 1) && (
                      <Card title="Cumulative Revenue & Income" pad={false}>
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <thead>
                            <tr>
                              <TH>Quarter</TH>
                              <TH right>Revenue</TH>
                              <TH right>Net Income</TH>
                              <TH right>Units</TH>
                              <TH right>Cum. Revenue</TH>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let cumRev = 0;
                              const source =
                                YTD_QS.length > 0
                                  ? YTD_QS
                                  : trendArr.length > 0
                                    ? trendArr
                                    : allReports;
                              return source
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (a.quarter || a.Quarter) -
                                    (b.quarter || b.Quarter),
                                )
                                .map((r) => {
                                  const rr = r.summary || r;
                                  const q = r.quarter || r.Quarter;
                                  const arFull =
                                    allReports.find(
                                      (x) => (x.quarter || x.Quarter) === q,
                                    ) || {};
                                  const rv =
                                    rr.revenue ||
                                    arFull.incomeStatement?.revenue ||
                                    0;
                                  const ni =
                                    rr.netIncome ||
                                    arFull.incomeStatement?.netIncome ||
                                    0;
                                  const u =
                                    rr.unitsSold ||
                                    arFull.keyMetrics?.unitsSold ||
                                    0;
                                  cumRev += rv;
                                  return (
                                    <tr
                                      key={q}
                                      style={{
                                        borderTop: `1px solid ${T.border}`,
                                        background:
                                          q === selectedQ
                                            ? T.primaryLight
                                            : "transparent",
                                      }}
                                    >
                                      <TD
                                        bold={q === selectedQ}
                                        color={
                                          q === selectedQ ? T.primary : T.text
                                        }
                                      >
                                        Q{q}
                                      </TD>
                                      <TD right mono>
                                        {fmtC(rv)}
                                      </TD>
                                      <TD
                                        right
                                        mono
                                        color={ni >= 0 ? T.success : T.error}
                                      >
                                        {fmtC(ni)}
                                      </TD>
                                      <TD right mono>
                                        {fmtN(u)}
                                      </TD>
                                      <TD right mono bold>
                                        {fmtC(cumRev)}
                                      </TD>
                                    </tr>
                                  );
                                });
                            })()}
                          </tbody>
                        </table>
                      </Card>
                    )}
                  </>
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
