// src/app/dashboard/faculty/simulations/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

// ── NEW layout components (replaces old Navigation + Tabs) ────────────────────
import Navigation    from "./components/Navigation";
import SimDetailSidebar from "./components/SimDetailSidebar";

// ── Remaining components (unchanged) ─────────────────────────────────────────
import Header        from "./components/Header";
import Alerts        from "./components/Alerts";
import ProgressCard  from "./components/ProgressCard";
import TabContent    from "./components/TabContent";
import EnrollModal   from "./components/modals/EnrollModal";
import EventModal    from "./components/modals/EventModal";
import FeatureModal  from "./components/modals/FeatureModal";

// ── Constants + utilities (unchanged) ────────────────────────────────────────
import {
  STATUS_CONFIG, ADVANCED_MODULES, CORE_FEATURES, EVENT_TYPES,
} from "./constants";
import {
  getTheme, formatCurrency, formatNumber, formatPercent, formatDate,
  getSeason, countEnabledAdvanced, getGradeColor, getGreenScoreBracket,
  getEnrolledStudentIds,
} from "./utils";

// ─── THEME TOKENS (inline, no Tailwind) ───────────────────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6", bgSurface: "#FFFFFF", bgElevated: "#F9FAFB",
  border: "#E5E7EB", textPrimary: "#111827", textMuted: "#6B7280",
  accent: "#1D4ED8", red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};
const DARK = {
  bgPage: "#0D1117", bgSurface: "#161B22", bgElevated: "#1C2128",
  border: "#30363D", textPrimary: "#E6EDF3", textMuted: "#545D68",
  accent: "#4493F8", red: "#F85149", redBg: "rgba(248,81,73,0.10)", redBorder: "rgba(248,81,73,0.30)",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

export default function SimulationDetailPage() {
  const { isDark, toggleTheme } = useTheme();

  // ─── ALL EXISTING STATE (untouched) ─────────────────────────────────────────
  const [user,               setUser]               = useState(null);
  const [loading,            setLoading]            = useState(true);
  const [simulation,         setSimulation]         = useState(null);
  const [quarterData,        setQuarterData]        = useState(null);
  const [demandHistory,      setDemandHistory]      = useState([]);
  const [leaderboard,        setLeaderboard]        = useState(null);
  const [activeTab,          setActiveTab]          = useState("overview");
  const [actionLoading,      setActionLoading]      = useState(false);
  const [error,              setError]              = useState("");
  const [success,            setSuccess]            = useState("");
  const [showEventModal,     setShowEventModal]     = useState(false);
  const [showEnrollModal,    setShowEnrollModal]    = useState(false);
  const [showFeatureModal,   setShowFeatureModal]   = useState(false);
  const [students,           setStudents]           = useState([]);
  const [firmsCreditHistory, setFirmsCreditHistory] = useState([]);
  const [enrollForm,         setEnrollForm]         = useState({ firmId: "", studentIds: [], teamName: "" });
  const [eventForm,          setEventForm]          = useState({ type: "", magnitude: 0.3, duration: 1 });
  const [selectedQuarter,    setSelectedQuarter]    = useState(null);
  const [quarterHistory,     setQuarterHistory]     = useState({});
  const [loadingQuarterData, setLoadingQuarterData] = useState(false);
  const [leaderboardHistory, setLeaderboardHistory] = useState({});
  const [greenScoreHistory,  setGreenScoreHistory]  = useState({});
  const [scrmData,           setScrmData]           = useState(null);
  const [scrmHistory,        setScrmHistory]        = useState({});
  const [loadingScrmData,    setLoadingScrmData]    = useState(false);
  const [eventImpacts,       setEventImpacts]       = useState([]);
  const [eventSummary,       setEventSummary]       = useState(null);
  const [dcStatus,           setDcStatus]           = useState(null);
  const [carrierAnalysis,    setCarrierAnalysis]    = useState(null);
  const [loadingDcCarrier,   setLoadingDcCarrier]   = useState(false);
  const [intelReports,       setIntelReports]       = useState({});
  const [loadingIntelReports,setLoadingIntelReports]= useState(false);
  const [vmiHistory,         setVmiHistory]         = useState({});
  const [loadingVmiHistory,  setLoadingVmiHistory]  = useState(false);
  const [dataVisibility,     setDataVisibility]     = useState(null);
  const [loadingVisibility,  setLoadingVisibility]  = useState(false);

  const router = useRouter();
  const params = useParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const theme  = getTheme(isDark);
  const t      = isDark ? DARK : LIGHT;

  const getToken = () => localStorage.getItem("access_token");

  // ─── ALL EXISTING API CALLS (untouched) ──────────────────────────────────────
  const fetchSimulation = async () => {
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) setSimulation(await res.json());
      else setError("Failed to load simulation");
    } catch { setError("Failed to load simulation"); }
  };

  const fetchQuarterData = async () => {
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/current-quarter`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) setQuarterData(await res.json());
    } catch {}
  };

  const fetchGreenScoreForFirm = async (firmId, quarter = null) => {
    try {
      let url = `${apiUrl}/simulations/${params.id}/firms/${firmId}/green-score`;
      if (quarter) url += `?quarters=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchAllGreenScoreHistory = async (quarter = null) => {
    if (!simulation || !Array.isArray(simulation.firms)) return;
    const results = {};
    await Promise.all(simulation.firms.map(async f => {
      const id = f._id || f.firm?._id || f.firmId || f.id;
      const data = await fetchGreenScoreForFirm(id, quarter);
      if (data) results[id] = data;
    }));
    setGreenScoreHistory({ ...results });
  };

  const fetchIntelReportsForFirm = async (firmId, quarter = null) => {
    try {
      let url = `${apiUrl}/simulations/${params.id}/firms/${firmId}/intelligence-reports`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchAllIntelReports = async (quarter = null) => {
    if (!simulation || !Array.isArray(simulation.firms)) return;
    setLoadingIntelReports(true);
    const results = {};
    await Promise.all(simulation.firms.map(async f => {
      const id = f._id || f.firm?._id || f.firmId || f.id;
      const data = await fetchIntelReportsForFirm(id, quarter);
      if (data) results[id] = data;
    }));
    setIntelReports({ ...results });
    setLoadingIntelReports(false);
  };

  const fetchVmiTrendForFirm = async (firmId, startQuarter = 1, endQuarter = null) => {
    try {
      const maxQ = endQuarter || selectedQuarter || quarterData?.quarter || 1;
      const res = await fetch(`${apiUrl}/reports/vmi/${params.id}/${firmId}/${startQuarter}/${maxQ}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const fetchAllVmiHistory = async () => {
    if (!simulation || !Array.isArray(simulation.firms)) return;
    setLoadingVmiHistory(true);
    const results = {};
    await Promise.all(simulation.firms.map(async firm => {
      const firmId = firm.id;
      const data = await fetchVmiTrendForFirm(firmId);
      if (data?.trend) results[firmId] = data.trend.map(i => ({ quarter: i.quarter, vmi: i.vmi, costs: i.costs }));
    }));
    setVmiHistory({ ...results });
    setLoadingVmiHistory(false);
  };

  const fetchScrmData = async (quarter) => {
    try {
      setLoadingScrmData(true);
      const res = await fetch(`${apiUrl}/simulations/${params.id}/scrm?quarter=${quarter}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) { const d = await res.json(); setScrmData(d); return d; }
      return null;
    } catch { return null; } finally { setLoadingScrmData(false); }
  };

  const fetchScrmHistory = async (firmId) => {
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/firms/${firmId}/scrm-history`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (!res.ok) return null;
      const d = await res.json();
      setScrmHistory(prev => ({ ...prev, [firmId]: d }));
      return d;
    } catch { return null; }
  };

  const fetchEventImpacts = async (quarter = null) => {
    try {
      let url = `${apiUrl}/simulations/${params.id}/event-impacts`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (res.ok) setEventImpacts(await res.json());
    } catch {}
  };

  const fetchEventSummary = async () => {
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/faculty-event-summary`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) setEventSummary(await res.json());
    } catch {}
  };

  const fetchDemandHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/demand`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) { const d = await res.json(); setDemandHistory(d.demandHistory || []); }
    } catch {}
  };

  const fetchFirmCreditHistory = async (firmId, quarter = null) => {
    try {
      const qs = quarter ? `?quarters=${quarter}` : "";
      const res = await fetch(`${apiUrl}/simulations/${params.id}/firms/${firmId}/credit-history${qs}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const hist = Array.isArray(data.history) ? data.history : [];
      return {
        firmId: data.firm?._id || firmId,
        firmNumber: data.firm?.firmNumber,
        summary: {
          currentTier:        hist[0]?.tierName || "N/A",
          currentScore:       hist[0]?.creditScore?.totalScore || 0,
          currentCreditLimit: hist[0]?.creditLimit || 0,
          currentDebt:        hist[0]?.endingDebt || 0,
          utilizationRate:    hist[0]?.creditLimit ? (hist[0].endingDebt / hist[0].creditLimit) * 100 : 0,
          totalInterestPaid:  hist.reduce((s, h) => s + (h.interestCharge || 0), 0),
          totalOverlimitFees: hist.reduce((s, h) => s + (h.overlimitFee || 0), 0),
          timesOverlimit:     hist.filter(h => !!h.wasOverlimit).length,
          forcedSalesCount:   hist.filter(h => !!h.forcedSaleTriggered).length,
        },
        history: quarter ? [...hist].reverse() : hist,
      };
    } catch { return null; }
  };

  const fetchAllFirmsCreditHistory = async (quarter = null) => {
    if (!simulation || !Array.isArray(simulation.firms)) return;
    const results = await Promise.all(
      simulation.firms.map(f => {
        const id = f._id || f.firm?._id || f.firmId || f.id;
        return fetchFirmCreditHistory(id, quarter);
      })
    );
    setFirmsCreditHistory(results.filter(Boolean));
  };

  const fetchDCStatus = async (quarter = null) => {
    try {
      let url = `${apiUrl}/simulations/${params.id}/dc-status`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (!res.ok) return null;
      const d = await res.json(); setDcStatus(d); return d;
    } catch { return null; }
  };

  const fetchCarrierAnalysis = async (quarter = null) => {
    try {
      let url = `${apiUrl}/simulations/${params.id}/carrier-analysis`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (!res.ok) return null;
      const d = await res.json(); setCarrierAnalysis(d); return d;
    } catch { return null; }
  };

  const fetchDCAndCarrierData = async (quarter = null) => {
    if (!simulation) return;
    setLoadingDcCarrier(true);
    const promises = [];
    if (simulation.features?.regionalDCs)           promises.push(fetchDCStatus(quarter));
    if (simulation.features?.multiCarrierSelection)  promises.push(fetchCarrierAnalysis(quarter));
    await Promise.all(promises);
    setLoadingDcCarrier(false);
  };

  const fetchQuarterDataVisibility = async (quarter = null) => {
    try {
      setLoadingVisibility(true);
      let url = `${apiUrl}/simulations/${params.id}/quarter-data-visibility`;
      if (quarter) url += `?quarter=${quarter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (res.ok) {
        const d = await res.json();
        setDataVisibility(d);
        return d;
      }
    } catch {}
    finally { setLoadingVisibility(false); }
  };

  const handleToggleDataVisibility = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const showQuarterData = !dataVisibility?.showQuarterData;
      const res = await fetch(`${apiUrl}/simulations/${params.id}/quarter-data-visibility`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify({ showQuarterData }),
      });
      if (res.ok) {
        setSuccess(`Data visibility ${showQuarterData ? "enabled" : "disabled"} successfully!`);
        await fetchQuarterDataVisibility();
      } else {
        const d = await res.json();
        setError(d.message || "Failed to update data visibility");
      }
    } catch (err) {
      setError("Failed to update data visibility");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchLeaderboard = async (quarterNumber = null) => {
    try {
      const url = quarterNumber
        ? `${apiUrl}/simulations/${params.id}/leaderboard?quarter=${quarterNumber}`
        : `${apiUrl}/simulations/${params.id}/leaderboard`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } });
      if (res.ok) {
        const data = await res.json();
        const q = quarterNumber || data.quarter || simulation?.currentQuarter;
        setLeaderboardHistory(prev => ({ ...prev, [q]: data }));
      }
    } catch {}
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/students`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) { const d = await res.json(); setStudents(d.users || d || []); }
    } catch {}
  };

  const fetchQuarterDataByNumber = async (quarterNumber) => {
    setLoadingQuarterData(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/quarters/${quarterNumber}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) {
        const apiData = await res.json();
        setQuarterHistory(prev => ({
          ...prev,
          [quarterNumber]: {
            firms: apiData.firms.map(f => ({ firm: f.firm, decision: f.decision, kpi: f.kpi, state: f.state })),
            allDecisionsSubmitted: apiData.firms.every(f => f.decision?.status === "PROCESSED" || f.decision?.status === "SUBMITTED"),
          },
        }));
        setSelectedQuarter(quarterNumber);
        await fetchLeaderboard(quarterNumber);
      } else {
        setError(`Failed to load Quarter ${quarterNumber} data`);
      }
    } catch { setError(`Failed to load Quarter ${quarterNumber} data`); }
    finally { setLoadingQuarterData(false); }
  };

  // ─── ALL EXISTING HANDLERS (untouched) ───────────────────────────────────────
  const handleAdvanceQuarter = async () => {
    setActionLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/advance`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (res.ok) {
        setSuccess("Quarter advanced successfully!");
        setSelectedQuarter(null);
        await Promise.all([fetchSimulation(), fetchQuarterData(), fetchLeaderboard(), fetchDemandHistory(), fetchEventImpacts(), fetchEventSummary()]);
      } else {
        const d = await res.json();
        setError(d.message || "Failed to advance quarter");
      }
    } catch { setError("Failed to advance quarter"); }
    finally { setActionLoading(false); }
  };

  const handleTriggerEvent = async () => {
    if (!eventForm.type) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(eventForm),
      });
      if (res.ok) {
        setSuccess("Event triggered successfully!");
        setShowEventModal(false);
        setEventForm({ type: "", magnitude: 0.3, duration: 1 });
        await Promise.all([fetchSimulation(), fetchEventSummary()]);
      } else { const d = await res.json(); setError(d.message || "Failed to trigger event"); }
    } catch { setError("Failed to trigger event"); }
    finally { setActionLoading(false); }
  };

  const handleUpdateFeatures = async (features) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/features`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(features),
      });
      if (res.ok) { setSuccess("Features updated successfully!"); await fetchSimulation(); }
      else { const d = await res.json(); setError(d.message || "Failed to update features"); }
    } catch { setError("Failed to update features"); }
    finally { setActionLoading(false); }
  };

  const handleEnrollStudents = async () => {
    if (!enrollForm.firmId || enrollForm.studentIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/simulations/${params.id}/firms/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify({
          firmId: enrollForm.firmId,
          students: enrollForm.studentIds.map(id => ({ studentId: id })),
          teamName: enrollForm.teamName || undefined,
        }),
      });
      if (res.ok) {
        setSuccess("Students enrolled successfully!");
        setShowEnrollModal(false);
        setEnrollForm({ firmId: "", studentIds: [], teamName: "" });
        await Promise.all([fetchSimulation(), fetchStudents()]);
      } else { const d = await res.json(); setError(d.message || "Failed to enroll students"); }
    } catch { setError("Failed to enroll students"); }
    finally { setActionLoading(false); }
  };

  const handleLogout = () => {
    ["access_token", "refresh_token", "user", "userRole"].forEach(k => localStorage.removeItem(k));
    router.push("/");
  };

  // ─── REACTIVE EFFECTS (untouched) ────────────────────────────────────────────
  useEffect(() => {
    if (!simulation || !Array.isArray(simulation.firms) || simulation.firms.length === 0) return;
    const quarter = selectedQuarter || null;
    fetchAllFirmsCreditHistory(quarter);
    if (simulation.features?.returnsGreenScore)      fetchAllGreenScoreHistory(quarter);
    if (simulation.features?.regionalDCs || simulation.features?.multiCarrierSelection) fetchDCAndCarrierData(quarter);
    if (simulation.features?.intelligenceCenter)     fetchAllIntelReports(quarter);
    if (simulation.features?.vmi)                    fetchAllVmiHistory();
  }, [
    simulation?._id, simulation?.features?.returnsGreenScore, simulation?.features?.regionalDCs,
    simulation?.features?.multiCarrierSelection, simulation?.features?.intelligenceCenter,
    simulation?.features?.vmi, simulation?.firms?.length, selectedQuarter, quarterData, quarterHistory,
  ]);

  useEffect(() => {
    if (!simulation || !params.id) return;
    const quarter = selectedQuarter || simulation.currentQuarter || 1;
    fetchScrmData(quarter);
  }, [simulation?._id, simulation?.currentQuarter, selectedQuarter]);

  useEffect(() => {
    const checkAuth = async () => {
      const token    = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user");
      const userRole = localStorage.getItem("userRole");
      if (!token || !userData || (userRole !== "admin" && userRole !== "faculty")) {
        router.push("/login"); return;
      }
      setUser(JSON.parse(userData));
      await Promise.all([
        fetchSimulation(), fetchQuarterData(), fetchDemandHistory(),
        fetchLeaderboard(), fetchStudents(), fetchEventImpacts(), fetchEventSummary(), fetchQuarterDataVisibility(),
      ]);
      setLoading(false);
    };
    checkAuth();
  }, [params.id]);

  // ─── DERIVED VALUES ───────────────────────────────────────────────────────────
  const statusConfig    = STATUS_CONFIG[simulation?.status] || STATUS_CONFIG.CREATED;
  const currentSeason   = getSeason((simulation?.currentQuarter ?? 0) + 1);
  const quarterProgress = ((simulation?.currentQuarter ?? 0) / (simulation?.maxQuarters ?? 12)) * 100;
  const advancedCount   = countEnabledAdvanced(simulation?.features, ADVANCED_MODULES);
  const enrolledIds     = getEnrolledStudentIds(simulation);
  const availableStudents = students.filter(s => !enrolledIds.has(s._id));

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: "100vh", background: t.bgPage,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: `3px solid ${t.border}`, borderTopColor: t.accent,
          animation: "spin 0.75s linear infinite", margin: "0 auto 14px",
        }} />
        <p style={{ color: t.textMuted, fontSize: 13 }}>Loading simulation…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!simulation) return (
    <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: t.red, fontSize: 16, marginBottom: 16 }}>Simulation not found</p>
        <Link href="/dashboard/faculty" style={{
          padding: "9px 20px", borderRadius: 6, background: t.accent,
          color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600,
        }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: t.bgPage, color: t.textPrimary,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 14,
    }}>

      {/* ── Sticky header ── */}
      <Navigation
        isDark={isDark}
        toggleTheme={toggleTheme}
        user={user}
        simulation={simulation}
        handleLogout={handleLogout}
        handleAdvanceQuarter={handleAdvanceQuarter}
        actionLoading={actionLoading}
        setShowEventModal={setShowEventModal}
        setShowEnrollModal={setShowEnrollModal}
        fetchStudents={fetchStudents}
        setShowFeatureModal={setShowFeatureModal}
      />

      {/* ── Body: sidebar + main ── */}
      {/* paddingTop: 56 clears the fixed 56px Navigation header */}
      <div style={{ display: "flex", paddingTop: 56 }}>

        {/* Sidebar — replaces horizontal Tabs */}
        <SimDetailSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          simulation={simulation}
        />

        {/* Main content */}
        <main style={{ flex: 1, padding: 24, minWidth: 0, overflowX: "hidden" }}>

          {/* Alerts */}
          <Alerts error={error} success={success} setError={setError} setSuccess={setSuccess} />

          {/* Page header strip (sim name, status badge, action buttons) */}
          <Header
            theme={theme}
            simulation={simulation}
            statusConfig={statusConfig}
            advancedCount={advancedCount}
            formatDate={formatDate}
            handleAdvanceQuarter={handleAdvanceQuarter}
            actionLoading={actionLoading}
            setShowEventModal={setShowEventModal}
            setShowEnrollModal={setShowEnrollModal}
            fetchStudents={fetchStudents}
            setShowFeatureModal={setShowFeatureModal}
            dataVisibility={dataVisibility}
            handleToggleDataVisibility={handleToggleDataVisibility}
            loadingVisibility={loadingVisibility}
          />

          {/* Quarter progress card */}
          <div style={{ marginTop: 16 }}>
            <ProgressCard
              theme={theme}
              isDark={isDark}
              simulation={simulation}
              quarterData={selectedQuarter ? quarterHistory[selectedQuarter] : quarterData}
              quarterProgress={quarterProgress}
              currentSeason={selectedQuarter ? getSeason(selectedQuarter) : currentSeason}
              getSeason={getSeason}
              onQuarterSelect={fetchQuarterDataByNumber}
              selectedQuarter={selectedQuarter}
              currentQuarter={simulation.currentQuarter}
            />
          </div>

          {/* Tab content */}
          <div style={{ marginTop: 16 }}>
            <TabContent
              activeTab={activeTab}
              theme={theme}
              isDark={isDark}
              simulation={simulation}
              quarterData={selectedQuarter ? quarterHistory[selectedQuarter] : quarterData}
              demandHistory={demandHistory}
              leaderboard={
                selectedQuarter
                  ? leaderboardHistory[selectedQuarter]
                  : leaderboardHistory[simulation?.currentQuarter]
              }
              ADVANCED_MODULES={ADVANCED_MODULES}
              CORE_FEATURES={CORE_FEATURES}
              getSeason={getSeason}
              handleUpdateFeatures={handleUpdateFeatures}
              actionLoading={actionLoading}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              formatPercent={formatPercent}
              getGradeColor={getGradeColor}
              getGreenScoreBracket={getGreenScoreBracket}
              selectedQuarter={selectedQuarter}
              firmsCreditHistory={firmsCreditHistory}
              fetchAllFirmsCreditHistory={fetchAllFirmsCreditHistory}
              greenScoreHistory={greenScoreHistory}
              fetchAllGreenScoreHistory={fetchAllGreenScoreHistory}
              scrmData={scrmData}
              fetchScrmData={fetchScrmData}
              fetchScrmHistory={fetchScrmHistory}
              eventImpacts={eventImpacts}
              eventSummary={eventSummary}
              fetchEventImpacts={fetchEventImpacts}
              apiUrl={apiUrl}
              getToken={getToken}
              setShowEventModal={setShowEventModal}
              setEventForm={setEventForm}
              eventForm={eventForm}
              setShowEnrollModal={setShowEnrollModal}
              setShowFeatureModal={setShowFeatureModal}
              dcStatus={dcStatus}
              carrierAnalysis={carrierAnalysis}
              loadingDcCarrier={loadingDcCarrier}
              fetchDCAndCarrierData={fetchDCAndCarrierData}
              intelReports={intelReports}
              loadingIntelReports={loadingIntelReports}
              fetchAllIntelReports={fetchAllIntelReports}
              vmiHistory={vmiHistory}
              loadingVmiHistory={loadingVmiHistory}
              fetchAllVmiHistory={fetchAllVmiHistory}
              dataVisibility={dataVisibility}
              fetchQuarterDataVisibility={fetchQuarterDataVisibility}
            />
          </div>

        </main>
      </div>

      {/* ── Modals (untouched) ── */}
      <EnrollModal
        showEnrollModal={showEnrollModal} setShowEnrollModal={setShowEnrollModal}
        theme={theme} isDark={isDark} simulation={simulation}
        enrollForm={enrollForm} setEnrollForm={setEnrollForm}
        students={students} handleEnrollStudents={handleEnrollStudents}
        actionLoading={actionLoading}
      />
      <EventModal
        showEventModal={showEventModal} setShowEventModal={setShowEventModal}
        theme={theme} isDark={isDark} eventForm={eventForm}
        setEventForm={setEventForm} handleTriggerEvent={handleTriggerEvent}
        actionLoading={actionLoading}
      />
      <FeatureModal
        showFeatureModal={showFeatureModal} setShowFeatureModal={setShowFeatureModal}
        theme={theme} isDark={isDark} simulation={simulation}
        ADVANCED_MODULES={ADVANCED_MODULES} handleUpdateFeatures={handleUpdateFeatures}
        actionLoading={actionLoading}
      />
    </div>
  );
}