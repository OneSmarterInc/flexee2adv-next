"use client";

import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";

export default function StudentHeader({
  simulation,
  currentQuarter,
  firm,
  firmInitials,
  greenScoreVal,
  onDecisionsClick,
}) {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Light theme
  const LIGHT = {
    primary: "#0176D3", primaryDark: "#014486", primaryLight: "#E0F2FE",
    bg: "#F3F3F3", surface: "#FFFFFF", surfaceAlt: "#F9FAFB",
    border: "#E5E5E5", borderStrong: "#D0D0D0",
    text: "#181818", textSec: "#444444", textMuted: "#706E6B",
    success: "#2E844A", successBg: "#EBF7EE", successBdr: "#A3D9B1",
    warning: "#DD7A01", warningBg: "#FEF3E2", warningBdr: "#F5C87A",
    error: "#BA0517", errorBg: "#FEE6E9", errorBdr: "#F5A3AB",
    shadow: "0 1px 3px rgba(0,0,0,0.08)", shadowMd: "0 4px 12px rgba(0,0,0,0.07)",
    headerBg: "#FFFFFF", teal: "#065F46", tealBg: "#CCFBF1", tealBorder: "#5EEAD4",
    bgElevated: "#F9FAFB", accent: "#1D4ED8",
  };
  
  // Dark theme
  const DARK = {
    primary: "#4A9EFF", primaryDark: "#2E7FD9", primaryLight: "#1E3E52",
    bg: "#0D1117", surface: "#161B22", surfaceAlt: "#21262D",
    border: "#30363D", borderStrong: "#444C56",
    text: "#E6EDF3", textSec: "#C9D1D9", textMuted: "#8B949E",
    success: "#3FB950", successBg: "#0D3920", successBdr: "#238636",
    warning: "#FFA657", warningBg: "#3D2817", warningBdr: "#845D1F",
    error: "#F85149", errorBg: "#3D0E0A", errorBdr: "#8B2C2C",
    shadow: "0 1px 3px rgba(0,0,0,0.3)", shadowMd: "0 4px 12px rgba(0,0,0,0.4)",
    headerBg: "#161B22", teal: "#3FB950", tealBg: "rgba(63,185,80,0.1)", tealBorder: "rgba(63,185,80,0.3)",
    bgElevated: "#1C2128", accent: "#4493F8",
  };
  
  const t = isDark ? DARK : LIGHT;
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: t?.headerBg || "#FFFFFF", borderBottom: `1px solid ${t?.border || "#E5E7EB"}`, boxShadow: t?.shadow || "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: Back Button & Logo & Context */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {/* Back to Simulations Button */}
          <button
            onClick={() => router.push("/dashboard/student")}
            className="tb"
            title="Back to simulations"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: `1px solid ${t?.border || "#E5E7EB"}`,
              background: t?.bgElevated || "#F9FAFB",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t?.textMuted || "#6B7280",
              marginRight: 8,
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: t?.accent || "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>F</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t?.textPrimary || "#111827", lineHeight: 1.25 }}>
                FLEXEE <span style={{ color: t?.accent || "#1D4ED8" }}>2.0</span>
              </div>
              <div style={{ fontSize: 10, color: t?.textMuted || "#6B7280", letterSpacing: "0.04em" }}>CORPORATE EDITION</div>
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: t?.border || "#E5E7EB", margin: "0 16px" }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: t?.textPrimary || "#111827", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {simulation?.name || "Loading…"}
            </div>
            <div style={{ fontSize: 11, color: t?.textMuted || "#6B7280" }}>
              Quarter {currentQuarter || "—"} of {simulation?.totalQuarters || simulation?.maxQuarters || "—"} · {firm?.name || "—"}
            </div>
          </div>
        </div>

        {/* Right: Status & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Quarter Active Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 4, background: t?.greenBg || "#D1FAE5", border: `1px solid ${t?.greenBorder || "#6EE7B7"}` }}>
            <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: t?.green || "#065F46" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: t?.green || "#065F46" }}>Q{currentQuarter || "—"} Active</span>
          </div>

          {/* Green Score Badge */}
          {greenScoreVal != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 4, background: t?.tealBg || "#CCFBF1", border: `1px solid ${t?.tealBorder || "#5EEAD4"}` }}>
              <span style={{ fontSize: 11, color: t?.teal || "#065F46" }}>🌱</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: t?.teal || "#065F46" }}>Green: {greenScoreVal?.toFixed(0)}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="tb"
            title="Toggle theme"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: `1px solid ${t?.border || "#E5E7EB"}`,
              background: t?.bgElevated || "#F9FAFB",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t?.textMuted || "#6B7280",
            }}
          >
            {isDark
              ? <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            }
          </button>

          {/* Firm Initials */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 6px", borderRadius: 6, border: `1px solid ${t?.border || "#E5E7EB"}`, background: t?.bgElevated || "#F9FAFB" }}>
            <div style={{ width: 28, height: 28, borderRadius: 4, background: firm?.color || t?.accent || "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {firmInitials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: t?.textSec || "#374151", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {firm?.name || "Team"}
            </span>
          </div>

          {/* Decisions Button */}
          <button
            className="pb"
            onClick={onDecisionsClick}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              background: t?.accent || "#1D4ED8",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Submit Decisions
          </button>
        </div>
      </div>
    </header>
  );
}
