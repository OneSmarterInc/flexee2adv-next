// src/app/dashboard/faculty/simulations/[id]/components/SimDetailSidebar.js
"use client";

import { useTheme } from "@/context/ThemeContext";

// ─── THEME ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bgSurface: "#FFFFFF", bgElevated: "#F9FAFB", bgHover: "#F3F4F6",
  border: "#E5E7EB", accent: "#1D4ED8", accentLight: "#EFF6FF",
  accentBorder: "#BFDBFE", textPrimary: "#111827", textSec: "#374151",
  textMuted: "#6B7280", textDisabled: "#9CA3AF",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
};
const DARK = {
  bgSurface: "#161B22", bgElevated: "#1C2128", bgHover: "#21262D",
  border: "#30363D", accent: "#4493F8", accentLight: "#1A2332",
  accentBorder: "#1F3A5F", textPrimary: "#E6EDF3", textSec: "#8D96A0",
  textMuted: "#545D68", textDisabled: "#3D444D",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)",
};

// ─── ALL TABS — feature-gated ones hidden when feature is off ─────────────────
const ALL_TABS = [
  // FIX 1: "Overview" is first — was missing from rendered sidebar
  { id: "overview",      label: "Overview",            d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "firms",         label: "Firms & Teams",        d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { id: "leaderboard",   label: "Leaderboard",          d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "demand",        label: "Market & Demand",      d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "events",        label: "Events",               d: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "credit",        label: "Credit & Finance",     d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "scrm",          label: "Supply Chain Risk",    d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  // ── Feature-gated ──────────────────────────────────────────────────────────
  { id: "green-score",   label: "Green Score",          feature: "returnsGreenScore",      d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "capacity-expansion", label: "Capacity Expansion", feature: "capacityExpansion",    d: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m-6 0a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
  { id: "logistics",     label: "Logistics",            feature: "advancedLogistics",      d: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" },
  { id: "intelligence",  label: "Intelligence Center",  feature: "intelligenceCenter",     d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "vmi",           label: "VMI",                  feature: "vmi",                    d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  // ── Always-last utility ─────────────────────────────────────────────────────
  { id: "features",      label: "Settings",             d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

// Section dividers appear BEFORE these tab ids
const SECTION_STARTS = new Set(["green", "features"]);

export default function SimDetailSidebar({ activeTab, setActiveTab, simulation, pendingCount = 0 }) {
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  // FIX 3: CSS injected directly inside this component so .nb/.nb.act work
  // regardless of whether a parent injected global styles
  const css = `
    .sdb-btn {
      transition: background-color 0.12s, color 0.12s;
      width: 100%; display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 6px; margin-bottom: 2px;
      border: none; cursor: pointer; text-align: left;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px; background: transparent;
    }
    .sdb-btn:hover { background-color: ${t.bgHover} !important; }
    .sdb-btn.active {
      background-color: ${isDark ? t.accentLight : "#EFF6FF"} !important;
      color: ${t.accent} !important;
      font-weight: 600;
    }
    .sdb-btn.active svg { stroke: ${t.accent}; }
  `;

  const visibleTabs = ALL_TABS.filter(tab =>
    !tab.feature || !!simulation?.features?.[tab.feature]
  );

  const qCur = simulation?.currentQuarter ?? 0;
  const qMax = simulation?.maxQuarters   ?? 12;
  const pct  = qMax ? Math.round((qCur / qMax) * 100) : 0;

  return (
    <>
      <style>{css}</style>
      <aside style={{
        width: 220, flexShrink: 0,
        background: t.bgSurface,
        borderRight: `1px solid ${t.border}`,
        minHeight: "calc(100vh - 56px)",
        position: "sticky", top: 56,
        overflowY: "auto",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <nav style={{ padding: "12px 10px" }}>
          {visibleTabs.map(item => {
            const isActive = activeTab === item.id;
            const badge    = item.id === "firms" && pendingCount > 0 ? pendingCount : null;

            return (
              <div key={item.id}>
                {SECTION_STARTS.has(item.id) && (
                  <div style={{ height: 1, background: t.border, margin: "8px 0" }} />
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`sdb-btn${isActive ? " active" : ""}`}
                  style={{ color: isActive ? t.accent : t.textSec }}
                >
                  <svg
                    width="15" height="15" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24" style={{ flexShrink: 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={item.d} />
                  </svg>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 10,
                      background: t.amberBg, border: `1px solid ${t.amberBorder}`,
                      fontSize: 10, fontWeight: 700, color: t.amber,
                    }}>
                      {badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Sim progress footer card */}
        {simulation && (
          <div style={{
            margin: "0 10px 14px",
            padding: "10px 12px", borderRadius: 6,
            background: t.bgElevated, border: `1px solid ${t.border}`,
          }}>
            <div style={{
              fontSize: 10, color: t.textMuted,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
            }}>
              Simulation
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: t.textPrimary,
              marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {simulation.name}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: t.textMuted }}>Progress</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: t.textPrimary, fontFamily: "SF Mono, Consolas, monospace" }}>
                Q{qCur}/{qMax}
              </span>
            </div>
            <div style={{ height: 3, background: t.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${pct}%`,
                // FIX 4 (here too): accent blue, not red
                background: t.accent,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}