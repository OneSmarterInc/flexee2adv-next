"use client";

/**
 * StudentDecisionsPage — fixed dark/light mode
 *
 * THEME FIX:
 *   Previously this page managed its own isDark state via
 *   useState + localStorage.getItem("flexee_theme"), completely
 *   disconnected from the shared ThemeContext used by every other page.
 *   Result: toggling dark mode on the dashboard had no effect on decisions,
 *   and the decisions toggle wrote to a different localStorage key than
 *   what ThemeContext reads.
 *
 *   Fix: removed local isDark/toggleTheme state entirely.
 *   Now reads from useTheme() — same context as dashboard, financials, etc.
 *   The custom inline <header> is also replaced with <StudentHeader> so
 *   the theme toggle button is consistent across all pages.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import StudentHeader from "../../../components/StudentHeader";
import StudentSidebar from "../../../components/StudentSidebar";

// ─── SEASON CONFIG (GAS CONFIG.seasonality) ───────────────────────────────────
const SEASON_CONFIG = {
  1: { name: "Q1 Post-Holiday", icon: "❄️", hint: "Lower demand expected (-15%)",  multiplier: 0.85 },
  2: { name: "Q2 Spring",       icon: "🌸", hint: "Demand recovering (normal)",     multiplier: 1.0  },
  3: { name: "Q3 Summer",       icon: "☀️", hint: "Steady demand (normal)",         multiplier: 1.0  },
  4: { name: "Q4 Holiday",      icon: "🎄", hint: "Peak demand season! (+25%)",     multiplier: 1.25 },
};

const INITIAL_DECISIONS = {
  forecastR1: 240000, forecastR2: 210000, forecastR3: 150000, forecastMethod: "GUT",
  enterR4: false, forecastR4: 0, enterR5: false, forecastR5: 0, enterR6: false, forecastR6: 0,
  primarySupplier: "SUP001", secondarySupplier: "NONE", primaryAllocation: 100,
  emergencyRegionalOrder: 0,
  orderGlobal: 600000, orderRegional: 0,
  productionP1: 120000, productionP2: 80000, productionP3: 0, shifts: 1,
  launchP3: false, p3Config: "STANDARD", p3Price: 549,
  priceP1: 500, priceP2: 850,
  marketingBudget: 5000000,
  segmentChampions: 25, segmentGrowth: 25, segmentAtRisk: 25, segmentOther: 25,
  inspectionLevel: "BASIC",
  shippingMode: "STANDARD",
  carrier: "TRUCK",
  techPurchases: { erp:false, controlTower:false, aps:false, demandSensing:false, wms:false, tms:false, oms:false, analytics:false },
  buildSmallLine: false, buildMediumLine: false, buildLargeLine: false,
  dcCentralStatus: "NO", dcWestStatus: "NO",
  allocateCentral: 0, allocateWest: 0,
  transferFromCentral: 0, transferFromCentralTo: "NONE",
  transferFromWest: 0, transferFromWestTo: "NONE",
  warrantyTier: "STANDARD", centralWarrantyNetwork: false, westWarrantyNetwork: false,
  disposalMethod: "RECYCLE", ecoPackaging: false,
  intelRegionalDemand: false, intelRetailChannel: false,
  intelCompetitorCapacity: false, intelSupplierRisk: false, intelCustomerSentiment: false,
  enableVMI: false,
};

const GAS_SUPPLIERS = [
  { id:"SUP001", label:"SUP001 — GlobalTech Mfg (China)",        unitCost:42.50, leadTimeDays:45, onTimeDelivery:0.88, defectRate:0.025, tariffRate:0.25, riskLevel:"MEDIUM" },
  { id:"SUP002", label:"SUP002 — Precision Parts Inc (USA)",      unitCost:58.00, leadTimeDays:14, onTimeDelivery:0.96, defectRate:0.008, tariffRate:0,    riskLevel:"LOW"    },
  { id:"SUP003", label:"SUP003 — EuroComponents GmbH (Germany)", unitCost:54.00, leadTimeDays:21, onTimeDelivery:0.94, defectRate:0.012, tariffRate:0.05, riskLevel:"LOW"    },
  { id:"SUP004", label:"SUP004 — Pacific Rim Supply (Vietnam)",   unitCost:38.00, leadTimeDays:52, onTimeDelivery:0.82, defectRate:0.035, tariffRate:0.05, riskLevel:"HIGH"   },
  { id:"SUP005", label:"SUP005 — MexiParts SA (Mexico)",          unitCost:48.00, leadTimeDays:10, onTimeDelivery:0.91, defectRate:0.018, tariffRate:0,    riskLevel:"MEDIUM" },
  { id:"SUP006", label:"SUP006 — IndiaSource Ltd (India)",        unitCost:36.00, leadTimeDays:42, onTimeDelivery:0.84, defectRate:0.030, tariffRate:0.05, riskLevel:"HIGH"   },
];

const TECH_TYPE_TO_KEY = {
  ERP:"erp", CONTROL_TOWER:"controlTower", APS:"aps",
  DEMAND_SENSING:"demandSensing", WMS:"wms", TMS:"tms", OMS:"oms", ANALYTICS:"analytics",
};

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
const feat          = (s, n) => s?.features?.[n] === true;
const showForecast     = s => feat(s, "demandForecasting");
const showMarketing    = s => feat(s, "customerChurn");
const showLogistics    = s => feat(s, "transportLogistics") || feat(s, "multiCarrierSelection");
const showMultiCarrier = s => feat(s, "multiCarrierSelection");
const showTech         = s => feat(s, "technologyInvestments");
const showIntel        = s => feat(s, "intelligenceCenter");
const showQuality      = s => feat(s, "qualityControl");
const showSupplierAna  = s => feat(s, "analyticsMode");
const showP3           = s => feat(s, "productInnovation");
const showExpansion    = s => feat(s, "marketExpansion");
const showCapacity     = s => feat(s, "capacityExpansion");
const showDCs          = s => feat(s, "regionalDCs");
const showGreen        = s => feat(s, "returnsGreenScore");
const showVMI          = s => feat(s, "vmi");
const showSeasonality  = s => feat(s, "seasonality");
const showAdvanced     = s => showCapacity(s)||showDCs(s)||showGreen(s)||showVMI(s)||showP3(s)||showExpansion(s);

// ─── THEMES ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage:"#F3F4F6", bgSurface:"#FFFFFF", bgElevated:"#F9FAFB",
  bgHover:"#F3F4F6", border:"#E5E7EB", borderStrong:"#D1D5DB",
  textPrimary:"#111827", textSec:"#374151", textMuted:"#6B7280", textDisabled:"#9CA3AF",
  accent:"#1D4ED8", accentHover:"#1E40AF", accentLight:"#EFF6FF", accentBorder:"#BFDBFE",
  green:"#065F46", greenBg:"#D1FAE5", greenBorder:"#6EE7B7",
  amber:"#92400E", amberBg:"#FEF3C7", amberBorder:"#FCD34D",
  red:"#991B1B", redBg:"#FEE2E2", redBorder:"#FECACA",
  shadow:"0 1px 3px rgba(0,0,0,0.08)", shadowMd:"0 4px 6px rgba(0,0,0,0.05)",
};
const DARK = {
  bgPage:"#0D1117", bgSurface:"#161B22", bgElevated:"#1C2128",
  bgHover:"#21262D", border:"#30363D", borderStrong:"#444C56",
  textPrimary:"#E6EDF3", textSec:"#8D96A0", textMuted:"#545D68", textDisabled:"#3D444D",
  accent:"#4493F8", accentHover:"#68B3FB", accentLight:"#1A2332", accentBorder:"#1F3A5F",
  green:"#3FB950", greenBg:"rgba(63,185,80,0.10)", greenBorder:"rgba(63,185,80,0.30)",
  amber:"#D29922", amberBg:"rgba(210,153,34,0.10)", amberBorder:"rgba(210,153,34,0.30)",
  red:"#F85149", redBg:"rgba(248,81,73,0.10)", redBorder:"rgba(248,81,73,0.30)",
  shadow:"0 1px 3px rgba(0,0,0,0.30)", shadowMd:"0 4px 8px rgba(0,0,0,0.40)",
};

// ─── CSS (theme-aware) ────────────────────────────────────────────────────────
const buildCSS = (t, isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${t.bgPage}}
  ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
  .nb{transition:background-color .12s,color .12s}
  .nb:hover{background-color:${t.bgHover}!important;color:${t.textPrimary}!important}
  .nb.act{background-color:${isDark?t.accentLight:"#EFF6FF"}!important;color:${t.accent}!important}
  .dc{transition:border-color .15s,box-shadow .15s}
  .dc:hover{border-color:${t.accent}!important}
  .dc.complete{border-left:4px solid ${t.green}!important}
  .dc.pending{border-left:4px solid ${t.amber}!important}
  .pb{transition:background-color .12s}
  .pb:hover:not(:disabled){background-color:${t.accentHover}!important}
  .pb:disabled{opacity:.45;cursor:not-allowed}
  .gb{transition:background-color .12s,border-color .12s}
  .gb:hover:not(:disabled){background-color:${t.bgHover}!important}
  .gb:disabled{opacity:.45;cursor:not-allowed}
  .tb{transition:background-color .12s}
  .tb:hover{background-color:${t.bgHover}!important}
  .opt-btn{transition:all .12s;cursor:pointer}
  .opt-btn:hover:not(:disabled){border-color:${t.accentBorder}!important}
  .opt-btn.sel{background:${t.accentLight}!important;border-color:${t.accent}!important;color:${t.accent}!important;font-weight:600}
  .fi{transition:border-color .12s,box-shadow .12s}
  .fi:focus{outline:none;border-color:${t.accent}!important;box-shadow:0 0 0 3px ${isDark?"rgba(68,147,248,.15)":"rgba(29,78,216,.10)"}}
  .fi::placeholder{color:${t.textDisabled}}
  input[type=range]{width:100%;appearance:none;height:4px;background:${isDark?t.bgElevated:"#E5E7EB"};border-radius:4px;outline:none;cursor:pointer;border:1px solid ${t.border}}
  input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:${t.accent};box-shadow:0 0 0 2px ${isDark?t.bgSurface:"#fff"},0 0 0 3px ${t.accentBorder};cursor:pointer}
  input[type=checkbox]{accent-color:${t.accent};width:14px;height:14px;cursor:pointer}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{animation:spin .75s linear infinite}
  @keyframes fup{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .fup{animation:fup .2s ease both}
  select option{background:${t.bgElevated};color:${t.textPrimary}}
`;

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────
const FL = ({ children, t }) => (
  <label style={{ display:"block", fontSize:12, fontWeight:600, color:t.textSec, marginBottom:6, letterSpacing:"0.01em" }}>{children}</label>
);
const NI = ({ value, onChange, suffix, disabled, t, min, max }) => (
  <div style={{ position:"relative" }}>
    <input type="number" value={value} onChange={onChange} disabled={disabled} min={min} max={max}
      className="fi"
      style={{ width:"100%", padding:suffix?"8px 48px 8px 12px":"8px 12px", background:t.bgElevated, border:`1px solid ${t.borderStrong}`, borderRadius:6, color:t.textPrimary, fontSize:13, fontFamily:"SF Mono,Consolas,monospace" }}/>
    {suffix && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:11, color:t.textMuted, pointerEvents:"none" }}>{suffix}</span>}
  </div>
);
const SI = ({ value, onChange, options, disabled, placeholder, t }) => (
  <select value={value} onChange={onChange} disabled={disabled} className="fi"
    style={{ width:"100%", padding:"8px 12px", background:t.bgElevated, border:`1px solid ${t.borderStrong}`, borderRadius:6, color:t.textPrimary, fontSize:13, cursor:"pointer" }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
const Hint = ({ children, type = "info", t }) => {
  const c = type==="warn" ? {c:t.amber,bg:t.amberBg,b:t.amberBorder} : {c:t.accent,bg:t.accentLight,b:t.accentBorder};
  return <div style={{ padding:"8px 12px", borderRadius:6, background:c.bg, border:`1px solid ${c.b}`, fontSize:12, color:c.c, lineHeight:1.5 }}>{children}</div>;
};
const SRow = ({ label, value, badge, t, mono=false }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${t.border}` }}>
    <span style={{ fontSize:13, color:t.textMuted }}>{label}</span>
    {badge
      ? <span style={{ padding:"2px 8px", borderRadius:4, background:t.accentLight, border:`1px solid ${t.accentBorder}`, fontSize:11, fontWeight:600, color:t.accent }}>{badge}</span>
      : <span style={{ fontSize:13, fontWeight:500, color:t.textPrimary, fontFamily:mono?"SF Mono,Consolas,monospace":"inherit" }}>{value}</span>}
  </div>
);

// ─── DECISION CARD ───────────────────────────────────────────────────────────
const DC = ({ id, title, subtitle, done, editing, onEdit, onSave, savingId, isSubmitted, t, isDark, children }) => {
  const showAsComplete = isSubmitted || done;
  const iconBg  = showAsComplete ? t.green : t.amber;
  const hdrBg   = showAsComplete ? (isDark?"rgba(63,185,80,.06)":"rgba(209,250,229,.4)") : (isDark?"rgba(210,153,34,.06)":"rgba(254,243,199,.4)");
  const badgeC  = showAsComplete ? t.green  : t.amber;
  const badgeBg = showAsComplete ? t.greenBg : t.amberBg;
  const badgeB  = showAsComplete ? t.greenBorder : t.amberBorder;
  const saving  = savingId === id;
  const showEditBtn = done && !editing && !isSubmitted;
  return (
    <div className={`dc fup ${showAsComplete?"complete":"pending"}`}
      style={{ background:t.bgSurface, border:`1px solid ${t.border}`, borderRadius:8, overflow:"hidden", boxShadow:t.shadow }}>
      <div style={{ padding:"13px 18px", borderBottom:`1px solid ${t.border}`, background:hdrBg, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {showAsComplete
              ? <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              : <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:t.textPrimary }}>{title}</div>
            <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{subtitle}</div>
          </div>
        </div>
        <span style={{ padding:"3px 10px", borderRadius:20, background:badgeBg, border:`1px solid ${badgeB}`, fontSize:11, fontWeight:600, color:badgeC, whiteSpace:"nowrap" }}>
          {isSubmitted ? "✓ Submitted" : (showAsComplete ? "Complete" : "Pending")}
        </span>
      </div>
      <div style={{ padding:"16px 18px 14px" }}>
        {children}
        <div style={{ marginTop:14 }}>
          {isSubmitted
            ? <div style={{ padding:"8px", borderRadius:6, background:t.greenBg, border:`1px solid ${t.greenBorder}`, fontSize:13, fontWeight:600, color:t.green, textAlign:"center" }}>
                ✓ Decision Submitted
              </div>
            : showEditBtn
            ? <button onClick={() => onEdit(id)} disabled={isSubmitted} className="gb"
                style={{ width:"100%", padding:"8px", borderRadius:6, border:`1px solid ${t.border}`, background:"transparent", color:t.textSec, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Edit Decision
              </button>
            : <button onClick={() => onSave(id)} disabled={saving||isSubmitted} className="pb"
                style={{ width:"100%", padding:"8px", borderRadius:6, border:"none", background:t.accent, color:"#fff", fontSize:13, fontWeight:600, cursor:saving||isSubmitted?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {saving && <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff" }}/>}
                Save Decision
              </button>}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StudentDecisionsPage() {
  const router  = useRouter();
  const params  = useParams();
  const apiUrl  = process.env.NEXT_PUBLIC_API_URL;

  // ── THEME: read from shared context, NOT local state ────────────────────────
  // This was the root cause of the dark/light inconsistency. The old page had:
  //   const [isDark, setIsDark] = useState(false);
  //   useEffect(() => { if (localStorage.getItem("flexee_theme")==="dark") setIsDark(true); }, []);
  // This is isolated from ThemeContext so toggling on other pages had no effect here.
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;

  const [loading,          setLoading]          = useState(true);
  const [submitting,       setSubmitting]        = useState(false);
  const [simulation,       setSimulation]        = useState(null);
  const [firmState,        setFirmState]         = useState(null);
  const [firm,             setFirm]              = useState(null);
  const [currentDecision,  setCurrentDecision]   = useState(null);
  const [decisionConfig,   setDecisionConfig]    = useState(null);
  const [error,            setError]             = useState("");
  const [success,          setSuccess]           = useState("");
  const [showConfirm,      setShowConfirm]       = useState(false);
  const [validationErrors, setValidationErrors]  = useState([]);
  const [decisions,        setDecisions]         = useState(INITIAL_DECISIONS);
  const [editing,          setEditing]           = useState({});
  const [savingId,         setSavingId]          = useState(null);
  const [completedCards,   setCompletedCards]    = useState(new Set());

  const getToken = () => localStorage.getItem("access_token");

  const fmtC = v => {
    if (!v && v !== 0) return "—";
    if (Math.abs(v) >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
    if (Math.abs(v) >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
    if (Math.abs(v) >= 1e3) return `$${(v/1e3).toFixed(0)}K`;
    return `$${Math.round(v).toLocaleString()}`;
  };
  const fmtN = v => (!v && v !== 0 ? "—" : Math.round(v).toLocaleString());
  const getSeason = q => SEASON_CONFIG[((q - 1) % 4) + 1] || SEASON_CONFIG[1];

  useEffect(() => { init(); }, [params.id]);

  const init = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || localStorage.getItem("userRole") !== "student") { router.push("/login"); return; }
    await loadAll();
    setLoading(false);
  };

  const loadAll = async () => {
    try {
      const simRes = await fetch(`${apiUrl}/simulations/${params.id}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (!simRes.ok) { setError("Failed to load simulation"); return; }
      const simData = await simRes.json();
      setSimulation(simData);

      const userId = localStorage.getItem("userId");
      let sf = null;
      for (const f of simData.firms || []) {
        const found = f.enrollments?.find(e => {
          const eid = e.user?.id || e.user?._id || e.userId;
          return eid?.toString() === userId?.toString();
        });
        if (found) { sf = f; break; }
      }
      if (!sf) { setError("You are not enrolled in any firm"); return; }
      setFirm(sf);

      const cfgRes = await fetch(
        `${apiUrl}/decisions/simulation/${params.id}/firm/${sf.id}/quarter/${simData.currentQuarter}`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (!cfgRes.ok) { setError("Failed to load decision configuration"); return; }
      const cfg = await cfgRes.json();
      setDecisionConfig(cfg);

      if (cfg.firmState?.currentState) setFirmState(cfg.firmState.currentState);
      if (cfg.decision) { setCurrentDecision(cfg.decision); prefill(cfg.decision); }
    } catch (e) {
      console.error(e);
      setError("Failed to load data");
    }
  };

  const prefill = dec => {
    setDecisions(prev => {
      const n = { ...prev };
      Object.keys(prev).forEach(k => {
        if (dec[k] !== undefined && dec[k] !== null) n[k] = dec[k];
      });
      if (dec.purchaseERP !== undefined) {
        n.techPurchases = {
          erp:          dec.purchaseERP          ?? dec.techPurchases?.erp          ?? false,
          controlTower: dec.purchaseControlTower ?? dec.techPurchases?.controlTower ?? false,
          aps:          dec.purchaseAPS          ?? dec.techPurchases?.aps          ?? false,
          demandSensing:dec.purchaseDemandSensing?? dec.techPurchases?.demandSensing?? false,
          wms:          dec.purchaseWMS          ?? dec.techPurchases?.wms          ?? false,
          tms:          dec.purchaseTMS          ?? dec.techPurchases?.tms          ?? false,
          oms:          dec.purchaseOMS          ?? dec.techPurchases?.oms          ?? false,
          analytics:    dec.purchaseAnalytics    ?? dec.techPurchases?.analytics    ?? false,
        };
      }
      return n;
    });

    const inferred = new Set();
    if (dec.forecastR1)                               inferred.add("Forecast");
    if (dec.primarySupplier)                          inferred.add("Supplier");
    if (dec.orderGlobal || dec.orderRegional)         inferred.add("Procurement");
    if (dec.productionP1)                             inferred.add("Production");
    if (dec.priceP1)                                  inferred.add("Pricing");
    if (dec.marketingBudget)                          inferred.add("Marketing");
    if (dec.inspectionLevel)                          inferred.add("Quality");
    if (dec.shippingMode || dec.carrier)              inferred.add("Logistics");
    if (Object.values(dec.techPurchases || {}).some(Boolean) ||
        dec.purchaseERP || dec.purchaseControlTower || dec.purchaseAPS ||
        dec.purchaseDemandSensing || dec.purchaseWMS || dec.purchaseTMS ||
        dec.purchaseOMS || dec.purchaseAnalytics)      inferred.add("Technology");
    if (dec.intelRegionalDemand || dec.intelRetailChannel ||
        dec.intelCompetitorCapacity || dec.intelSupplierRisk ||
        dec.intelCustomerSentiment)                   inferred.add("Intelligence");
    if (dec._id || dec.id)                            inferred.add("Advanced");
    setCompletedCards(inferred);
  };

  const buildPayload = (isCreate = false) => {
    const p = { ...decisions };
    p.purchaseERP           = decisions.techPurchases.erp           ?? false;
    p.purchaseControlTower  = decisions.techPurchases.controlTower  ?? false;
    p.purchaseAPS           = decisions.techPurchases.aps           ?? false;
    p.purchaseDemandSensing = decisions.techPurchases.demandSensing ?? false;
    p.purchaseWMS           = decisions.techPurchases.wms           ?? false;
    p.purchaseTMS           = decisions.techPurchases.tms           ?? false;
    p.purchaseOMS           = decisions.techPurchases.oms           ?? false;
    p.purchaseAnalytics     = decisions.techPurchases.analytics     ?? false;
    if (isCreate) { p.simulation = params.id; p.firm = firm.id; p.quarter = simulation.currentQuarter; }
    return p;
  };

  const handleSaveCard = async (cardId) => {
    setSavingId(cardId); setError(""); setSuccess("");
    try {
      const url    = currentDecision?.id ? `${apiUrl}/decisions/${currentDecision.id}` : `${apiUrl}/decisions`;
      const method = currentDecision?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(buildPayload(!currentDecision?.id)),
      });
      if (res.ok) {
        const d = await res.json();
        setCurrentDecision(d);
        setEditing(prev => ({ ...prev, [cardId]: false }));
        setCompletedCards(prev => {
          const next = new Set(prev);
          if (cardId === "All") {
            if (d.forecastR1)                                     next.add("Forecast");
            if (d.primarySupplier)                                next.add("Supplier");
            if (d.orderGlobal || d.orderRegional)                 next.add("Procurement");
            if (d.productionP1)                                   next.add("Production");
            if (d.priceP1)                                        next.add("Pricing");
            if (d.marketingBudget)                                next.add("Marketing");
            if (d.inspectionLevel)                                next.add("Quality");
            if (d.shippingMode || d.carrier)                      next.add("Logistics");
            if (Object.values(d.techPurchases||{}).some(Boolean)) next.add("Technology");
            if (d.intelRegionalDemand||d.intelRetailChannel||d.intelCompetitorCapacity||d.intelSupplierRisk||d.intelCustomerSentiment) next.add("Intelligence");
          } else {
            next.add(cardId);
          }
          next.add("Advanced");
          return next;
        });
        setSuccess(cardId === "All" ? "Draft saved." : `${cardId} saved.`);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to save");
      }
    } catch { setError("Failed to save"); }
    finally { setSavingId(null); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const url    = currentDecision?.id ? `${apiUrl}/decisions/${currentDecision.id}` : `${apiUrl}/decisions`;
      const method = currentDecision?.id ? "PUT" : "POST";
      const sRes = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(buildPayload(!currentDecision?.id)),
      });
      if (!sRes.ok) {
        const d = await sRes.json();
        const msg = Array.isArray(d.errors) ? d.errors.join("; ")
                  : Array.isArray(d.message) ? d.message.join("; ")
                  : d.message || "Save failed";
        throw new Error(msg);
      }
      const saved = await sRes.json();
      const userId = localStorage.getItem("userId");
      const subRes = await fetch(
        `${apiUrl}/decisions/${saved.id}/submit${userId ? `?userId=${userId}` : ""}`,
        { method: "POST", headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (subRes.ok) {
        setSuccess("Decisions submitted successfully.");
        setShowConfirm(false);
        await loadAll();
      } else {
        const d = await subRes.json();
        const errMsg = Array.isArray(d.errors) ? d.errors.join("\n")
                     : Array.isArray(d.message) ? d.message.join("\n")
                     : d.message || "Submit failed";
        setError(errMsg);
      }
    } catch (e) { setError(e.message || "Failed to submit"); }
    finally { setSubmitting(false); }
  };

  const validate = useCallback(() => {
    const errors = [];
    const c   = decisionConfig?.constraints || {};
    const cap = decisionConfig?.constraints?.production || {};
    const baseCapacity  = (cap.baseCapacity || firmState?.capacityUnits || 250000);
    const extraCapacity = cap.effectiveAdditionalCapacity || 0;
    const maxCap = (baseCapacity + extraCapacity) * (decisions.shifts || 1);
    const totalProdVal = (decisions.productionP1||0) + (decisions.productionP2||0)
                       + (showP3(simulation) ? decisions.productionP3||0 : 0);
    if (totalProdVal > maxCap)
      errors.push(`Production (${totalProdVal.toLocaleString()}) exceeds capacity (${maxCap.toLocaleString()}) for ${decisions.shifts} shift(s)`);

    const partsNeeded  = totalProdVal * (cap.partsPerUnit || 3);
    const rawMats      = firmState?.rawMaterials || firmState?.rawMaterialUnits || 0;
    const inTransit    = firmState?.inTransit    || firmState?.inTransitUnits  || 0;
    const currentQ     = simulation?.currentQuarter || 1;
    const isFirstQ     = currentQ === 1 || firmState?.quarter === 0 || decisionConfig?.marketInfo?.isFirstQuarter === true;
    if ((rawMats > 0 || inTransit > 0) && !isFirstQ) {
      const partsAvailable = rawMats + inTransit + (decisions.orderRegional || 0);
      if (partsNeeded > partsAvailable)
        errors.push(`Parts needed (${partsNeeded.toLocaleString()}) exceeds available (${partsAvailable.toLocaleString()}) — add regional order`);
    }

    const segT = (decisions.segmentChampions||0)+(decisions.segmentGrowth||0)+(decisions.segmentAtRisk||0)+(decisions.segmentOther||0);
    if (Math.abs(segT - 100) > 1) errors.push(`Customer segments must total 100% (currently ${segT}%)`);

    const pc  = c.pricing || {};
    const mn1 = pc.minPrice?.P1 || 250, mx1 = pc.maxPrice?.P1 || 1000;
    const mn2 = pc.minPrice?.P2 || 425, mx2 = pc.maxPrice?.P2 || 1500;
    if ((decisions.priceP1||0) < mn1 || (decisions.priceP1||0) > mx1) errors.push(`P1 price must be $${mn1}–$${mx1}`);
    if ((decisions.priceP2||0) < mn2 || (decisions.priceP2||0) > mx2) errors.push(`P2 price must be $${mn2}–$${mx2}`);

    const maxShifts = cap.maxShifts || 3;
    if ((decisions.shifts||1) < 1 || (decisions.shifts||1) > maxShifts)
      errors.push(`Shifts must be 1–${maxShifts}`);

    return errors;
  }, [decisions, firmState, decisionConfig, simulation]);

  useEffect(() => { if (simulation && firmState) setValidationErrors(validate()); }, [decisions, firmState, simulation, decisionConfig]);

  // ─── CLOSE EDITING WHEN SUBMITTED ─────────────────────────────────────────
  useEffect(() => {
    if (currentDecision?.status === "SUBMITTED" || currentDecision?.status === "PROCESSED") {
      setEditing({}); // Clear all editing states
    }
  }, [currentDecision?.status]);

  // ─── DERIVED ──────────────────────────────────────────────────────────────
  const nextQ       = simulation?.currentQuarter || 1;
  const season      = getSeason(nextQ);
  const isSubmitted = currentDecision?.status === "SUBMITTED" || currentDecision?.status === "PROCESSED";
  const isEdit      = id => editing[id] || false;

  // Build done object only with enabled features
  // When submitted, all sections are marked as complete
  const done = (() => {
    if (isSubmitted) {
      // When submitted, all enabled features are complete
      const result = {
        forecast:    true,
        supplier:    true,
        procurement: true,
        production:  true,
        pricing:     true,
      };
      if (showMarketing(simulation))   result.marketing    = true;
      if (showQuality(simulation))     result.quality      = true;
      if (showLogistics(simulation))   result.logistics    = true;
      if (showTech(simulation))        result.technology   = true;
      if (showIntel(simulation))       result.intelligence = true;
      if (showAdvanced(simulation))    result.advanced     = true;
      return result;
    }

    // Otherwise, calculate based on card completion and decision values
    const result = {
      forecast:    completedCards.has("Forecast")    || !!currentDecision?.forecastR1,
      supplier:    completedCards.has("Supplier")    || !!currentDecision?.primarySupplier,
      procurement: completedCards.has("Procurement") || !!(currentDecision?.orderGlobal || currentDecision?.orderRegional),
      production:  completedCards.has("Production")  || !!currentDecision?.productionP1,
      pricing:     completedCards.has("Pricing")     || !!currentDecision?.priceP1,
    };
    if (showMarketing(simulation))
      result.marketing = completedCards.has("Marketing")   || !!currentDecision?.marketingBudget;
    if (showQuality(simulation))
      result.quality     = completedCards.has("Quality")     || !!currentDecision?.inspectionLevel;
    if (showLogistics(simulation))
      result.logistics   = completedCards.has("Logistics")   || !!(currentDecision?.shippingMode || currentDecision?.carrier);
    if (showTech(simulation))
      result.technology  = completedCards.has("Technology")  || !!(currentDecision?.techPurchases && Object.values(currentDecision.techPurchases||{}).some(Boolean));
    if (showIntel(simulation))
      result.intelligence = completedCards.has("Intelligence")|| !!(currentDecision?.intelRegionalDemand||currentDecision?.intelRetailChannel||currentDecision?.intelCompetitorCapacity||currentDecision?.intelSupplierRisk||currentDecision?.intelCustomerSentiment);
    if (showAdvanced(simulation))
      result.advanced    = completedCards.has("Advanced")    || !!(currentDecision?.buildSmallLine||currentDecision?.buildMediumLine||currentDecision?.buildLargeLine||currentDecision?.dcCentralStatus==="YES"||currentDecision?.dcWestStatus==="YES"||currentDecision?.enableVMI||currentDecision?.ecoPackaging||currentDecision?.centralWarrantyNetwork||currentDecision?.westWarrantyNetwork);
    return result;
  })();

  const totalDone  = Object.values(done).filter(Boolean).length;
  const totalCards = Object.keys(done).length;
  const progPct    = Math.round((totalDone / totalCards) * 100);
  const pending    = totalCards - totalDone;

  const baseCapacity = ((decisionConfig?.constraints?.production?.baseCapacity || firmState?.capacityUnits || 250000) + (decisionConfig?.constraints?.production?.effectiveAdditionalCapacity || 0)) * (decisions.shifts || 1);
  const totalProd    = (decisions.productionP1||0) + (decisions.productionP2||0);
  const capPct       = baseCapacity > 0 ? Math.round(totalProd / baseCapacity * 100) : 0;

  const supOpts = (() => {
    const apiSups = decisionConfig?.configurations?.suppliers || [];
    if (apiSups.length > 0) return apiSups.map(s => ({ value: s.id, label: s.label || `${s.id} — ${s.country}` }));
    return GAS_SUPPLIERS.map(s => ({ value: s.id, label: s.label }));
  })();

  const techMap = {
    erp:          "Basic ERP ($2M) — visibility: -5% holding cost",
    controlTower: "Control Tower ($4M) — +3% on-time, -10% event impact",
    aps:          "APS ($3M) — planning: +5% effective capacity",
    demandSensing:"Demand Sensing ($2.5M) — planning: -10% forecast error",
    wms:          "WMS ($1.5M) — execution: -10% holding cost",
    tms:          "TMS ($1.5M) — execution: -8% freight cost",
    oms:          "OMS ($1M) — execution: +5% Perfect Order",
    analytics:    "Analytics Dashboard ($1M) — KPI tracking unlocked",
  };

  const navItems = [
    { id:"dashboard",  label:"Dashboard",    d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id:"decisions",  label:"Decisions",    badge: pending > 0 ? pending : null, d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id:"results",    label:"Results",      d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { id:"financials", label:"Financials",   d:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id:"analytics",  label:"Analytics",   d:"M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id:"risk",       label:"Risk Monitor", d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  const firmInitials = firm?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "TM";

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{buildCSS(t, isDark)}</style>
      <div style={{ minHeight:"100vh", background:t.bgPage, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div className="spinner" style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${t.border}`, borderTopColor:t.accent, margin:"0 auto 14px" }}/>
          <p style={{ fontSize:13, color:t.textMuted }}>Loading decisions…</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{buildCSS(t, isDark)}</style>
      <div style={{ minHeight:"100vh", background:t.bgPage, color:t.textPrimary, fontFamily:"Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize:14 }}>

        {/* ── HEADER — shared component, handles theme toggle + logout ── */}
        <StudentHeader
          simulation={simulation}
          currentQuarter={nextQ}
          firm={firm}
          firmInitials={firmInitials}
          onDecisionsClick={() => router.push(`/dashboard/student/simulation/decisions/${params.id}`)}
        />

        <div style={{ display:"flex" }}>
          {/* ── SIDEBAR — shared component ── */}
          <StudentSidebar
            navItems={navItems}
            activeTab="decisions"
            simId={params.id}
          />

          {/* ── MAIN ── */}
          <main style={{ flex:1, padding:"24px", maxWidth:1200, minWidth:0 }}>

            {/* Page header */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
              <div>
                <h1 style={{ fontSize:20, fontWeight:700, color:t.textPrimary, letterSpacing:"-0.3px" }}>Quarter {nextQ} Decisions</h1>
                <p style={{ fontSize:13, color:t.textMuted, marginTop:3 }}>
                  {totalDone} of {totalCards} decisions complete
                  {isSubmitted && " · Submitted"}
                  {showSeasonality(simulation) && ` · ${season.hint}`}
                </p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {isSubmitted
                  ? <span style={{ padding:"7px 14px", borderRadius:6, background:t.greenBg, border:`1px solid ${t.greenBorder}`, fontSize:13, fontWeight:600, color:t.green }}>✓ Submitted</span>
                  : <>
                      <button onClick={() => handleSaveCard("All")} disabled={!!savingId} className="gb"
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:6, border:`1px solid ${t.border}`, background:t.bgSurface, color:t.textSec, fontSize:13, fontWeight:500, cursor:savingId?"not-allowed":"pointer" }}>
                        {savingId==="All" ? <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:`2px solid ${t.border}`, borderTopColor:t.accent }}/> :
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>}
                        Save Draft
                      </button>
                      <button onClick={() => setShowConfirm(true)} disabled={submitting || validationErrors.length > 0} className="pb"
                        style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 18px", borderRadius:6, border:"none", background:t.accent, color:"#fff", fontSize:13, fontWeight:600, cursor:submitting||validationErrors.length>0?"not-allowed":"pointer" }}>
                        {submitting ? <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff" }}/> :
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                        Submit All Decisions
                      </button>
                    </>
                }
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:8, marginBottom:16, background:t.redBg, border:`1px solid ${t.redBorder}` }}>
                <svg width="14" height="14" fill="none" stroke={t.red} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span style={{ flex:1, fontSize:13, color:t.red }}>{error}</span>
                <button onClick={() => setError("")} style={{ background:"none", border:"none", color:t.red, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
            )}
            {success && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:8, marginBottom:16, background:t.greenBg, border:`1px solid ${t.greenBorder}` }}>
                <span style={{ fontSize:13, color:t.green }}>✓ {success}</span>
                <button onClick={() => setSuccess("")} style={{ marginLeft:"auto", background:"none", border:"none", color:t.green, cursor:"pointer", fontSize:16 }}>×</button>
              </div>
            )}
            {validationErrors.length > 0 && !isSubmitted && (
              <div style={{ padding:"12px 14px", borderRadius:8, marginBottom:16, background:t.amberBg, border:`1px solid ${t.amberBorder}` }}>
                <p style={{ fontSize:13, fontWeight:600, color:t.amber, marginBottom:6 }}>⚠ Fix before submitting:</p>
                <ul style={{ paddingLeft:18, margin:0 }}>
                  {validationErrors.map((e,i) => <li key={i} style={{ fontSize:12, color:t.textSec, marginBottom:3 }}>{e}</li>)}
                </ul>
              </div>
            )}

            {/* Progress bar */}
            <div style={{ background:t.bgSurface, border:`1px solid ${t.border}`, borderRadius:8, padding:"14px 18px", marginBottom:24, boxShadow:t.shadow }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:t.textPrimary }}>Decision Progress</span>
                <span style={{ fontSize:13, color:t.textMuted }}>{progPct}% Complete</span>
              </div>
              <div style={{ height:6, background:isDark?t.bgElevated:"#E5E7EB", borderRadius:4, overflow:"hidden", border:`1px solid ${t.border}` }}>
                <div style={{ height:"100%", borderRadius:4, width:`${progPct}%`, background:t.accent, transition:"width .4s ease" }}/>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                {Object.entries(done).map(([k,v]) => (
                  <span key={k} style={{ padding:"2px 8px", borderRadius:4, background:v?t.greenBg:t.bgElevated, border:`1px solid ${v?t.greenBorder:t.border}`, fontSize:11, fontWeight:500, color:v?t.green:t.textMuted }}>
                    {v?"✓":"○"} {k.charAt(0).toUpperCase()+k.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══ DECISION CARDS ════════════════════════════════════════════ */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

              {/* ── 1. DEMAND FORECAST ── */}
              {showForecast(simulation) && (
                <DC id="Forecast" title="Demand Forecast" subtitle="Regional volume predictions — GUT or MODEL method"
                  done={done.forecast} editing={isEdit("Forecast")} onEdit={id => setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Forecast") && done.forecast ? (
                    <div>
                      <SRow label="R1 — Northeast" value={`${fmtN(decisions.forecastR1)} units`} t={t} mono/>
                      <SRow label="R2 — Central"   value={`${fmtN(decisions.forecastR2)} units`} t={t} mono/>
                      <SRow label="R3 — West"       value={`${fmtN(decisions.forecastR3)} units`} t={t} mono/>
                      <SRow label="Method"           badge={decisions.forecastMethod} t={t}/>
                      {showExpansion(simulation) && decisions.enterR4 && <SRow label="R4 — Canada" value={`${fmtN(decisions.forecastR4)} units`} t={t} mono/>}
                      {showExpansion(simulation) && decisions.enterR5 && <SRow label="R5 — EU"     value={`${fmtN(decisions.forecastR5)} units`} t={t} mono/>}
                      {showExpansion(simulation) && decisions.enterR6 && <SRow label="R6 — APAC"   value={`${fmtN(decisions.forecastR6)} units`} t={t} mono/>}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        <div><FL t={t}>R1 — Northeast</FL><NI value={decisions.forecastR1} onChange={e=>setDecisions(p=>({...p,forecastR1:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                        <div><FL t={t}>R2 — Central</FL><NI value={decisions.forecastR2} onChange={e=>setDecisions(p=>({...p,forecastR2:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                        <div><FL t={t}>R3 — West</FL><NI value={decisions.forecastR3} onChange={e=>setDecisions(p=>({...p,forecastR3:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                      </div>
                      <div>
                        <FL t={t}>Forecast Method</FL>
                        <SI value={decisions.forecastMethod} onChange={e=>setDecisions(p=>({...p,forecastMethod:e.target.value}))} disabled={isSubmitted} t={t}
                          options={[
                            {value:"GUT",   label:"GUT — Gut feeling (default)"},
                            {value:"MODEL", label:"MODEL — Statistical model (logged for accuracy)"},
                          ]}/>
                      </div>
                      {showSeasonality(simulation) && (
                        <Hint t={t}>Season hint: {season.icon} {season.hint}. Seasonal indices: Q1 0.85 / Q2 1.00 / Q3 1.00 / Q4 1.25</Hint>
                      )}
                      <Hint t={t}>Total forecast: {fmtN((decisions.forecastR1||0)+(decisions.forecastR2||0)+(decisions.forecastR3||0))} units (R1 40% / R2 35% / R3 25% of market)</Hint>
                      {showExpansion(simulation) && (
                        <div>
                          <FL t={t}>Market Expansion (Analytics Mode)</FL>
                          {[
                            {r:"R4", name:"Canada",       cost:"$1.5M entry, $200K/qtr"},
                            {r:"R5", name:"EU (Germany)", cost:"$3M entry, $400K/qtr"},
                            {r:"R6", name:"APAC (Japan)", cost:"$5M entry, $600K/qtr"},
                          ].map(({r,name,cost}) => (
                            <div key={r} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:t.textSec, cursor:"pointer", minWidth:140 }}>
                                <input type="checkbox" checked={decisions[`enter${r}`]} onChange={e=>setDecisions(p=>({...p,[`enter${r}`]:e.target.checked}))} disabled={isSubmitted}/>
                                Enter {r} ({name})
                              </label>
                              {decisions[`enter${r}`] && (
                                <div style={{ flex:1 }}>
                                  <NI value={decisions[`forecast${r}`]} onChange={e=>setDecisions(p=>({...p,[`forecast${r}`]:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/>
                                  <p style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{cost}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 2. SUPPLIER SELECTION ── */}
              {showSupplierAna(simulation) && (
                <DC id="Supplier" title="Supplier Selection" subtitle="Analytics Mode: TCO-based supplier decision"
                  done={done.supplier} editing={isEdit("Supplier")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Supplier") && done.supplier ? (
                    <div>
                      <SRow label="Primary Supplier"   value={decisions.primarySupplier||"—"} t={t}/>
                      <SRow label="Secondary Supplier" value={decisions.secondarySupplier==="NONE"?"None":decisions.secondarySupplier} t={t}/>
                      <SRow label="Primary Allocation" value={`${decisions.primaryAllocation}%`} t={t} mono/>
                      {decisions.emergencyRegionalOrder > 0 && <SRow label="Emergency Regional" value={`${fmtN(decisions.emergencyRegionalOrder)} units — $195/unit`} t={t} mono/>}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div>
                        <FL t={t}>Primary Supplier</FL>
                        <SI value={decisions.primarySupplier} onChange={e=>setDecisions(p=>({...p,primarySupplier:e.target.value}))} disabled={isSubmitted} placeholder="Select supplier…" options={supOpts} t={t}/>
                      </div>
                      <div>
                        <FL t={t}>Secondary Supplier (optional split)</FL>
                        <SI value={decisions.secondarySupplier} onChange={e=>setDecisions(p=>({...p,secondarySupplier:e.target.value}))} disabled={isSubmitted}
                          options={[{value:"NONE",label:"None (single source)"},...supOpts]} t={t}/>
                      </div>
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <FL t={t}>Primary Allocation (50–100%)</FL>
                          <span style={{ fontSize:13, fontWeight:600, color:t.textPrimary, fontFamily:"SF Mono,Consolas,monospace" }}>{decisions.primaryAllocation}%</span>
                        </div>
                        <input type="range" min="50" max="100" value={decisions.primaryAllocation} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,primaryAllocation:+e.target.value}))}/>
                      </div>
                      <div>
                        <FL t={t}>Emergency Regional Order</FL>
                        <NI value={decisions.emergencyRegionalOrder} onChange={e=>setDecisions(p=>({...p,emergencyRegionalOrder:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/>
                        <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>$195/unit · Same-quarter delivery · 0.98 on-time · 1.0% defect</p>
                      </div>
                      {decisions.primarySupplier && (() => {
                        const sup = GAS_SUPPLIERS.find(s => s.id === decisions.primarySupplier);
                        if (!sup) return null;
                        const riskColor = sup.riskLevel === "LOW" ? t.green : sup.riskLevel === "HIGH" ? t.red : t.amber;
                        return (
                          <div style={{ padding:"10px 12px", borderRadius:6, background:t.bgElevated, border:`1px solid ${t.border}` }}>
                            <p style={{ fontSize:11, fontWeight:600, color:t.textMuted, marginBottom:6 }}>Selected supplier profile</p>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                              {[
                                ["Unit Cost",   `$${sup.unitCost}/unit`],
                                ["Lead Time",   `${sup.leadTimeDays} days`],
                                ["On-Time",     `${(sup.onTimeDelivery*100).toFixed(0)}%`],
                                ["Defect Rate", `${(sup.defectRate*100).toFixed(1)}%`],
                                ["Tariff",      `${(sup.tariffRate*100).toFixed(0)}%`],
                                ["Risk",        sup.riskLevel],
                              ].map(([l,v]) => (
                                <div key={l} style={{ display:"flex", justifyContent:"space-between" }}>
                                  <span style={{ fontSize:11, color:t.textMuted }}>{l}</span>
                                  <span style={{ fontSize:11, fontWeight:600, color:l==="Risk"?riskColor:t.textPrimary, fontFamily:"SF Mono,Consolas,monospace" }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 3. PROCUREMENT ── */}
              <DC id="Procurement" title="Procurement Order" subtitle="Raw material order quantities (3 parts per finished unit)"
                done={done.procurement} editing={isEdit("Procurement")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                {!isEdit("Procurement") && done.procurement ? (
                  <div>
                    <SRow label="Global Order"   value={`${fmtN(decisions.orderGlobal)} units`} t={t} mono/>
                    <SRow label="Regional Order" value={`${fmtN(decisions.orderRegional)} units`} t={t} mono/>
                    <SRow label="Total Cost"     value={fmtC((decisions.orderGlobal||0)*150 + (decisions.orderRegional||0)*195)} t={t} mono/>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div>
                      <FL t={t}>Global Order (Primary Supplier)</FL>
                      <NI value={decisions.orderGlobal} onChange={e=>setDecisions(p=>({...p,orderGlobal:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/>
                      <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>$150/unit · 1 quarter lead time · arrives next quarter</p>
                    </div>
                    <div>
                      <FL t={t}>Regional Emergency Order</FL>
                      <NI value={decisions.orderRegional} onChange={e=>setDecisions(p=>({...p,orderRegional:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/>
                      <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>$195/unit (+30% premium) · same quarter delivery</p>
                    </div>
                    <Hint t={t}>
                      {(() => {
                        const rawMats = firmState?.rawMaterials||firmState?.rawMaterialUnits||0;
                        const inTrans = firmState?.inTransit||firmState?.inTransitUnits||0;
                        const avail   = rawMats + inTrans + (decisions.orderRegional||0);
                        const needed  = ((decisions.productionP1||0)+(decisions.productionP2||0))*3;
                        if (nextQ === 1 && rawMats === 0 && inTrans === 0) {
                          return `Q1 start — global order (${fmtN(decisions.orderGlobal||0)} units) arrives Q2. Regional order for same-quarter delivery.`;
                        }
                        return `Parts available: ${fmtN(avail)} · Need ${fmtN(needed)} parts${avail < needed ? ` · ⚠ shortfall ${fmtN(needed-avail)}` : " ✓"}`;
                      })()}
                    </Hint>
                  </div>
                )}
              </DC>

              {/* ── 4. PRODUCTION ── */}
              <DC id="Production" title="Production Target" subtitle="Shifts and production volume by product"
                done={done.production} editing={isEdit("Production")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                {!isEdit("Production") && done.production ? (
                  <div>
                    <SRow label="Shifts"        value={`${decisions.shifts} shift${decisions.shifts>1?"s":""}`} t={t}/>
                    <SRow label="P1 Production" value={`${fmtN(decisions.productionP1)} units`} t={t} mono/>
                    <SRow label="P2 Production" value={`${fmtN(decisions.productionP2)} units`} t={t} mono/>
                    {showP3(simulation) && decisions.launchP3 && <SRow label="P3 Production" value={`${fmtN(decisions.productionP3)} units`} t={t} mono/>}
                    <SRow label="Capacity Used" value={`${capPct}%`} t={t} mono/>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div>
                      <FL t={t}>Production Shifts (1–3)</FL>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        {[1,2,3].map(s => (
                          <button key={s} disabled={isSubmitted} onClick={() => setDecisions(p=>({...p,shifts:s}))}
                            className={`opt-btn ${decisions.shifts===s?"sel":""}`}
                            style={{ padding:"8px", borderRadius:6, border:`1px solid ${decisions.shifts===s?t.accent:t.border}`, background:decisions.shifts===s?t.accentLight:t.bgElevated, color:decisions.shifts===s?t.accent:t.textSec, fontSize:12 }}>
                            {s} Shift{s>1?"s":""}
                            <div style={{ fontSize:10, color:decisions.shifts===s?t.accent:t.textMuted, marginTop:2 }}>
                              {["1.0x","1.15x","1.50x"][s-1]} labor
                            </div>
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>
                        Base capacity: {fmtN((firmState?.capacityUnits||250000)*decisions.shifts)} units/quarter
                        {(decisionConfig?.constraints?.production?.effectiveAdditionalCapacity||0) > 0 && ` + ${fmtN(decisionConfig.constraints.production.effectiveAdditionalCapacity)} expansion`}
                      </p>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <div><FL t={t}>P1 Production</FL><NI value={decisions.productionP1} onChange={e=>setDecisions(p=>({...p,productionP1:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                      <div><FL t={t}>P2 Production</FL><NI value={decisions.productionP2} onChange={e=>setDecisions(p=>({...p,productionP2:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                    </div>
                    {showP3(simulation) && (
                      <div>
                        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:t.textSec, cursor:"pointer", marginBottom:8 }}>
                          <input type="checkbox" checked={decisions.launchP3} onChange={e=>setDecisions(p=>({...p,launchP3:e.target.checked}))} disabled={isSubmitted}/>
                          Launch P3 Product ($2M launch cost, 4-qtr ramp-up)
                        </label>
                        {decisions.launchP3 && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            <div>
                              <FL t={t}>P3 Config</FL>
                              <SI value={decisions.p3Config} onChange={e=>setDecisions(p=>({...p,p3Config:e.target.value}))} disabled={isSubmitted} t={t}
                                options={[{value:"STANDARD",label:"Standard ($549, $320 cost)"},{value:"PREMIUM",label:"Premium ($649, $400 cost)"}]}/>
                            </div>
                            <div><FL t={t}>P3 Units</FL><NI value={decisions.productionP3} onChange={e=>setDecisions(p=>({...p,productionP3:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/></div>
                          </div>
                        )}
                      </div>
                    )}
                    <Hint t={t} type={capPct > 90 ? "warn" : "info"}>
                      Total: {fmtN(totalProd)} units · {capPct}% of capacity
                      {capPct > 85 ? " ⚠ Above 85% triggers overtime labor surcharge" : ""}
                    </Hint>
                  </div>
                )}
              </DC>

              {/* ── 5. PRICING ── */}
              <DC id="Pricing" title="Pricing Strategy" subtitle="P1 $250–$1000 · P2 $425–$1500"
                done={done.pricing} editing={isEdit("Pricing")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                {!isEdit("Pricing") && done.pricing ? (
                  <div>
                    <SRow label="P1 Base Price" value={`$${decisions.priceP1}`} t={t} mono/>
                    <SRow label="P2 Base Price" value={`$${decisions.priceP2}`} t={t} mono/>
                    {showP3(simulation) && decisions.launchP3 && <SRow label="P3 Price" value={`$${decisions.p3Price}`} t={t} mono/>}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <div>
                      <FL t={t}>P1 — Standard Product</FL>
                      <NI value={decisions.priceP1} onChange={e=>setDecisions(p=>({...p,priceP1:+e.target.value}))} suffix="$/unit" disabled={isSubmitted} t={t} min={250} max={1000}/>
                      <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>Range $250–$1,000 · Market base $500 · R2 price-sensitive, R3 quality-sensitive</p>
                    </div>
                    <div>
                      <FL t={t}>P2 — Premium Product</FL>
                      <NI value={decisions.priceP2} onChange={e=>setDecisions(p=>({...p,priceP2:+e.target.value}))} suffix="$/unit" disabled={isSubmitted} t={t} min={425} max={1500}/>
                      <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>Range $425–$1,500 · Market base $850</p>
                    </div>
                    {showP3(simulation) && decisions.launchP3 && (
                      <div>
                        <FL t={t}>P3 — Innovation Product</FL>
                        <NI value={decisions.p3Price} onChange={e=>setDecisions(p=>({...p,p3Price:+e.target.value}))} suffix="$/unit" disabled={isSubmitted} t={t}/>
                        <p style={{ fontSize:11, color:t.textMuted, marginTop:4 }}>Conjoint suggest: STANDARD $549 / PREMIUM $649</p>
                      </div>
                    )}
                    <Hint t={t}>Churn triggers: price hike &gt;10% = 15% churn · competitor undercut &gt;15% = 5% churn</Hint>
                  </div>
                )}
              </DC>

              {/* ── 6. MARKETING ── */}
              {showMarketing(simulation) && (
                <DC id="Marketing" title="Marketing Allocation" subtitle="Budget by customer segment (must total 100%)"
                  done={done.marketing} editing={isEdit("Marketing")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Marketing") && done.marketing ? (
                    <div>
                      <SRow label="Total Budget"        value={fmtC(decisions.marketingBudget)} t={t} mono/>
                      <SRow label="Champions (50% rev)" value={`${decisions.segmentChampions}%`} t={t}/>
                      <SRow label="Growth (30% rev)"    value={`${decisions.segmentGrowth}%`}    t={t}/>
                      <SRow label="At-Risk (15% rev)"   value={`${decisions.segmentAtRisk}%`}    t={t}/>
                      <SRow label="Other (5% rev)"      value={`${decisions.segmentOther}%`}     t={t}/>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <div><FL t={t}>Marketing Budget</FL><NI value={decisions.marketingBudget} onChange={e=>setDecisions(p=>({...p,marketingBudget:+e.target.value}))} suffix="$" disabled={isSubmitted} t={t}/></div>
                      {[
                        { key:"segmentChampions", label:"Champions (20% of customers, 50% revenue, +2% retention/10%)" },
                        { key:"segmentGrowth",    label:"Growth (35% of customers, 30% revenue, +5% retention/10%)" },
                        { key:"segmentAtRisk",    label:"At-Risk (25% of customers, 15% revenue, +8% retention/10%)" },
                        { key:"segmentOther",     label:"Other (20% of customers, 5% revenue, +3% retention/10%)" },
                      ].map(seg => (
                        <div key={seg.key}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <label style={{ fontSize:12, color:t.textSec }}>{seg.label}</label>
                            <span style={{ fontSize:12, fontWeight:600, color:t.textPrimary, fontFamily:"SF Mono,Consolas,monospace" }}>{decisions[seg.key]}%</span>
                          </div>
                          <input type="range" min="0" max="100" value={decisions[seg.key]} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,[seg.key]:+e.target.value}))}/>
                        </div>
                      ))}
                      {(() => {
                        const total = (decisions.segmentChampions||0)+(decisions.segmentGrowth||0)+(decisions.segmentAtRisk||0)+(decisions.segmentOther||0);
                        return Math.abs(total-100) > 1
                          ? <Hint t={t} type="warn">Segments total {total}% — must equal exactly 100%</Hint>
                          : <Hint t={t}>Total: {total}% ✓</Hint>;
                      })()}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 7. QUALITY ── */}
              {showQuality(simulation) && (
                <DC id="Quality" title="Quality Program" subtitle="Inspection level affects defect detection and labor cost"
                  done={done.quality} editing={isEdit("Quality")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Quality") && done.quality ? (
                    <SRow label="Inspection Level" value={decisions.inspectionLevel} t={t}/>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <FL t={t}>Inspection Level</FL>
                      {[
                        { value:"NONE",  label:"None",  desc:"$0/unit · 20% detection · base defect 3%",          labor:"1.0x labor" },
                        { value:"BASIC", label:"Basic", desc:"$2/unit · 70% detection · catches most defects",    labor:"1.05x labor" },
                        { value:"FULL",  label:"Full",  desc:"$5/unit · 95% detection · premium quality control", labor:"1.15x labor" },
                      ].map(opt => (
                        <label key={opt.value} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:6, border:`1px solid ${decisions.inspectionLevel===opt.value?t.accent:t.border}`, background:decisions.inspectionLevel===opt.value?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer" }}>
                          <input type="radio" name="inspectionLevel" value={opt.value} checked={decisions.inspectionLevel===opt.value} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,inspectionLevel:e.target.value}))} style={{ marginTop:2 }}/>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:decisions.inspectionLevel===opt.value?t.accent:t.textPrimary }}>{opt.label}</div>
                            <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{opt.desc}</div>
                            <div style={{ fontSize:11, color:t.textMuted }}>{opt.labor} · Rework $50/defect · Undetected = $150 return cost</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 8. LOGISTICS ── */}
              {showLogistics(simulation) && (
                <DC id="Logistics" title="Logistics" subtitle={showMultiCarrier(simulation) ? "Multi-carrier selection (Advanced Module)" : "Shipping mode selection"}
                  done={done.logistics} editing={isEdit("Logistics")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Logistics") && done.logistics ? (
                    <div>
                      {showMultiCarrier(simulation)
                        ? <SRow label="Carrier Mode"  value={decisions.carrier}      t={t}/>
                        : <SRow label="Shipping Mode" value={decisions.shippingMode} t={t}/>}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {showMultiCarrier(simulation) ? (
                        <div>
                          <FL t={t}>Carrier Mode (Multi-Carrier Advanced Module)</FL>
                          {[
                            { value:"INTERMODAL", label:"Intermodal",  cost:"$1.50/unit", onTime:"80% on-time",        note:"Rail + truck — cheapest, variable timing, 1.0% damage" },
                            { value:"TRUCK",      label:"Truck (FTL)", cost:"$3.50/unit", onTime:"93% on-time",        note:"5% vol discount at 75K+ units — 0.5% damage" },
                            { value:"AIR",        label:"Air Freight", cost:"$12.00/unit",onTime:"100% guaranteed",    note:"Premium speed, 0% damage — use for critical quarters" },
                          ].map(opt => (
                            <label key={opt.value} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:6, border:`1px solid ${decisions.carrier===opt.value?t.accent:t.border}`, background:decisions.carrier===opt.value?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer", marginBottom:6 }}>
                              <input type="radio" name="carrier" value={opt.value} checked={decisions.carrier===opt.value} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,carrier:e.target.value}))} style={{ marginTop:2 }}/>
                              <div style={{ flex:1 }}>
                                <div style={{ display:"flex", justifyContent:"space-between" }}>
                                  <span style={{ fontSize:13, fontWeight:600, color:decisions.carrier===opt.value?t.accent:t.textPrimary }}>{opt.label}</span>
                                  <span style={{ fontSize:12, fontFamily:"SF Mono,Consolas,monospace", color:t.textMuted }}>{opt.cost} · {opt.onTime}</span>
                                </div>
                                <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{opt.note}</div>
                              </div>
                            </label>
                          ))}
                          <Hint t={t}>TMS technology gives -8% freight cost on all modes. No DC open = forced Air ($12/unit penalty).</Hint>
                        </div>
                      ) : (
                        <div>
                          <FL t={t}>Shipping Mode</FL>
                          {[
                            { value:"STANDARD", label:"Standard Ground", cost:"$3/unit",  note:"7 day transit · no on-time bonus" },
                            { value:"EXPRESS",  label:"Express Ground",  cost:"$5/unit",  note:"3 day transit · +3% on-time bonus" },
                            { value:"AIR",      label:"Air Freight",     cost:"$10/unit", note:"1 day transit · +8% on-time bonus" },
                          ].map(opt => (
                            <label key={opt.value} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:6, border:`1px solid ${decisions.shippingMode===opt.value?t.accent:t.border}`, background:decisions.shippingMode===opt.value?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer", marginBottom:6 }}>
                              <input type="radio" name="shippingMode" value={opt.value} checked={decisions.shippingMode===opt.value} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,shippingMode:e.target.value}))} style={{ marginTop:2 }}/>
                              <div style={{ flex:1 }}>
                                <div style={{ display:"flex", justifyContent:"space-between" }}>
                                  <span style={{ fontSize:13, fontWeight:600, color:decisions.shippingMode===opt.value?t.accent:t.textPrimary }}>{opt.label}</span>
                                  <span style={{ fontSize:12, fontFamily:"SF Mono,Consolas,monospace", color:t.textMuted }}>{opt.cost}</span>
                                </div>
                                <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{opt.note}</div>
                              </div>
                            </label>
                          ))}
                          <Hint t={t}>TMS technology reduces freight cost by 8%.</Hint>
                        </div>
                      )}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 9. TECHNOLOGY ── */}
              {showTech(simulation) && (
                <DC id="Technology" title="Technology Investments" subtitle="SC systems — maintenance = 15%/yr (3.75%/qtr) of cost"
                  done={done.technology} editing={isEdit("Technology")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Technology") && done.technology ? (
                    <div>
                      {Object.entries(decisions.techPurchases||{}).filter(([,v])=>v).map(([k]) => (
                        <SRow key={k} label={techMap[k]?.split(" (")[0]||k} value="Purchased" t={t}/>
                      ))}
                      {!Object.values(decisions.techPurchases||{}).some(Boolean) && <p style={{ fontSize:13, color:t.textMuted }}>No technology purchased this quarter</p>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {Object.entries(techMap).map(([k, label]) => {
                          const ownedKeys    = decisionConfig?.technologies?.ownedKeys || [];
                          const alreadyOwned = ownedKeys.includes(k);
                          const ownedByDetail= decisionConfig?.technologies?.owned?.some(o => TECH_TYPE_TO_KEY[o.type] === k) || false;
                          const owned        = alreadyOwned || ownedByDetail;
                          const techDef      = (decisionConfig?.technologies?.available || []).find(td => (td.frontendKey === k) || (TECH_TYPE_TO_KEY[td.type] === k));
                          const cost         = techDef?.cost;
                          return (
                            <label key={k} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"9px 10px", borderRadius:6, border:`1px solid ${(decisions.techPurchases?.[k]||owned)?t.accentBorder:t.border}`, background:(decisions.techPurchases?.[k]||owned)?t.accentLight:t.bgElevated, cursor:owned||isSubmitted?"not-allowed":"pointer" }}>
                              <input type="checkbox" checked={!!decisions.techPurchases?.[k]||owned} disabled={owned||isSubmitted}
                                onChange={e => setDecisions(p => ({ ...p, techPurchases: {...p.techPurchases, [k]:e.target.checked} }))}
                                style={{ marginTop:2 }}/>
                              <div>
                                <div style={{ fontSize:12, fontWeight:600, color:owned?t.green:t.textPrimary }}>
                                  {label.split(" (")[0]}{owned?" ✓ Owned":""}
                                </div>
                                <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>
                                  {label.match(/\(.*?\)/)?.[0] || ""}
                                  {cost ? ` · $${(cost/1e6).toFixed(cost%1e6===0?0:1)}M` : ""}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div style={{ marginTop:10 }}>
                        <Hint t={t} type="info">Purchased systems are permanent. Maintenance = 15%/yr of cost deducted each quarter.</Hint>
                      </div>
                    </div>
                  )}
                </DC>
              )}

              {/* ── 10. INTELLIGENCE ── */}
              {showIntel(simulation) && (
                <DC id="Intelligence" title="Intelligence Center" subtitle="Market intelligence subscriptions (quarterly cost)"
                  done={done.intelligence} editing={isEdit("Intelligence")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Intelligence") && done.intelligence ? (
                    <div>
                      {[
                        ["intelRegionalDemand",   "Regional Demand Analysis",    "$50K"],
                        ["intelRetailChannel",    "Retail Channel Intelligence", "$50K"],
                        ["intelCompetitorCapacity","Competitor Capacity Intel",  "$100K"],
                        ["intelSupplierRisk",     "Supplier Risk Monitor",       "$75K"],
                        ["intelCustomerSentiment","Customer Sentiment Tracker",  "$75K"],
                      ].filter(([k]) => decisions[k]).map(([k,l,c]) => (
                        <SRow key={k} label={l} value={c} t={t}/>
                      ))}
                      {!["intelRegionalDemand","intelRetailChannel","intelCompetitorCapacity","intelSupplierRisk","intelCustomerSentiment"].some(k=>decisions[k]) && (
                        <p style={{ fontSize:13, color:t.textMuted }}>No intelligence subscriptions (market trends + competitor pricing are always free)</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ padding:"8px 10px", borderRadius:6, background:t.greenBg, border:`1px solid ${t.greenBorder}`, fontSize:12, color:t.green, fontWeight:500 }}>
                        ✓ Free: Market Trends Report · Competitor Pricing Report (1-quarter lag)
                      </div>
                      {[
                        ["intelRegionalDemand",    "Regional Demand Analysis",    "$50K/qtr",  "R1/R2/R3 demand breakdown and seasonal trends"],
                        ["intelRetailChannel",     "Retail Channel Intelligence", "$50K/qtr",  "Retailer inventory, coverage, sell-through rate"],
                        ["intelCompetitorCapacity","Competitor Capacity Intel",   "$100K/qtr", "Competitor expansion plans and utilization"],
                        ["intelSupplierRisk",      "Supplier Risk Monitor",       "$75K/qtr",  "Early warning on supply disruptions"],
                        ["intelCustomerSentiment", "Customer Sentiment Tracker",  "$75K/qtr",  "CSI trends and churn analysis by competitor"],
                      ].map(([k,l,cost,desc]) => (
                        <label key={k} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:6, border:`1px solid ${decisions[k]?t.accentBorder:t.border}`, background:decisions[k]?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer" }}>
                          <input type="checkbox" checked={!!decisions[k]} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,[k]:e.target.checked}))} style={{ marginTop:2 }}/>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", justifyContent:"space-between" }}>
                              <span style={{ fontSize:13, fontWeight:500, color:decisions[k]?t.accent:t.textSec }}>{l}</span>
                              <span style={{ fontSize:12, fontWeight:600, color:t.textMuted, fontFamily:"SF Mono,Consolas,monospace" }}>{cost}</span>
                            </div>
                            <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{desc}</div>
                          </div>
                        </label>
                      ))}
                      {(() => {
                        const total = (decisions.intelRegionalDemand?50000:0)+(decisions.intelRetailChannel?50000:0)+(decisions.intelCompetitorCapacity?100000:0)+(decisions.intelSupplierRisk?75000:0)+(decisions.intelCustomerSentiment?75000:0);
                        return total > 0 && <Hint t={t}>Total subscription cost this quarter: {fmtC(total)}</Hint>;
                      })()}
                    </div>
                  )}
                </DC>
              )}

              {/* ── 11. ADVANCED ── */}
              {showAdvanced(simulation) && (
                <DC id="Advanced" title="Advanced Operations" subtitle="Capacity · Regional DCs · VMI · Warranty · Sustainability"
                  done={done.advanced} editing={isEdit("Advanced")} onEdit={id=>setEditing(p=>({...p,[id]:true}))} onSave={handleSaveCard} savingId={savingId} isSubmitted={isSubmitted} t={t} isDark={isDark}>
                  {!isEdit("Advanced") && done.advanced ? (
                    <div>
                      {decisions.buildSmallLine  && <SRow label="Small Line (+50K)"   value="Ordered · $8M · 1 qtr"   t={t}/>}
                      {decisions.buildMediumLine && <SRow label="Medium Line (+100K)" value="Ordered · $15M · 2 qtrs" t={t}/>}
                      {decisions.buildLargeLine  && <SRow label="Large Line (+200K)"  value="Ordered · $25M · 3 qtrs" t={t}/>}
                      {decisions.dcCentralStatus==="YES" && <SRow label="R2 Central DC" value={`Open · ${fmtN(decisions.allocateCentral)} units allocated`} t={t}/>}
                      {decisions.dcWestStatus==="YES"    && <SRow label="R3 West DC"    value={`Open · ${fmtN(decisions.allocateWest)} units allocated`}    t={t}/>}
                      {decisions.enableVMI        && <SRow label="VMI"           value="Enabled with retailer"          t={t}/>}
                      {decisions.warrantyTier !== "STANDARD" && <SRow label="Warranty Tier" value={decisions.warrantyTier}   t={t}/>}
                      {decisions.disposalMethod !== "RECYCLE" && <SRow label="Disposal"      value={decisions.disposalMethod} t={t}/>}
                      {decisions.ecoPackaging     && <SRow label="Eco Packaging" value="+$0.50/unit · +1 Green Score"  t={t}/>}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {showCapacity(simulation) && (
                        <div>
                          <FL t={t}>Capacity Expansion</FL>
                          {[
                            { k:"buildSmallLine",  label:"Small Production Line",  cap:"+50K units/qtr",  cost:"$8M",  maint:"$200K/qtr", build:"1 qtr"  },
                            { k:"buildMediumLine", label:"Medium Production Line", cap:"+100K units/qtr", cost:"$15M", maint:"$350K/qtr", build:"2 qtrs" },
                            { k:"buildLargeLine",  label:"Large Production Line",  cap:"+200K units/qtr", cost:"$25M", maint:"$500K/qtr", build:"3 qtrs" },
                          ].map(({ k, label, cap, cost, maint, build }) => (
                            <label key={k} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"9px 10px", borderRadius:6, border:`1px solid ${decisions[k]?t.accentBorder:t.border}`, background:decisions[k]?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer", marginBottom:6 }}>
                              <input type="checkbox" checked={!!decisions[k]} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,[k]:e.target.checked}))} style={{ marginTop:2 }}/>
                              <div>
                                <span style={{ fontSize:12, fontWeight:600, color:decisions[k]?t.accent:t.textPrimary }}>{label}</span>
                                <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{cap} · {cost} investment · {maint} maintenance · ready in {build}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {showDCs(simulation) && (
                        <div>
                          <FL t={t}>Regional Distribution Centers</FL>
                          <Hint t={t}>Factory serves R1 (East) directly. DCs serve R2 (Central) and R3 (West) only.</Hint>
                          <div style={{ height:8 }}/>
                          {[
                            { sk:"dcCentralStatus", ak:"allocateCentral", label:"R2 Central DC (Chicago)",  setup:"$4M", opex:"$700K/qtr", cap:"200K units", svc:"+3% on-time R2" },
                            { sk:"dcWestStatus",    ak:"allocateWest",    label:"R3 West DC (Los Angeles)", setup:"$6M", opex:"$900K/qtr", cap:"150K units", svc:"+5% on-time R3" },
                          ].map(({ sk, ak, label, setup, opex, cap, svc }) => (
                            <div key={sk} style={{ marginBottom:12, padding:"10px 12px", borderRadius:6, border:`1px solid ${t.border}`, background:t.bgElevated }}>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                                <span style={{ fontSize:13, fontWeight:600, color:t.textPrimary }}>{label}</span>
                                <div style={{ fontSize:11, color:t.textMuted }}>{setup} setup · {opex} · {cap} · {svc}</div>
                              </div>
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                <div style={{ flex:1 }}>
                                  <FL t={t}>Status</FL>
                                  <SI value={decisions[sk]} onChange={e=>setDecisions(p=>({...p,[sk]:e.target.value}))} disabled={isSubmitted} t={t}
                                    options={[{value:"NO",label:"Closed"},{value:"YES",label:"Open (allocate inventory)"},{value:"CLOSE",label:"Close (recover 25% of setup)"}]}/>
                                </div>
                                {(decisions[sk]==="YES" || firmState?.[sk==="dcCentralStatus"?"dcCentralOpen":"dcWestOpen"]) && (
                                  <div style={{ flex:1 }}>
                                    <FL t={t}>Allocate Units</FL>
                                    <NI value={decisions[ak]} onChange={e=>setDecisions(p=>({...p,[ak]:+e.target.value}))} suffix="units" disabled={isSubmitted} t={t}/>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showVMI(simulation) && (
                        <div>
                          <FL t={t}>Vendor Managed Inventory (VMI)</FL>
                          <label style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:6, border:`1px solid ${decisions.enableVMI?t.accentBorder:t.border}`, background:decisions.enableVMI?t.accentLight:t.bgElevated, cursor:isSubmitted?"not-allowed":"pointer" }}>
                            <input type="checkbox" checked={!!decisions.enableVMI} disabled={isSubmitted||firmState?.vmiActive} onChange={e=>setDecisions(p=>({...p,enableVMI:e.target.checked}))} style={{ marginTop:2 }}/>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:decisions.enableVMI?t.accent:t.textPrimary }}>Enable VMI with Retailer</div>
                              <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>$2M one-time setup · $100K/qtr ongoing · smooths retailer panic/clearance cycles</div>
                            </div>
                          </label>
                        </div>
                      )}

                      {showGreen(simulation) && (
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          <div>
                            <FL t={t}>Warranty Tier</FL>
                            <SI value={decisions.warrantyTier} onChange={e=>setDecisions(p=>({...p,warrantyTier:e.target.value}))} disabled={isSubmitted} t={t}
                              options={[
                                {value:"NONE",     label:"None — $0/unit · -10 CSI · +50% churn"},
                                {value:"BASIC",    label:"Basic — $1.50/unit · parts shipped · -2 CSI · +10% churn"},
                                {value:"STANDARD", label:"Standard — $2.10/unit · parts + service visit · no CSI change"},
                                {value:"PREMIUM",  label:"Premium — $3.00/unit · priority service · +3 CSI · -10% churn"},
                              ]}/>
                          </div>
                          <div>
                            <FL t={t}>Disposal Method</FL>
                            <SI value={decisions.disposalMethod} onChange={e=>setDecisions(p=>({...p,disposalMethod:e.target.value}))} disabled={isSubmitted} t={t}
                              options={[
                                {value:"LANDFILL", label:"Landfill — $5/unit · $0 recovery · -2 Green Score/qtr"},
                                {value:"RECYCLE",  label:"Recycle — $15/unit · $0 recovery · +1 Green Score/qtr"},
                                {value:"REFURBISH",label:"Refurbish — $25/unit · $40 recovery · +2 Green Score/qtr"},
                              ]}/>
                          </div>
                          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:t.textSec, cursor:isSubmitted?"not-allowed":"pointer" }}>
                            <input type="checkbox" checked={!!decisions.ecoPackaging} disabled={isSubmitted} onChange={e=>setDecisions(p=>({...p,ecoPackaging:e.target.checked}))}/>
                            Eco Packaging — +$0.50/unit · +1 Green Score per quarter
                          </label>
                          {showDCs(simulation) && (
                            <div>
                              <FL t={t}>Warranty Service Network (requires DC open)</FL>
                              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                {[
                                  { k:"centralWarrantyNetwork", label:"Central DC Warranty Network (R2)", requires:"dcCentralOpen" },
                                  { k:"westWarrantyNetwork",    label:"West DC Warranty Network (R3)",    requires:"dcWestOpen" },
                                ].map(({ k, label, requires }) => {
                                  const dcOpen = firmState?.[requires] || decisions.dcCentralStatus==="YES" || decisions.dcWestStatus==="YES";
                                  return (
                                    <label key={k} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:dcOpen?t.textSec:t.textDisabled, cursor:dcOpen&&!isSubmitted?"pointer":"not-allowed" }}>
                                      <input type="checkbox" checked={!!decisions[k]} disabled={!dcOpen||isSubmitted} onChange={e=>setDecisions(p=>({...p,[k]:e.target.checked}))}/>
                                      {label} — $500K setup · $100K/qtr · in-house service $50/visit (+2 CSI)
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </DC>
              )}
            </div>

            {/* AI Coach */}
            <div style={{ marginTop:24, padding:"16px 20px", borderRadius:8, background:isDark?t.accentLight:"#EFF6FF", border:`1px solid ${t.accentBorder}`, display:"flex", gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:t.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:t.textPrimary, marginBottom:4 }}>AI Coach</p>
                <p style={{ fontSize:13, color:t.textSec, lineHeight:1.6 }}>
                  {firmState?.perfectOrder?.overall ? `Your last Perfect Order was ${(firmState.perfectOrder.overall*100).toFixed(1)}%. ` : ""}
                  {capPct > 85 ? "⚠ Capacity above 85% — overtime labor surcharge applies. " : ""}
                  {(() => {
                    const rawMats = firmState?.rawMaterials||firmState?.rawMaterialUnits||0;
                    const inTrans = firmState?.inTransit||firmState?.inTransitUnits||0;
                    if (nextQ === 1 && rawMats === 0 && inTrans === 0) {
                      return `Q1 start — global order arrives Q2. Use regional order ($195/unit) for same-quarter parts if needed.`;
                    }
                    return `Raw materials available: ${fmtN(rawMats + inTrans)} units. Parts needed for planned production: ${fmtN(totalProd*3)} parts.`;
                  })()}
                </p>
              </div>
            </div>

          </main>
        </div>

        {/* ── CONFIRM MODAL ── */}
        {showConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
            <div style={{ background:t.bgSurface, border:`1px solid ${t.border}`, borderRadius:10, width:"100%", maxWidth:460, boxShadow:t.shadowMd }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:15, fontWeight:700, color:t.textPrimary }}>Confirm Q{nextQ} Submission</span>
                <button onClick={() => setShowConfirm(false)} style={{ background:"none", border:"none", color:t.textMuted, cursor:"pointer", fontSize:18 }}>×</button>
              </div>
              <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
                <p style={{ fontSize:13, color:t.textMuted, lineHeight:1.6 }}>Submit Q{nextQ} decisions? This cannot be undone. The simulation advances automatically when all firms submit.</p>
                {validationErrors.length > 0 && (
                  <div style={{ padding:"10px 12px", borderRadius:7, background:t.redBg, border:`1px solid ${t.redBorder}` }}>
                    <p style={{ fontSize:12, fontWeight:600, color:t.red, marginBottom:5 }}>Fix errors before submitting:</p>
                    <ul style={{ paddingLeft:16, margin:0 }}>{validationErrors.map((e,i) => <li key={i} style={{ fontSize:11, color:t.red, marginBottom:2 }}>{e}</li>)}</ul>
                  </div>
                )}
                <div style={{ background:t.bgElevated, border:`1px solid ${t.border}`, borderRadius:7, padding:"12px 14px" }}>
                  <p style={{ fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Decision Summary</p>
                  {[
                    { label:"Supplier",   value: decisions.primarySupplier||"—" },
                    { label:"Orders",     value: `${fmtN((decisions.orderGlobal||0)+(decisions.orderRegional||0))} units` },
                    { label:"Production", value: `${fmtN(totalProd)} units · ${decisions.shifts} shift${decisions.shifts>1?"s":""}` },
                    { label:"Prices",     value: `P1 $${decisions.priceP1} / P2 $${decisions.priceP2}` },
                    { label:"Marketing",  value: fmtC(decisions.marketingBudget||0) },
                    { label:"Inspection", value: decisions.inspectionLevel },
                    { label:"Shipping",   value: showMultiCarrier(simulation) ? decisions.carrier : decisions.shippingMode },
                    { label:"Warranty",   value: decisions.warrantyTier },
                    { label:"Disposal",   value: decisions.disposalMethod },
                    { label:"VMI",        value: decisions.enableVMI ? "Enabled" : "Off" },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderBottom:`1px solid ${t.border}` }}>
                      <span style={{ fontSize:12, color:t.textMuted }}>{r.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:t.textPrimary, fontFamily:"SF Mono,Consolas,monospace" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"14px 20px", borderTop:`1px solid ${t.border}`, display:"flex", gap:10 }}>
                <button onClick={() => setShowConfirm(false)} className="gb"
                  style={{ flex:1, padding:"9px", borderRadius:7, border:`1px solid ${t.border}`, background:t.bgElevated, color:t.textSec, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting||validationErrors.length>0} className="pb"
                  style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background:t.accent, color:"#fff", fontSize:13, fontWeight:600, cursor:submitting||validationErrors.length>0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  {submitting ? <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff" }}/> :
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>}
                  Submit Decisions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}