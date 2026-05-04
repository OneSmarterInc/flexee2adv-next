// src/app/dashboard/faculty/simulations/[id]/components/Header.js
"use client";

import { useTheme } from "@/context/ThemeContext";

const LIGHT = {
  bgSurface: "#FFFFFF", bgElevated: "#F9FAFB", border: "#E5E7EB",
  borderStrong: "#D1D5DB", textPrimary: "#111827", textSec: "#374151",
  textMuted: "#6B7280", textDisabled: "#9CA3AF",
  accent: "#1D4ED8", accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  accentHover: "#1E40AF",
  green: "#065F46", greenBg: "#D1FAE5", greenBorder: "#6EE7B7",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
  red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  purple: "#5B21B6", purpleBg: "#EDE9FE", purpleBorder: "#C4B5FD",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};
const DARK = {
  bgSurface: "#161B22", bgElevated: "#1C2128", border: "#30363D",
  borderStrong: "#444C56", textPrimary: "#E6EDF3", textSec: "#8D96A0",
  textMuted: "#545D68", textDisabled: "#3D444D",
  accent: "#4493F8", accentLight: "#1A2332", accentBorder: "#1F3A5F",
  accentHover: "#68B3FB",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)", greenBorder: "rgba(63,185,80,0.30)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)", redBorder: "rgba(248,81,73,0.30)",
  purple: "#C4B5FD", purpleBg: "rgba(139,92,246,0.10)", purpleBorder: "rgba(139,92,246,0.30)",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

const STATUS_LIGHT = {
  CREATED:     { label: "Created",        color: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  INITIALIZED: { label: "Ready to Start", color: "#1D4ED8", bg: "#DBEAFE", border: "#93C5FD" },
  IN_PROGRESS: { label: "In Progress",    color: "#065F46", bg: "#D1FAE5", border: "#6EE7B7" },
  PAUSED:      { label: "Paused",         color: "#92400E", bg: "#FEF3C7", border: "#FCD34D" },
  COMPLETED:   { label: "Completed",      color: "#5B21B6", bg: "#EDE9FE", border: "#C4B5FD" },
};
const STATUS_DARK = {
  CREATED:     { label: "Created",        color: "#FCD34D", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  INITIALIZED: { label: "Ready to Start", color: "#93C5FD", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  IN_PROGRESS: { label: "In Progress",    color: "#6EE7B7", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)"  },
  PAUSED:      { label: "Paused",         color: "#FCD34D", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  COMPLETED:   { label: "Completed",      color: "#C4B5FD", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)"  },
};

// SVG icon paths for meta chips — FIX 6: no emojis
const ICONS = {
  // course / tag
  tag:      "M7 7h.01M7 3H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2zm0 12H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zm12-12h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2z",
  // institution
  building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  // created date
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  // advance quarter
  chevron:  "M9 5l7 7-7 7",
  // event
  bolt:     "M13 10V3L4 14h7v7l9-11h-7z",
  // enroll
  addUser:  "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  // features
  gear:     "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

function Icon({ d, size = 13, color }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color || "currentColor"} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={d} />
    </svg>
  );
}

// Small inline meta chip — FIX 2: replaces emoji badges
function MetaChip({ icon, label, t }) {
  if (!label) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 4,
      background: t.bgElevated, border: `1px solid ${t.border}`,
      fontSize: 11, fontWeight: 500, color: t.textSec,
    }}>
      <Icon d={icon} size={12} color={t.textMuted} />
      {label}
    </div>
  );
}

/**
 * Header — sim name, meta chips, status badge, action buttons.
 *
 * Props (all passed from page.js):
 *   theme, simulation, statusConfig, advancedCount, formatDate,
 *   handleAdvanceQuarter, actionLoading,
 *   setShowEventModal, setShowEnrollModal, fetchStudents, setShowFeatureModal,
 *   dataVisibility, handleToggleDataVisibility, loadingVisibility
 */
export default function Header({
  theme,              // legacy prop — kept but unused for styling
  simulation,
  statusConfig,       // legacy prop from old system — we re-derive below
  advancedCount,
  formatDate,
  handleAdvanceQuarter,
  actionLoading,
  setShowEventModal,
  setShowEnrollModal,
  fetchStudents,
  setShowFeatureModal,
  dataVisibility,
  handleToggleDataVisibility,
  loadingVisibility,
}) {
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const statusCfg = (isDark ? STATUS_DARK : STATUS_LIGHT)[simulation?.status]
    || (isDark ? STATUS_DARK : STATUS_LIGHT).CREATED;

  const isCompleted = simulation?.status === "COMPLETED";

  const css = `
    .hdr-pb { transition: background-color 0.12s; }
    .hdr-pb:hover:not(:disabled) { background-color: ${t.accentHover} !important; }
    .hdr-tb { transition: background-color 0.12s, border-color 0.12s; }
    .hdr-tb:hover { background-color: ${t.bgElevated} !important; }
    .hdr-amb { transition: background-color 0.12s; }
    .hdr-amb:hover { background-color: ${isDark ? "rgba(210,153,34,0.2)" : "#FEF3C7"} !important; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        background: t.bgSurface, border: `1px solid ${t.border}`,
        borderRadius: 8, padding: "16px 20px",
        boxShadow: t.shadow, marginBottom: 16,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

          {/* Left: name + meta chips */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{
                fontSize: 18, fontWeight: 700, color: t.textPrimary,
                letterSpacing: "-0.3px", lineHeight: 1,
              }}>
                {simulation?.name || "—"}
              </h1>

              {/* Status badge */}
              <span style={{
                padding: "3px 9px", borderRadius: 4,
                fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
                color: statusCfg.color, background: statusCfg.bg,
                border: `1px solid ${statusCfg.border}`,
                whiteSpace: "nowrap",
              }}>
                {statusCfg.label}
              </span>

              {/* Advanced modules badge */}
              {advancedCount > 0 && (
                <span style={{
                  padding: "3px 9px", borderRadius: 4,
                  fontSize: 11, fontWeight: 600,
                  color: isDark ? "#C4B5FD" : "#5B21B6",
                  background: isDark ? "rgba(139,92,246,0.12)" : "#EDE9FE",
                  border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "#C4B5FD"}`,
                  whiteSpace: "nowrap",
                }}>
                  {advancedCount} module{advancedCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* FIX 2: Meta chips with SVG icons instead of emojis */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <MetaChip icon={ICONS.tag}      label={simulation?.courseCode}     t={t} />
              <MetaChip icon={ICONS.building} label={simulation?.institutionName} t={t} />
              {simulation?.createdAt && formatDate && (
                <MetaChip icon={ICONS.calendar} label={`Created ${formatDate(simulation.createdAt)}`} t={t} />
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>

            {/* Enroll students */}
            <button
              className="hdr-tb"
              onClick={() => { fetchStudents?.(); setShowEnrollModal?.(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`, background: t.bgSurface,
                color: t.textSec, fontSize: 13, fontWeight: 500,
              }}
            >
              <Icon d={ICONS.addUser} size={14} />
              Enroll Students
            </button>

            {/* Toggle data visibility */}
            <button
              className="hdr-tb"
              onClick={handleToggleDataVisibility}
              disabled={actionLoading || loadingVisibility}
              title={dataVisibility?.showQuarterData ? "Hide data from students" : "Show data to students"}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`, background: dataVisibility?.showQuarterData ? t.accentLight : t.bgSurface,
                color: dataVisibility?.showQuarterData ? t.accent : t.textSec, fontSize: 13, fontWeight: 500,
                opacity: (actionLoading || loadingVisibility) ? 0.6 : 1,
              }}
            >
              {(actionLoading || loadingVisibility) ? (
                <div style={{
                  width: 13, height: 13, borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "currentColor",
                  animation: "spin 0.75s linear infinite",
                }} />
              ) : null}
              {dataVisibility?.showQuarterData ? "Hide Data" : "Show Data"}
            </button>

            {/* Trigger event */}
            <button
              className="hdr-amb"
              onClick={() => setShowEventModal?.(true)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${isDark ? t.amberBorder : "#FCD34D"}`,
                background: isDark ? t.amberBg : "#FEF3C7",
                color: isDark ? t.amber : "#92400E",
                fontSize: 13, fontWeight: 500,
              }}
            >
              <Icon d={ICONS.bolt} size={14} color={isDark ? t.amber : "#92400E"} />
              Trigger Event
            </button>

            {/* Simulation settings */}
            <button
              className="hdr-tb"
              onClick={() => setShowFeatureModal?.(true)}
              title="Simulation settings"
              style={{
                width: 36, height: 36, borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`, background: t.bgSurface,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.textMuted,
              }}
            >
              <Icon d={ICONS.gear} size={15} />
            </button>

            {/* Advance quarter — primary CTA */}
            <button
              className="hdr-pb"
              onClick={handleAdvanceQuarter}
              disabled={actionLoading || isCompleted}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                background: t.accent, border: "none",
                color: "#fff", fontSize: 13, fontWeight: 600,
                opacity: (actionLoading || isCompleted) ? 0.5 : 1,
              }}
            >
              {actionLoading ? (
                <div style={{
                  width: 13, height: 13, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  animation: "spin 0.75s linear infinite",
                }} />
              ) : (
                <Icon d={ICONS.chevron} size={13} color="#fff" />
              )}
              Advance Quarter
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}