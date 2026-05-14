// src/app/dashboard/admin/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import CreateSimulationModal from "./components/CreateSimulationModal";

// ─── ADVANCED MODULES ─────────────────────────────────────────────────────────
const ADVANCED_MODULES = {
  capacityExpansion:     { label: "Capacity Expansion",   icon: "🏭" },
  regionalDCs:           { label: "Regional DCs",          icon: "📦" },
  multiCarrierSelection: { label: "Multi-Carrier",         icon: "🚛" },
  returnsGreenScore:     { label: "Returns & Green Score", icon: "♻️" },
  intelligenceCenter:    { label: "Intelligence Center",   icon: "📊" },
  vmi:                   { label: "VMI",                   icon: "🤝" },
  analyticsMode:         { label: "Analytics Mode",        icon: "📈" },
  productInnovation:     { label: "Product Innovation",    icon: "🆕" },
  marketExpansion:       { label: "Market Expansion",      icon: "🌍" },
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  CREATED:     { label: "Created",        color: "#B45309", bg: "#FEF3C7", borderColor: "#FCD34D" },
  INITIALIZED: { label: "Ready to Start", color: "#1D4ED8", bg: "#DBEAFE", borderColor: "#93C5FD" },
  IN_PROGRESS: { label: "In Progress",    color: "#065F46", bg: "#D1FAE5", borderColor: "#6EE7B7" },
  PAUSED:      { label: "Paused",         color: "#92400E", bg: "#FEF3C7", borderColor: "#FCD34D" },
  COMPLETED:   { label: "Completed",      color: "#5B21B6", bg: "#EDE9FE", borderColor: "#C4B5FD" },
};
const STATUS_CONFIG_DARK = {
  CREATED:     { label: "Created",        color: "#FCD34D", bg: "rgba(251,191,36,0.12)",  borderColor: "rgba(251,191,36,0.3)"  },
  INITIALIZED: { label: "Ready to Start", color: "#93C5FD", bg: "rgba(59,130,246,0.12)",  borderColor: "rgba(59,130,246,0.3)"  },
  IN_PROGRESS: { label: "In Progress",    color: "#6EE7B7", bg: "rgba(16,185,129,0.12)",  borderColor: "rgba(16,185,129,0.3)"  },
  PAUSED:      { label: "Paused",         color: "#FCD34D", bg: "rgba(251,191,36,0.12)",  borderColor: "rgba(251,191,36,0.3)"  },
  COMPLETED:   { label: "Completed",      color: "#C4B5FD", bg: "rgba(139,92,246,0.12)",  borderColor: "rgba(139,92,246,0.3)"  },
};

// ─── THEME TOKENS ─────────────────────────────────────────────────────────────
const LIGHT = {
  bgPage:       "#F3F4F6",  bgSurface:    "#FFFFFF",    bgElevated:   "#F9FAFB",
  bgHover:      "#F3F4F6",  border:       "#E5E7EB",    borderStrong: "#D1D5DB",
  textPrimary:  "#111827",  textSec:      "#374151",    textMuted:    "#6B7280",
  textDisabled: "#9CA3AF",  accent:       "#1D4ED8",    accentLight:  "#EFF6FF",
  accentBorder: "#BFDBFE",  green:        "#065F46",    greenBg:      "#D1FAE5",
  greenBorder:  "#6EE7B7",  amber:        "#92400E",    amberBg:      "#FEF3C7",
  amberBorder:  "#FCD34D",  red:          "#991B1B",    redBg:        "#FEE2E2",
  redBorder:    "#FECACA",  purple:       "#5B21B6",    purpleBg:     "#EDE9FE",
  purpleBorder: "#C4B5FD",  headerBg:     "#FFFFFF",    tableHead:    "#F9FAFB",
  rowAlt:       "#FAFAFA",
  shadowSm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
};
const DARK = {
  bgPage:       "#0D1117",  bgSurface:    "#161B22",    bgElevated:   "#1C2128",
  bgHover:      "#21262D",  border:       "#30363D",    borderStrong: "#444C56",
  textPrimary:  "#E6EDF3",  textSec:      "#8D96A0",    textMuted:    "#545D68",
  textDisabled: "#3D444D",  accent:       "#4493F8",    accentLight:  "#1A2332",
  accentBorder: "#1F3A5F",  green:        "#3FB950",    greenBg:      "rgba(63,185,80,0.10)",
  greenBorder:  "rgba(63,185,80,0.30)",   amber:        "#D29922",    amberBg:      "rgba(210,153,34,0.10)",
  amberBorder:  "rgba(210,153,34,0.30)",  red:          "#F85149",    redBg:        "rgba(248,81,73,0.10)",
  redBorder:    "rgba(248,81,73,0.30)",   purple:       "#C4B5FD",    purpleBg:     "rgba(139,92,246,0.10)",
  purpleBorder: "rgba(139,92,246,0.30)",  headerBg:     "#161B22",    tableHead:    "#1C2128",
  rowAlt:       "#191E25",
  shadowSm: "0 1px 3px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.4)",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const buildCSS = (isDark, t) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${t.bgPage}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${t.borderStrong}; }
  select option { background: ${t.bgElevated}; color: ${t.textPrimary}; }

  .sim-row { transition: background-color 0.12s ease; cursor: default; }
  .sim-row:hover { background-color: ${t.bgHover} !important; }

  .manage-btn { transition: background-color 0.12s, border-color 0.12s, color 0.12s; }
  .manage-btn:hover {
    background-color: ${t.accentLight} !important;
    border-color: ${t.accent} !important;
    color: ${t.accent} !important;
  }

  .delete-btn { transition: background-color 0.12s, border-color 0.12s, color 0.12s; }
  .delete-btn:hover {
    background-color: ${isDark ? "rgba(248,81,73,0.15)" : "#FEE2E2"} !important;
    border-color: ${t.red} !important;
    color: ${t.red} !important;
  }

  .ctrl-input { transition: border-color 0.12s, box-shadow 0.12s; }
  .ctrl-input:focus {
    outline: none;
    border-color: ${t.accent} !important;
    box-shadow: 0 0 0 3px ${isDark ? "rgba(68,147,248,0.15)" : "rgba(29,78,216,0.1)"};
  }
  .ctrl-input::placeholder { color: ${t.textDisabled}; }

  .kpi-card { transition: box-shadow 0.12s; }
  .kpi-card:hover { box-shadow: ${t.shadowMd} !important; }

  .icon-btn { transition: background-color 0.12s, border-color 0.12s; }
  .icon-btn:hover { background-color: ${t.bgHover} !important; }

  .logout-btn { transition: background-color 0.12s, border-color 0.12s; }
  .logout-btn:hover {
    background-color: ${isDark ? "rgba(248,81,73,0.15)" : "#FEE2E2"} !important;
    border-color: ${t.red} !important;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.75s linear infinite; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .fade-row { animation: fadeIn 0.2s ease both; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .status-pulse { animation: pulse 2s ease-in-out infinite; }
`;

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, isDark }) {
  const cfg = (isDark ? STATUS_CONFIG_DARK : STATUS_CONFIG)[status]
    || (isDark ? STATUS_CONFIG_DARK : STATUS_CONFIG).CREATED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.borderColor}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ─── MODULE CHIP ───────────────────────────────────────────────────────────────
function ModuleChip({ openCount, scheduledCount, isDark, t }) {
  if (openCount === 0 && scheduledCount === 0) {
    return (
      <div style={{
        padding: "2px 8px", borderRadius: 4,
        background: t.bgElevated, border: `1px solid ${t.border}`,
        fontSize: 10, fontWeight: 600, color: t.textDisabled,
        whiteSpace: "nowrap",
      }}>
        None
      </div>
    );
  }

  // Just open modules, no schedule pending
  if (scheduledCount === 0) {
    return (
      <div style={{
        padding: "2px 8px", borderRadius: 4,
        background: isDark ? "rgba(139,92,246,0.12)" : "#EDE9FE",
        border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "#C4B5FD"}`,
        fontSize: 10, fontWeight: 700,
        color: isDark ? "#C4B5FD" : "#5B21B6",
        whiteSpace: "nowrap",
      }}>
        {openCount} open
      </div>
    );
  }

  // Has scheduled modules — show both with a divider
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4,
      background: isDark ? "rgba(139,92,246,0.12)" : "#EDE9FE",
      border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "#C4B5FD"}`,
      fontSize: 10, fontWeight: 700,
      color: isDark ? "#C4B5FD" : "#5B21B6",
      whiteSpace: "nowrap",
    }}>
      <span>{openCount} open</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span style={{ color: isDark ? "#FCD34D" : "#92400E" }}>
        {scheduledCount} sched
      </span>
    </div>
  );
}

// Feature configuration with descriptions
const CORE_FEATURES = {
  seasonality: { label: "Seasonality", desc: "Quarterly demand variations" },
  randomEvents: { label: "Random Events", desc: "Supply chain disruptions" },
  customerChurn: { label: "Customer Churn", desc: "Customer retention dynamics" },
  retailerBrain: { label: "Retailer Brain", desc: "Smart retailer ordering" },
  regionalCompetition: { label: "Regional Competition", desc: "Multi-region markets" },
  demandForecasting: { label: "Demand Forecasting", desc: "Forecast accuracy tracking" },
  perfectOrderTracking: { label: "Perfect Order", desc: "OTIF metrics tracking" },
  technologyInvestments: { label: "Technology", desc: "Tech investment decisions" },
  qualityControl: { label: "Quality Control", desc: "Inspection & defect rates" },
  transportLogistics: { label: "Transport Logistics", desc: "Shipping mode selection" },
};

const DEFAULT_FORM_DATA = {
  name: "",
  description: "",
  facultyIds: [],
  maxQuarters: 12,
  numFirms: 3,
  numRegions: 3,
  numProducts: 2,
  totalMarketSize: 600000,
  startingCash: 50000000,
  startingRevenue: 1000000000,
  courseCode: "",
  institutionName: "",
  eventProbability: 0.15,
  demandVariability: 0.05,
  features: {
    // Core features (default ON)
    seasonality: true,
    randomEvents: true,
    customerChurn: true,
    retailerBrain: true,
    regionalCompetition: true,
    demandForecasting: true,
    perfectOrderTracking: true,
    technologyInvestments: true,
    qualityControl: true,
    transportLogistics: true,
    // Advanced modules (default OFF)
    capacityExpansion: false,
    regionalDCs: false,
    multiCarrierSelection: false,
    returnsGreenScore: false,
    intelligenceCenter: false,
    vmi: false,
    analyticsMode: false,
  },
  seasonality: {
    q1Multiplier: 0.85,
    q2Multiplier: 1.0,
    q3Multiplier: 1.0,
    q4Multiplier: 1.25,
  },
  firmConfigs: [
    { firmNumber: 1, name: "Firm 1", color: "#3B82F6" },
    { firmNumber: 2, name: "Firm 2", color: "#EF4444" },
    { firmNumber: 3, name: "Firm 3", color: "#10B981" },
    { firmNumber: 4, name: "Firm 4", color: "#F59E0B" },
    { firmNumber: 5, name: "Firm 5", color: "#8B5CF6" },
    { firmNumber: 6, name: "Firm 6", color: "#EC4899" },
  ],
};

export default function AdminDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSimId, setSelectedSimId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("userRole");

      if (!token || !userData || userRole !== "admin") {
        router.push("/login");
        return;
      }

      setUser(JSON.parse(userData));
      await fetchSimulations();
      setLoading(false);
    };

    checkAuth();
  }, []);

  const fetchSimulations = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/simulations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSimulations(data.simulations || data || []);
      }
    } catch (err) {
      console.error("Failed to load simulations:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      setFacultyLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/users/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaculty(data.users || data || []);
      }
    } catch (err) {
      console.error("Failed to load faculty:", err);
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleCreateSimulation = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Simulation name is required");
      setCreateLoading(false);
      return;
    }

    if (!formData.facultyIds || formData.facultyIds.length === 0) {
      setError("Please select at least one faculty member");
      setCreateLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("access_token");

      const payloadData = {
        name: formData.name,
        description: formData.description || undefined,
        maxQuarters: parseInt(formData.maxQuarters),
        numFirms: parseInt(formData.numFirms),
        numRegions: parseInt(formData.numRegions),
        numProducts: parseInt(formData.numProducts),
        totalMarketSize: parseInt(formData.totalMarketSize),
        startingCash: parseInt(formData.startingCash),
        startingRevenue: parseInt(formData.startingRevenue),
        courseCode: formData.courseCode || undefined,
        institutionName: formData.institutionName || undefined,
        eventProbability: parseFloat(formData.eventProbability),
        demandVariability: parseFloat(formData.demandVariability),
        facultyIds: formData.facultyIds,
        features: formData.features,
        seasonality: formData.seasonality,
        firmConfigs: formData.firmConfigs.slice(0, parseInt(formData.numFirms)),
      };

      const response = await fetch(`${apiUrl}/simulations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
        body: JSON.stringify(payloadData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create simulation");
        setCreateLoading(false);
        return;
      }

      setSuccess("Simulation created successfully!");
      setTimeout(() => {
        setShowCreateModal(false);
        setFormData(DEFAULT_FORM_DATA);
        setActiveTab("basic");
        fetchSimulations();
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteSimulation = async () => {
    if (!selectedSimId) return;

    setDeleteLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}/simulations/${selectedSimId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete simulation");
        setDeleteLoading(false);
        return;
      }

      setSuccess("Simulation deleted successfully!");
      setShowDeleteConfirm(false);
      setSelectedSimId(null);
      setDeleteLoading(false);

      setTimeout(() => {
        fetchSimulations();
        setSuccess("");
      }, 1000);
    } catch (err) {
      setError(err.message || "An error occurred");
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleFacultyChange = (facultyId) => {
    setFormData((prev) => {
      const currentFaculty = prev.facultyIds || [];
      const isSelected = currentFaculty.includes(facultyId);
      return {
        ...prev,
        facultyIds: isSelected
          ? currentFaculty.filter((id) => id !== facultyId)
          : [...currentFaculty, facultyId],
      };
    });
  };

  const handleFirmConfigChange = (index, field, value) => {
    const newConfigs = [...formData.firmConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setFormData((prev) => ({ ...prev, firmConfigs: newConfigs }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  const toggleAllAdvancedModules = (enabled) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        capacityExpansion: enabled,
        regionalDCs: enabled,
        multiCarrierSelection: enabled,
        returnsGreenScore: enabled,
        intelligenceCenter: enabled,
        vmi: enabled,
        analyticsMode: enabled,
      },
    }));
  };

  // Filter simulations
  const filteredSimulations = simulations.filter((item) => {
    const sim = item.simulation || item;
    const matchesStatus = filterStatus === "all" || sim.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      sim.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: simulations.length,
    active: simulations.filter((s) => (s.simulation || s).status === "IN_PROGRESS").length,
    initialized: simulations.filter((s) => (s.simulation || s).status === "INITIALIZED").length,
    completed: simulations.filter((s) => (s.simulation || s).status === "COMPLETED").length,
  };

  // Count enabled advanced modules and scheduled ones
  const countModules = (features, moduleSchedule, currentQuarter) => {
    const keys = Object.keys(ADVANCED_MODULES);
    if (!features && !moduleSchedule) return { open: 0, scheduled: 0 };

    let open = 0;
    let scheduled = 0;
    for (const k of keys) {
      if (features?.[k]) {
        open++;
      } else {
        const scheduledQuarter = moduleSchedule?.[k] ?? 0;
        if (scheduledQuarter > 0 && scheduledQuarter > (currentQuarter ?? 0)) {
          scheduled++;
        }
      }
    }
    return { open, scheduled };
  };

  // Theme classes
  const theme = {
    bg: isDark ? "bg-gray-900" : "bg-gray-50",
    text: isDark ? "text-white" : "text-gray-900",
    textMuted: isDark ? "text-gray-400" : "text-gray-600",
    card: isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    cardHover: isDark ? "hover:bg-gray-750 hover:border-gray-600" : "hover:bg-gray-50 hover:border-gray-300",
    nav: isDark ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-200",
    input: isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    accent: isDark ? "blue" : "red",
    accentBg: isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700",
    accentText: isDark ? "text-blue-400" : "text-red-600",
    secondaryBg: isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300",
  };

  const t = isDark ? DARK : LIGHT;

  if (loading) return (
    <>
      <style>{buildCSS(isDark, t)}</style>
      <div style={{
        minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{
            width: 40, height: 40, borderRadius: "50%",
            border: `3px solid ${t.border}`, borderTopColor: t.accent, margin: "0 auto 14px",
          }} />
          <p style={{ color: t.textMuted, fontSize: 13 }}>Loading…</p>
        </div>
      </div>
    </>
  );

  const displayName = user?.displayName || user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin";
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const filtered = filteredSimulations;

  return (
    <>
      <style>{buildCSS(isDark, t)}</style>
      <div style={{
        minHeight: "100vh", background: t.bgPage, color: t.textPrimary, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 14,
      }}>

        {/* ════════════════════════════════════════════════════════
            HEADER
        ════════════════════════════════════════════════════════ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: t.headerBg, borderBottom: `1px solid ${t.border}`, boxShadow: t.shadowSm,
        }}>
          <div style={{
            maxWidth: 1320, margin: "0 auto", padding: "0 24px",
            height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: t.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>F</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.2px", lineHeight: 1.2 }}>
                    FLEXEE <span style={{ color: t.accent }}>2.0</span>
                  </span>
                  <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.04em", lineHeight: 1 }}>
                    ADMIN EDITION
                  </span>
                </div>
              </Link>
              <div style={{ width: 1, height: 28, background: t.border, margin: "0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary }}>Admin Portal</span>
                <span style={{ fontSize: 11, color: t.textMuted }}>{displayName}</span>
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {filteredSimulations.length > 0 && (
                <div style={{
                  padding: "3px 9px", borderRadius: 4,
                  background: isDark ? t.purpleBg : "#EDE9FE",
                  border: `1px solid ${isDark ? t.purpleBorder : "#C4B5FD"}`,
                  fontSize: 11, fontWeight: 600, color: isDark ? "#C4B5FD" : "#5B21B6",
                }}>
                  Admin
                </div>
              )}

              <button onClick={toggleTheme} className="icon-btn" title={isDark ? "Switch to light" : "Switch to dark"}
                style={{
                  width: 34, height: 34, borderRadius: 6, border: `1px solid ${t.border}`,
                  background: t.bgElevated, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted,
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

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 10px 4px 6px", borderRadius: 6,
                border: `1px solid ${t.border}`, background: t.bgElevated,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4, background: t.accent, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.textSec, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>
              </div>

              <button onClick={handleLogout} className="logout-btn" style={{
                padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.border}`, background: "transparent",
                color: t.red, fontSize: 13, fontWeight: 500,
              }}>
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════════
            PAGE BODY
        ════════════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page title row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.3px" }}>
                All Simulations
              </h1>
              <p style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>
                Manage simulation instances and configurations
              </p>
            </div>
            <button onClick={() => { setShowCreateModal(true); fetchFaculty(); }} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 6, cursor: "pointer",
              background: t.accent, border: `1px solid ${t.accent}`,
              color: "#fff", fontSize: 13, fontWeight: 600,
            }}>
              <span style={{ fontSize: 16 }}>+</span>
              Create Simulation
            </button>
          </div>

          {/* ── KPI SUMMARY CARDS ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Simulations", value: stats.total,       col: t.accent,               bg: isDark ? t.accentLight : "#EFF6FF",  bdr: isDark ? t.accentBorder : "#BFDBFE", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { label: "In Progress",       value: stats.active,      col: t.green,                bg: t.greenBg,                           bdr: isDark ? t.greenBorder  : "#6EE7B7", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Ready to Start",    value: stats.initialized, col: t.amber,                bg: t.amberBg,                           bdr: isDark ? t.amberBorder  : "#FCD34D", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Completed",         value: stats.completed,   col: isDark ? "#C4B5FD" : "#5B21B6", bg: isDark ? t.purpleBg : "#EDE9FE", bdr: isDark ? t.purpleBorder : "#C4B5FD", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
            ].map((c, i) => (
              <div key={i} className="kpi-card" style={{
                background: t.bgSurface, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: "16px 18px", boxShadow: t.shadowSm,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, lineHeight: 1, letterSpacing: "-0.5px" }}>
                      {c.value}
                    </div>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: c.bg, border: `1px solid ${c.bdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: c.col,
                  }}>
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={c.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SIMULATION TABLE ────────────────────────────────────── */}
          <div style={{
            background: t.bgSurface, border: `1px solid ${t.border}`,
            borderRadius: 8, overflow: "hidden", boxShadow: t.shadowSm,
          }}>

            {/* Toolbar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12, padding: "12px 16px",
              borderBottom: `1px solid ${t.border}`, background: t.bgElevated,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                  All Simulations
                </span>
                <span style={{
                  padding: "1px 7px", borderRadius: 10,
                  background: isDark ? t.accentLight : "#EFF6FF",
                  border: `1px solid ${isDark ? t.accentBorder : "#BFDBFE"}`,
                  fontSize: 11, fontWeight: 600, color: t.accent,
                }}>
                  {filtered.length}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: t.textDisabled, pointerEvents: "none" }}
                    width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text" placeholder="Search by name or course…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="ctrl-input"
                    style={{
                      paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                      background: t.bgSurface, border: `1px solid ${t.borderStrong}`,
                      borderRadius: 6, color: t.textPrimary, fontSize: 13, width: 240,
                    }}
                  />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="ctrl-input"
                  style={{
                    padding: "6px 10px",
                    background: t.bgSurface, border: `1px solid ${t.borderStrong}`,
                    borderRadius: 6, color: t.textPrimary, fontSize: 13, cursor: "pointer",
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="INITIALIZED">Ready to Start</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                background: t.redBg, borderBottom: `1px solid ${isDark ? "rgba(248,81,73,0.25)" : "#FECACA"}`,
              }}>
                <svg width="14" height="14" fill="none" stroke={t.red} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span style={{ fontSize: 13, color: t.red, flex: 1 }}>{error}</span>
                <button onClick={() => setError("")} style={{ background: "none", border: "none", color: t.red, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                background: t.greenBg, borderBottom: `1px solid ${isDark ? "rgba(63,185,80,0.25)" : "#6EE7B7"}`,
              }}>
                <svg width="14" height="14" fill="none" stroke={t.green} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ fontSize: 13, color: t.green, flex: 1 }}>{success}</span>
                <button onClick={() => setSuccess("")} style={{ background: "none", border: "none", color: t.green, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2.4fr 0.75fr 1fr 0.85fr 1.1fr 0.65fr 80px",
              padding: "9px 16px",
              background: t.tableHead, borderBottom: `1px solid ${t.border}`,
            }}>
              {["Simulation", "Course", "Status", "Quarter", "Firms / Students", "Modules", ""].map((h, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 600, color: t.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  textAlign: i >= 5 ? "center" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.length > 0 ? filtered.map((item, idx) => {
              const sim = item.simulation || item;
              const { open: modOpen, scheduled: modScheduled } =
                countModules(sim.features, sim.moduleSchedule, sim.currentQuarter);
              const qCur = sim.currentQuarter || 0;
              const qMax = sim.maxQuarters || 12;
              const qPct = qMax ? Math.round(qCur / qMax * 100) : 0;
              const enrolled = sim.enrollmentCount ?? item.enrollmentCount;

              return (
                <div key={idx} className="sim-row fade-row" style={{
                  animationDelay: `${idx * 0.03}s`,
                  display: "grid",
                  gridTemplateColumns: "2.4fr 0.75fr 1fr 0.85fr 1.1fr 0.65fr 80px",
                  padding: "13px 16px",
                  borderBottom: `1px solid ${t.border}`,
                  alignItems: "center",
                  background: idx % 2 === 1 ? t.rowAlt : t.bgSurface,
                }}>

                  {/* Simulation name + meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: t.accentLight, border: `1px solid ${t.accentBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: t.accent,
                    }}>
                      {sim.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: t.textPrimary,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {sim.name}
                      </div>
                      <div style={{
                        fontSize: 11, color: t.textMuted,
                        display: "flex", alignItems: "center", gap: 4,
                        overflow: "hidden", whiteSpace: "nowrap",
                      }}>
                        {sim.institutionName && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{sim.institutionName}</span>}
                        {sim.institutionName && (sim.numRegions || sim.numProducts) && <span>·</span>}
                        {sim.numRegions   && <span>{sim.numRegions} regions</span>}
                        {sim.numRegions && sim.numProducts && <span>·</span>}
                        {sim.numProducts  && <span>{sim.numProducts} products</span>}
                      </div>
                    </div>
                  </div>

                  {/* Course code */}
                  <div>
                    {sim.courseCode ? (
                      <span style={{
                        display: "inline-block", padding: "2px 7px", borderRadius: 4,
                        background: t.bgElevated, border: `1px solid ${t.border}`,
                        fontSize: 11, fontWeight: 500, color: t.textSec,
                        fontFamily: "'SF Mono', 'Consolas', monospace",
                      }}>
                        {sim.courseCode}
                      </span>
                    ) : (
                      <span style={{ color: t.textDisabled, fontSize: 13 }}>—</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div>
                    <StatusBadge status={sim.status} isDark={isDark} />
                  </div>

                  {/* Quarter + progress bar */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, fontFamily: "'SF Mono','Consolas',monospace" }}>
                        Q{qCur}
                      </span>
                      <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'SF Mono','Consolas',monospace" }}>
                        /{qMax}
                      </span>
                    </div>
                    <div style={{ height: 4, background: t.bgElevated, borderRadius: 2, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2, width: `${qPct}%`,
                        background: t.accent, transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>

                  {/* Firms · Students */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="11" height="11" fill="none" stroke={t.textMuted} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, fontFamily: "SF Mono, Consolas, monospace" }}>
                        {sim.numFirms || 3} firms
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="11" height="11" fill="none" stroke={t.textMuted} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span style={{ fontSize: 12, color: t.textMuted, fontFamily: "SF Mono, Consolas, monospace" }}>
                        {enrolled != null ? `${enrolled} students` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Module count chip */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ModuleChip
                      openCount={modOpen}
                      scheduledCount={modScheduled}
                      isDark={isDark}
                      t={t}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                    <Link href={`/dashboard/admin/simulations/${sim._id}`} style={{ textDecoration: "none" }}>
                      <button className="manage-btn" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 6,
                        background: isDark ? t.accentLight : "#EFF6FF",
                        border: `1px solid ${isDark ? t.accentBorder : "#BFDBFE"}`,
                        color: t.accent, cursor: "pointer",
                      }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                    <button onClick={() => { setSelectedSimId(sim._id); setShowDeleteConfirm(true); }}
                      className="delete-btn"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 6,
                        background: "transparent", border: `1px solid ${t.border}`,
                        color: t.textMuted, cursor: "pointer", fontSize: 12,
                      }}
                      title="Delete simulation"
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              );
            }) : (
              /* Empty state */
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, margin: "0 auto 16px",
                  borderRadius: 8, background: t.bgElevated, border: `1px solid ${t.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" fill="none" stroke={t.textMuted} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: t.textSec, marginBottom: 6 }}>
                  {searchQuery || filterStatus !== "all" ? "No matching simulations found" : "No simulations created yet"}
                </p>
                <p style={{ fontSize: 13, color: t.textMuted, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter."
                    : "Click \"Create Simulation\" to get started."}
                </p>
              </div>
            )}

            {/* Table footer */}
            {filtered.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderTop: `1px solid ${t.border}`, background: t.tableHead,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>
                    Modules: currently open · scheduled to unlock later
                  </span>
                </div>
                <span style={{ fontSize: 12, color: t.textMuted }}>
                  Showing {filtered.length} of {simulations.length} simulations
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CREATE SIMULATION MODAL
      ════════════════════════════════════════════════════════════════ */}
      <CreateSimulationModal show={showCreateModal} onClose={() => setShowCreateModal(false)} isDark={isDark} />

      {/* ════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: t.bgSurface, border: `1px solid ${t.border}`, borderRadius: 8,
            padding: "24px", maxWidth: 420, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
          }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 8 }}>
                Delete Simulation?
              </h3>
              <p style={{ fontSize: 13, color: t.textMuted }}>
                This action cannot be undone. All associated data will be permanently deleted.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: `1px solid ${t.border}`, background: "transparent", color: t.textSec,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button onClick={handleDeleteSimulation} disabled={deleteLoading}
                style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: t.red, border: `1px solid ${t.red}`, color: "#fff",
                  cursor: deleteLoading ? "not-allowed" : "pointer", opacity: deleteLoading ? 0.7 : 1,
                }}
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}