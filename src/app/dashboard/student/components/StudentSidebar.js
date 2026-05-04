"use client";

import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";

export default function StudentSidebar({ navItems = [], activeTab, onTabChange, simId }) {
  const { isDark } = useTheme();
  const router = useRouter();

  const LIGHT = {
    sidebarBg: "#FFFFFF", border: "#E5E7EB", accentLight: "#EFF6FF", accent: "#1D4ED8",
    textSec: "#374151", textMuted: "#6B7280", textDisabled: "#9CA3AF",
    amberBg: "#FEF3C7", amberBorder: "#FCD34D", amber: "#92400E",
  };
  const DARK = {
    sidebarBg: "#161B22", border: "#30363D", accentLight: "#1A2332", accent: "#4493F8",
    textSec: "#8D96A0", textMuted: "#545D68", textDisabled: "#3D444D",
    amberBg: "rgba(210,153,34,0.10)", amberBorder: "rgba(210,153,34,0.30)", amber: "#D29922",
  };
  const t = isDark ? DARK : LIGHT;

  // Route map — all navigation is router.push, no more setActiveTab for cross-page tabs.
  // risk doesn't have a page yet — it is disabled (no href, muted style).
  const ROUTES = {
    dashboard:  simId ? `/dashboard/student/simulation/${simId}`          : null,
    decisions:  simId ? `/dashboard/student/simulation/decisions/${simId}` : null,
    results:    simId ? `/dashboard/student/simulation/reports/${simId}`              : null,
    financials: simId ? `/dashboard/student/simulation/financials/${simId}`: null,
    analytics:  simId ? `/dashboard/student/simulation/analytics/${simId}` : null,
    risk:       simId ? `/dashboard/student/simulation/risks/${simId}`      : null,
  };

  const handleClick = (tab) => {
    const route = ROUTES[tab];
    if (!route) return; // disabled tab
    if (onTabChange) onTabChange(tab); // let parent know (for in-page tabs like dashboard)
    router.push(route);
  };

  // const resources = [
  //   { label: "Market Data", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" },
  //   { label: "Team",        d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  // ];

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: t.sidebarBg,
      borderRight: `1px solid ${t.border}`, minHeight: "calc(100vh - 56px)",
      position: "sticky", top: 56, overflowY: "auto",
    }}>
      <nav style={{ padding: "12px 10px" }}>
        {navItems.map(item => {
          const isActive   = activeTab === item.id;
          const isDisabled = ROUTES[item.id] === null;
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && handleClick(item.id)}
              className={`nb ${isActive ? "act" : ""}`}
              disabled={isDisabled}
              title={isDisabled ? "Coming soon" : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 6, marginBottom: 2,
                border: "none", cursor: isDisabled ? "not-allowed" : "pointer",
                textAlign: "left",
                background: isActive ? (isDark ? t.accentLight : "#EFF6FF") : "transparent",
                color: isDisabled ? t.textDisabled : isActive ? t.accent : t.textSec,
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={item.d} />
              </svg>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ padding: "1px 6px", borderRadius: 10, background: t.amberBg, border: `1px solid ${t.amberBorder}`, fontSize: 10, fontWeight: 700, color: t.amber }}>
                  {item.badge}
                </span>
              )}
              {isDisabled && (
                <span style={{ fontSize: 9, color: t.textDisabled, fontWeight: 500 }}>SOON</span>
              )}
            </button>
          );
        })}

        <div style={{ height: 1, background: t.border, margin: "10px 0" }} />
        {/* <div style={{ fontSize: 10, fontWeight: 600, color: t.textDisabled, textTransform: "uppercase", letterSpacing: "0.07em", padding: "0 10px", marginBottom: 6 }}>
          Resources
        </div>
        {resources.map(r => (
          <button key={r.label} className="nb" style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, marginBottom: 2, border: "none", cursor: "pointer", background: "transparent", color: t.textSec, fontSize: 13 }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={r.d} />
            </svg>
            {r.label}
          </button>
        ))} */}
      </nav>
    </aside>
  );
}