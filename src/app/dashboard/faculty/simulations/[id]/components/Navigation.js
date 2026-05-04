// src/app/dashboard/faculty/simulations/[id]/components/Navigation.js
"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage:       "#F3F4F6", bgSurface:    "#FFFFFF", bgElevated:  "#F9FAFB",
  bgHover:      "#F3F4F6", border:       "#E5E7EB", borderStrong:"#D1D5DB",
  textPrimary:  "#111827", textSec:      "#374151", textMuted:   "#6B7280",
  textDisabled: "#9CA3AF", accent:       "#1D4ED8", accentLight: "#EFF6FF",
  accentBorder: "#BFDBFE", accentHover:  "#1E40AF",
  red:          "#991B1B", redBg:        "#FEE2E2", redBorder:   "#FECACA",
  purple:       "#5B21B6", purpleBg:     "#EDE9FE", purpleBorder:"#C4B5FD",
  headerBg:     "#FFFFFF",
  shadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
};
const DARK = {
  bgPage:       "#0D1117", bgSurface:    "#161B22", bgElevated:  "#1C2128",
  bgHover:      "#21262D", border:       "#30363D", borderStrong:"#444C56",
  textPrimary:  "#E6EDF3", textSec:      "#8D96A0", textMuted:   "#545D68",
  textDisabled: "#3D444D", accent:       "#4493F8", accentLight: "#1A2332",
  accentBorder: "#1F3A5F", accentHover:  "#68B3FB",
  red:          "#F85149", redBg:        "rgba(248,81,73,0.10)", redBorder:"rgba(248,81,73,0.30)",
  purple:       "#C4B5FD", purpleBg:     "rgba(139,92,246,0.10)", purpleBorder:"rgba(139,92,246,0.30)",
  headerBg:     "#161B22",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const buildCSS = (t, isDark) => `
  .nav-tb { transition: background-color 0.12s; }
  .nav-tb:hover { background-color: ${t.bgHover} !important; }
  .nav-rb { transition: background-color 0.12s, border-color 0.12s; }
  .nav-rb:hover {
    background-color: ${isDark ? "rgba(248,81,73,0.15)" : "#FEE2E2"} !important;
    border-color: ${t.red} !important;
  }
`;

export default function Navigation({
  isDark,
  toggleTheme,
  user,
  theme,           // legacy prop — kept for backward compat, not used for styling
  handleLogout,
  simulationName,
}) {
  const t = isDark ? DARK : LIGHT;

  const displayName = user?.displayName || user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Faculty";
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <style>{buildCSS(t, isDark)}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: t.headerBg,
        borderBottom: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "0 24px",
          height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* ── Left: back button + brand + separator + breadcrumb ── */}
          <div style={{ display: "flex", alignItems: "center" }}>

            {/* Back to faculty list */}
            <Link href="/dashboard/faculty" style={{ textDecoration: "none" }}>
              <button className="nav-tb" title="Back to simulations" style={{
                width: 34, height: 34, borderRadius: 6,
                border: `1px solid ${t.border}`, background: t.bgElevated,
                cursor: "pointer", marginRight: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.textMuted,
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>

            {/* Brand */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: t.accent, flexShrink: 0,
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

            {/* Separator */}
            <div style={{ width: 1, height: 28, background: t.border, margin: "0 16px" }} />

            {/* Breadcrumb: Faculty Portal → sim name */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link href="/dashboard/faculty" style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: 12, color: t.textMuted, cursor: "pointer",
                  transition: "color 0.12s",
                }}
                  onMouseEnter={e => e.target.style.color = t.textPrimary}
                  onMouseLeave={e => e.target.style.color = t.textMuted}
                >
                  Faculty Portal
                </span>
              </Link>
              <svg width="12" height="12" fill="none" stroke={t.textDisabled} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <span style={{
                fontSize: 12, fontWeight: 500, color: t.textPrimary,
                maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {simulationName || "Simulation"}
              </span>
            </div>
          </div>

          {/* ── Right: faculty badge + theme toggle + avatar + logout ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Faculty role badge */}
            <div style={{
              padding: "3px 9px", borderRadius: 4,
              background: isDark ? t.purpleBg : "#EDE9FE",
              border: `1px solid ${isDark ? t.purpleBorder : "#C4B5FD"}`,
              fontSize: 11, fontWeight: 600,
              color: isDark ? "#C4B5FD" : "#5B21B6",
            }}>
              Faculty
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="nav-tb"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 34, height: 34, borderRadius: 6,
                border: `1px solid ${t.border}`, background: t.bgElevated,
                cursor: "pointer",
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

            {/* Avatar chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 10px 4px 6px", borderRadius: 6,
              border: `1px solid ${t.border}`, background: t.bgElevated,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 4, background: t.accent, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
              }}>
                {initials}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500, color: t.textSec,
                maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {displayName}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="nav-rb"
              style={{
                padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`, background: "transparent",
                color: t.red, fontSize: 13, fontWeight: 500,
              }}
            >
              Log out
            </button>

          </div>
        </div>
      </header>
    </>
  );
}