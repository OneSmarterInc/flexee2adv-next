"use client";

/**
 * CreateSimulationModal.jsx — Corporate Edition (rich-shape schedule)
 *
 * Sends moduleSchedule in the rich shape the backend now expects:
 *
 *   moduleSchedule: {
 *     mode: 'CUSTOM',
 *     modules: [
 *       { moduleId: 'vmi',                order: 1, unlocksAtQuarter: 4, enabled: true },
 *       { moduleId: 'regionalDCs',         order: 2, unlocksAtQuarter: 5, enabled: true },
 *       { moduleId: 'multiCarrierSelection', order: 3, unlocksAtQuarter: 4, enabled: false },
 *       ...
 *     ]
 *   }
 *
 * Visually nothing changes — same toggle + "Opens at Q__" dropdown per module,
 * same Enable All / Disable All buttons, same flow.
 */

import { useState, useEffect } from "react";

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

// ─── Backend module keys, grouped for display ────────────────────────────────
const FEATURE_GROUPS = [
  {
    label: "Supply Chain",
    features: [
      { key: "vmi",                   label: "Vendor Managed Inventory",      desc: "Firms can invest in VMI to stabilise retailer ordering behaviour." },
      { key: "regionalDCs",           label: "Regional Distribution Centres", desc: "Central and West DC options that improve regional service levels." },
      { key: "multiCarrierSelection", label: "Multi-Carrier Selection",       desc: "Intermodal, truck, and air freight with cost / on-time tradeoffs." },
    ],
  },
  {
    label: "Operations",
    features: [
      { key: "capacityExpansion",   label: "Capacity Expansion",       desc: "Firms can build new production lines — small, medium, or large." },
      { key: "productInnovation",   label: "Product Innovation (P3)",  desc: "Allow firms to launch and manage a third product line." },
      { key: "marketExpansion",     label: "Market Expansion (R4–R6)", desc: "Open new regional markets beyond the default three regions." },
    ],
  },
  {
    label: "Intelligence & Reporting",
    features: [
      { key: "intelligenceCenter", label: "Intelligence Center",   desc: "Paid market intelligence reports — competitor pricing, regional demand, supplier risk." },
      { key: "returnsGreenScore",  label: "Returns & Green Score", desc: "ESG scoring based on disposal method, packaging, and return rates." },
      { key: "analyticsMode",      label: "Analytics Mode",        desc: "Advanced analytics — customer segments, supplier scorecards, scenario modelling." },
    ],
  },
];

// Order matters — this drives the `order` field sent to the backend
const ALL_FEATURE_KEYS = FEATURE_GROUPS.flatMap(g => g.features.map(f => f.key));
const orderOf = (key) => ALL_FEATURE_KEYS.indexOf(key) + 1;

const DEFAULT_FIRM_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const FIRST_DECISION_QUARTER = 4;

// Build the modules[] array with sensible defaults — all enabled, all at Q4.
// The UI mutates this in place via setModule.
const buildInitialModules = () =>
  ALL_FEATURE_KEYS.map((key) => ({
    moduleId: key,
    order: orderOf(key),
    unlocksAtQuarter: FIRST_DECISION_QUARTER,
    enabled: false, // start with all OFF; faculty opts in
  }));

const INITIAL_FORM = {
  name: "", description: "", courseCode: "", institutionName: "",
  numFirms: 3, maxQuarters: 12,
  modules: buildInitialModules(),
  firmConfigs: [],
  facultyIds: [],
};

export default function CreateSimulationModal({ show, onClose, isDark }) {
  const t = isDark ? DARK : LIGHT;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () => localStorage.getItem("access_token");

  const [form, setForm] = useState(INITIAL_FORM);
  const [firmNames, setFirmNames] = useState(["Firm 1", "Firm 2", "Firm 3"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch faculty list on mount
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/faculty`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFacultyList(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch faculty:", err);
      } finally {
        setFacultyLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  // Sync firmNames length to numFirms
  useEffect(() => {
    setFirmNames(prev => {
      const next = [...prev];
      while (next.length < form.numFirms) next.push(`Firm ${next.length + 1}`);
      return next.slice(0, form.numFirms);
    });
  }, [form.numFirms]);

  // Auto-clamp unlock quarters when maxQuarters shrinks
  useEffect(() => {
    setForm(f => {
      const needsClamp = f.modules.some(m => m.unlocksAtQuarter > f.maxQuarters);
      if (!needsClamp) return f;
      return {
        ...f,
        modules: f.modules.map(m => ({
          ...m,
          unlocksAtQuarter: Math.min(m.unlocksAtQuarter, f.maxQuarters),
        })),
      };
    });
  }, [form.maxQuarters]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // Patch a single module by its moduleId
  const patchModule = (key, patch) => {
    setForm(f => ({
      ...f,
      modules: f.modules.map(m => (m.moduleId === key ? { ...m, ...patch } : m)),
    }));
  };

  const toggleFeature = (key) => {
    const current = form.modules.find(m => m.moduleId === key);
    patchModule(key, { enabled: !current?.enabled });
  };

  const setModuleQuarter = (key, quarter) => {
    patchModule(key, { unlocksAtQuarter: quarter });
  };

  const enableAll = () => {
    setForm(f => ({
      ...f,
      modules: f.modules.map(m => ({
        ...m,
        enabled: true,
        unlocksAtQuarter: m.unlocksAtQuarter ?? FIRST_DECISION_QUARTER,
      })),
    }));
  };

  const disableAll = () => {
    setForm(f => ({
      ...f,
      modules: f.modules.map(m => ({ ...m, enabled: false })),
    }));
  };

  const enabledCount = form.modules.filter(m => m.enabled).length;

  // Quarter choices for the per-module dropdown
  const quarterChoices = [];
  for (let q = FIRST_DECISION_QUARTER; q <= form.maxQuarters; q++) {
    quarterChoices.push(q);
  }

  const toggleFacultySelection = (facultyId) => {
    setForm(f => ({
      ...f,
      facultyIds: f.facultyIds.includes(facultyId)
        ? f.facultyIds.filter(id => id !== facultyId)
        : [...f.facultyIds, facultyId]
    }));
  };

  const getSelectedFacultyNames = () => {
    return facultyList
      .filter(f => form.facultyIds.includes(f._id))
      .map(f => `${f.firstName} ${f.lastName}`)
      .join(", ");
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Simulation name is required."); return; }
    if (form.facultyIds.length === 0) { setError("Please select at least one faculty member."); return; }

    // Orphan check — block submit if any enabled module unlocks past sim end
    const orphans = form.modules.filter(
      m => m.enabled && m.unlocksAtQuarter > form.maxQuarters
    );
    if (orphans.length > 0) {
      setError(`${orphans.length} module(s) unlock after the simulation ends. Adjust the schedule or increase Simulation Length.`);
      return;
    }

    setLoading(true); setError("");

    const configs = firmNames
      .map((name, i) => ({ firmNumber: i + 1, name: name.trim() || `Firm ${i + 1}`, color: DEFAULT_FIRM_COLORS[i] }))
      .filter((c, i) => c.name !== `Firm ${i + 1}`);

    // Determine preset label for the mode field
    const allOpen = form.modules.every(m => m.enabled && m.unlocksAtQuarter === FIRST_DECISION_QUARTER);
    const mode = allOpen ? "ALL_OPEN" : "CUSTOM";

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      courseCode: form.courseCode.trim() || undefined,
      institutionName: form.institutionName.trim() || undefined,
      numFirms: form.numFirms,
      maxQuarters: form.maxQuarters,
      facultyIds: form.facultyIds,
      moduleSchedule: {
        mode,
        modules: form.modules,
      },
      ...(configs.length > 0 && { firmConfigs: configs }),
    };

    try {
      const res = await fetch(`${apiUrl}/simulations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const sim = await res.json();
        window.location.href = `/dashboard/admin/simulations/${sim._id}`;
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

  const handleClose = () => {
    setForm({ ...INITIAL_FORM, modules: buildInitialModules() });
    setFirmNames(["Firm 1", "Firm 2", "Firm 3"]);
    setError("");
    setDropdownOpen(false);
    onClose();
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.textPrimary, fontSize: 14, outline: "none", transition: "border-color 0.15s", fontFamily: "inherit" };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 };
  const hintStyle = { fontSize: 12, color: t.textMuted, marginTop: 4 };
  const cardStyle = { background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 };
  const sectionTitleStyle = { fontSize: 13, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 18 };

  if (!show) return null;

  // Lookup helper for the render loop
  const moduleOf = (key) => form.modules.find(m => m.moduleId === key);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 50,
      padding: 16, overflowY: "auto", paddingTop: 20,
    }}>
      <div style={{
        background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 12,
        width: "100%", maxWidth: 760, marginBottom: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50, background: t.bgSurface, borderBottom: `1px solid ${t.border}`,
          padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: t.shadow, borderRadius: "12px 12px 0 0",
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>New Simulation</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleClose} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${t.border}`, background: "none", color: t.textPrimary,
            }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading || !form.name.trim() || form.facultyIds.length === 0} style={{
              padding: "7px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: loading || !form.name.trim() || form.facultyIds.length === 0 ? "not-allowed" : "pointer",
              background: loading || !form.name.trim() || form.facultyIds.length === 0 ? t.textSubtle : t.accent, color: "#fff", border: "none",
              transition: "background 0.15s",
            }}>
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", padding: "24px" }}>
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
              <input style={inputStyle} placeholder="e.g. Spring 2026 — SCM 401"
                value={form.name} onChange={e => set("name", e.target.value)} maxLength={100}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72, lineHeight: 1.6 }}
                placeholder="Optional — describe the simulation scenario or learning objectives."
                value={form.description} onChange={e => set("description", e.target.value)} maxLength={500}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Course Code</label>
                <input style={inputStyle} placeholder="e.g. SCM 401"
                  value={form.courseCode} onChange={e => set("courseCode", e.target.value)} maxLength={30}
                />
              </div>
              <div>
                <label style={labelStyle}>Institution</label>
                <input style={inputStyle} placeholder="e.g. Wharton School"
                  value={form.institutionName} onChange={e => set("institutionName", e.target.value)} maxLength={80}
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Structure ── */}
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Simulation Structure</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={labelStyle}>Number of Firms</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[2, 3, 4, 5, 6].map(n => (
                    <button key={n} onClick={() => set("numFirms", n)} style={{
                      width: 44, height: 44, borderRadius: 10,
                      border: `2px solid ${form.numFirms === n ? t.accent : t.border}`,
                      background: form.numFirms === n ? t.accentLight : "none",
                      color: form.numFirms === n ? t.accent : t.textPrimary,
                      fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.12s",
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
                <p style={hintStyle}>One team per firm. Each firm competes independently.</p>
              </div>
              <div>
                <label style={labelStyle}>Simulation Length</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[{ label: "4 Q", value: 4 }, { label: "8 Q", value: 8 }, { label: "12 Q", value: 12 }, { label: "16 Q", value: 16 }].map(({ label, value }) => (
                    <button key={value} onClick={() => set("maxQuarters", value)} style={{
                      padding: "9px 14px", borderRadius: 10,
                      border: `2px solid ${form.maxQuarters === value ? t.accent : t.border}`,
                      background: form.maxQuarters === value ? t.accentLight : "none",
                      color: form.maxQuarters === value ? t.accent : t.textPrimary,
                      fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.12s",
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
                <p style={hintStyle}>Q1–Q3 are pre-seeded. Decisions begin at Q4.</p>
              </div>
            </div>
          </div>

          {/* ── Section 3: Faculty ── */}
          <div style={cardStyle}>
            <p style={sectionTitleStyle}>Faculty</p>

            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>
                Faculty Members <span style={{ color: t.red }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    ...inputStyle,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: t.inputBg, cursor: "pointer", color: form.facultyIds.length > 0 ? t.textPrimary : t.textMuted,
                  }}
                >
                  <span>{form.facultyIds.length === 0 ? "Select faculty members..." : getSelectedFacultyNames()}</span>
                  <span style={{ fontSize: 12 }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                    background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8,
                    maxHeight: 300, overflowY: "auto", zIndex: 100, boxShadow: t.shadowMd,
                  }}>
                    {facultyLoading ? (
                      <div style={{ padding: 16, color: t.textMuted, fontSize: 13 }}>Loading faculty...</div>
                    ) : facultyList.length === 0 ? (
                      <div style={{ padding: 16, color: t.textMuted, fontSize: 13 }}>No faculty members found</div>
                    ) : (
                      facultyList.map(faculty => {
                        const isSelected = form.facultyIds.includes(faculty._id);
                        return (
                          <div
                            key={faculty._id}
                            onClick={() => toggleFacultySelection(faculty._id)}
                            style={{
                              padding: "12px 16px", borderBottom: `1px solid ${t.border}`, cursor: "pointer",
                              background: isSelected ? t.accentLight : "transparent", transition: "background 0.12s",
                              display: "flex", alignItems: "center", gap: 12,
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 4,
                              border: `2px solid ${isSelected ? t.accent : t.border}`,
                              background: isSelected ? t.accent : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {isSelected && <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>✓</span>}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: t.textPrimary }}>
                                {faculty.firstName} {faculty.lastName}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textMuted }}>
                                {faculty.email}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              <p style={hintStyle}>Selected: {form.facultyIds.length} faculty member(s)</p>
            </div>
          </div>

          {/* ── Section 4: Firm Names ── */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ ...sectionTitleStyle, marginBottom: 0 }}>Firm Names</p>
              <span style={{ fontSize: 12, color: t.textMuted }}>Optional — teams can update these later</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {firmNames.map((name, i) => (
                <div key={i}>
                  <label style={{ ...labelStyle, fontWeight: 500 }}>
                    <span style={{
                      display: "inline-block", width: 20, height: 20, borderRadius: "50%",
                      background: DEFAULT_FIRM_COLORS[i], marginRight: 8, verticalAlign: "middle",
                    }} />
                    Firm {i + 1}
                  </label>
                  <input style={inputStyle} placeholder={`Firm ${i + 1}`}
                    value={name} onChange={e => {
                      const next = [...firmNames];
                      next[i] = e.target.value;
                      setFirmNames(next);
                    }} maxLength={40}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 5: Advanced Modules with Scheduling ── */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <p style={{ ...sectionTitleStyle, marginBottom: 0 }}>Advanced Modules</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={enableAll} style={{
                  fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${t.accentBorder}`, background: t.accentLight, color: t.accent,
                }}>
                  Enable All
                </button>
                <button onClick={disableAll} style={{
                  fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 10px", borderRadius: 6,
                  border: `1px solid ${t.border}`, background: "none", color: t.textMuted,
                }}>
                  Disable All
                </button>
              </div>
            </div>
            <p style={{ ...hintStyle, marginBottom: 20 }}>
              {enabledCount} of {ALL_FEATURE_KEYS.length} modules enabled.
              Each enabled module can open immediately (Q4) or be scheduled to unlock later.
            </p>

            {FEATURE_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: t.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${t.border}`,
                }}>
                  {group.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.features.map(feat => {
                    const mod = moduleOf(feat.key);
                    const on = !!mod?.enabled;
                    const scheduledQuarter = mod?.unlocksAtQuarter ?? FIRST_DECISION_QUARTER;
                    const isImmediate = scheduledQuarter <= FIRST_DECISION_QUARTER;

                    return (
                      <div key={feat.key} style={{
                        padding: "12px 14px", borderRadius: 10,
                        border: `1px solid ${on ? t.accentBorder : t.border}`,
                        background: on ? t.accentLight : t.bgElevated, transition: "all 0.12s",
                      }}>
                        {/* Top row — toggle + label + description */}
                        <div
                          onClick={() => toggleFeature(feat.key)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                        >
                          <div style={{
                            flexShrink: 0, marginTop: 2, width: 36, height: 20, borderRadius: 999,
                            background: on ? t.accent : t.inputBorder, position: "relative", transition: "background 0.15s",
                          }}>
                            <div style={{
                              position: "absolute", top: 3, borderRadius: "50%", width: 14, height: 14, background: "#fff",
                              left: on ? 19 : 3, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: on ? t.accent : t.textPrimary }}>
                              {feat.label}
                            </p>
                            <p style={{ margin: "3px 0 0", fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                              {feat.desc}
                            </p>
                          </div>
                        </div>

                        {/* Schedule row — only shown when module is enabled */}
                        {on && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                            marginTop: 10, paddingTop: 10, paddingLeft: 48,
                            borderTop: `1px dashed ${t.accentBorder}`,
                          }}>
                            <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>
                              Opens at:
                            </span>
                            <select
                              value={scheduledQuarter}
                              onChange={e => setModuleQuarter(feat.key, parseInt(e.target.value, 10))}
                              style={{
                                padding: "4px 10px", borderRadius: 6,
                                border: `1px solid ${t.inputBorder}`,
                                background: t.inputBg, color: t.textPrimary,
                                fontSize: 13, fontWeight: 600,
                                cursor: "pointer", outline: "none",
                              }}
                            >
                              {quarterChoices.map(q => (
                                <option key={q} value={q}>
                                  Q{q}{q === FIRST_DECISION_QUARTER ? " (start)" : ""}
                                </option>
                              ))}
                            </select>
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: isImmediate ? t.green : t.accent,
                            }}>
                              {isImmediate
                                ? "Available from day one"
                                : `Unlocks after ${scheduledQuarter - FIRST_DECISION_QUARTER} quarter${scheduledQuarter - FIRST_DECISION_QUARTER === 1 ? "" : "s"}`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}