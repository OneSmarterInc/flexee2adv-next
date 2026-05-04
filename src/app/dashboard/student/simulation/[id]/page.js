"use client";

/**
 * SimulationDashboard
 *
 * FIXES (cumulative):
 *  FIX 1 — Green Score: reads greenScore.greenScoreHistory[last].newScore
 *  FIX 2 — S&OP Summary: reads sopDash.totalMarketDemand / supplyPlan / keyMetrics.*
 *  FIX 3 — BSC Scorecard: reads firmBsc.scorecard.* + note guard uses !firmBsc?.scorecard
 *  FIX 4 — Credit Status: reads hist[0].effectiveRate || annualRate
 *  FIX 5 — Analytics: guards featureEnabled !== false before storing in state
 *  FIX 6 — TenQ: removed dead tenqTrend state + fetch
 *  FIX 7 — Layout alignItems:"start" so columns are natural height
 *  FIX 8 — Column balance: Inventory Status + Customer Metrics moved to LEFT column
 *           (after Cost Breakdown). Previously they were in the right column, making
 *           it much taller than the left and creating a large white gap in the center.
 *           Right column now: BSC → Decisions → Credit → Competitive → Sustainability
 *           Left column now:  Financial → Scorecard → S&OP+Analytics → Cost → Inventory → Customer
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../components/StudentHeader";
import StudentSidebar from "../../components/StudentSidebar";

// ─── SEASON CONFIGURATION ─────────────────────────────────────────────────────
const SEASON_CONFIG = {
  1: { name: "Q1 Post-Holiday", icon: "❄️", semantic: "blue", hint: "Lower demand expected" },
  2: { name: "Q2 Spring", icon: "🌸", semantic: "pink", hint: "Demand recovering" },
  3: { name: "Q3 Summer", icon: "☀️", semantic: "amber", hint: "Steady demand" },
  4: { name: "Q4 Holiday", icon: "🎄", semantic: "emerald", hint: "Peak demand season!" },
};

// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6", bgSurface: "#FFFFFF", bgElevated: "#F9FAFB",
  bgHover: "#F3F4F6", border: "#E5E7EB", borderStrong: "#D1D5DB",
  textPrimary: "#111827", textSec: "#374151", textMuted: "#6B7280",
  textDisabled: "#9CA3AF", accent: "#1D4ED8", accentHover: "#1E40AF",
  accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  green: "#065F46", greenBg: "#D1FAE5", greenBorder: "#6EE7B7",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
  red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  purple: "#5B21B6", purpleBg: "#EDE9FE", purpleBorder: "#C4B5FD",
  teal: "#065F46", tealBg: "#CCFBF1", tealBorder: "#5EEAD4",
  headerBg: "#FFFFFF", tableHead: "#F9FAFB", rowAlt: "#FAFAFA",
  sidebarBg: "#FFFFFF",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
};

const DARK = {
  bgPage: "#0D1117", bgSurface: "#161B22", bgElevated: "#1C2128",
  bgHover: "#21262D", border: "#30363D", borderStrong: "#444C56",
  textPrimary: "#E6EDF3", textSec: "#8D96A0", textMuted: "#545D68",
  textDisabled: "#3D444D", accent: "#4493F8", accentHover: "#68B3FB",
  accentLight: "#1A2332", accentBorder: "#1F3A5F",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)", greenBorder: "rgba(63,185,80,0.30)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)", redBorder: "rgba(248,81,73,0.30)",
  purple: "#C4B5FD", purpleBg: "rgba(139,92,246,0.10)", purpleBorder: "rgba(139,92,246,0.30)",
  teal: "#5EEAD4", tealBg: "rgba(20,184,166,0.10)", tealBorder: "rgba(20,184,166,0.30)",
  headerBg: "#161B22", tableHead: "#1C2128", rowAlt: "#191E25",
  sidebarBg: "#161B22",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
  shadowMd: "0 4px 8px rgba(0,0,0,0.40)",
};

const statusStyle = (type, t) => ({
  success: { color: t.green,  bg: t.greenBg,  border: t.greenBorder  },
  warning: { color: t.amber,  bg: t.amberBg,  border: t.amberBorder  },
  error:   { color: t.red,    bg: t.redBg,    border: t.redBorder    },
  purple:  { color: t.purple, bg: t.purpleBg, border: t.purpleBorder },
  teal:    { color: t.teal,   bg: t.tealBg,   border: t.tealBorder   },
}[type] || { color: t.textMuted, bg: t.bgElevated, border: t.border });

const buildCSS = (t, isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${t.bgPage}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
  .nb { transition: background-color 0.12s, color 0.12s; }
  .nb:hover { background-color: ${t.bgHover} !important; color: ${t.textPrimary} !important; }
  .nb.act { background-color: ${isDark ? t.accentLight : "#EFF6FF"} !important; color: ${t.accent} !important; }
  .mc { transition: box-shadow 0.12s; }
  .mc:hover { box-shadow: ${t.shadowMd} !important; }
  .dr { transition: background-color 0.10s; }
  .dr:hover { background-color: ${t.bgHover} !important; }
  .pb { transition: background-color 0.12s; }
  .pb:hover { background-color: ${t.accentHover} !important; }
  .gb { transition: background-color 0.12s, border-color 0.12s; }
  .gb:hover { background-color: ${t.bgHover} !important; }
  .tb { transition: background-color 0.12s; }
  .tb:hover { background-color: ${t.bgHover} !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.75s linear infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes fi { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
  .fi { animation: fi 0.2s ease both; }
  select option { background: ${t.bgElevated}; color: ${t.textPrimary}; }
`;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Badge = ({ type, children, t }) => {
  const s = statusStyle(type, t);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Card = ({ title, headerRight, children, t, noPad = false, style = {} }) => (
  <div style={{ background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8, overflow: "hidden", boxShadow: t.shadow, ...style }}>
    {title && (
      <div style={{ padding: "11px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{title}</span>
        {headerRight}
      </div>
    )}
    {noPad ? children : <div style={{ padding: 16 }}>{children}</div>}
  </div>
);

const KRow = ({ label, value, valueColor, t }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
    <span style={{ fontSize: 12, color: t.textMuted }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || t.textPrimary, fontFamily: "SF Mono, Consolas, monospace" }}>{value}</span>
  </div>
);

// ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
const fmt = (v, compact = false) => {
  if (v == null) return "—";
  if (compact) {
    if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  }
  return `$${v.toLocaleString()}`;
};
const pct   = (v, dp = 1) => v != null ? `${(v > 1 ? v : v * 100).toFixed(dp)}%` : "—";
const num   = (v) => v != null ? Math.round(v).toLocaleString() : "—";
const x     = (v, dp = 1) => v != null ? `${v.toFixed(dp)}x` : "—";
const delta = (cur, prev) => {
  if (cur == null || prev == null || prev === 0) return null;
  return ((cur - prev) / Math.abs(prev) * 100);
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SimulationDashboard() {
  const router = useRouter();
  const params = useParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const [activeTab,      setActiveTab]      = useState("dashboard");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [simulation,     setSimulation]     = useState(null);
  const [firm,           setFirm]           = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [kpiReports,     setKpiReports]     = useState([]);
  const [competitorData, setCompetitorData] = useState(null);
  const [dataVisibility, setDataVisibility] = useState(null);
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [decisions,      setDecisions]      = useState(null);
  const [creditHistory,  setCreditHistory]  = useState(null);
  const [bscData,        setBscData]        = useState(null);
  const [firmBsc,        setFirmBsc]        = useState(null);
  const [analyticsDash,  setAnalyticsDash]  = useState(null);
  const [sopDash,        setSopDash]        = useState(null);
  const [greenScore,     setGreenScore]     = useState(null);
  const [tenqReports,    setTenqReports]    = useState({});
  const [tenqYtd,        setTenqYtd]        = useState({});
  const [tenqCompare,    setTenqCompare]    = useState({});

  const getToken = useCallback(() => localStorage.getItem("access_token"), []);

  const apiFetch = useCallback(async (url) => {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  }, [getToken]);

  // ─── 10-Q REPORT HELPERS ──────────────────────────────────────────────────────
  const getCalendarQuarter = (q) => ((q - 1) % 4) + 1;
  const getSeason = (q) => SEASON_CONFIG[getCalendarQuarter(q)] || SEASON_CONFIG[1];

  const fetchTenQReport = useCallback(async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqReports((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching quarterly report for Q${quarter}:`, err);
    }
  }, [params.id, apiUrl, getToken]);

  const fetchTenQYtd = useCallback(async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}/ytd`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqYtd((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching YTD for Q${quarter}:`, err);
    }
  }, [params.id, apiUrl, getToken]);

  const fetchTenQCompare = useCallback(async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}/compare`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqCompare((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching peer comparison for Q${quarter}:`, err);
    }
  }, [params.id, apiUrl, getToken]);

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

  const handleDownload10QReport = useCallback(async () => {
    const latestReport = kpiReports.length > 0 ? kpiReports[kpiReports.length - 1] : null;
    if (!latestReport || !currentQuarter) return;

    try {
      const season = getSeason(currentQuarter);

      // Helper functions for formatting
      const fmtCurrency = (val) => {
        if (val === null || val === undefined) return "$0";
        const absVal = Math.abs(val);
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(absVal);
        return val < 0 ? `(${formatted})` : formatted;
      };

      const fmtNumber = (val) => {
        if (val === null || val === undefined) return "0";
        return new Intl.NumberFormat("en-US").format(Math.round(val));
      };

      const fmtPercent = (val) => {
        if (val === null || val === undefined) return "0%";
        const pct = val > 1 ? val : val * 100;
        return `${pct.toFixed(0)}%`;
      };

      // Calculate YTD totals from kpiReports (using mapped field names from dashboard)
      const ytdTotals = kpiReports.reduce((acc, r) => ({
        revenue:           acc.revenue + (r.revenue || 0),
        cogs:              acc.cogs + (r.cogs || 0),
        laborCost:         acc.laborCost + (r.costLabor || 0),
        holdingCost:       acc.holdingCost + (r.costHolding || 0),
        marketingCost:     acc.marketingCost + (r.costMarketing || 0),
        techMaintenanceCost: acc.techMaintenanceCost + (r.costTech || 0),
        qualityCost:       acc.qualityCost + (r.costQuality || 0),
        freightCost:       acc.freightCost + (r.costFreight || 0),
        operatingExpenses: acc.operatingExpenses + (r.operatingExpenses || 0),
        interestCost:      acc.interestCost + (r.costInterest || 0),
        netIncome:         acc.netIncome + (r.netIncome || 0),
        unitsProduced:     acc.unitsProduced + (r.unitsProduced || 0),
        unitsSold:         acc.unitsSold + (r.unitsSold || 0),
      }), {
        revenue: 0, cogs: 0, laborCost: 0, holdingCost: 0, marketingCost: 0,
        techMaintenanceCost: 0, qualityCost: 0, freightCost: 0, operatingExpenses: 0,
        interestCost: 0, netIncome: 0, unitsProduced: 0, unitsSold: 0,
      });

      // Calculate derived values for each quarter
      const quarterlyData = kpiReports.map((r) => ({
        quarter: r.quarter,
        revenue: r.revenue || 0,
        cogs: r.cogs || 0,
        grossMargin: (r.revenue || 0) - (r.cogs || 0),
        laborCost: r.costLabor || 0,
        holdingCost: r.costHolding || 0,
        marketingCost: r.costMarketing || 0,
        techMaintenanceCost: r.costTech || 0,
        qualityCost: r.costQuality || 0,
        freightCost: r.costFreight || 0,
        totalOpex: (r.costLabor || 0) + (r.costHolding || 0) + (r.costMarketing || 0) + (r.costTech || 0) + (r.costQuality || 0) + (r.costFreight || 0),
        operatingIncome: (r.revenue || 0) - (r.cogs || 0) - ((r.costLabor || 0) + (r.costHolding || 0) + (r.costMarketing || 0) + (r.costTech || 0) + (r.costQuality || 0) + (r.costFreight || 0)),
        interestCost: r.costInterest || 0,
        netIncome: r.netIncome || 0,
        cash: r.cash || 0,
        inventoryValue: r.inventoryValue || 0,
        rawMaterialUnits: r.rawMtlUnits || 0,
        finishedGoodsUnits: r.fgUnits || 0,
        retailerInventory: r.retailerInventory || 0,
        inventoryTurnover: r.inventoryTurnover || 0,
        weeksOfSupply: r.weeksOfSupply || 0,
        unitsProduced: r.unitsProduced || 0,
        unitsSold: r.unitsSold || 0,
        fillRate: r.fillRate || 0,
        csi: r.csi || 0,
        marketShare: r.marketShare || 0,
        perfectOrder: r.perfectOrder || 0,
        forecastAccuracy: r.forecastAcc || 0,
      }));

      // Calculate YTD derived values
      const ytdGrossMargin = ytdTotals.revenue - ytdTotals.cogs;
      const ytdTotalOpex = ytdTotals.laborCost + ytdTotals.holdingCost + ytdTotals.marketingCost + ytdTotals.techMaintenanceCost + ytdTotals.qualityCost + ytdTotals.freightCost;
      const ytdOperatingIncome = ytdGrossMargin - ytdTotalOpex;

      // Build quarterly columns for tables
      const quarterHeaders = quarterlyData
        .map((q) => `<th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600;">Q${q.quarter}</th>`)
        .join("");

      // Income Statement rows builder
      const buildIncomeRow = (label, values, isTotal = false, isSubtotal = false, indent = false) => {
        const style = isTotal
          ? "font-weight: bold; background-color: #f0f0f0;"
          : isSubtotal ? "font-weight: 600; background-color: #f8f8f8;" : "";
        const labelStyle = indent ? "padding-left: 20px; color: #555;" : "";
        return `<tr style="${style}"><td style="padding: 6px 12px; border-bottom: 1px solid #ddd; ${labelStyle}">${label}</td>${values.map((v) => `<td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #ddd; font-family: 'Courier New', monospace;">${v}</td>`).join("")}</tr>`;
      };

      const element = document.createElement("div");
      element.style.padding = "20px";
      element.style.backgroundColor = "white";
      element.style.color = "#000";

      const htmlContent = `<div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.4; max-width: 900px; margin: 0 auto; font-size: 11px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">FORM 10-Q QUARTERLY REPORT</h1>
          <h2 style="margin: 8px 0 0 0; font-size: 16px; font-weight: bold;">${firm?.name || "FIRM"}</h2>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #444;">For the Quarter Ended Q${currentQuarter} • ${season.name} ${season.icon}</p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">${simulation?.name || "FLEXEE Supply Chain Simulation"}</p>
        </div>

        <!-- INCOME STATEMENT -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">CONSOLIDATED STATEMENTS OF OPERATIONS</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="background-color: #f5f5f5;">
              <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
              ${quarterHeaders}
              <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">YTD</th>
            </tr></thead>
            <tbody>
              ${buildIncomeRow("Net Revenue", [...quarterlyData.map((q) => fmtCurrency(q.revenue)), fmtCurrency(ytdTotals.revenue)], false, true)}
              ${buildIncomeRow("Cost of Goods Sold", [...quarterlyData.map((q) => fmtCurrency(q.cogs)), fmtCurrency(ytdTotals.cogs)], false, false)}
              ${buildIncomeRow("Gross Margin", [...quarterlyData.map((q) => fmtCurrency(q.grossMargin)), fmtCurrency(ytdGrossMargin)], false, true)}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px; font-size: 8px;"></td></tr>
              <tr style="background-color: #f9f9f9;"><td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">OPERATING EXPENSES</td></tr>
              ${buildIncomeRow("Labor Costs", [...quarterlyData.map((q) => fmtCurrency(q.laborCost)), fmtCurrency(ytdTotals.laborCost)], false, false, true)}
              ${buildIncomeRow("Holding Costs", [...quarterlyData.map((q) => fmtCurrency(q.holdingCost)), fmtCurrency(ytdTotals.holdingCost)], false, false, true)}
              ${buildIncomeRow("Marketing Expense", [...quarterlyData.map((q) => fmtCurrency(q.marketingCost)), fmtCurrency(ytdTotals.marketingCost)], false, false, true)}
              ${buildIncomeRow("Technology Maintenance", [...quarterlyData.map((q) => fmtCurrency(q.techMaintenanceCost)), fmtCurrency(ytdTotals.techMaintenanceCost)], false, false, true)}
              ${buildIncomeRow("Quality Costs", [...quarterlyData.map((q) => fmtCurrency(q.qualityCost)), fmtCurrency(ytdTotals.qualityCost)], false, false, true)}
              ${buildIncomeRow("Freight Costs", [...quarterlyData.map((q) => fmtCurrency(q.freightCost)), fmtCurrency(ytdTotals.freightCost)], false, false, true)}
              ${buildIncomeRow("Total OPEX", [...quarterlyData.map((q) => fmtCurrency(q.totalOpex)), fmtCurrency(ytdTotalOpex)], false, true)}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 2px;"></td></tr>
              ${buildIncomeRow("Operating Income", [...quarterlyData.map((q) => fmtCurrency(q.operatingIncome)), fmtCurrency(ytdOperatingIncome)], false, true)}
              ${buildIncomeRow("Interest Expense", [...quarterlyData.map((q) => fmtCurrency(q.interestCost)), fmtCurrency(ytdTotals.interestCost)], false, false)}
              ${buildIncomeRow("Net Income", [...quarterlyData.map((q) => fmtCurrency(q.netIncome)), fmtCurrency(ytdTotals.netIncome)], true)}
            </tbody>
          </table>
        </div>

        <!-- INVENTORY REPORT -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">INVENTORY REPORT</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="background-color: #f5f5f5;">
              <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
              ${quarterHeaders}
              <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">Current</th>
            </tr></thead>
            <tbody>
              <tr style="background-color: #f9f9f9;"><td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Raw Materials:</td></tr>
              ${buildIncomeRow("Units", [...quarterlyData.map((q) => fmtNumber(q.rawMaterialUnits)), fmtNumber(latestReport.rawMtlUnits)], false, false, true)}
              <tr style="background-color: #f9f9f9;"><td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Finished Goods:</td></tr>
              ${buildIncomeRow("Units", [...quarterlyData.map((q) => fmtNumber(q.finishedGoodsUnits)), fmtNumber(latestReport.fgUnits)], false, false, true)}
              ${buildIncomeRow("Retailer Inventory", [...quarterlyData.map((q) => fmtNumber(q.retailerInventory)), fmtNumber(latestReport.retailerInventory)], false, false)}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              ${buildIncomeRow("Total Inventory Value", [...quarterlyData.map((q) => fmtCurrency(q.inventoryValue)), fmtCurrency(latestReport.inventoryValue)], false, true)}
              ${buildIncomeRow("Inventory Turnover", [...quarterlyData.map((q) => q.inventoryTurnover?.toFixed(1) || "0"), latestReport.inventoryTurnover?.toFixed(1) || "0"], false, false)}
              ${buildIncomeRow("Weeks of Supply", [...quarterlyData.map((q) => q.weeksOfSupply?.toFixed(1) || "0"), latestReport.weeksOfSupply?.toFixed(1) || "0"], false, false)}
            </tbody>
          </table>
        </div>

        <!-- KEY METRICS -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">KEY PERFORMANCE METRICS</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead><tr style="background-color: #f5f5f5;">
              <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Metric</th>
              ${quarterHeaders}
              <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">YTD/Avg</th>
            </tr></thead>
            <tbody>
              ${buildIncomeRow("Units Produced", [...quarterlyData.map((q) => fmtNumber(q.unitsProduced)), fmtNumber(ytdTotals.unitsProduced)])}
              ${buildIncomeRow("Units Sold", [...quarterlyData.map((q) => fmtNumber(q.unitsSold)), fmtNumber(ytdTotals.unitsSold)])}
              ${buildIncomeRow("Fill Rate", [...quarterlyData.map((q) => fmtPercent(q.fillRate)), fmtPercent(quarterlyData.reduce((a, q) => a + q.fillRate, 0) / quarterlyData.length)])}
              ${buildIncomeRow("CSI Score", [...quarterlyData.map((q) => q.csi?.toFixed(0) || "0"), (quarterlyData.reduce((a, q) => a + (q.csi || 0), 0) / quarterlyData.length).toFixed(1)])}
              ${buildIncomeRow("Market Share", [...quarterlyData.map((q) => fmtPercent(q.marketShare)), fmtPercent(quarterlyData.reduce((a, q) => a + q.marketShare, 0) / quarterlyData.length)])}
              ${buildIncomeRow("Perfect Order", [...quarterlyData.map((q) => fmtPercent(q.perfectOrder)), fmtPercent(quarterlyData.reduce((a, q) => a + q.perfectOrder, 0) / quarterlyData.length)])}
              ${buildIncomeRow("Forecast Accuracy", [...quarterlyData.map((q) => fmtPercent(q.forecastAccuracy)), fmtPercent(quarterlyData.reduce((a, q) => a + q.forecastAccuracy, 0) / quarterlyData.length)])}
            </tbody>
          </table>
        </div>

        <!-- BALANCED SCORECARD SUMMARY -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">BALANCED SCORECARD - Q${currentQuarter}</h3>
          <table style="width: 50%; border-collapse: collapse; font-size: 11px;">
            <tbody>
              <tr><td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Overall Score</td><td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">${latestReport?.bscOverall?.toFixed(1) || "0"}</td></tr>
              <tr><td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Grade</td><td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">${latestReport?.bscGrade || "N/A"}</td></tr>
              <tr><td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Industry Rank</td><td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">#${latestReport?.bscRank || "—"}</td></tr>
              <tr><td colspan="2" style="padding: 4px;"></td></tr>
              <tr><td style="padding: 6px 12px; border: 1px solid #ddd;">Financial Perspective</td><td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${latestReport?.bscFinancial?.toFixed(0) || "0"}</td></tr>
              <tr><td style="padding: 6px 12px; border: 1px solid #ddd;">Customer Perspective</td><td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${latestReport?.bscCustomer?.toFixed(0) || "0"}</td></tr>
              <tr><td style="padding: 6px 12px; border: 1px solid #ddd;">Internal Process</td><td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${latestReport?.bscProcess?.toFixed(0) || "0"}</td></tr>
              <tr><td style="padding: 6px 12px; border: 1px solid #ddd;">Learning & Growth</td><td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${latestReport?.bscLearning?.toFixed(0) || "0"}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; text-align: center; font-size: 9px; color: #666;">
          <p style="margin: 0;"><strong>FLEXEE 2.0</strong> Supply Chain Management Simulation</p>
          <p style="margin: 4px 0 0 0;">Report Generated: ${new Date().toLocaleString()} | This report is for educational purposes only.</p>
        </div>
      </div>`;

      element.innerHTML = htmlContent;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `10-Q_${firm?.name?.replace(/\s+/g, "_") || "Firm"}_Q${currentQuarter}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error downloading 10-Q report:", error);
      setError("Failed to download report. Please try again.");
    }
  }, [currentQuarter, kpiReports, firm, simulation]);


  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const userId   = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      if (userRole !== "student") { router.push("/login"); return; }

      const simData = await apiFetch(`${apiUrl}/simulations/${params.id}`);
      if (!simData) { setError("Failed to load simulation"); setLoading(false); return; }
      setSimulation(simData);

      let studentFirm = null;
      for (const f of (simData.firms || [])) {
        const found = f.enrollments?.find(e => {
          const eid = e.user?.id || e.user?._id || e.userId;
          return eid?.toString() === userId?.toString();
        });
        if (found) { studentFirm = f; setFirm(f); break; }
      }
      if (!studentFirm) { setError("Could not find your firm enrollment"); setLoading(false); return; }

      const fid = studentFirm.id || studentFirm._id;

      const qData = await apiFetch(`${apiUrl}/simulations/${params.id}/current-quarter`);
      const quarter = qData?.quarter || simData.currentQuarter;
      setCurrentQuarter(quarter);

      const [
        kpiRaw, compRaw, decRaw, creditRaw,
        bscAllRaw, firmBscRaw, analyticsRaw, sopRaw, greenRaw,
      ] = await Promise.all([
        apiFetch(`${apiUrl}/reports/kpi-history/${params.id}/${fid}`),
        apiFetch(`${apiUrl}/reports/competitor-comparison/${params.id}/${fid}/${quarter}`),
        apiFetch(`${apiUrl}/decisions/simulation/${params.id}/firm/${fid}/quarter/${quarter}`),
        apiFetch(`${apiUrl}/simulations/${params.id}/firms/${fid}/credit-history`),
        apiFetch(`${apiUrl}/simulations/${params.id}/balanced-scorecard?quarter=${quarter}`),
        apiFetch(`${apiUrl}/reports/balanced-scorecard/${params.id}/${fid}/${quarter}`),
        apiFetch(`${apiUrl}/simulations/${params.id}/firms/${fid}/analytics-dashboard?quarter=${quarter}`),
        apiFetch(`${apiUrl}/simulations/${params.id}/firms/${fid}/sop-dashboard?quarter=${quarter}`),
        apiFetch(`${apiUrl}/simulations/${params.id}/firms/${fid}/green-score`),
      ]);

      if (kpiRaw) {
        const raw = Array.isArray(kpiRaw) ? kpiRaw : kpiRaw.history || [];
        const mappedReports = raw.map(k => ({
          quarter:           k.quarter,
          revenue:           k.financial?.revenue           || 0,
          netIncome:         k.financial?.netIncome         || 0,
          cash:              k.financial?.cash              || 0,
          grossMarginPct:    k.financial?.grossMarginPct    || 0,
          cogs:              k.financial?.cogs              || 0,
          operatingExpenses: k.financial?.operatingExpenses || 0,
          operatingMargin:   k.financial?.operatingMargin   || 0,
          csi:               k.customer?.csi               || 0,
          marketShare:       k.customer?.marketShare        || 0,
          fillRate:          k.customer?.fillRate           || 0,
          returnRate:        k.customer?.returnRate         || 0,
          customersLoyal:    k.customer?.customersLoyal     || 0,
          customersInPlay:   k.customer?.customersInPlay    || 0,
          customersChurned:  k.customer?.customersChurned   || 0,
          perfectOrder:      k.operations?.perfectOrder        || 0,
          capacityUtil:      k.operations?.capacityUtilization || 0,
          defectRate:        k.operations?.defectRate          || 0,
          onTimeDelivery:    k.operations?.onTimeDelivery      || 0,
          mape:              k.operations?.mape                || 0,
          unitsProduced:     k.operations?.unitsProduced       || 0,
          unitsSold:         k.operations?.unitsSold           || 0,
          rawMtlUnits:       k.inventory?.rawMaterialUnits   || 0,
          fgUnits:           k.inventory?.finishedGoodsUnits || 0,
          inventoryValue:    k.inventory?.inventoryValue     || 0,
          inventoryTurnover: k.inventory?.inventoryTurnover  || 0,
          weeksOfSupply:     k.inventory?.weeksOfSupply      || 0,
          retailerInventory: k.inventory?.retailerInventory  || 0,
          techCount:         k.learning?.techSystemsCount || 0,
          scMaturity:        k.learning?.scMaturity       || "BASIC",
          forecastAcc:       k.learning?.forecastAccuracy || 0,
          bscFinancial:      k.bsc?.financial || 0,
          bscCustomer:       k.bsc?.customer  || 0,
          bscProcess:        k.bsc?.process   || 0,
          bscLearning:       k.bsc?.learning  || 0,
          bscOverall:        k.bsc?.overall   || 0,
          bscRank:           k.bsc?.rank      || 0,
          bscGrade:          k.bsc?.grade     || "—",
          costLabor:         k.costs?.labor           || 0,
          costHolding:       k.costs?.holding         || 0,
          costMarketing:     k.costs?.marketing       || 0,
          costQuality:       k.costs?.quality         || 0,
          costFreight:       k.costs?.freight         || 0,
          costTech:          k.costs?.techMaintenance || 0,
          costInterest:      k.costs?.interest        || 0,
        }));
        mappedReports.sort((a, b) => a.quarter - b.quarter);
        setKpiReports(mappedReports);

        // Fetch 10-Q data for each quarter
        for (const report of mappedReports) {
          fetchTenQReport(fid, report.quarter);
          fetchTenQYtd(fid, report.quarter);
          fetchTenQCompare(fid, report.quarter);
        }
      }

      if (compRaw?.benchmarks) {
        const firmMap = {};
        const add = (arr, field) => arr?.forEach(item => {
          if (!firmMap[item.firmId]) firmMap[item.firmId] = { firmId: item.firmId, isCurrentFirm: item.isCurrentFirm };
          firmMap[item.firmId][field] = item[field];
          firmMap[item.firmId][`${field}Rank`] = item.rank;
        });
        add(compRaw.benchmarks.byRevenue,     "revenue");
        add(compRaw.benchmarks.byMarketShare, "marketShare");
        add(compRaw.benchmarks.byCsi,         "csi");
        add(compRaw.benchmarks.byFillRate,    "fillRate");
        setCompetitorData({ competitors: Object.values(firmMap).sort((a, b) => (a.revenueRank || 99) - (b.revenueRank || 99)), totalFirms: compRaw.totalFirms });
      }

      if (decRaw) setDecisions(decRaw);

      if (creditRaw) {
        const summary = creditRaw.summary;
        const hist    = Array.isArray(creditRaw.history) ? creditRaw.history : [];
        setCreditHistory({
          currentTier:      summary?.currentTier        || hist[0]?.tierName               || "—",
          currentScore:     summary?.currentScore       || hist[0]?.creditScore?.totalScore || 0,
          creditLimit:      summary?.currentCreditLimit || hist[0]?.creditLimit             || 0,
          currentDebt:      summary?.currentDebt        || hist[0]?.endingDebt              || 0,
          interestRate:     hist[0]?.effectiveRate      || hist[0]?.annualRate              || 0,
          utilization:      summary?.utilizationRate    || (hist[0]?.creditLimit ? (hist[0].endingDebt / hist[0].creditLimit) * 100 : 0),
          totalInterestPaid:summary?.totalInterestPaid  || hist.reduce((s, h) => s + (h.interestCharge || 0), 0),
          timesOverlimit:   summary?.timesOverlimit     || hist.filter(h => h.wasOverlimit).length,
          availableCredit:  (summary?.currentCreditLimit || hist[0]?.creditLimit || 0) - (summary?.currentDebt || hist[0]?.endingDebt || 0),
          scoreBreakdown:   hist[0]?.creditScore || null,
        });
      }

      if (bscAllRaw)  setBscData(bscAllRaw);
      if (firmBscRaw) setFirmBsc(firmBscRaw);
      if (analyticsRaw && analyticsRaw.featureEnabled !== false) setAnalyticsDash(analyticsRaw);
      if (sopRaw)   setSopDash(sopRaw);
      if (greenRaw) setGreenScore(greenRaw);

      await fetchQuarterDataVisibility(quarter);

      setLoading(false);
    } catch {
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  }, [params.id, apiUrl, apiFetch, router, fetchQuarterDataVisibility]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const latest = kpiReports.length > 0 ? kpiReports[kpiReports.length - 1] : null;
  const prev   = kpiReports.length > 1 ? kpiReports[kpiReports.length - 2] : null;

  const teams = (competitorData?.competitors || []).slice(0, 5).map((c, i) => ({
    rank: c.revenueRank || i + 1,
    name: c.isCurrentFirm ? `${firm?.name || "Your Firm"} (You)` : `Firm ${i + 1}`,
    revenue: c.revenue || 0, sharePct: (c.marketShare * 100) || 0,
    csi: c.csi || 0, fillRate: (c.fillRate * 100) || 0, highlight: !!c.isCurrentFirm,
  }));

  const decisionList = [
    { name: "Demand Forecast",      done: decisions?.decision?.forecastR1      != null },
    { name: "Pricing Strategy",     done: decisions?.decision?.priceP1         != null },
    { name: "Quality Program",      done: decisions?.decision?.inspectionLevel != null },
    { name: "Supplier Selection",   done: decisions?.decision?.primarySupplier != null },
    { name: "Production Target",    done: decisions?.decision?.productionP1    != null },
    { name: "Marketing Allocation", done: decisions?.decision?.marketingBudget != null },
  ];
  const doneCount    = decisionList.filter(d => d.done).length;
  const pendingCount = decisionList.length - doneCount;

  const bscScores = {
    overall:   firmBsc?.scorecard?.overall   ?? latest?.bscOverall   ?? 0,
    financial: firmBsc?.scorecard?.financial ?? latest?.bscFinancial ?? 0,
    customer:  firmBsc?.scorecard?.customer  ?? latest?.bscCustomer  ?? 0,
    process:   firmBsc?.scorecard?.process   ?? latest?.bscProcess   ?? 0,
    learning:  firmBsc?.scorecard?.learning  ?? latest?.bscLearning  ?? 0,
    rank:      firmBsc?.scorecard?.rank      ?? latest?.bscRank      ?? 0,
    grade:     firmBsc?.scorecard?.grade     ?? latest?.bscGrade     ?? "—",
  };

  const greenHistory  = greenScore?.greenScoreHistory || [];
  const latestGreen   = greenHistory.length > 0 ? greenHistory[greenHistory.length - 1] : null;
  const greenScoreVal = latestGreen?.newScore ?? null;
  const greenBracket  = greenScoreVal == null ? "—"
    : greenScoreVal >= 80 ? "Excellent"
    : greenScoreVal >= 60 ? "Good"
    : greenScoreVal >= 40 ? "Average"
    : "Below Average";

  const credit = creditHistory ?? {
    currentTier: "—", currentScore: 0, creditLimit: 0, currentDebt: 0,
    availableCredit: 0, interestRate: 0, utilization: 0, totalInterestPaid: 0, timesOverlimit: 0,
  };

  const sopSummary = sopDash ? {
    totalDemand:  sopDash.totalMarketDemand ?? null,
    totalSupply:  sopDash.supplyPlan?.unitsProduced ?? null,
    gap: (sopDash.supplyPlan?.unitsProduced != null && sopDash.totalMarketDemand != null)
           ? sopDash.supplyPlan.unitsProduced - sopDash.totalMarketDemand : null,
    fillRate:     sopDash.keyMetrics?.fillRate?.value != null ? sopDash.keyMetrics.fillRate.value / 100 : null,
    serviceLevel: sopDash.keyMetrics?.csi?.value    != null ? sopDash.keyMetrics.csi.value    / 100 : null,
  } : (latest ? {
    totalDemand: latest.unitsSold || null, totalSupply: latest.unitsProduced || null,
    gap: (latest.unitsProduced || 0) - (latest.unitsSold || 0) || null,
    fillRate: latest.fillRate || null, serviceLevel: latest.onTimeDelivery || null,
  } : null);
  const sopSummaryHasData = sopSummary && Object.values(sopSummary).some(v => v != null && v !== 0);

  const analytics = analyticsDash ? {
    forecastBias: analyticsDash.forecastBias ?? null,
    demandVolatility: analyticsDash.demandVolatility ?? null,
    supplyRisk: analyticsDash.supplyRisk ?? null,
    topBottleneck: analyticsDash.topBottleneck ?? null,
  } : null;

  const kpiCards = [
    { label: "Revenue",          accent: t.accent,  value: latest?.revenue         ? fmt(latest.revenue, true)                                                                   : "—", sub: prev?.revenue         ? `Prior: ${fmt(prev.revenue, true)}` : "No prior data", change: prev?.revenue         ? delta(latest?.revenue, prev.revenue)               : null },
    { label: "Operating Margin", accent: t.green,   value: latest?.operatingMargin ? pct(latest.operatingMargin) : latest?.grossMarginPct ? pct(latest.grossMarginPct)           : "—", sub: "Target: 15.0%",                                                             change: prev?.operatingMargin ? delta(latest?.operatingMargin, prev.operatingMargin) : null },
    { label: "Perfect Order",    accent: t.amber,   value: latest?.perfectOrder    ? pct(latest.perfectOrder)                                                                    : "—", sub: "Target: 92.0%",                                                             change: prev?.perfectOrder    ? delta(latest?.perfectOrder, prev.perfectOrder)       : null },
    { label: "Market Share",     accent: t.green,   value: latest?.marketShare     ? pct(latest.marketShare)                                                                     : "—", sub: bscScores.rank ? `Rank #${bscScores.rank} of ${competitorData?.totalFirms || "—"}` : "—", change: prev?.marketShare ? delta(latest?.marketShare, prev.marketShare) : null },
    { label: "BSC Score",        accent: t.purple,  value: bscScores.overall       ? bscScores.overall.toFixed(1)                                                               : "—", sub: bscScores.grade !== "—" ? `Grade: ${bscScores.grade}` : "Awaiting data",       change: null },
    { label: "Cash Position",    accent: t.teal,    value: latest?.cash            ? fmt(latest.cash, true)                                                                      : "—", sub: credit.availableCredit ? `Credit avail: ${fmt(credit.availableCredit, true)}` : "—", change: prev?.cash ? delta(latest?.cash, prev.cash) : null },
  ];

  const opMetrics = [
    { metric: "Forecast Accuracy (MAPE)",    actual: latest?.mape           ? pct(latest.mape)           : "—", target: "≤10%",   cur: latest?.mape,           tgt: 0.10, lowerIsBetter: true  },
    { metric: "On-Time Delivery",            actual: latest?.onTimeDelivery ? pct(latest.onTimeDelivery) : "—", target: "95%",    cur: latest?.onTimeDelivery, tgt: 0.95, lowerIsBetter: false },
    { metric: "Fill Rate",                   actual: latest?.fillRate       ? pct(latest.fillRate)       : "—", target: "96%",    cur: latest?.fillRate,       tgt: 0.96, lowerIsBetter: false },
    { metric: "Defect Rate",                 actual: latest?.defectRate     ? pct(latest.defectRate, 2)  : "—", target: "≤2%",    cur: latest?.defectRate,     tgt: 0.02, lowerIsBetter: true  },
    { metric: "Inventory Turnover",          actual: latest?.inventoryTurnover ? x(latest.inventoryTurnover) : "—", target: "7.0x", cur: latest?.inventoryTurnover, tgt: 7, lowerIsBetter: false },
    { metric: "Customer Satisfaction (CSI)", actual: latest?.csi            ? latest.csi.toFixed(1)     : "—", target: "80+",    cur: latest?.csi,            tgt: 80,   lowerIsBetter: false },
    { metric: "Capacity Utilization",        actual: latest?.capacityUtil   ? pct(latest.capacityUtil)  : "—", target: "75–90%", cur: latest?.capacityUtil,   tgt: null, lowerIsBetter: false },
    { metric: "Customer Retention",          actual: latest?.customersLoyal && (latest.customersLoyal + latest.customersInPlay + latest.customersChurned) > 0 ? pct(latest.customersLoyal / (latest.customersLoyal + latest.customersInPlay + latest.customersChurned)) : "—", target: "90%", cur: null, tgt: null, lowerIsBetter: false },
  ].map(m => {
    let type = "neutral";
    if (m.cur != null && m.tgt != null) {
      const ok = m.lowerIsBetter ? m.cur <= m.tgt : m.cur >= m.tgt;
      type = ok ? "success" : (m.lowerIsBetter ? m.cur <= m.tgt * 1.3 : m.cur >= m.tgt * 0.85) ? "warning" : "error";
    }
    return { ...m, type };
  });

  const statusLabel  = { success: "On Track", warning: "At Risk", error: "Below", neutral: "—" };
  const firmInitials = firm?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "TM";

  const inventory = {
    rawMaterial:       latest?.rawMtlUnits        || 0,
    finishedGoods:     latest?.fgUnits             || 0,
    inventoryValue:    latest?.inventoryValue      || 0,
    turnover:          latest?.inventoryTurnover   || 0,
    weeksOfSupply:     latest?.weeksOfSupply       || 0,
    retailerInventory: latest?.retailerInventory   || 0,
  };

  const customer = {
    loyal:      latest?.customersLoyal   || 0,
    inPlay:     latest?.customersInPlay  || 0,
    churned:    latest?.customersChurned || 0,
    csi:        latest?.csi        || 0,
    fillRate:   latest?.fillRate   || 0,
    returnRate: latest?.returnRate || 0,
  };
  const totalCustomers = customer.loyal + customer.inPlay + customer.churned;
  const retentionRate  = totalCustomers > 0 ? (customer.loyal / totalCustomers) * 100 : 0;

  const navItems = [
    { id: "dashboard",  label: "Dashboard",    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "decisions",  label: "Decisions",    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", badge: pendingCount > 0 ? pendingCount : null },
    { id: "results",    label: "Results",      d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id: "financials", label: "Financials",   d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "analytics",  label: "Analytics",    d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "risk",       label: "Risk Monitor", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  if (loading) return (
    <>
      <style>{buildCSS(t, isDark)}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spin" style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${t.border}`, borderTopColor: t.accent, margin: "0 auto 14px" }} />
          <p style={{ color: t.textMuted, fontSize: 13 }}>Loading dashboard…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{buildCSS(t, isDark)}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, color: t.textPrimary, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 14 }}>

        <StudentHeader simulation={simulation} currentQuarter={currentQuarter} firm={firm} firmInitials={firmInitials} greenScoreVal={greenScoreVal} onDecisionsClick={() => router.push(`/dashboard/student/simulation/decisions/${params.id}`)} />

        <div style={{ display: "flex" }}>
          <StudentSidebar navItems={navItems} activeTab={activeTab} simId={params.id} onTabChange={(tab) => { if (tab === "dashboard") setActiveTab(tab); }} />

          <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: "hidden" }}>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 8, marginBottom: 18, background: t.redBg, border: `1px solid ${t.redBorder}` }}>
                <svg width="14" height="14" fill="none" stroke={t.red} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span style={{ fontSize: 13, color: t.red, flex: 1 }}>{error}</span>
                <button onClick={() => setError("")} style={{ background: "none", border: "none", color: t.red, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            )}

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>Executive Dashboard</h1>
                <p style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>Q{currentQuarter || "—"} · Year {Math.ceil((currentQuarter || 1) / 4)} · {firm?.name || "—"}{bscScores.rank > 0 && ` · Rank #${bscScores.rank}`}</p>
              </div>
              <button className="gb" onClick={handleDownload10QReport} disabled={kpiReports.length === 0 || !currentQuarter} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.bgSurface, color: t.textSec, fontSize: 13, fontWeight: 500, cursor: kpiReports.length === 0 || !currentQuarter ? "not-allowed" : "pointer", opacity: kpiReports.length === 0 || !currentQuarter ? 0.5 : 1 }}>Export Report (10-Q)</button>
            </div>

            {/* Data visibility check */}
            {(dataVisibility?.showQuarterData === false) && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}`, marginBottom: 18 }}>
                <svg width="44" height="44" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>Report Data Not Available</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Your instructor has restricted access to report data for this period.</p>
              </div>
            )}

            {pendingCount > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderRadius: 8, marginBottom: 18, background: t.amberBg, border: `1px solid ${t.amberBorder}` }}>
                <svg width="14" height="14" fill="none" stroke={t.amber} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: t.textPrimary }}>{pendingCount} decision{pendingCount > 1 ? "s" : ""} pending before quarter close — </span>
                  <span style={{ color: t.textMuted }}>{decisionList.filter(d => !d.done).slice(0, 3).map(d => d.name).join(", ")}{pendingCount > 3 ? "…" : ""}</span>
                </div>
                <button onClick={() => router.push(`/dashboard/student/simulation/decisions/${params.id}`)} style={{ background: "none", border: "none", color: t.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Review →</button>
              </div>
            )}

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }} className="fi">
              {kpiCards.map((c, i) => {
                const chgPos = c.change != null ? c.change >= 0 : null;
                return (
                  <div key={i} className="mc" style={{ background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "14px 15px", boxShadow: t.shadow, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</span>
                      {c.change != null && <span style={{ fontSize: 11, fontWeight: 600, color: chgPos ? t.green : t.red }}>{chgPos ? "+" : ""}{c.change.toFixed(1)}%</span>}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px", lineHeight: 1 }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 5 }}>{c.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* ── BODY GRID — alignItems:start so columns are natural height ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 16, alignItems: "start" }}>

              {/* ══════════════════════════════════════════════════════
                  LEFT COLUMN
                  Financial → Scorecard → S&OP+Analytics → Cost
                  → Inventory → Customer   (FIX 8: last two moved here)
                  This keeps left column roughly as tall as right column,
                  eliminating the white gap in the center.
              ══════════════════════════════════════════════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

                {/* Financial Summary */}
                {(dataVisibility?.showQuarterData !== false) && kpiReports.length > 0 && (
                  <Card title="Financial Summary" t={t} noPad headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>{kpiReports.length} quarters</span>}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: t.tableHead }}>
                            {["Quarter","Revenue","Net Income","Gross Margin","Operating Margin","Cash"].map((h, i) => (
                              <th key={h} style={{ padding: "8px 13px", fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "left" : "right", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {kpiReports.map((r, idx) => (
                            <tr key={idx} className="dr" style={{ background: r.quarter === currentQuarter ? (isDark ? "rgba(68,147,248,0.1)" : "rgba(29,78,216,0.05)") : (idx % 2 === 1 ? t.rowAlt : t.bgSurface), borderBottom: `1px solid ${t.border}` }}>
                              <td style={{ padding: "8px 13px", fontSize: 12, fontWeight: r.quarter === currentQuarter ? 600 : 400, color: r.quarter === currentQuarter ? t.accent : t.textPrimary }}>Q{r.quarter}</td>
                              <td style={{ padding: "8px 13px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{fmt(r.revenue, true)}</td>
                              <td style={{ padding: "8px 13px", fontSize: 12, color: r.netIncome >= 0 ? t.green : t.red, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{fmt(r.netIncome, true)}</td>
                              <td style={{ padding: "8px 13px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{pct(r.grossMarginPct)}</td>
                              <td style={{ padding: "8px 13px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{pct(r.operatingMargin)}</td>
                              <td style={{ padding: "8px 13px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{fmt(r.cash, true)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Operational Scorecard */}
                {(dataVisibility?.showQuarterData !== false) && (
                <Card title="Operational Scorecard" t={t} noPad>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: t.tableHead }}>
                          {["Metric","Actual","Target","Status"].map((h, i) => (
                            <th key={h} style={{ padding: "8px 13px", fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "left" : i === 3 ? "center" : "right", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {opMetrics.map((m, idx) => (
                          <tr key={idx} className="dr" style={{ background: idx % 2 === 1 ? t.rowAlt : t.bgSurface, borderBottom: `1px solid ${t.border}` }}>
                            <td style={{ padding: "8px 13px", fontSize: 12, color: t.textPrimary }}>{m.metric}</td>
                            <td style={{ padding: "8px 13px", fontSize: 12, color: t.textPrimary, textAlign: "right", fontWeight: 600, fontFamily: "SF Mono, Consolas, monospace" }}>{m.actual}</td>
                            <td style={{ padding: "8px 13px", fontSize: 12, color: t.textMuted, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{m.target}</td>
                            <td style={{ padding: "8px 13px", textAlign: "center" }}><Badge type={m.type} t={t}>{statusLabel[m.type]}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                )}

                {/* S&OP + Analytics side-by-side */}
                {(dataVisibility?.showQuarterData !== false) && (sopSummaryHasData || analytics) && (
                  <div style={{ display: "grid", gridTemplateColumns: sopSummaryHasData && analytics ? "1fr 1fr" : "1fr", gap: 16 }}>
                    {sopSummaryHasData && (
                      <Card title="S&OP Summary" t={t} headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter || "—"}</span>}>
                        <KRow label="Total Demand"  value={sopSummary.totalDemand  != null ? num(sopSummary.totalDemand)  : "—"} t={t} />
                        <KRow label="Total Supply"  value={sopSummary.totalSupply  != null ? num(sopSummary.totalSupply)  : "—"} t={t} />
                        <KRow label="Gap"           value={sopSummary.gap != null ? num(sopSummary.gap) : "—"} valueColor={sopSummary.gap != null && sopSummary.gap < 0 ? t.red : t.green} t={t} />
                        <KRow label="Fill Rate"     value={sopSummary.fillRate     != null ? pct(sopSummary.fillRate)     : "—"} t={t} />
                        <KRow label="Service Level" value={sopSummary.serviceLevel != null ? pct(sopSummary.serviceLevel) : "—"} t={t} />
                      </Card>
                    )}
                    {analytics && (
                      <Card title="Analytics Signals" t={t} headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>AI insights</span>}>
                        {analytics.forecastBias     != null && <KRow label="Forecast Bias"     value={analytics.forecastBias.toFixed(1) + "%"}     t={t} />}
                        {analytics.demandVolatility != null && <KRow label="Demand Volatility" value={analytics.demandVolatility.toFixed(1) + "%"} t={t} />}
                        {analytics.supplyRisk       != null && <KRow label="Supply Risk Index" value={analytics.supplyRisk.toFixed(2)}             t={t} />}
                        {analytics.topBottleneck         && <KRow label="Top Bottleneck"     value={analytics.topBottleneck}                    t={t} />}
                        {!Object.values(analytics).some(v => v != null) && <p style={{ fontSize: 12, color: t.textMuted, textAlign: "center", padding: "12px 0" }}>No signal data for this quarter</p>}
                      </Card>
                    )}
                  </div>
                )}

                {/* Cost Breakdown */}
                {(dataVisibility?.showQuarterData !== false) && latest && (latest.costLabor + latest.costHolding + latest.costMarketing + latest.costQuality + latest.costFreight + latest.costTech) > 0 && (
                  <Card title="Cost Breakdown" t={t} headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter || "—"}</span>}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {[{ label:"Labor",value:latest.costLabor },{ label:"Holding",value:latest.costHolding },{ label:"Marketing",value:latest.costMarketing },{ label:"Quality",value:latest.costQuality },{ label:"Freight",value:latest.costFreight },{ label:"Technology",value:latest.costTech }].map(c => (
                        <div key={c.label} style={{ background: t.bgElevated, border: `1px solid ${t.border}`, borderRadius: 6, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{c.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, fontFamily: "SF Mono, Consolas, monospace" }}>{fmt(c.value, true)}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* FIX 8: Inventory Status — moved from right to left column */}
                {(dataVisibility?.showQuarterData !== false) && (inventory.rawMaterial + inventory.finishedGoods + inventory.inventoryValue) > 0 && (
                  <Card title="Inventory Status" t={t} headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter || "—"}</span>}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                      <KRow label="Raw Material Units"   value={num(inventory.rawMaterial)}         t={t} />
                      <KRow label="Inventory Value"      value={fmt(inventory.inventoryValue, true)} t={t} />
                      <KRow label="Finished Goods Units" value={num(inventory.finishedGoods)}        t={t} />
                      <KRow label="Inventory Turnover"   value={x(inventory.turnover)}               t={t} />
                      <KRow label="Retailer Inventory"   value={num(inventory.retailerInventory)}    t={t} />
                      <KRow label="Weeks of Supply"      value={inventory.weeksOfSupply?.toFixed(1) || "—"} t={t} />
                    </div>
                  </Card>
                )}

                {/* FIX 8: Customer Metrics — moved from right to left column */}
                {(dataVisibility?.showQuarterData !== false) && (customer.csi + customer.fillRate + retentionRate) > 0 && (
                  <Card title="Customer Metrics" t={t} headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter || "—"}</span>}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                      <KRow label="Customer Satisfaction" value={customer.csi?.toFixed(1) || "—"} t={t} />
                      <KRow label="Return Rate"           value={pct(customer.returnRate)}         t={t} />
                      <KRow label="Fill Rate"             value={pct(customer.fillRate)}           t={t} />
                      <KRow label="Retention Rate"        value={pct(retentionRate / 100)}         t={t} />
                      <KRow label="Loyal Customers"       value={num(customer.loyal)}              t={t} />
                      <KRow label="Customers In Play"     value={num(customer.inPlay)}             t={t} />
                    </div>
                  </Card>
                )}

              </div>{/* end left column */}

              {/* ══════════════════════════════════════════════════════
                  RIGHT COLUMN — summary/status sidebar
                  BSC → Decisions → Credit → Competitive → Sustainability
                  Leaner than before; roughly matches left column height.
              ══════════════════════════════════════════════════════ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* BSC Scorecard */}
                {(dataVisibility?.showQuarterData !== false) && (
                <Card title="Balanced Scorecard" t={t} headerRight={bscScores.grade !== "—" ? <Badge type={bscScores.overall >= 70 ? "success" : bscScores.overall >= 50 ? "warning" : "error"} t={t}>Grade {bscScores.grade}</Badge> : null}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.5px", lineHeight: 1 }}>{bscScores.overall ? bscScores.overall.toFixed(1) : "—"}</div>
                      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>Overall</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, background: t.bgElevated, borderRadius: 4, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(bscScores.overall || 0, 100)}%`, background: t.accent, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 10, color: t.textMuted }}><span>0</span><span>50</span><span>100</span></div>
                    </div>
                    {bscScores.rank > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: t.accent, lineHeight: 1 }}>#{bscScores.rank}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>Rank</div>
                      </div>
                    )}
                  </div>
                  {[
                    { label: "Financial",        value: bscScores.financial },
                    { label: "Customer",          value: bscScores.customer  },
                    { label: "Internal Process",  value: bscScores.process   },
                    { label: "Learning & Growth", value: bscScores.learning  },
                  ].map(p => (
                    <div key={p.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                        <span style={{ color: t.textSec }}>{p.label}</span>
                        <span style={{ color: t.textPrimary, fontFamily: "SF Mono, Consolas, monospace", fontWeight: 600 }}>{p.value ? p.value.toFixed(0) : "—"}</span>
                      </div>
                      <div style={{ height: 3, background: t.bgElevated, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(p.value || 0, 100)}%`, background: t.accent, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  ))}
                  {!firmBsc?.scorecard && <p style={{ fontSize: 11, color: t.textMuted, textAlign: "center", marginTop: 4 }}>Using KPI-embedded BSC data</p>}
                </Card>
                )}

                {/* Decisions */}
                <Card title={`Q${currentQuarter || "—"} Decisions`} t={t} noPad headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>{doneCount}/{decisionList.length}</span>}>
                  <div style={{ padding: "10px 14px 0", borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ height: 4, background: t.bgElevated, borderRadius: 2, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 10 }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${(doneCount / decisionList.length) * 100}%`, background: t.accent, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                  <div style={{ padding: "6px 14px" }}>
                    {decisionList.map((d, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < decisionList.length - 1 ? `1px solid ${t.border}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: d.done ? t.greenBg : t.bgElevated, border: `1.5px solid ${d.done ? t.greenBorder : t.amberBorder}` }}>
                            {d.done ? <svg width="8" height="8" fill="none" stroke={t.green} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.amber }} />}
                          </div>
                          <span style={{ fontSize: 12, color: t.textPrimary }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: d.done ? t.green : t.amber }}>{d.done ? "Done" : "Pending"}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.border}` }}>
                    <button className="pb" onClick={() => router.push(`/dashboard/student/simulation/decisions/${params.id}`)} style={{ width: "100%", padding: "8px", borderRadius: 6, border: "none", background: t.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      Continue Decisions
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </Card>

                {/* Credit Status */}
                {(dataVisibility?.showQuarterData !== false) && (
                <Card title="Credit Status" t={t} headerRight={<Badge type={credit.currentScore >= 750 ? "success" : credit.currentScore >= 600 ? "warning" : "error"} t={t}>{credit.currentTier || (credit.currentScore >= 750 ? "Good" : credit.currentScore >= 600 ? "Fair" : "Poor")}</Badge>}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Credit Score</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.5px", lineHeight: 1 }}>{credit.currentScore || "—"}</div>
                    </div>
                    {credit.timesOverlimit > 0 && <div style={{ fontSize: 11, color: t.red, textAlign: "right" }}>{credit.timesOverlimit}× over limit</div>}
                  </div>
                  <div style={{ height: 5, background: t.bgElevated, borderRadius: 3, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", borderRadius: 3, width: credit.creditLimit ? `${Math.min(credit.utilization, 100)}%` : "0%", background: credit.utilization > 80 ? t.red : credit.utilization > 60 ? t.amber : t.green, transition: "width 0.4s ease" }} />
                  </div>
                  <KRow label="Credit Limit"     value={credit.creditLimit     ? fmt(credit.creditLimit, true)     : "—"} t={t} />
                  <KRow label="Current Debt"     value={credit.currentDebt     ? fmt(credit.currentDebt, true)     : "—"} valueColor={credit.currentDebt > 0 ? t.amber : null} t={t} />
                  <KRow label="Available Credit" value={credit.availableCredit ? fmt(credit.availableCredit, true) : "—"} valueColor={t.green} t={t} />
                  <KRow label="Interest Rate"    value={credit.interestRate    ? pct(credit.interestRate)           : "—"} t={t} />
                  {credit.totalInterestPaid > 0 && <KRow label="Total Interest Paid" value={fmt(credit.totalInterestPaid, true)} valueColor={t.red} t={t} />}
                  {!creditHistory && <p style={{ fontSize: 11, color: t.textMuted, textAlign: "center", marginTop: 8 }}>Awaiting credit history API</p>}
                </Card>
                )}

                {/* Competitive Position */}
                {(dataVisibility?.showQuarterData !== false) && teams.length > 0 && (
                  <Card title="Competitive Position" t={t} noPad>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: t.tableHead }}>
                            {["Rank","Firm","Revenue","Mkt Share","CSI","Fill Rate"].map((h, i) => (
                              <th key={h} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "center" : i === 1 ? "left" : "right", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((team, idx) => (
                            <tr key={idx} className="dr" style={{ background: idx % 2 === 1 ? t.rowAlt : t.bgSurface, borderBottom: `1px solid ${t.border}` }}>
                              <td style={{ padding: "8px 10px", textAlign: "center", fontSize: 12, fontWeight: 600, color: team.highlight ? t.accent : t.textMuted }}>#{team.rank}</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, fontWeight: team.highlight ? 600 : 400, color: team.highlight ? t.accent : t.textPrimary }}>{team.name}</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{fmt(team.revenue, true)}</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{team.sharePct.toFixed(1)}%</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{team.csi?.toFixed(1) || "—"}</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, color: t.textSec, textAlign: "right", fontFamily: "SF Mono, Consolas, monospace" }}>{team.fillRate?.toFixed(1) || "—"}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Sustainability Score */}
                {(dataVisibility?.showQuarterData !== false) && greenScoreVal != null && (
                  <Card title="Sustainability Score" t={t} headerRight={<Badge type={greenScoreVal >= 60 ? "success" : greenScoreVal >= 40 ? "warning" : "error"} t={t}>{greenBracket}</Badge>}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: t.teal, lineHeight: 1 }}>{greenScoreVal.toFixed(0)}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>/ 100</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 6, background: t.bgElevated, borderRadius: 4, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 4, width: `${greenScoreVal}%`, background: t.teal, transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    </div>
                    {latestGreen && [
                      { k: "Score Change",    v: latestGreen.scoreChange != null ? (latestGreen.scoreChange >= 0 ? `+${latestGreen.scoreChange}` : String(latestGreen.scoreChange)) : "—" },
                      { k: "Disposal Method", v: latestGreen.disposalMethod ?? "—" },
                      { k: "Eco Packaging",   v: latestGreen.ecoPackaging ? "Yes" : "No" },
                    ].map(({ k, v }) => <KRow key={k} label={k} value={String(v)} t={t} />)}
                  </Card>
                )}

              </div>{/* end right column */}
            </div>{/* end body grid */}
          </main>
        </div>
      </div>
    </>
  );
}