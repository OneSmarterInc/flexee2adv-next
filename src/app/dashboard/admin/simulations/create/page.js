"use client";

/**
 * CreateSimulationPage.jsx
 *
 * Only collects inputs that the backend actually uses in a meaningful way.
 *
 * REMOVED from previous form (all have hardcoded defaults that power the simulation math):
 *   ✗  numRegions        → always 3 (East/Central/West), hardwired into market CONFIG
 *   ✗  numProducts       → always 2 (P1 Standard / P2 Premium), hardwired into market CONFIG
 *   ✗  startingRevenue   → $1B constant; changing it silently breaks the financial model
 *   ✗  startingCash      → $50M default wired into Q0 state initialization
 *   ✗  totalMarketSize   → 600K constant; changing it breaks per-firm market-share math
 *   ✗  seasonality       → backend reads from CONFIG.seasonality.QUARTERS; UI can't override usefully
 *   ✗  eventProbability  → fine-tuning knob with no visible effect faculty can reason about
 *   ✗  demandVariability → same
 *   ✗  facultyIds        → auto-set to the authenticated owner (req.user._id)
 *
 * KEPT (each maps to a real, faculty-facing decision):
 *   ✓  name              → required, human identifier
 *   ✓  description       → optional, course context
 *   ✓  courseCode        → optional, organizational metadata
 *   ✓  institutionName   → optional, organizational metadata
 *   ✓  numFirms          → 2–6, meaningful team-count decision
 *   ✓  maxQuarters       → semester length (4 / 8 / 12 / 16)
 *   ✓  features          → which advanced modules are enabled — the most impactful config choice
 *   ✓  firmConfigs       → optional per-firm name override (teams name themselves)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// ─── Theme tokens (matches the detail-page pattern) ───────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6", bgSurface: "#FFFFFF", bgElevated: "#F9FAFB",
  border: "#E5E7EB", textPrimary: "#111827", textMuted: "#6B7280",
  textSubtle: "#9CA3AF", accent: "#1D4ED8", accentHover: "#1E40AF",
  accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  red: "#991B1B", redBg: "#FEE2E2",
  green: "#065F46", greenBg: "#D1FAE5",
  inputBg: "#FFFFFF", inputBorder: "#D1D5DB", inputFocus: "#1D4ED8",
  shadow: "0 1px 3px rgba(0,0,0,0.08)", shadowMd: "0 4px 12px rgba(0,0,0,0.10)",
};
const DARK = {
  bgPage: "#0D1117", bgSurface: "#161B22", bgElevated: "#1C2128",
  border: "#30363D", textPrimary: "#E6EDF3", textMuted: "#8B949E",
  textSubtle: "#545D68", accent: "#4493F8", accentHover: "#58A6FF",
  accentLight: "rgba(68,147,248,0.10)", accentBorder: "rgba(68,147,248,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)",
  inputBg: "#0D1117", inputBorder: "#30363D", inputFocus: "#4493F8",
  shadow: "0 1px 3px rgba(0,0,0,0.30)", shadowMd: "0 4px 12px rgba(0,0,0,0.40)",
};

// ─── Feature toggle definitions (matches ADVANCED_MODULES on detail page) ─────
const FEATURE_GROUPS = [
  {
    label: "Supply Chain",
    features: [
      { key: "supplierSelection",     label: "Supplier Selection",       desc: "Firms choose from multiple supplier tiers with different cost/quality tradeoffs" },
      { key: "vmi",                   label: "Vendor Managed Inventory",  desc: "Firms can invest in VMI to stabilize retailer ordering behavior" },
      { key: "regionalDCs",          label: "Regional Distribution Centers", desc: "Central and West DC options that improve regional service levels" },
      { key: "multiCarrierSelection", label: "Multi-Carrier Selection",  desc: "Intermodal / Truck / Air Freight with cost and on-time tradeoffs" },
    ],
  },
  {
    label: "Operations",
    features: [
      { key: "productionExpansion",  label: "Production Expansion",      desc: "Firms can invest in new production lines (Small / Medium / Large)" },
      { key: "qualityManagement",    label: "Quality Management",         desc: "Inspection levels and rework decisions affect defect rates and CSI" },
      { key: "technologyInvestment", label: "Technology Investment",      desc: "ERP, TMS, WMS, APS and other systems with measurable cost/benefit effects" },
      { key: "globalExpansion",      label: "Global Market Expansion",    desc: "Canada, EU, and APAC region entry with varying barriers and growth rates" },
    ],
  },
  {
    label: "Finance & Risk",
    features: [
      { key: "creditManagement",     label: "Credit Management",         desc: "Dynamic credit scoring, tiers, and overlimit fee mechanics" },
      { key: "scrmEnabled",          label: "SCRM Risk Assessment",       desc: "Supply-chain risk scoring with disruption probability and mitigation options" },
      { key: "warrantyManagement",   label: "Warranty Management",        desc: "Three-tier warranty offering with return/recall cost implications" },
    ],
  },
  {
    label: "Intelligence & Reporting",
    features: [
      { key: "intelligenceCenter",   label: "Intelligence Center",        desc: "Paid market intelligence reports (competitor pricing, regional demand, etc.)" },
      { key: "returnsGreenScore",    label: "Green Score & Returns",      desc: "ESG scoring based on disposal method, packaging, and return rates" },
      { key: "newProductDevelopment", label: "New Product Development",  desc: "Firms can launch a third product line (P3) with custom configuration" },
    ],
  },
];

const ALL_FEATURE_KEYS = FEATURE_GROUPS.flatMap(g => g.features.map(f => f.key));

const DEFAULT_FIRM_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function CreateSimulationPage() {
  const router  = useRouter();
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const apiUrl  = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () => localStorage.getItem("access_token");

  // ─── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:            "",
    description:     "",
    courseCode:      "",
    institutionName: "",
    numFirms:        3,
    maxQuarters:     12,
    features:        {},        // populated as feature keys toggled
    firmConfigs:     [],        // [{firmNumber, name}] — only sent if user customises
  });

  const [firmNames,   setFirmNames]   = useState(["Firm 1", "Firm 2", "Firm 3"]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [expandGroup, setExpandGroup] = useState({});

  // Sync firmNames array length when numFirms changes
  useEffect(() => {
    setFirmNames(prev => {
      const next = [...prev];
      while (next.length < form.numFirms) next.push(`Firm ${next.length + 1}`);
      return next.slice(0, form.numFirms);
    });
  }, [form.numFirms]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleFeature = (key) =>
    setForm(f => ({
      ...f,
      features: { ...f.features, [key]: !f.features[key] },
    }));

  const enableAll  = () => setForm(f => ({ ...f, features: Object.fromEntries(ALL_FEATURE_KEYS.map(k => [k, true])) }));
  const disableAll = () => setForm(f => ({ ...f, features: {} }));

  const enabledCount = ALL_FEATURE_KEYS.filter(k => form.features[k]).length;

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Simulation name is required."); return; }
    setLoading(true); setError("");

    // Build firmConfigs only if any name differs from the default
    const configs = firmNames
      .map((name, i) => ({ firmNumber: i + 1, name: name.trim() || `Firm ${i + 1}`, color: DEFAULT_FIRM_COLORS[i] }))
      .filter((c, i) => c.name !== `Firm ${i + 1}`);

    const payload = {
      name:            form.name.trim(),
      description:     form.description.trim() || undefined,
      courseCode:      form.courseCode.trim()   || undefined,
      institutionName: form.institutionName.trim() || undefined,
      numFirms:        form.numFirms,
      maxQuarters:     form.maxQuarters,
      features:        form.features,
      ...(configs.length > 0 && { firmConfigs: configs }),
    };

    try {
      const res = await fetch(`${apiUrl}/simulations`, {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          Accept:         "*/*",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const sim = await res.json();
        router.push(`/dashboard/admin/simulations/${sim._id}`);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.message || "Failed to create simulation. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared input style ───────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${t.inputBorder}`,
    background: t.inputBg, color: t.textPrimary,
    fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: t.textPrimary, marginBottom: 6,
  };

  const hintStyle = { fontSize: 12, color: t.textMuted, marginTop: 4 };

  const cardStyle = {
    background: t.bgSurface, border: `1px solid ${t.border}`,
    borderRadius: 12, padding: 24, marginBottom: 16,
    boxShadow: t.shadow,
  };

  const sectionTitleStyle = {
    fontSize: 13, fontWeight: 700, color: t.textMuted,
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 18,
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: t.bgPage, color: t.textPrimary,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: 14,
    }}>

      {/* ── Header bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: t.bgSurface, borderBottom: `1px solid ${t.border}`,
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: t.shadow,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: t.textMuted, fontSize: 20, padding: "4px 8px",
              borderRadius: 6, display: "flex", alignItems: "center",
            }}
          >
            ←
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>
            New Simulation
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${t.border}`,
              background: "none", color: t.textPrimary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            style={{
              padding: "7px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: loading || !form.name.trim() ? "not-allowed" : "pointer",
              background: loading || !form.name.trim() ? t.textSubtle : t.accent,
              color: "#fff", border: "none",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Creating…" : "Create Simulation"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: t.redBg, border: `1px solid ${t.red}`,
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            color: t.red, fontSize: 13, fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* ── Section 1: Identity ── */}
        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Simulation Identity</p>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Simulation Name <span style={{ color: t.red }}>*</span>
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Spring 2025 — SCM 401"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72, lineHeight: 1.6 }}
              placeholder="Optional — describe the simulation scenario or learning objectives."
              value={form.description}
              onChange={e => set("description", e.target.value)}
              maxLength={500}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Course Code</label>
              <input
                style={inputStyle}
                placeholder="e.g. SCM 401"
                value={form.courseCode}
                onChange={e => set("courseCode", e.target.value)}
                maxLength={30}
              />
            </div>
            <div>
              <label style={labelStyle}>Institution</label>
              <input
                style={inputStyle}
                placeholder="e.g. Wharton School"
                value={form.institutionName}
                onChange={e => set("institutionName", e.target.value)}
                maxLength={80}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Structure ── */}
        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Simulation Structure</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* numFirms */}
            <div>
              <label style={labelStyle}>Number of Firms</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => set("numFirms", n)}
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      border: `2px solid ${form.numFirms === n ? t.accent : t.border}`,
                      background: form.numFirms === n ? t.accentLight : "none",
                      color: form.numFirms === n ? t.accent : t.textPrimary,
                      fontWeight: 700, fontSize: 15, cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={hintStyle}>One team per firm. Each firm competes independently.</p>
            </div>

            {/* maxQuarters */}
            <div>
              <label style={labelStyle}>Simulation Length</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "4 Q", value: 4 },
                  { label: "8 Q", value: 8 },
                  { label: "12 Q", value: 12 },
                  { label: "16 Q", value: 16 },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => set("maxQuarters", value)}
                    style={{
                      padding: "9px 14px", borderRadius: 10,
                      border: `2px solid ${form.maxQuarters === value ? t.accent : t.border}`,
                      background: form.maxQuarters === value ? t.accentLight : "none",
                      color: form.maxQuarters === value ? t.accent : t.textPrimary,
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p style={hintStyle}>Quarter 1 is pre-seeded. 12 quarters ≈ one semester.</p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Firm Names (optional) ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ ...sectionTitleStyle, marginBottom: 0 }}>Firm Names</p>
            <span style={{ fontSize: 12, color: t.textMuted }}>Optional — students can update these later</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {firmNames.map((name, i) => (
              <div key={i}>
                <label style={{ ...labelStyle, fontWeight: 500 }}>
                  <span style={{
                    display: "inline-block", width: 20, height: 20, borderRadius: "50%",
                    background: DEFAULT_FIRM_COLORS[i], marginRight: 8,
                    verticalAlign: "middle",
                  }} />
                  Firm {i + 1}
                </label>
                <input
                  style={inputStyle}
                  placeholder={`Firm ${i + 1}`}
                  value={name}
                  onChange={e => {
                    const next = [...firmNames];
                    next[i] = e.target.value;
                    setFirmNames(next);
                  }}
                  maxLength={40}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Advanced Modules ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ ...sectionTitleStyle, marginBottom: 0 }}>Advanced Modules</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={enableAll}
                style={{
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${t.accentBorder}`,
                  background: t.accentLight, color: t.accent,
                }}
              >
                Enable All
              </button>
              <button
                onClick={disableAll}
                style={{
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${t.border}`,
                  background: "none", color: t.textMuted,
                }}
              >
                Disable All
              </button>
            </div>
          </div>
          <p style={{ ...hintStyle, marginBottom: 20 }}>
            {enabledCount} of {ALL_FEATURE_KEYS.length} modules enabled.
            Modules can also be toggled after the simulation starts.
          </p>

          {FEATURE_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: t.textMuted,
                textTransform: "uppercase", letterSpacing: "0.05em",
                marginBottom: 10, paddingBottom: 8,
                borderBottom: `1px solid ${t.border}`,
              }}>
                {group.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.features.map(feat => {
                  const on = !!form.features[feat.key];
                  return (
                    <div
                      key={feat.key}
                      onClick={() => toggleFeature(feat.key)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${on ? t.accentBorder : t.border}`,
                        background: on ? t.accentLight : t.bgElevated,
                        transition: "all 0.12s",
                      }}
                    >
                      {/* Toggle pill */}
                      <div style={{
                        flexShrink: 0, marginTop: 2,
                        width: 36, height: 20, borderRadius: 999,
                        background: on ? t.accent : t.inputBorder,
                        position: "relative", transition: "background 0.15s",
                      }}>
                        <div style={{
                          position: "absolute", top: 3, borderRadius: "50%",
                          width: 14, height: 14, background: "#fff",
                          left: on ? 19 : 3,
                          transition: "left 0.15s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                        }} />
                      </div>

                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: on ? t.accent : t.textPrimary }}>
                          {feat.label}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom submit ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button
            onClick={() => router.push("/dashboard/admin")}
            style={{
              padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${t.border}`,
              background: "none", color: t.textPrimary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            style={{
              padding: "10px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: loading || !form.name.trim() ? "not-allowed" : "pointer",
              background: loading || !form.name.trim() ? t.textSubtle : t.accent,
              color: "#fff", border: "none",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Creating simulation…" : "Create Simulation"}
          </button>
        </div>

      </div>
    </div>
  );
}
