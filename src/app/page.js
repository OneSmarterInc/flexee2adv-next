'use client';

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const LIGHT = {
  bgPage: "#F3F4F6",
  bgSurface: "#FFFFFF",
  bgElevated: "#F9FAFB",
  bgSection: "rgba(243, 244, 246, 0.5)",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textMuted: "#6B7280",
  accent: "#1D4ED8",
  accentHover: "#1E40AF",
  accentLight: "#EFF6FF",
  red: "#991B1B",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};
const DARK = {
  bgPage: "#0D1117",
  bgSurface: "#161B22",
  bgElevated: "#1C2128",
  bgSection: "rgba(22, 27, 34, 0.5)",
  border: "#30363D",
  textPrimary: "#E6EDF3",
  textMuted: "#8B949E",
  accent: "#4493F8",
  accentHover: "#79C0FF",
  accentLight: "rgba(68,147,248,0.10)",
  red: "#F85149",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

// ─── Clean SVG icon components (no emojis) ───────────────────────────────────
const NAV_HEIGHT = 56;

function IconBuilding({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="1"/><path d="M9 21V9h6v12"/><path d="M2 9h20"/>
    </svg>
  );
}
function IconChart({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IconRefresh({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  );
}
function IconUser({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconScorecard({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
function IconGlobe({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IconCheck({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconSun({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function IconMoon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? DARK : LIGHT;
  const [expandedFaq, setExpandedFaq] = useState(null);

  const features = [
    { title: "Multi-Player Competition", description: "Students control competing firms, making strategic decisions each quarter", Icon: IconBuilding },
    { title: "Quarterly Decisions",       description: "Production, procurement, pricing, marketing, and technology investments",           Icon: IconChart },
    { title: "Real-World Simulation",     description: "8–12 quarters with randomised market variance for authentic supply chain dynamics", Icon: IconRefresh },
    { title: "Faculty Control",           description: "Initialise, generate pre-history, process quarters, and monitor performance",        Icon: IconUser },
    { title: "Balanced Scorecard",        description: "Comprehensive performance analytics comparing all firms across metrics",             Icon: IconScorecard },
    { title: "Seamless Integration",      description: "Web-based platform for easy access and collaboration",                              Icon: IconGlobe },
  ];

  const simulationSteps = [
    { number: "1", title: "Faculty Initialisation",  description: "Create all sheets with starting data for Quarter 0" },
    { number: "2", title: "Pre-History Generation",  description: "Runs 3 quarters (Q1–Q3) with random variance to establish baseline" },
    { number: "3", title: "Student Decisions",        description: "Students enter their quarterly decisions via the Decision Cockpit" },
    { number: "4", title: "Quarter Processing",       description: "System calculates outcomes and updates all performance sheets" },
    { number: "5", title: "Performance Analysis",     description: "Compare firm performance via Balanced Scorecard at simulation end" },
  ];

  const faqs = [
    {
      question: "How long does a typical simulation run?",
      answer: "FLEXEE 2.0 simulations typically run for 8–12 quarters, with each quarter representing one business period. Faculty controls the pacing and can adjust based on classroom needs.",
    },
    {
      question: "What decisions do students make each quarter?",
      answer: "Students make quarterly decisions on production volume, procurement strategies, pricing, marketing spend, and technology investments. These decisions directly impact their firm's competitiveness and profitability.",
    },
    {
      question: "How is performance measured?",
      answer: "Performance is tracked through a comprehensive Balanced Scorecard that evaluates financial metrics, market share, customer satisfaction, operational efficiency, and strategic execution across all competing firms.",
    },
    {
      question: "Can faculty customise the simulation?",
      answer: "Yes, faculty has full control over initialisation parameters, market conditions, random variance, and the number of quarters. This allows customisation for different course objectives and timelines.",
    },
  ];

  // ─── Shared section wrapper — fixes the padding override bug ────────────────
  // Previous code wrote: `padding: "128px 24px", padding: "24px"` (shorthand last = overwrites)
  // Fix: always use paddingTop/paddingBottom/paddingLeft/paddingRight explicitly.
  const sectionPad  = { paddingTop: 80,  paddingBottom: 80,  paddingLeft: 24, paddingRight: 24 };
  const sectionPadAlt = { ...sectionPad, background: t.bgSection };

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bgPage,
      color: t.textPrimary,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: 14,
    }}>

      {/* ── Fixed Nav (NAV_HEIGHT = 56px) ── */}
      <nav style={{
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 40,
        height: NAV_HEIGHT,
        borderBottom: `1px solid ${t.border}`,
        background: isDark ? "rgba(13,17,23,0.85)" : "rgba(243,244,246,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          maxWidth: "96rem",
          width: "100%",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
            FLEXEE <span style={{ color: t.accent }}>2.0</span>
          </span>

          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[
              { label: "Features",     href: "#features" },
              { label: "Architecture", href: "#architecture" },
              { label: "FAQ",          href: "#faq" },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{ color: t.textMuted, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = t.textPrimary}
                onMouseLeave={e => e.target.style.color = t.textMuted}
              >
                {item.label}
              </a>
            ))}

            {/* Theme toggle — inline in nav, not floating */}
            <button
              onClick={toggleTheme}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: `1px solid ${t.border}`,
                cursor: "pointer", transition: "border-color 0.2s",
              }}
              title="Toggle theme"
              onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              {isDark ? <IconMoon color={t.textMuted} /> : <IconSun color={t.textMuted} />}
            </button>

            <Link href="/login" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "7px 20px",
                background: t.accent,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => e.target.style.background = t.accentHover}
                onMouseLeave={e => e.target.style.background = t.accent}
              >
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — paddingTop clears the 56px fixed nav ── */}
      <section style={{
        paddingTop: NAV_HEIGHT + 80,   // 56 nav + 80 breathing room
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <div style={{ maxWidth: "96rem", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 24px",
            letterSpacing: "-0.03em",
          }}>
            Supply Chain Management
            <br />
            <span style={{
              display: "inline-block",
              backgroundImage: isDark
                ? "linear-gradient(135deg, #4493F8, #0EA5E9)"
                : "linear-gradient(135deg, #1D4ED8, #2563EB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Simulation Platform
            </span>
          </h1>

          <p style={{ fontSize: 17, color: t.textMuted, maxWidth: 680, margin: "0 auto 36px", lineHeight: 1.7 }}>
            FLEXEE 2.0 is a comprehensive multi-player supply chain management simulation designed for executive education. Students compete as firms, making strategic quarterly decisions that shape their market success.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "12px 32px",
                background: t.accent, color: "#fff",
                border: "none", borderRadius: 9,
                fontWeight: 700, fontSize: 14,
                cursor: "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.target.style.background = t.accentHover}
                onMouseLeave={e => e.target.style.background = t.accent}
              >
                Start Simulation
              </button>
            </Link>
            <a href="#features" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "12px 32px",
                background: "transparent",
                border: `1px solid ${t.border}`,
                color: t.textPrimary,
                borderRadius: 9, fontWeight: 600, fontSize: 14,
                cursor: "pointer", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
              >
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3D Supply Chain Diagram ── */}
      <section style={sectionPad}>
        <div style={{ maxWidth: "96rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              The supply chain, visualised
            </h2>
            <p style={{ color: t.textMuted, fontSize: 15, margin: "0 auto", maxWidth: 540, lineHeight: 1.7 }}>
              Four stages, one chain. Student teams control a firm at each node — every quarterly decision ripples downstream.
            </p>
          </div>

          {(() => {
            const hw = 52, hd = 26, bh = 58, cy = 134;

            const nc = isDark ? {
              supplier: { top: "#EF9F27", left: "#854F0B", right: "#412402", text: "#FAC775", badge: "#633806", badgeText: "#FAC775" },
              factory:  { top: "#378ADD", left: "#185FA5", right: "#042C53", text: "#B5D4F4", badge: "#0C447C", badgeText: "#B5D4F4" },
              dc:       { top: "#1D9E75", left: "#0F6E56", right: "#04342C", text: "#9FE1CB", badge: "#085041", badgeText: "#9FE1CB" },
              retailer: { top: "#7F77DD", left: "#3C3489", right: "#26215C", text: "#CECBF6", badge: "#3C3489", badgeText: "#CECBF6" },
            } : {
              supplier: { top: "#FAC775", left: "#BA7517", right: "#854F0B", text: "#412402", badge: "#FAC775", badgeText: "#633806" },
              factory:  { top: "#B5D4F4", left: "#185FA5", right: "#0C447C", text: "#042C53", badge: "#B5D4F4", badgeText: "#0C447C" },
              dc:       { top: "#9FE1CB", left: "#1D9E75", right: "#085041", text: "#04342C", badge: "#9FE1CB", badgeText: "#085041" },
              retailer: { top: "#CECBF6", left: "#534AB7", right: "#3C3489", text: "#26215C", badge: "#CECBF6", badgeText: "#3C3489" },
            };

            const boxes = [
              { cx: 120, key: "supplier", step: 1, label: "Supplier",      sub: "Raw materials",  code: "RAW" },
              { cx: 267, key: "factory",  step: 2, label: "Factory",       sub: "Manufacturing",  code: "MFG" },
              { cx: 414, key: "dc",       step: 3, label: "Distribution",  sub: "Warehousing",    code: "DC"  },
              { cx: 561, key: "retailer", step: 4, label: "Retailer",      sub: "End customer",   code: "RTL" },
            ];

            const shadow      = isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.07)";
            const edgeStroke  = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.13)";
            const arrowColor  = isDark ? "#30363D" : "#D1D5DB";
            const transportClr = isDark ? "#545D68" : "#9CA3AF";

            const arrowPairs  = [[172,215],[319,362],[466,509]];
            const transports  = [
              { x: 193.5, label: "Road" },
              { x: 340.5, label: "Sea"  },
              { x: 487.5, label: "Rail" },
            ];

            return (
              <svg width="100%" viewBox="0 0 680 278">
                <defs>
                  <marker id="scArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                </defs>

                {/* Ground shadows */}
                {boxes.map(({ cx }) => (
                  <ellipse key={`sh-${cx}`} cx={cx} cy={cy + hd + bh + 8} rx={50} ry={7} fill={shadow} />
                ))}

                {/* 3D Boxes — left and right faces first, then top */}
                {boxes.map(({ cx, key }) => {
                  const c = nc[key];
                  const top   = `M${cx},${cy-hd} L${cx+hw},${cy} L${cx},${cy+hd} L${cx-hw},${cy} Z`;
                  const left  = `M${cx-hw},${cy} L${cx-hw},${cy+bh} L${cx},${cy+hd+bh} L${cx},${cy+hd} Z`;
                  const right = `M${cx},${cy+hd} L${cx+hw},${cy} L${cx+hw},${cy+bh} L${cx},${cy+hd+bh} Z`;
                  return (
                    <g key={key}>
                      <path d={left}  fill={c.left}  />
                      <path d={right} fill={c.right} />
                      <path d={top}   fill={c.top}   />
                      <path d={top}   fill="none" stroke={edgeStroke} strokeWidth="0.7" />
                      <path d={left}  fill="none" stroke={edgeStroke} strokeWidth="0.7" />
                      <path d={right} fill="none" stroke={edgeStroke} strokeWidth="0.7" />
                    </g>
                  );
                })}

                {/* Short code labels on top faces */}
                {boxes.map(({ cx, key, code }) => (
                  <text key={`code-${cx}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                    style={{ fill: nc[key].text, fontSize: "10px", fontWeight: 700, fontFamily: "Inter, sans-serif", userSelect: "none" }}>
                    {code}
                  </text>
                ))}

                {/* Flow arrows — gentle arcs */}
                {arrowPairs.map(([x1, x2], i) => (
                  <path key={`arr-${i}`}
                    d={`M${x1},${cy} Q${(x1+x2)/2},${cy-14} ${x2},${cy}`}
                    fill="none" stroke={arrowColor} strokeWidth="1.5"
                    markerEnd="url(#scArr)" />
                ))}

                {/* Transport mode labels */}
                {transports.map(({ x, label }) => (
                  <text key={`tr-${x}`} x={x} y={cy - 22} textAnchor="middle"
                    style={{ fill: transportClr, fontSize: "10px", fontFamily: "Inter, sans-serif" }}>
                    {label}
                  </text>
                ))}

                {/* Step number badges + dashed connectors to box */}
                {boxes.map(({ cx, step, key }) => {
                  const c = nc[key];
                  return (
                    <g key={`step-${step}`}>
                      <line x1={cx} y1={86} x2={cx} y2={cy - hd}
                        stroke={arrowColor} strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx={cx} cy={72} r={14} fill={c.badge} />
                      <text x={cx} y={72} textAnchor="middle" dominantBaseline="central"
                        style={{ fill: c.badgeText, fontSize: "12px", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                        {step}
                      </text>
                    </g>
                  );
                })}

                {/* Node name + sub labels below boxes */}
                {boxes.map(({ cx, label, sub }) => (
                  <g key={`lbl-${cx}`}>
                    <text x={cx} y={cy + hd + bh + 20} textAnchor="middle"
                      style={{ fill: t.textPrimary, fontSize: "13px", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                      {label}
                    </text>
                    <text x={cx} y={cy + hd + bh + 36} textAnchor="middle"
                      style={{ fill: t.textMuted, fontSize: "11px", fontFamily: "Inter, sans-serif" }}>
                      {sub}
                    </text>
                  </g>
                ))}
              </svg>
            );
          })()}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={sectionPadAlt}>
        <div style={{ maxWidth: "96rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 52px", letterSpacing: "-0.02em" }}>
            Key Features
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {features.map(({ title, description, Icon }, idx) => (
              <div
                key={idx}
                style={{
                  background: t.bgSurface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  padding: "24px 24px 28px",
                  transition: "border-color 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: t.accentLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <Icon color={t.accent} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: t.textPrimary }}>{title}</h3>
                <p style={{ color: t.textMuted, margin: 0, lineHeight: 1.6 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulation Flow ── */}
      <section id="architecture" style={sectionPad}>
        <div style={{ maxWidth: "96rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 52px", letterSpacing: "-0.02em" }}>
            Simulation Flow
          </h2>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {simulationSteps.map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{
                  flexShrink: 0,
                  width: 44, height: 44, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 16,
                  color: "#fff",
                  background: t.accent,
                }}>
                  {step.number}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: t.bgSurface,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    padding: "18px 22px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: t.textPrimary }}>{step.title}</h3>
                  <p style={{ color: t.textMuted, margin: 0, lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Decision Cockpit ── */}
      <section style={sectionPadAlt}>
        <div style={{ maxWidth: "96rem", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "center",
          }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                Decision Cockpit
              </h2>
              <p style={{ color: t.textMuted, margin: "0 0 24px", lineHeight: 1.7 }}>
                Students control their firm through an intuitive decision cockpit where they set quarterly strategy across five key areas:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Production Volume",
                  "Procurement Strategy",
                  "Pricing Decisions",
                  "Marketing Investment",
                  "Technology Upgrades",
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: t.accentLight,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <IconCheck color={t.accent} />
                    </div>
                    <span style={{ color: t.textPrimary, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: t.bgSurface,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: t.shadow,
            }}>
              <img src="/image.png" alt="Decision Cockpit Interface" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Balanced Scorecard ── */}
      <section style={sectionPad}>
        <div style={{ maxWidth: "96rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 52px", letterSpacing: "-0.02em" }}>
            Balanced Scorecard
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                title: "Financial Performance",
                desc:  "Profit margins, revenue growth, ROI, and cash flow management",
                items: ["Quarterly Profit / Loss", "Market Share Growth", "Return on Investment"],
              },
              {
                title: "Strategic Execution",
                desc:  "Technology adoption, supply chain optimisation, and competitive positioning",
                items: ["Technology Index", "Operational Efficiency", "Market Positioning"],
              },
              {
                title: "Customer Metrics",
                desc:  "Customer satisfaction, loyalty, and brand strength",
                items: ["Customer Satisfaction Score", "Brand Loyalty", "Market Reputation"],
              },
              {
                title: "Operational Health",
                desc:  "Production capacity, supply chain resilience, and cost control",
                items: ["Production Capacity", "Supply Chain Health", "Cost Efficiency"],
              },
            ].map((metric, idx) => (
              <div key={idx} style={{
                background: t.bgSurface,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "28px 24px",
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", color: t.textPrimary }}>{metric.title}</h3>
                <p style={{ color: t.textMuted, margin: "0 0 18px", lineHeight: 1.6, fontSize: 13 }}>{metric.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {metric.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: t.accent, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 13, color: t.textMuted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={sectionPadAlt}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 52px", letterSpacing: "-0.02em" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{
                background: t.bgSurface,
                border: `1px solid ${expandedFaq === idx ? t.accent : t.border}`,
                borderRadius: 10,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14, color: t.textPrimary }}>{faq.question}</span>
                  <span style={{
                    flexShrink: 0, width: 22, height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${t.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700,
                    color: expandedFaq === idx ? t.accent : t.textMuted,
                    transition: "color 0.2s, transform 0.2s",
                    transform: expandedFaq === idx ? "rotate(45deg)" : "rotate(0deg)",
                  }}>
                    +
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div style={{
                    padding: "0 20px 18px",
                    borderTop: `1px solid ${t.border}`,
                    paddingTop: 16,
                  }}>
                    <p style={{ color: t.textMuted, margin: 0, lineHeight: 1.7 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={sectionPad}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Ready to Launch Your Simulation?
          </h2>
          <p style={{ fontSize: 16, color: t.textMuted, margin: "0 0 36px", lineHeight: 1.7 }}>
            FLEXEE 2.0 transforms supply chain education through immersive, competitive learning experiences that prepare students for real-world management challenges.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "12px 32px",
                background: t.accent, color: "#fff",
                border: "none", borderRadius: 9,
                fontWeight: 700, fontSize: 14,
                cursor: "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.accentHover}
                onMouseLeave={e => e.currentTarget.style.background = t.accent}
              >
                Contact Faculty Support
              </button>
            </Link>
            <button style={{
              padding: "12px 32px",
              background: "transparent",
              border: `1px solid ${t.border}`,
              color: t.textPrimary,
              borderRadius: 9, fontWeight: 600, fontSize: 14,
              cursor: "pointer", transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${t.border}`,
        paddingTop: 28, paddingBottom: 28,
        paddingLeft: 24, paddingRight: 24,
        textAlign: "center",
      }}>
        <p style={{ color: t.textMuted, margin: 0, fontSize: 13 }}>
          FLEXEE 2.0 © 2026 — Supply Chain Management Simulation
        </p>
      </footer>
    </div>
  );
}