// src/app/dashboard/faculty/simulations/[id]/components/ProgressCard.js
"use client";

import { useTheme } from "@/context/ThemeContext";

const LIGHT = {
  bgSurface: "#FFFFFF", bgElevated: "#F9FAFB", bgHover: "#F3F4F6",
  border: "#E5E7EB", borderStrong: "#D1D5DB",
  textPrimary: "#111827", textSec: "#374151", textMuted: "#6B7280", textDisabled: "#9CA3AF",
  accent: "#1D4ED8", accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  green: "#065F46", greenBg: "#D1FAE5", greenBorder: "#6EE7B7",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
  red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};
const DARK = {
  bgSurface: "#161B22", bgElevated: "#1C2128", bgHover: "#21262D",
  border: "#30363D", borderStrong: "#444C56",
  textPrimary: "#E6EDF3", textSec: "#8D96A0", textMuted: "#545D68", textDisabled: "#3D444D",
  accent: "#4493F8", accentLight: "#1A2332", accentBorder: "#1F3A5F",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)", greenBorder: "rgba(63,185,80,0.30)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)", redBorder: "rgba(248,81,73,0.30)",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

const SEASON_CONFIG = {
  1: { name: "Q1 Post-Holiday", icon: "❄️" },
  2: { name: "Q2 Spring",       icon: "🌸" },
  3: { name: "Q3 Summer",       icon: "☀️" },
  4: { name: "Q4 Holiday",      icon: "🎄" },
};

function getCalendarQuarter(q) { return ((q - 1) % 4) + 1; }
function getSeason(q) { return SEASON_CONFIG[getCalendarQuarter(q)] || SEASON_CONFIG[1]; }

// FIX 5 helper — decide pill visual state
function pillStyle(pillQ, currentQ, selectedQ, t, isDark) {
  const isSelected   = pillQ === selectedQ;
  const isCompleted  = pillQ < currentQ;
  const isCurrent    = pillQ === currentQ;

  if (isSelected) return {
    background: t.accent, border: `1px solid ${t.accent}`,
    color: "#fff", fontWeight: 700,
    boxShadow: `0 0 0 2px ${isDark ? "rgba(68,147,248,0.35)" : "rgba(29,78,216,0.25)"}`,
  };
  if (isCompleted) return {
    // FIX 5: was dark red fill — now accent-light tint
    background: isDark ? t.accentLight : "#EFF6FF",
    border: `1px solid ${isDark ? t.accentBorder : "#BFDBFE"}`,
    color: t.accent, fontWeight: 600,
  };
  if (isCurrent) return {
    // FIX 5: was red outline — now green pulse to show "live"
    background: isDark ? t.greenBg : "#D1FAE5",
    border: `1px solid ${isDark ? t.greenBorder : "#6EE7B7"}`,
    color: t.green, fontWeight: 700,
  };
  // Future
  return {
    background: t.bgElevated, border: `1px solid ${t.border}`,
    color: t.textDisabled, fontWeight: 400,
  };
}

// Decision status firm chip
function FirmChip({ firm, t, isDark }) {
  const status = firm.decision?.status || "NO_DECISION";
  const label  = status === "PROCESSED" ? "Processed"
               : status === "SUBMITTED" ? "Submitted"
               : status === "DRAFT"     ? "Draft"
               : "No Decision";

  const style = status === "PROCESSED" || status === "SUBMITTED"
    ? { color: t.green, bg: isDark ? t.greenBg : "#D1FAE5", border: isDark ? t.greenBorder : "#6EE7B7" }
    : status === "DRAFT"
    ? { color: t.amber, bg: isDark ? t.amberBg : "#FEF3C7", border: isDark ? t.amberBorder : "#FCD34D" }
    : { color: t.textMuted, bg: t.bgElevated, border: t.border };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 4,
      background: style.bg, border: `1px solid ${style.border}`,
    }}>
      {/* Dot */}
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: style.color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
        {firm.firm?.name || `Firm ${firm.firm?.firmNumber || "?"}`}
      </span>
      <span style={{ fontSize: 11, color: style.color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/**
 * ProgressCard
 *
 * Props (unchanged from original page.js wiring):
 *   theme, isDark, simulation, quarterData, quarterProgress,
 *   currentSeason, getSeason (legacy — we use our own),
 *   onQuarterSelect, selectedQuarter, currentQuarter
 */
export default function ProgressCard({
  theme,          // legacy — not used for styling
  isDark: isDarkProp,
  simulation,
  quarterData,
  quarterProgress,
  currentSeason,  // legacy — we re-derive below
  getSeason: getSeasonfn, // legacy
  onQuarterSelect,
  selectedQuarter,
  currentQuarter,
}) {
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const qCur  = currentQuarter ?? simulation?.currentQuarter ?? 0;
  const qMax  = simulation?.maxQuarters ?? 12;
  // FIX 4: was hardcoded red — now accent blue
  const pct   = qMax ? Math.round((qCur / qMax) * 100) : 0;

  const nextQ    = qCur + 1;
  const season   = getSeason(nextQ);

  const firms    = quarterData?.firms || [];
  const allDone  = firms.length > 0 && firms.every(
    f => f.decision?.status === "PROCESSED" || f.decision?.status === "SUBMITTED"
  );

  const css = `
    .qpill { transition: box-shadow 0.12s, background-color 0.12s; cursor: pointer; }
    .qpill:hover { opacity: 0.82; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        background: t.bgSurface, border: `1px solid ${t.border}`,
        borderRadius: 8, padding: "18px 20px",
        boxShadow: t.shadow, marginBottom: 16,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* ── Top row: progress label + season badge ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Simulation Progress
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.4px", lineHeight: 1 }}>
              Quarter {qCur}{" "}
              <span style={{ fontSize: 16, fontWeight: 400, color: t.textMuted }}>of {qMax}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>Next Quarter</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 4,
              background: isDark ? t.greenBg : "#D1FAE5",
              border: `1px solid ${isDark ? t.greenBorder : "#6EE7B7"}`,
              fontSize: 12, fontWeight: 600, color: t.green,
            }}>
              {season.icon} {season.name}
            </div>
          </div>
        </div>

        {/* ── Progress bar — FIX 4: accent blue ── */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ height: 8, background: t.bgElevated, borderRadius: 4, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${pct}%`,
              background: t.accent,   // FIX 4: was red, now accent blue
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>Start</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.accent }}>{pct}% Complete</span>
            <span style={{ fontSize: 11, color: t.textMuted }}>Q{qMax}</span>
          </div>
        </div>

        {/* ── Quarter pills — FIX 5: accent/green/gray system ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginTop: 12 }}>
          {Array.from({ length: qMax }, (_, i) => i + 1).map(q => {
            const ps = pillStyle(q, qCur, selectedQuarter, t, isDark);
            return (
              <button
                key={q}
                className="qpill"
                onClick={() => onQuarterSelect?.(q)}
                style={{
                  width: 32, height: 28, borderRadius: 4,
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  ...ps,
                }}
              >
                {q}
              </button>
            );
          })}
        </div>

        {/* ── Decision status strip ── */}
        {firms.length > 0 && (
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: `1px solid ${t.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>Decision Status</span>
              {allDone ? (
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                  color: t.green, background: isDark ? t.greenBg : "#D1FAE5",
                  border: `1px solid ${isDark ? t.greenBorder : "#6EE7B7"}`,
                }}>
                  All Submitted
                </span>
              ) : (
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                  color: t.amber, background: isDark ? t.amberBg : "#FEF3C7",
                  border: `1px solid ${isDark ? t.amberBorder : "#FCD34D"}`,
                }}>
                  Pending
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {firms.map((f, i) => (
                <FirmChip key={i} firm={f} t={t} isDark={isDark} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}