"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  CREATED:     { label: "Created",        color: "#B45309", bg: "#FEF3C7", borderColor: "#FCD34D" },
  INITIALIZED: { label: "Ready to Start", color: "#1D4ED8", bg: "#DBEAFE", borderColor: "#93C5FD" },
  IN_PROGRESS: { label: "In Progress",    color: "#065F46", bg: "#D1FAE5", borderColor: "#6EE7B7" },
  PAUSED:      { label: "Paused",         color: "#92400E", bg: "#FEF3C7", borderColor: "#FCD34D" },
  COMPLETED:   { label: "Completed",      color: "#5B21B6", bg: "#EDE9FE", borderColor: "#C4B5FD" },
};

const STATUS_CONFIG_DARK = {
  CREATED:     { label: "Created",        color: "#FCD34D", bg: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.3)" },
  INITIALIZED: { label: "Ready to Start", color: "#93C5FD", bg: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.3)" },
  IN_PROGRESS: { label: "In Progress",    color: "#6EE7B7", bg: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)" },
  PAUSED:      { label: "Paused",         color: "#FCD34D", bg: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.3)" },
  COMPLETED:   { label: "Completed",      color: "#C4B5FD", bg: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.3)" },
};

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage:      "#F3F4F6",
  bgSurface:   "#FFFFFF",
  bgElevated:  "#F9FAFB",
  bgHover:     "#F3F4F6",
  bgActive:    "#EFF6FF",
  border:      "#E5E7EB",
  borderStrong:"#D1D5DB",
  textPrimary: "#111827",
  textSec:     "#374151",
  textMuted:   "#6B7280",
  textDisabled:"#9CA3AF",
  accent:      "#1D4ED8",
  accentHover: "#1E40AF",
  accentLight: "#EFF6FF",
  accentBorder:"#BFDBFE",
  green:       "#065F46",
  greenBg:     "#D1FAE5",
  amber:       "#92400E",
  amberBg:     "#FEF3C7",
  red:         "#991B1B",
  redBg:       "#FEE2E2",
  headerBg:    "#FFFFFF",
  tableHead:   "#F9FAFB",
  rowAlt:      "#FAFAFA",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:    "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
};

const DARK = {
  bgPage:      "#0D1117",
  bgSurface:   "#161B22",
  bgElevated:  "#1C2128",
  bgHover:     "#21262D",
  bgActive:    "#1A2332",
  border:      "#30363D",
  borderStrong:"#444C56",
  textPrimary: "#E6EDF3",
  textSec:     "#8D96A0",
  textMuted:   "#545D68",
  textDisabled:"#3D444D",
  accent:      "#4493F8",
  accentHover: "#68B3FB",
  accentLight: "#1A2332",
  accentBorder:"#1F3A5F",
  green:       "#3FB950",
  greenBg:     "rgba(63,185,80,0.1)",
  amber:       "#D29922",
  amberBg:     "rgba(210,153,34,0.1)",
  red:         "#F85149",
  redBg:       "rgba(248,81,73,0.1)",
  headerBg:    "#161B22",
  tableHead:   "#1C2128",
  rowAlt:      "#191E25",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.3)",
  shadowMd:    "0 4px 6px rgba(0,0,0,0.4)",
};

// ─── CSS ───────────────────────────────────────────────────────────────────────
const buildCSS = (isDark, t) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${t.bgPage}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${t.borderStrong}; }
  select option { background: ${t.bgElevated}; color: ${t.textPrimary}; }

  .sim-row { transition: background-color 0.12s ease; cursor: default; }
  .sim-row:hover { background-color: ${t.bgHover} !important; }

  .open-btn {
    transition: background-color 0.12s, border-color 0.12s, color 0.12s;
  }
  .open-btn:hover:not(:disabled) {
    background-color: ${t.accentLight} !important;
    border-color: ${t.accent} !important;
    color: ${t.accent} !important;
  }
  .open-btn:active:not(:disabled) {
    background-color: ${isDark ? "#1D3350" : "#DBEAFE"} !important;
  }

  .ctrl-input {
    transition: border-color 0.12s, box-shadow 0.12s;
  }
  .ctrl-input:focus {
    outline: none;
    border-color: ${t.accent} !important;
    box-shadow: 0 0 0 3px ${isDark ? "rgba(68,147,248,0.15)" : "rgba(29,78,216,0.1)"};
  }
  .ctrl-input::placeholder { color: ${t.textDisabled}; }

  .kpi-card { transition: box-shadow 0.12s; }
  .kpi-card:hover { box-shadow: ${t.shadowMd} !important; }

  .theme-toggle { transition: background-color 0.12s, border-color 0.12s; }
  .theme-toggle:hover { background-color: ${t.bgHover} !important; }

  .nav-link { transition: background-color 0.12s, color 0.12s; }
  .nav-link:hover { background-color: ${t.bgHover} !important; color: ${t.textPrimary} !important; }

  .logout-btn { transition: background-color 0.12s, border-color 0.12s; }
  .logout-btn:hover { background-color: ${isDark ? "rgba(248,81,73,0.15)" : "#FEE2E2"} !important; border-color: ${t.red} !important; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.75s linear infinite; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .fade-row { animation: fadeIn 0.2s ease both; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .status-pulse { animation: pulse 2s ease-in-out infinite; }
`;

// ─── BADGE ─────────────────────────────────────────────────────────────────────
function StatusBadge({ status, isDark }) {
  const cfg = (isDark ? STATUS_CONFIG_DARK : STATUS_CONFIG)[status] || (isDark ? STATUS_CONFIG_DARK : STATUS_CONFIG).CREATED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.borderColor}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ─── PERMISSION CHIP ───────────────────────────────────────────────────────────
function PermChip({ active, label, title, t }) {
  return (
    <div title={title} style={{
      width: 24, height: 24, borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? t.greenBg : t.bgElevated,
      border: `1px solid ${active ? (t === DARK ? "rgba(63,185,80,0.3)" : "#6EE7B7") : t.border}`,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.02em",
      color: active ? t.green : t.textDisabled,
    }}>
      {label}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [simulations, setSimulations]   = useState([]);
  const [error, setError]               = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const router = useRouter();

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    (async () => {
      const token    = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("userRole");
      const userId   = localStorage.getItem("userId");
      if (!token || !userData || userRole !== "student") { router.push("/login"); return; }
      setUser(JSON.parse(userData));
      await fetchSims(userId);
      setLoading(false);
    })();
  }, []);

  const fetchSims = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/simulations/student/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}`, Accept: "*/*" } }
      );
      if (res.ok) { const d = await res.json(); setSimulations(d.simulations || d || []); }
      else setError("Failed to load simulations");
    } catch { setError("An error occurred while loading simulations"); }
  };

  const handleLogout = () => {
    ["access_token", "refresh_token", "user", "userId", "userRole"].forEach(k => localStorage.removeItem(k));
    router.push("/");
  };

  const filtered = simulations.filter(item => {
    const sim = item.simulation || item;
    return (filterStatus === "all" || sim.status === filterStatus) &&
      (!searchQuery ||
        sim.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const stats = {
    total:     simulations.length,
    active:    simulations.filter(s => (s.simulation || s).status === "IN_PROGRESS").length,
    canDecide: simulations.filter(s => s.enrollment?.canSubmitDecisions).length,
    completed: simulations.filter(s => (s.simulation || s).status === "COMPLETED").length,
  };

  const displayName = user?.displayName || user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{buildCSS(isDark, t)}</style>
      <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{
            width: 40, height: 40, borderRadius: "50%",
            border: `3px solid ${t.border}`, borderTopColor: t.accent,
            margin: "0 auto 14px",
          }} />
          <p style={{ color: t.textMuted, fontSize: 13, fontFamily: "Inter, sans-serif" }}>Loading…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{buildCSS(isDark, t)}</style>
      <div style={{
        minHeight: "100vh",
        background: t.bgPage,
        color: t.textPrimary,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
      }}>

        {/* ════════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════════ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: t.headerBg,
          borderBottom: `1px solid ${t.border}`,
          boxShadow: t.shadowSm,
        }}>
          <div style={{
            maxWidth: 1320, margin: "0 auto", padding: "0 24px",
            height: 56, display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>

            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                  background: t.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>F</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                    FLEXEE <span style={{ color: t.accent }}>2.0</span>
                  </span>
                  <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.04em", lineHeight: 1 }}>
                    CORPORATE EDITION
                  </span>
                </div>
              </Link>

              {/* Separator + context */}
              <div style={{ width: 1, height: 28, background: t.border, margin: "0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>Student Portal</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{displayName}</span>
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

              {/* Active indicator */}
              {stats.active > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 4,
                  background: isDark ? "rgba(63,185,80,0.1)" : "#D1FAE5",
                  border: `1px solid ${isDark ? "rgba(63,185,80,0.25)" : "#A7F3D0"}`,
                }}>
                  <div className="status-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: t.green }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: t.green }}>
                    {stats.active} in progress
                  </span>
                </div>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  width: 34, height: 34, borderRadius: 6, border: `1px solid ${t.border}`,
                  background: t.bgElevated, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.textMuted,
                }}
              >
                {isDark ? (
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User avatar + name */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 10px 4px 6px", borderRadius: 6,
                border: `1px solid ${t.border}`, background: t.bgElevated,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4,
                  background: t.accent, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.textSec, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="logout-btn"
                style={{
                  padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${t.border}`,
                  background: "transparent",
                  color: t.red, fontSize: 13, fontWeight: 500,
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════
            PAGE BODY
        ════════════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page title */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>
                My Simulations
              </h1>
              <p style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>
                All simulations you are enrolled in
              </p>
            </div>
            <button
              onClick={() => fetchSims(localStorage.getItem("userId"))}
              className="nav-link"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`,
                background: t.bgSurface,
                color: t.textSec, fontSize: 13, fontWeight: 500,
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* ── SUMMARY CARDS ──────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Enrolled", value: stats.total, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", col: t.accent, bg: isDark ? t.accentLight : "#EFF6FF", bdr: isDark ? t.accentBorder : "#BFDBFE" },
              { label: "In Progress",    value: stats.active, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", col: t.green, bg: t.greenBg, bdr: isDark ? "rgba(63,185,80,0.3)" : "#6EE7B7" },
              { label: "Can Decide",     value: stats.canDecide, icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", col: t.amber, bg: t.amberBg, bdr: isDark ? "rgba(210,153,34,0.3)" : "#FCD34D" },
              { label: "Completed",      value: stats.completed, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", col: isDark ? "#C4B5FD" : "#5B21B6", bg: isDark ? "rgba(139,92,246,0.1)" : "#EDE9FE", bdr: isDark ? "rgba(139,92,246,0.3)" : "#C4B5FD" },
            ].map((c, i) => (
              <div key={i} className="kpi-card" style={{
                background: t.bgSurface, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: "16px 18px",
                boxShadow: t.shadowSm,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, lineHeight: 1, letterSpacing: "-0.5px" }}>
                      {c.value}
                    </div>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: c.bg, border: `1px solid ${c.bdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: c.col,
                  }}>
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={c.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SIMULATION TABLE ───────────────────────────────────────────── */}
          <div style={{
            background: t.bgSurface, border: `1px solid ${t.border}`,
            borderRadius: 8, overflow: "hidden", boxShadow: t.shadowSm,
          }}>

            {/* Table toolbar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
              padding: "12px 16px",
              borderBottom: `1px solid ${t.border}`,
              background: t.bgElevated,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  Enrolled Simulations
                </span>
                <span style={{
                  padding: "1px 7px", borderRadius: 10,
                  background: isDark ? t.accentLight : "#EFF6FF",
                  border: `1px solid ${isDark ? t.accentBorder : "#BFDBFE"}`,
                  fontSize: 11, fontWeight: 600, color: t.accent,
                }}>
                  {filtered.length}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: t.textDisabled, pointerEvents: "none" }}
                    width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text" placeholder="Search by name or course…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="ctrl-input"
                    style={{
                      paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                      background: t.bgSurface, border: `1px solid ${t.borderStrong}`,
                      borderRadius: 6, color: t.textPrimary, fontSize: 13, width: 240,
                    }}
                  />
                </div>

                {/* Status filter */}
                <select
                  value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="ctrl-input"
                  style={{
                    padding: "6px 10px",
                    background: t.bgSurface, border: `1px solid ${t.borderStrong}`,
                    borderRadius: 6, color: t.textPrimary, fontSize: 13, cursor: "pointer",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="INITIALIZED">Ready to Start</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                background: t.redBg, borderBottom: `1px solid ${isDark ? "rgba(248,81,73,0.25)" : "#FECACA"}`,
              }}>
                <svg width="14" height="14" fill="none" stroke={t.red} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span style={{ fontSize: 13, color: t.red, flex: 1 }}>{error}</span>
                <button onClick={() => setError("")}
                  style={{ background: "none", border: "none", color: t.red, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>
                  ×
                </button>
              </div>
            )}

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2.2fr 0.75fr 1fr 1fr 100px 120px",
              padding: "9px 16px",
              background: t.tableHead,
              borderBottom: `1px solid ${t.border}`,
            }}>
              {["Simulation", "Course", "Status", "Quarter", "Access", ""].map((h, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 600, color: t.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  textAlign: i >= 4 ? "center" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.length > 0 ? filtered.map((item, idx) => {
              const sim        = item.simulation || item;
              const firm       = item.firm || {};
              const enrollment = item.enrollment || {};
              const canOpen    = enrollment.canSubmitDecisions || enrollment.canViewReports;
              const qCur       = sim.currentQuarter || 0;
              const qMax       = sim.maxQuarters || 12;
              const qPct       = qMax ? Math.round(qCur / qMax * 100) : 0;
              const firmColor  = firm.color || t.accent;

              return (
                <div key={idx} className="sim-row fade-row" style={{
                  animationDelay: `${idx * 0.03}s`,
                  display: "grid",
                  gridTemplateColumns: "2.2fr 0.75fr 1fr 1fr 100px 120px",
                  padding: "13px 16px",
                  borderBottom: `1px solid ${t.border}`,
                  alignItems: "center",
                  background: idx % 2 === 1 ? t.rowAlt : t.bgSurface,
                }}>

                  {/* Simulation name + meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: firm.name ? firmColor : t.bgElevated,
                      border: `1px solid ${firm.name ? "transparent" : t.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                      color: firm.name ? "#fff" : t.textMuted,
                    }}>
                      {firm.firmNumber || sim.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: t.textPrimary,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {sim.name}
                      </div>
                      <div style={{
                        fontSize: 11, color: t.textMuted, marginTop: 2,
                        display: "flex", alignItems: "center", gap: 4,
                        overflow: "hidden", whiteSpace: "nowrap",
                      }}>
                        {firm.name && <span style={{ color: t.textSec }}>{firm.name}</span>}
                        {firm.name && enrollment.teamName && <span>·</span>}
                        {enrollment.teamName && <span>{enrollment.teamName}</span>}
                        {enrollment.decisionsSubmitted !== undefined && (firm.name || enrollment.teamName) && <span>·</span>}
                        {enrollment.decisionsSubmitted !== undefined && (
                          <span>{enrollment.decisionsSubmitted} decisions submitted</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course code */}
                  <div>
                    {sim.courseCode ? (
                      <span style={{
                        display: "inline-block",
                        padding: "2px 7px", borderRadius: 4,
                        background: t.bgElevated, border: `1px solid ${t.border}`,
                        fontSize: 11, fontWeight: 500, color: t.textSec,
                        fontFamily: "'SF Mono', 'Consolas', monospace",
                      }}>
                        {sim.courseCode}
                      </span>
                    ) : (
                      <span style={{ color: t.textDisabled, fontSize: 13 }}>—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={sim.status} isDark={isDark} />
                  </div>

                  {/* Quarter + progress */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, fontFamily: "'SF Mono','Consolas',monospace" }}>
                        Q{qCur}
                      </span>
                      <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'SF Mono','Consolas',monospace" }}>
                        /{qMax}
                      </span>
                    </div>
                    <div style={{ height: 4, background: t.bgElevated, borderRadius: 2, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${qPct}%`,
                        background: t.accent,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>

                  {/* Permission chips */}
                  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    <PermChip active={enrollment.canSubmitDecisions}    label="D" title="Submit Decisions" t={t} />
                    <PermChip active={enrollment.canViewReports}        label="R" title="View Reports"     t={t} />
                    <PermChip active={enrollment.canViewCompetitorData} label="I" title="Competitor Intel"  t={t} />
                  </div>

                  {/* Open button */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link
                      href={canOpen ? `/dashboard/student/simulation/${sim._id}` : "#"}
                      style={{ textDecoration: "none" }}
                      onClick={e => { if (!canOpen) e.preventDefault(); }}
                    >
                      <button
                        disabled={!canOpen}
                        className="open-btn"
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 16px", borderRadius: 6,
                          background: canOpen ? (isDark ? t.accentLight : "#EFF6FF") : t.bgElevated,
                          border: `1px solid ${canOpen ? (isDark ? t.accentBorder : "#BFDBFE") : t.border}`,
                          color: canOpen ? t.accent : t.textDisabled,
                          fontSize: 13, fontWeight: 600,
                          cursor: canOpen ? "pointer" : "not-allowed",
                          opacity: canOpen ? 1 : 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Open
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                  </div>

                </div>
              );
            }) : (
              /* Empty state */
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, margin: "0 auto 16px",
                  borderRadius: 8, background: t.bgElevated, border: `1px solid ${t.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" fill="none" stroke={t.textMuted} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: t.textSec, marginBottom: 6 }}>
                  {searchQuery || filterStatus !== "all" ? "No matching simulations found" : "No simulations assigned yet"}
                </p>
                <p style={{ fontSize: 13, color: t.textMuted, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter."
                    : "You will see your simulations here once a faculty member enrolls you."}
                </p>
              </div>
            )}

            {/* Table footer */}
            {filtered.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderTop: `1px solid ${t.border}`,
                background: t.tableHead,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>Access chips:</span>
                  {[{ l: "D", d: "Decisions" }, { l: "R", d: "Reports" }, { l: "I", d: "Intel" }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4,
                        background: t.greenBg,
                        border: `1px solid ${isDark ? "rgba(63,185,80,0.3)" : "#6EE7B7"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: t.green,
                      }}>{x.l}</div>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{x.d}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: t.textMuted }}>
                  Showing {filtered.length} of {simulations.length} simulations
                </span>
              </div>
            )}

          </div>

          {/* ── QUICK GUIDE ───────────────────────────────────────────────── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
            marginTop: 24,
          }}>
            {[
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                title: "Submit Decisions",
                desc: "Each quarter you submit key decisions — production volumes, pricing, procurement orders, and marketing allocation.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Review Reports",
                desc: "After each quarter closes, review your firm's performance reports covering financials, supply chain KPIs, and market share.",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Learn & Compete",
                desc: "Compete against peer firms, learn how decisions affect financial outcomes, and develop supply chain management skills.",
              },
            ].map((g, i) => (
              <div key={i} style={{
                background: t.bgSurface, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: "16px 18px",
                boxShadow: t.shadowSm,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                    background: isDark ? t.accentLight : "#EFF6FF",
                    border: `1px solid ${isDark ? t.accentBorder : "#BFDBFE"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: t.accent,
                  }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={g.icon} />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{g.title}</span>
                </div>
                <p style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>{g.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}