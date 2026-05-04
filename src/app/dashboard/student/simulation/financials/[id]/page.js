"use client";

/**
 * FinancialsPage — Financial Statements Display
 * 
 * BACKEND FIELD MAPPINGS (TenQReport schema):
 * 
 * incomeStatement: {
 *   revenue, cogs, grossProfit, grossMarginPct, laborCost,
 *   holdingCost, marketing, techMaintenance, qualityCost, freightCost,
 *   totalOpex, operatingIncome, interest, netIncome
 * }
 * 
 * balanceSheet: {
 *   cash, accountsReceivable, inventoryValue,
 *   totalCurrentAssets, fixedAssets, totalAssets,
 *   accountsPayable, shortTermDebt, longTermDebt,
 *   totalLiabilities, equity
 * }
 * 
 * cashFlow: {
 *   netIncome, depreciation, workingCapitalChange,
 *   cashFromOperations, capitalExpenditures,
 *   cashUsedInvesting, debtChange, dividends,
 *   cashFromFinancing, netCashChange,
 *   beginningCash, endingCash
 * }
 * 
 * trend array:
 *   quarter, revenue, netIncome, operatingIncome, totalAssets,
 *   totalLiabilities, equity, cashFromOperations, unitsProduced,
 *   unitsSold, inventoryValue
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../../components/StudentHeader";
import StudentSidebar from "../../../components/StudentSidebar";

const LIGHT = {
  bgPage: "#F3F4F6",
  bgSurface: "#FFFFFF",
  bgElevated: "#F9FAFB",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  textPrimary: "#111827",
  textSec: "#374151",
  textMuted: "#6B7280",
  accent: "#1D4ED8",
  accentLight: "#EFF6FF",
  green: "#065F46",
  greenBg: "#D1FAE5",
  red: "#991B1B",
  redBg: "#FEE2E2",
  headerBg: "#FFFFFF",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const DARK = {
  bgPage: "#0D1117",
  bgSurface: "#161B22",
  bgElevated: "#1C2128",
  border: "#30363D",
  borderStrong: "#444C56",
  textPrimary: "#E6EDF3",
  textSec: "#8D96A0",
  textMuted: "#545D68",
  accent: "#4493F8",
  accentLight: "#1A2332",
  green: "#3FB950",
  greenBg: "rgba(63,185,80,0.1)",
  red: "#F85149",
  redBg: "rgba(248,81,73,0.1)",
  headerBg: "#161B22",
  shadow: "0 1px 3px rgba(0,0,0,0.3)",
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

const pct = (v, dp = 1) =>
  v != null ? `${(v > 1 ? Number(v) : Number(v) * 100).toFixed(dp)}%` : "—";

const ratio = (v, dp = 2) => (v != null ? Number(v).toFixed(dp) : "—");

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ title, headerRight, children, t }) => (
  <div
    style={{
      background: t.bgSurface,
      border: `1px solid ${t.border}`,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 0,
      boxShadow: t.shadow,
    }}
  >
    {title && (
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgElevated,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
          {title}
        </span>
        {headerRight}
      </div>
    )}
    <div style={{ padding: 16 }}>{children}</div>
  </div>
);

const Row = ({ label, value, valueColor, t, bold, indent }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "7px 0",
      borderBottom: `1px solid ${t.border}`,
      fontWeight: bold ? 600 : 400,
    }}
  >
    <span
      style={{
        color: t.textSec,
        paddingLeft: indent ? 16 : 0,
        fontSize: indent ? 12 : 13,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "SF Mono, Consolas, monospace",
        color: valueColor || t.textPrimary,
        fontSize: 13,
      }}
    >
      {value}
    </span>
  </div>
);

const SectionLabel = ({ children, t }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 700,
      color: t.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      padding: "10px 0 4px",
    }}
  >
    {children}
  </div>
);

export default function FinancialsPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [firm, setFirm] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [trend, setTrend] = useState([]);
  const [dataVisibility, setDataVisibility] = useState(null);
  const [loadingVisibility, setLoadingVisibility] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

  const apiFetch = useCallback(
    async (url) => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        });
        if (res.ok) return await res.json();
      } catch {}
      return null;
    },
    [getToken],
  );

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
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");
        if (userRole !== "student") {
          router.push("/login");
          return;
        }

        const simData = await apiFetch(`${apiUrl}/simulations/${params.id}`);
        if (!simData) {
          setError("Failed to load simulation");
          setLoading(false);
          return;
        }
        setSimulation(simData);

        let studentFirm = null;
        for (const f of simData.firms || []) {
          const found = f.enrollments?.find((e) => {
            const eid = e.user?.id || e.user?._id || e.userId;
            return eid?.toString() === userId?.toString();
          });
          if (found) { studentFirm = f; setFirm(f); break; }
        }
        if (!studentFirm) {
          setError("Firm not found");
          setLoading(false);
          return;
        }

        const fid = studentFirm.id || studentFirm._id;

        const qData = await apiFetch(`${apiUrl}/simulations/${params.id}/current-quarter`);
        const quarter = qData?.quarter || simData.currentQuarter;
        setCurrentQuarter(quarter);

        const [finData, trendData] = await Promise.all([
          apiFetch(`${apiUrl}/reports/tenq/${params.id}/${fid}/${quarter - 1}`),
          apiFetch(`${apiUrl}/reports/tenq/${params.id}/${fid}/trend`),
        ]);

        setFinancials(finData || {});
        setTrend(
          Array.isArray(trendData)
            ? trendData
            : Array.isArray(trendData?.trend)
            ? trendData.trend
            : [],
        );
        setLoading(false);
      } catch {
        setError("Error loading financials");
        setLoading(false);
      }
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

  if (loading)
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            minHeight: "100vh",
            background: t.bgPage,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `3px solid ${t.border}`, borderTopColor: t.accent,
                margin: "0 auto 14px", animation: "spin 0.75s linear infinite",
              }}
            />
            <p style={{ color: t.textMuted }}>Loading financials…</p>
          </div>
        </div>
      </>
    );

  // ─── DERIVE ALL DISPLAY VALUES FROM CORRECT BACKEND FIELDS ────────────────
  const is = financials?.incomeStatement || {};
  const bs = financials?.balanceSheet    || {};
  const cf = financials?.cashFlow        || {};

  // Income statement derived
  const opMarginPct  = is.revenue ? (is.operatingIncome / is.revenue) * 100 : null;
  const netMarginPct = is.revenue ? (is.netIncome        / is.revenue) * 100 : null;
  const ebitda       = (is.operatingIncome || 0) + (cf.depreciation || 0);

  // Balance sheet derived
  const totalDebt        = (bs.shortTermDebt || 0) + (bs.longTermDebt || 0);
  const currentLiab      = (bs.accountsPayable || 0) + (bs.shortTermDebt || 0);
  const debtToEquity     = bs.equity ? totalDebt / bs.equity : null;
  const currentRatio     = currentLiab > 0 ? (bs.totalCurrentAssets || 0) / currentLiab : null;
  const assetTurnover    = bs.totalAssets && is.revenue ? is.revenue / bs.totalAssets : null;
  const inventoryTurnover= bs.inventoryValue && is.cogs ? is.cogs / bs.inventoryValue : null;
  const roa              = bs.totalAssets && is.netIncome != null ? (is.netIncome / bs.totalAssets) * 100 : null;
  const roe              = bs.equity && is.netIncome != null ? (is.netIncome / bs.equity) * 100 : null;

  // Cash flow derived
  const freeCashFlow = (cf.cashFromOperations || 0) - (cf.capitalExpenditures || 0);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          minHeight: "100vh",
          background: t.bgPage,
          color: t.textPrimary,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 14,
        }}
      >
        <StudentHeader
          simulation={simulation}
          currentQuarter={currentQuarter}
          firm={firm}
          firmInitials={firmInitials}
          onDecisionsClick={() =>
            router.push(`/dashboard/student/simulation/decisions/${params.id}`)
          }
        />

        <div style={{ display: "flex" }}>
          <StudentSidebar
            navItems={navItems}
            activeTab="financials"
            simId={params.id}
          />

          <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: "hidden" }}>
            {error && (
              <div
                style={{
                  padding: "12px 16px", borderRadius: 8,
                  background: t.redBg, border: `1px solid ${t.red}`,
                  color: t.red, marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Data visibility check */}
            {(dataVisibility?.showQuarterData === false) && (
              <div style={{ padding: "48px 24px", textAlign: "center", background: t.bgSurface, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <svg width="44" height="44" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" style={{ margin: "0 auto 14px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>Financial Data Not Available</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Your instructor has restricted access to financial data for this period.</p>
              </div>
            )}

            {/* Financial content - only show when data is visible */}
            {(dataVisibility?.showQuarterData !== false) && (
              <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>
                Financial Statements
              </h1>
              <p style={{ fontSize: 12, color: t.textMuted, marginTop: 3 }}>
                Q{currentQuarter - 1 || "—"} · {firm?.name || "—"}
              </p>
            </div>

            {/* ── TOP ROW: Income Statement + Balance Sheet ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Income Statement */}
              <Card
                title="Income Statement"
                headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter - 1 || "—"}</span>}
                t={t}
              >
                <Row label="Revenue"             value={fmt(is.revenue)}           bold t={t} />
                <Row label="COGS"                value={fmt(is.cogs)}              t={t} indent />
                <Row
                  label="Gross Profit"
                  value={fmt(is.grossProfit)}
                  valueColor={t.green}
                  bold t={t}
                />
                <Row label="Gross Margin"        value={is.grossMarginPct != null ? `${Number(is.grossMarginPct).toFixed(1)}%` : "—"} t={t} indent />

                <div style={{ height: 1, background: t.border, margin: "6px 0" }} />
                <SectionLabel t={t}>Operating Expenses</SectionLabel>

                {is.laborCost != null    && <Row label="Labor"            value={fmt(is.laborCost)}    t={t} indent />}
                {is.holdingCost != null  && <Row label="Holding"          value={fmt(is.holdingCost)}  t={t} indent />}
                {is.marketing != null    && <Row label="Marketing"        value={fmt(is.marketing)}    t={t} indent />}
                {is.qualityCost != null  && <Row label="Quality"          value={fmt(is.qualityCost)}  t={t} indent />}
                {is.freightCost != null  && <Row label="Freight"          value={fmt(is.freightCost)}  t={t} indent />}
                {is.techMaintenance != null && <Row label="Tech Maintenance" value={fmt(is.techMaintenance)} t={t} indent />}
                <Row label="Total OpEx"          value={fmt(is.totalOpex)}         t={t} bold />

                <div style={{ height: 1, background: t.border, margin: "6px 0" }} />

                <Row
                  label="Operating Income"
                  value={fmt(is.operatingIncome)}
                  valueColor={is.operatingIncome >= 0 ? t.green : t.red}
                  bold t={t}
                />
                <Row label="Operating Margin"    value={opMarginPct != null ? `${opMarginPct.toFixed(1)}%` : "—"} t={t} indent />
                {is.interest != null && <Row label="Interest Expense" value={fmt(is.interest)} t={t} indent />}
                <Row label="EBITDA"              value={fmt(ebitda)}               t={t} />
                <Row
                  label="Net Income"
                  value={fmt(is.netIncome)}
                  valueColor={is.netIncome >= 0 ? t.green : t.red}
                  bold t={t}
                />
                <Row label="Net Margin"          value={netMarginPct != null ? `${netMarginPct.toFixed(1)}%` : "—"} t={t} indent />
              </Card>

              {/* Balance Sheet */}
              <Card
                title="Balance Sheet"
                headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter - 1 || "—"}</span>}
                t={t}
              >
                <SectionLabel t={t}>Assets</SectionLabel>
                <Row label="Cash & Equivalents"  value={fmt(bs.cash)}              t={t} />
                <Row label="Accounts Receivable" value={fmt(bs.accountsReceivable)} t={t} />
                <Row label="Inventory"           value={fmt(bs.inventoryValue)}    t={t} />
                <Row label="Total Current Assets" value={fmt(bs.totalCurrentAssets)} bold t={t} />
                <Row label="Fixed Assets"        value={fmt(bs.fixedAssets)}       t={t} />
                <Row label="Total Assets"        value={fmt(bs.totalAssets)}       bold t={t} />

                <div style={{ height: 1, background: t.border, margin: "8px 0" }} />
                <SectionLabel t={t}>Liabilities & Equity</SectionLabel>

                <Row label="Accounts Payable"    value={fmt(bs.accountsPayable)}   t={t} />
                <Row label="Short-term Debt"     value={fmt(bs.shortTermDebt)}     t={t} />
                <Row label="Long-term Debt"      value={fmt(bs.longTermDebt)}      t={t} />
                <Row label="Total Liabilities"   value={fmt(bs.totalLiabilities)}  bold t={t} />
                <Row
                  label="Total Equity"
                  value={fmt(bs.equity)}
                  valueColor={bs.equity >= 0 ? t.green : t.red}
                  bold t={t}
                />
                <Row label="Debt / Equity"       value={debtToEquity != null ? debtToEquity.toFixed(2) : "—"} t={t} />
              </Card>
            </div>

            {/* ── BOTTOM ROW: Cash Flow + Key Ratios ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* Cash Flow Statement */}
              <Card
                title="Cash Flow Statement"
                headerRight={<span style={{ fontSize: 11, color: t.textMuted }}>Q{currentQuarter - 1 || "—"}</span>}
                t={t}
              >
                <Row
                  label="Operating Cash Flow"
                  value={fmt(cf.cashFromOperations)}
                  valueColor={cf.cashFromOperations >= 0 ? t.green : t.red}
                  bold t={t}
                />
                {cf.depreciation != null && (
                  <Row label="+ Depreciation"    value={fmt(cf.depreciation)}      t={t} indent />
                )}
                {cf.workingCapitalChange != null && (
                  <Row label="Working Capital Δ" value={fmt(cf.workingCapitalChange)} t={t} indent />
                )}

                <div style={{ height: 1, background: t.border, margin: "6px 0" }} />

                <Row label="Capital Expenditures" value={fmt(cf.capitalExpenditures)} t={t} />
                {cf.cashUsedInvesting != null && (
                  <Row label="Investing Activities" value={fmt(cf.cashUsedInvesting)} t={t} indent />
                )}

                <div style={{ height: 1, background: t.border, margin: "6px 0" }} />

                {cf.cashFromFinancing != null && (
                  <Row label="Financing Activities" value={fmt(cf.cashFromFinancing)} t={t} />
                )}
                {cf.debtChange != null && (
                  <Row label="Debt Change"       value={fmt(cf.debtChange)}        t={t} indent />
                )}

                <div style={{ height: 1, background: t.border, margin: "6px 0" }} />

                <Row
                  label="Free Cash Flow"
                  value={fmt(freeCashFlow)}
                  valueColor={freeCashFlow >= 0 ? t.green : t.red}
                  bold t={t}
                />

                <Row label="Net Change in Cash"  value={fmt(cf.netCashChange)}     t={t} />
                {cf.beginningCash != null && (
                  <Row label="Beginning Cash"    value={fmt(cf.beginningCash)}     t={t} indent />
                )}
                {cf.endingCash != null && (
                  <Row label="Ending Cash"       value={fmt(cf.endingCash)}        t={t} indent />
                )}
              </Card>

              {/* Key Ratios & Metrics */}
              <Card title="Key Ratios & Metrics" t={t}>
                <SectionLabel t={t}>Profitability</SectionLabel>
                <Row label="Gross Margin"        value={is.grossMarginPct != null ? `${Number(is.grossMarginPct).toFixed(1)}%` : "—"} t={t} />
                <Row label="Operating Margin"    value={opMarginPct != null ? `${opMarginPct.toFixed(1)}%` : "—"}  t={t} />
                <Row label="Net Margin"          value={netMarginPct != null ? `${netMarginPct.toFixed(1)}%` : "—"} t={t} />
                {roa != null && <Row label="ROA" value={`${roa.toFixed(1)}%`} t={t} />}
                {roe != null && <Row label="ROE" value={`${roe.toFixed(1)}%`} t={t} />}

                <SectionLabel t={t}>Liquidity & Leverage</SectionLabel>
                {currentRatio != null && (
                  <Row label="Current Ratio"     value={currentRatio.toFixed(2)}   t={t} />
                )}
                <Row label="Total Debt"          value={fmt(totalDebt)}            t={t} />
                {debtToEquity != null && (
                  <Row label="Debt / Equity"     value={debtToEquity.toFixed(2)}   t={t} />
                )}

                <SectionLabel t={t}>Efficiency</SectionLabel>
                {inventoryTurnover != null && (
                  <Row label="Inventory Turnover" value={`${inventoryTurnover.toFixed(2)}×`} t={t} />
                )}
                {assetTurnover != null && (
                  <Row label="Asset Turnover"    value={`${assetTurnover.toFixed(2)}×`}     t={t} />
                )}

                <SectionLabel t={t}>Cash</SectionLabel>
                <Row label="Operating Cash Flow" value={fmt(cf.cashFromOperations)} t={t} />
                <Row label="Free Cash Flow"      value={fmt(freeCashFlow)} valueColor={freeCashFlow >= 0 ? t.green : t.red} t={t} />
              </Card>
            </div>

            {/* ── TREND TABLE ── */}
            {trend.length > 0 && (
              <Card
                title="Quarterly Trend"
                headerRight={
                  <span style={{ fontSize: 11, color: t.textMuted }}>
                    {trend.length} quarter{trend.length !== 1 ? "s" : ""}
                  </span>
                }
                t={t}
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${t.border}`, background: t.bgElevated }}>
                        {[
                          { label: "Quarter",          align: "left"  },
                          { label: "Revenue",          align: "right" },
                          { label: "Op Income",        align: "right" },
                          { label: "Net Income",       align: "right" },
                          { label: "Cash (Ops)",       align: "right" },
                          { label: "Total Assets",     align: "right" },
                          { label: "Units Sold",       align: "right" },
                        ].map((h) => (
                          <th
                            key={h.label}
                            style={{
                              padding: "8px 12px",
                              textAlign: h.align,
                              color: t.textMuted,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...trend]
                        .sort((a, b) => (a.quarter || 0) - (b.quarter || 0))
                        .slice(-6)
                        .map((q, i) => {
                          const isCurrent = q.quarter === currentQuarter;
                          return (
                            <tr
                              key={i}
                              style={{
                                borderBottom: `1px solid ${t.border}`,
                                background: isCurrent
                                  ? isDark ? "rgba(68,147,248,0.08)" : "rgba(29,78,216,0.04)"
                                  : i % 2 === 1 ? t.bgElevated : t.bgSurface,
                              }}
                            >
                              <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? t.accent : t.textPrimary }}>
                                Q{q.quarter}{isCurrent && <span style={{ marginLeft: 6, fontSize: 10, background: t.accent, color: "#fff", padding: "1px 5px", borderRadius: 3 }}>Current</span>}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>
                                {fmt(q.revenue)}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: q.operatingIncome >= 0 ? t.green : t.red }}>
                                {fmt(q.operatingIncome)}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: q.netIncome >= 0 ? t.green : t.red }}>
                                {fmt(q.netIncome)}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>
                                {fmt(q.cashFromOperations)}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>
                                {fmt(q.totalAssets)}
                              </td>
                              <td style={{ padding: "8px 12px", fontSize: 12, textAlign: "right", fontFamily: "SF Mono,Consolas,monospace", color: t.textSec }}>
                                {q.unitsSold != null ? Math.round(q.unitsSold).toLocaleString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}