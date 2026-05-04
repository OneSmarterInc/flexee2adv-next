"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import IntelligenceReportsPanel from "./IntelligenceReportsPanel";

const SEASON_CONFIG = {
  1: {
    name: "Q1 Post-Holiday",
    icon: "❄️",
    semantic: "blue",
    hint: "Lower demand expected",
  },
  2: {
    name: "Q2 Spring",
    icon: "🌸",
    semantic: "pink",
    hint: "Demand recovering",
  },
  3: {
    name: "Q3 Summer",
    icon: "☀️",
    semantic: "amber",
    hint: "Steady demand",
  },
  4: {
    name: "Q4 Holiday",
    icon: "🎄",
    semantic: "emerald",
    hint: "Peak demand season!",
  },
};

const REPORT_TABS = [
  { id: "kpi", label: "KPI Dashboard", icon: "📊" },
  { id: "financial", label: "Financial", icon: "💰" },
  { id: "operations", label: "Operations", icon: "⚙️" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "scorecard", label: "Scorecard", icon: "📈" },
  { id: "competitor", label: "Competitors", icon: "⚔️" },
  { id: "credit", label: "Credit", icon: "💳" },
  { id: "intelligence", label: "Intelligence", icon: "🕵️" },
  { id: "green-score", label: "Green Score", icon: "♻️" },
  { id: "tenq", label: "10-Q Report", icon: "📄" },
];

export default function StudentReportsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [firm, setFirm] = useState(null);
  const [creditHistory, setCreditHistory] = useState(null);
  const [greenScoreHistory, setGreenScoreHistory] = useState(null);
  // All report data
  const [kpiReports, setKpiReports] = useState([]);
  const [scorecardReports, setScorecardReports] = useState({});
  const [competitorReports, setCompetitorReports] = useState({});
  const [tenqReports, setTenqReports] = useState({});
  const [tenqYtd, setTenqYtd] = useState({});
  const [tenqTrend, setTenqTrend] = useState(null);
  const [tenqCompare, setTenqCompare] = useState({});
  const [intelReports, setIntelReports] = useState({});
  const [loadingIntelReports, setLoadingIntelReports] = useState(false);
  const [vmiData, setVmiData] = useState([]);
  // UI state
  const [activeTab, setActiveTab] = useState("kpi");
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [error, setError] = useState("");

  const router = useRouter();
  const params = useParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ==================== THEME CONFIGURATION ====================
  const theme = {
    bg: isDark ? "bg-gray-900" : "bg-white",
    bgSecondary: isDark ? "bg-gray-800/30" : "bg-gray-50",
    border: isDark ? "border-gray-700/50" : "border-gray-200",
    text: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-400" : "text-gray-600",
    textMuted: isDark ? "text-gray-500" : "text-gray-700",
    card: isDark
      ? "bg-gray-800/50 border-gray-700/50"
      : "bg-white border-gray-200",
    cardHover: isDark
      ? "hover:bg-gray-750 hover:border-gray-600"
      : "hover:bg-gray-50 hover:border-gray-300",
    table: isDark ? "bg-gray-800/50" : "bg-white",
    tableRow: isDark
      ? "divide-gray-700/30 hover:bg-gray-800/30"
      : "divide-gray-200 hover:bg-gray-50",
    tabActive: isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white",
    tabInactive: isDark
      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200",
  };

  // Helper functions for common patterns
  const getCardClass = () =>
    `${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"} border rounded-xl shadow-sm`;
  const getBgSecondaryClass = () => (isDark ? "bg-gray-700/30" : "bg-gray-100");
  const getTextSecondaryClass = () =>
    isDark ? "text-gray-400" : "text-gray-600";
  const getTextTertiaryClass = () =>
    isDark ? "text-gray-300" : "text-gray-700";

  // ==================== UTILITIES ====================
  const formatCurrency = (value, compact = false) => {
    if (value === null || value === undefined) return "—";
    if (compact) {
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return "—";
    const pct = value > 1 ? value : value * 100;
    return `${pct.toFixed(decimals)}%`;
  };

  // ==================== THEME COLOR HELPERS ====================
  const getThemeColor = (semantic) => {
    const colorMap = {
      blue: isDark ? "text-blue-400" : "text-blue-600",
      pink: isDark ? "text-pink-400" : "text-pink-600",
      amber: isDark ? "text-amber-400" : "text-amber-600",
      emerald: isDark ? "text-emerald-400" : "text-emerald-600",
      red: isDark ? "text-red-400" : "text-red-600",
      green: isDark ? "text-green-400" : "text-green-600",
      purple: isDark ? "text-purple-400" : "text-purple-600",
      cyan: isDark ? "text-cyan-400" : "text-cyan-600",
    };
    return colorMap[semantic] || colorMap.blue;
  };

  const getThemeBgColor = (semantic) => {
    const bgMap = {
      blue: isDark
        ? "bg-blue-500/15 border-blue-500/30"
        : "bg-blue-100 border-blue-300",
      pink: isDark
        ? "bg-pink-500/15 border-pink-500/30"
        : "bg-pink-100 border-pink-300",
      amber: isDark
        ? "bg-amber-500/15 border-amber-500/30"
        : "bg-amber-100 border-amber-300",
      emerald: isDark
        ? "bg-emerald-500/15 border-emerald-500/30"
        : "bg-emerald-100 border-emerald-300",
      red: isDark
        ? "bg-red-500/15 border-red-500/30"
        : "bg-red-100 border-red-300",
      green: isDark
        ? "bg-green-500/15 border-green-500/30"
        : "bg-green-100 border-green-300",
      purple: isDark
        ? "bg-purple-500/15 border-purple-500/30"
        : "bg-purple-100 border-purple-300",
      cyan: isDark
        ? "bg-cyan-500/15 border-cyan-500/30"
        : "bg-cyan-100 border-cyan-300",
    };
    return bgMap[semantic] || bgMap.blue;
  };

  const getScoreColorClass = (score, isCredit = false) => {
    if (isCredit) {
      if (score >= 850) return getThemeColor("emerald");
      if (score >= 750) return getThemeColor("blue");
      if (score >= 650) return getThemeColor("amber");
      return getThemeColor("red");
    }
    // Green score or other metrics
    if (score >= 80) return getThemeColor("emerald");
    if (score >= 60) return getThemeColor("green");
    if (score >= 40) return getThemeColor("amber");
    if (score >= 20) return getThemeColor("red");
    return getThemeColor("red");
  };

  const getCalendarQuarter = (q) => ((q - 1) % 4) + 1;
  const getSeason = (q) =>
    SEASON_CONFIG[getCalendarQuarter(q)] || SEASON_CONFIG[1];

  const getTrendIndicator = (current, previous) => {
    if (!previous || !current) return null;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    if (change > 0)
      return { direction: "up", value: change, color: "text-emerald-400" };
    if (change < 0)
      return {
        direction: "down",
        value: Math.abs(change),
        color: "text-red-400",
      };
    return { direction: "flat", value: 0, color: "text-gray-400" };
  };

  // ==================== AUTH & DATA LOADING ====================
  const getToken = () => localStorage.getItem("access_token");

  const loadAllData = async () => {
    try {
      const userRole = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");

      if (userRole !== "student") {
        router.push("/login");
        return;
      }

      const simResponse = await fetch(`${apiUrl}/simulations/${params.id}`, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });

      if (!simResponse.ok) {
        setError("Failed to load simulation");
        setLoading(false);
        return;
      }

      const simData = await simResponse.json();
      setSimulation(simData);

      let studentFirm = null;
      if (simData.firms && simData.firms.length > 0) {
        for (const f of simData.firms) {
          if (f.enrollments && f.enrollments.length > 0) {
            const userEnrollment = f.enrollments.find(
              (e) => e.user.id === userId,
            );
            if (userEnrollment) {
              studentFirm = f;
              setFirm(f);
              break;
            }
          }
        }
      }

      if (!studentFirm) {
        setError("Could not find your firm enrollment in this simulation");
        setLoading(false);
        return;
      }

      const kpiReports = await fetchKpiHistory(studentFirm.id);
      await fetchCreditHistory(studentFirm.id);
      const gsData = await fetchGreenScoreHistory(studentFirm.id);
      if (gsData) {
        setGreenScoreHistory(gsData);
      }
      // Fetch intelligence reports if feature is enabled
      console.log("Simulation features:", simData.features);
      console.log(
        "Intelligence Center enabled:",
        simData.features?.intelligenceCenter,
      );
      if (simData.features?.intelligenceCenter) {
        console.log("Fetching intelligence reports for firms:", simData.firms);
        await fetchAllIntelReports(simData.firms);
      } else {
        console.log("Intelligence Center feature is not enabled");
      }
      // Fetch VMI data if feature is enabled
      if (simData.features?.vmi) {
        console.log("Fetching VMI data for firm:", studentFirm.id);
        // Get the highest quarter from the reports that were just fetched
        const latestQuarter = kpiReports.length > 0 ? kpiReports[kpiReports.length - 1].quarter : null;
        console.log("Latest quarter from KPI reports:", latestQuarter);
        if (latestQuarter) {
          console.log("Calling fetchVmiData with:", { firmId: studentFirm.id, startQuarter: 1, endQuarter: latestQuarter });
          await fetchVmiData(studentFirm.id, 1, latestQuarter);
        } else {
          console.log("No latest quarter found in KPI reports");
        }
      } else {
        console.log("VMI feature is not enabled");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load reports data");
      setLoading(false);
    }
  };
  const fetchGreenScoreHistory = async (firmId, quarter = null) => {
    try {
      const url = quarter
        ? `${apiUrl}/simulations/${params.id}/firms/${firmId}/green-score?quarters=${quarter}`
        : `${apiUrl}/simulations/${params.id}/firms/${firmId}/green-score`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Error fetching green score history:", err);
    }
    return null;
  };
  const fetchCreditHistory = async (firmId) => {
    try {
      const response = await fetch(
        `${apiUrl}/simulations/${params.id}/firms/${firmId}/credit-history`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const history = Array.isArray(data.history) ? data.history : [];

        const summary = {
          currentTier: history[0]?.tierName || "N/A",
          currentScore: history[0]?.creditScore?.totalScore || 0,
          currentCreditLimit: history[0]?.creditLimit || 0,
          currentDebt: history[0]?.endingDebt || 0,
          utilizationRate:
            history[0] && history[0].creditLimit
              ? (history[0].endingDebt / history[0].creditLimit) * 100
              : 0,
          totalInterestPaid: history.reduce(
            (sum, h) => sum + (h.interestCharge || 0),
            0,
          ),
          totalOverlimitFees: history.reduce(
            (sum, h) => sum + (h.overlimitFee || 0),
            0,
          ),
          timesOverlimit: history.filter((h) => !!h.wasOverlimit).length,
          forcedSalesCount: history.filter((h) => !!h.forcedSaleTriggered)
            .length,
        };

        setCreditHistory({
          summary,
          history,
          creditScore: history[0]?.creditScore || null,
        });
      }
    } catch (err) {
      console.error("Error fetching credit history:", err);
    }
  };

  const fetchIntelReportsForFirm = async (firmId, quarter) => {
    try {
      const url = quarter
        ? `${apiUrl}/simulations/${params.id}/firms/${firmId}/intelligence-reports?quarter=${quarter}`
        : `${apiUrl}/simulations/${params.id}/firms/${firmId}/intelligence-reports`;
      console.log(`Fetching intelligence reports from: ${url}`);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      console.log(`Response status for ${firmId}:`, response.status);
      if (response.ok) {
        const data = await response.json();
        console.log(`Intelligence reports for ${firmId}:`, data);
        return data;
      } else {
        console.warn(
          `Failed to fetch intelligence reports for ${firmId}: ${response.status}`,
        );
      }
    } catch (err) {
      console.error(
        `Error fetching intelligence reports for firm ${firmId}:`,
        err,
      );
    }
    return null;
  };

  const fetchAllIntelReports = async (firms = null, quarter = null) => {
    const firmsToFetch = firms || simulation?.firms;
    console.log("Fetching intelligence reports for firms:", firmsToFetch);
    if (!firmsToFetch) {
      console.warn("No firms available to fetch intelligence reports");
      return;
    }
    setLoadingIntelReports(true);
    try {
      const reports = {};
      for (const firm of firmsToFetch) {
        const firmId = firm._id || firm.id;
        console.log(`Fetching intel reports for firm ${firmId}`);
        const data = await fetchIntelReportsForFirm(firmId, quarter);
        if (data) {
          reports[firmId] = data;
        }
      }
      console.log("All intelligence reports fetched:", reports);
      setIntelReports(reports);
    } catch (err) {
      console.error("Error fetching all intelligence reports:", err);
    } finally {
      setLoadingIntelReports(false);
    }
  };

  const fetchKpiHistory = async (firmId) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/kpi-history/${params.id}/${firmId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        },
      );

      if (response.ok) {
        const data = await response.json();
        // FIX: API returns array directly, not { history: [...] }
        const rawReports = Array.isArray(data) ? data : data.history || [];

        const reports = rawReports.map((kpi) => ({
          quarter: kpi.quarter,
          // Financial
          revenue: kpi.financial?.revenue || 0,
          netIncome: kpi.financial?.netIncome || 0,
          cash: kpi.financial?.cash || 0,
          grossMarginPct: kpi.financial?.grossMarginPct || 0,
          cogs: kpi.financial?.cogs || 0,
          operatingExpenses: kpi.financial?.operatingExpenses || 0,
          // Customer
          csi: kpi.customer?.csi || 0,
          marketShare: kpi.customer?.marketShare || 0,
          fillRate: kpi.customer?.fillRate || 0,
          returnRate: kpi.customer?.returnRate || 0,
          customersLoyal: kpi.customer?.customersLoyal || 0,
          customersInPlay: kpi.customer?.customersInPlay || 0,
          customersChurned: kpi.customer?.customersChurned || 0,
          // Operations
          perfectOrder: kpi.operations?.perfectOrder || 0,
          capacityUtilization: kpi.operations?.capacityUtilization || 0,
          defectRate: kpi.operations?.defectRate || 0,
          onTimeDelivery: kpi.operations?.onTimeDelivery || 0,
          mape: kpi.operations?.mape || 0,
          unitsProduced: kpi.operations?.unitsProduced || 0,
          unitsSold: kpi.operations?.unitsSold || 0,
          // Inventory
          rawMaterialUnits: kpi.inventory?.rawMaterialUnits || 0,
          finishedGoodsUnits: kpi.inventory?.finishedGoodsUnits || 0,
          inventoryValue: kpi.inventory?.inventoryValue || 0,
          inventoryTurnover: kpi.inventory?.inventoryTurnover || 0,
          weeksOfSupply: kpi.inventory?.weeksOfSupply || 0,
          retailerInventory: kpi.inventory?.retailerInventory || 0,
          // Learning
          techSystemsCount: kpi.learning?.techSystemsCount || 0,
          scMaturity: kpi.learning?.scMaturity || "BASIC",
          techInvestmentTotal: kpi.learning?.techInvestmentTotal || 0,
          forecastAccuracy: kpi.learning?.forecastAccuracy || 0,
          // BSC
          bscFinancial: kpi.bsc?.financial || 0,
          bscCustomer: kpi.bsc?.customer || 0,
          bscProcess: kpi.bsc?.process || 0,
          bscLearning: kpi.bsc?.learning || 0,
          bscOverall: kpi.bsc?.overall || 0,
          bscRank: kpi.bsc?.rank || 0,
          bscGrade: kpi.bsc?.grade || "N/A",
          // Costs breakdown
          laborCost: kpi.costs?.labor || 0,
          holdingCost: kpi.costs?.holding || 0,
          marketingCost: kpi.costs?.marketing || 0,
          qualityCost: kpi.costs?.quality || 0,
          freightCost: kpi.costs?.freight || 0,
          techMaintenanceCost: kpi.costs?.techMaintenance || 0,
          interestCost: kpi.costs?.interest || 0,
          // Meta
          createdAt: kpi.createdAt,
        }));

        // Sort by quarter ascending
        reports.sort((a, b) => a.quarter - b.quarter);

        if (reports.length > 0) {
          setKpiReports(reports);
          setSelectedQuarter(reports[reports.length - 1].quarter);

          // Fetch additional reports for each quarter
          for (const report of reports) {
            fetchScorecardReport(firmId, report.quarter);
            fetchCompetitorReport(firmId, report.quarter);
            fetchTenQReport(firmId, report.quarter);
            fetchTenQYtd(firmId, report.quarter);
            fetchTenQCompare(firmId, report.quarter);
          }
        }
        fetchTenQTrend(firmId);
        return reports;
      }
      return [];
    } catch (err) {
      console.error("Error fetching KPI history:", err);
      return [];
    }
  };
  const fetchTenQReport = async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqReports((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching quarterly report for Q${quarter}:`, err);
    }
  };

  const fetchTenQYtd = async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}/ytd`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqYtd((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching YTD for Q${quarter}:`, err);
    }
  };

  const fetchTenQTrend = async (firmId) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/trend`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqTrend(data);
      }
    } catch (err) {
      console.error("Error fetching financial trend:", err);
    }
  };

  const fetchTenQCompare = async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/tenq/${params.id}/${firmId}/${quarter}/compare`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (response.ok) {
        const data = await response.json();
        setTenqCompare((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching peer comparison for Q${quarter}:`, err);
    }
  };

  const fetchVmiData = async (firmId, startQuarter = 1, endQuarter = null) => {
    try {
      // Use provided endQuarter or default to 1
      const maxQuarter = endQuarter || 1;
      const url = `${apiUrl}/reports/vmi/${params.id}/${firmId}/${startQuarter}/${maxQuarter}`;
      
      console.log(`Fetching VMI data from: ${url}`);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Failed to load VMI data for firm ${firmId}:`, errData.message || response.statusText);
        return null;
      }

      const data = await response.json();
      console.log(`VMI data received for firm ${firmId}:`, data);
      
      if (data && data.trend && Array.isArray(data.trend)) {
        // Store the full trend array
        setVmiData(data.trend);
        return data.trend;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching VMI data for firm ${firmId}:`, err);
      return null;
    }
  };

  // Add this transformation function in your component
  const transformCompetitorData = (rawData) => {
    if (!rawData || !rawData.benchmarks) return null;

    const { benchmarks, currentFirmId, totalFirms } = rawData;

    // Build a map of firms with all their metrics
    const firmMap = {};

    // Process each benchmark type
    benchmarks.byRevenue?.forEach((item) => {
      if (!firmMap[item.firmId]) {
        firmMap[item.firmId] = {
          firmId: item.firmId,
          isCurrentFirm: item.isCurrentFirm,
        };
      }
      firmMap[item.firmId].revenue = item.revenue;
      firmMap[item.firmId].revenueRank = item.rank;
    });

    benchmarks.byMarketShare?.forEach((item) => {
      if (!firmMap[item.firmId]) {
        firmMap[item.firmId] = {
          firmId: item.firmId,
          isCurrentFirm: item.isCurrentFirm,
        };
      }
      firmMap[item.firmId].marketShare = item.marketShare;
      firmMap[item.firmId].marketShareRank = item.rank;
    });

    benchmarks.byCsi?.forEach((item) => {
      if (!firmMap[item.firmId]) {
        firmMap[item.firmId] = {
          firmId: item.firmId,
          isCurrentFirm: item.isCurrentFirm,
        };
      }
      firmMap[item.firmId].csi = item.csi;
      firmMap[item.firmId].csiRank = item.rank;
    });

    benchmarks.byFillRate?.forEach((item) => {
      if (!firmMap[item.firmId]) {
        firmMap[item.firmId] = {
          firmId: item.firmId,
          isCurrentFirm: item.isCurrentFirm,
        };
      }
      firmMap[item.firmId].fillRate = item.fillRate;
      firmMap[item.firmId].fillRateRank = item.rank;
    });

    // Convert to array and add firm names
    const competitors = Object.values(firmMap).map((firm, idx) => ({
      ...firm,
      firmName: firm.isCurrentFirm ? "Your Firm" : `Competitor ${idx + 1}`,
      rank: firm.revenueRank, // Use revenue rank as primary rank
    }));

    // Sort by revenue rank
    competitors.sort((a, b) => (a.rank || 99) - (b.rank || 99));

    return {
      competitors,
      totalFirms,
      currentFirmId,
    };
  };

  const fetchScorecardReport = async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/balanced-scorecard/${params.id}/${firmId}/${quarter}`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setScorecardReports((prev) => ({ ...prev, [quarter]: data }));
      }
    } catch (err) {
      console.error(`Error fetching scorecard for Q${quarter}:`, err);
    }
  };

  const fetchCompetitorReport = async (firmId, quarter) => {
    try {
      const response = await fetch(
        `${apiUrl}/reports/competitor-comparison/${params.id}/${firmId}/${quarter}`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const transformedData = transformCompetitorData(data);
        setCompetitorReports((prev) => ({
          ...prev,
          [quarter]: transformedData,
        }));
      }
    } catch (err) {
      console.error(`Error fetching competitor for Q${quarter}:`, err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [params.id]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/");
  };
  const getGreenScoreBracket = (score) => {
    if (score >= 80) return "EXCELLENT";
    if (score >= 60) return "GOOD";
    if (score >= 40) return "AVERAGE";
    if (score >= 20) return "BELOW_AVERAGE";
    return "POOR";
  };
  // Improved handleDownload10QReport function
  // Replace your existing handleDownload10QReport function with this one

  const handleDownload10QReport = async () => {
    if (!currentData || !selectedQuarter) return;

    try {
      const season = getSeason(selectedQuarter);
      const ytdData = tenqYtd[selectedQuarter];
      const compareData = tenqCompare[selectedQuarter];

      // Helper function for currency formatting in PDF
      const fmtCurrency = (val) => {
        if (val === null || val === undefined) return "$0";
        const absVal = Math.abs(val);
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(absVal);
        return val < 0 ? `(${formatted})` : formatted;
      };

      const fmtNumber = (val) => {
        if (val === null || val === undefined) return "0";
        return new Intl.NumberFormat("en-US").format(Math.round(val));
      };

      const fmtPercent = (val) => {
        if (val === null || val === undefined) return "0%";
        const pct = val > 1 ? val : val * 100;
        return `${pct.toFixed(0)}%`;
      };

      // Calculate YTD totals from kpiReports
      const ytdTotals = kpiReports.reduce(
        (acc, r) => ({
          revenue: acc.revenue + (r.revenue || 0),
          cogs: acc.cogs + (r.cogs || 0),
          laborCost: acc.laborCost + (r.laborCost || 0),
          holdingCost: acc.holdingCost + (r.holdingCost || 0),
          marketingCost: acc.marketingCost + (r.marketingCost || 0),
          techMaintenanceCost:
            acc.techMaintenanceCost + (r.techMaintenanceCost || 0),
          qualityCost: acc.qualityCost + (r.qualityCost || 0),
          freightCost: acc.freightCost + (r.freightCost || 0),
          operatingExpenses: acc.operatingExpenses + (r.operatingExpenses || 0),
          interestCost: acc.interestCost + (r.interestCost || 0),
          netIncome: acc.netIncome + (r.netIncome || 0),
          unitsProduced: acc.unitsProduced + (r.unitsProduced || 0),
          unitsSold: acc.unitsSold + (r.unitsSold || 0),
        }),
        {
          revenue: 0,
          cogs: 0,
          laborCost: 0,
          holdingCost: 0,
          marketingCost: 0,
          techMaintenanceCost: 0,
          qualityCost: 0,
          freightCost: 0,
          operatingExpenses: 0,
          interestCost: 0,
          netIncome: 0,
          unitsProduced: 0,
          unitsSold: 0,
        },
      );

      // Calculate derived values for each quarter
      const quarterlyData = kpiReports.map((r) => ({
        quarter: r.quarter,
        revenue: r.revenue || 0,
        cogs: r.cogs || 0,
        grossMargin: (r.revenue || 0) - (r.cogs || 0),
        laborCost: r.laborCost || 0,
        holdingCost: r.holdingCost || 0,
        marketingCost: r.marketingCost || 0,
        techMaintenanceCost: r.techMaintenanceCost || 0,
        qualityCost: r.qualityCost || 0,
        freightCost: r.freightCost || 0,
        totalOpex:
          (r.laborCost || 0) +
          (r.holdingCost || 0) +
          (r.marketingCost || 0) +
          (r.techMaintenanceCost || 0) +
          (r.qualityCost || 0) +
          (r.freightCost || 0),
        operatingIncome:
          (r.revenue || 0) -
          (r.cogs || 0) -
          ((r.laborCost || 0) +
            (r.holdingCost || 0) +
            (r.marketingCost || 0) +
            (r.techMaintenanceCost || 0) +
            (r.qualityCost || 0) +
            (r.freightCost || 0)),
        interestCost: r.interestCost || 0,
        netIncome: r.netIncome || 0,
        cash: r.cash || 0,
        inventoryValue: r.inventoryValue || 0,
        rawMaterialUnits: r.rawMaterialUnits || 0,
        finishedGoodsUnits: r.finishedGoodsUnits || 0,
        retailerInventory: r.retailerInventory || 0,
        inventoryTurnover: r.inventoryTurnover || 0,
        weeksOfSupply: r.weeksOfSupply || 0,
        unitsProduced: r.unitsProduced || 0,
        unitsSold: r.unitsSold || 0,
        fillRate: r.fillRate || 0,
        csi: r.csi || 0,
        marketShare: r.marketShare || 0,
        perfectOrder: r.perfectOrder || 0,
        forecastAccuracy: r.forecastAccuracy || 0,
      }));

      // Calculate YTD derived values
      const ytdGrossMargin = ytdTotals.revenue - ytdTotals.cogs;
      const ytdTotalOpex =
        ytdTotals.laborCost +
        ytdTotals.holdingCost +
        ytdTotals.marketingCost +
        ytdTotals.techMaintenanceCost +
        ytdTotals.qualityCost +
        ytdTotals.freightCost;
      const ytdOperatingIncome = ytdGrossMargin - ytdTotalOpex;

      // Build quarterly columns for tables
      const quarterHeaders = quarterlyData
        .map(
          (q) =>
            `<th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600;">Q${q.quarter}</th>`,
        )
        .join("");

      // Income Statement rows builder
      const buildIncomeRow = (
        label,
        values,
        isTotal = false,
        isSubtotal = false,
        indent = false,
      ) => {
        const style = isTotal
          ? "font-weight: bold; background-color: #f0f0f0;"
          : isSubtotal
            ? "font-weight: 600; background-color: #f8f8f8;"
            : "";
        const labelStyle = indent ? "padding-left: 20px; color: #555;" : "";
        return `
        <tr style="${style}">
          <td style="padding: 6px 12px; border-bottom: 1px solid #ddd; ${labelStyle}">${label}</td>
          ${values.map((v) => `<td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #ddd; font-family: 'Courier New', monospace;">${v}</td>`).join("")}
        </tr>
      `;
      };

      const element = document.createElement("div");
      element.style.padding = "20px";
      element.style.backgroundColor = "white";
      element.style.color = "#000";

      const htmlContent = `
      <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.4; max-width: 900px; margin: 0 auto; font-size: 11px;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">FORM 10-Q QUARTERLY REPORT</h1>
          <h2 style="margin: 8px 0 0 0; font-size: 16px; font-weight: bold;">${firm?.name || "FIRM"}</h2>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #444;">
            For the Quarter Ended Q${selectedQuarter} • ${season.name} ${season.icon}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">
            ${simulation?.name || "FLEXEE Supply Chain Simulation"}
          </p>
        </div>

        <!-- INCOME STATEMENT -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            CONSOLIDATED STATEMENTS OF OPERATIONS
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
                ${quarterHeaders}
                <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">YTD</th>
              </tr>
            </thead>
            <tbody>
              ${buildIncomeRow(
                "Net Revenue",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.revenue)),
                  fmtCurrency(ytdTotals.revenue),
                ],
                false,
                true,
              )}
              ${buildIncomeRow(
                "Cost of Goods Sold",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.cogs)),
                  fmtCurrency(ytdTotals.cogs),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Gross Margin",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.grossMargin)),
                  fmtCurrency(ytdGrossMargin),
                ],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px; font-size: 8px;"></td></tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">OPERATING EXPENSES</td>
              </tr>
              ${buildIncomeRow(
                "Labor Costs",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.laborCost)),
                  fmtCurrency(ytdTotals.laborCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Holding Costs",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.holdingCost)),
                  fmtCurrency(ytdTotals.holdingCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Marketing Expense",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.marketingCost)),
                  fmtCurrency(ytdTotals.marketingCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Technology Maintenance",
                [
                  ...quarterlyData.map((q) =>
                    fmtCurrency(q.techMaintenanceCost),
                  ),
                  fmtCurrency(ytdTotals.techMaintenanceCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Quality Costs",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.qualityCost)),
                  fmtCurrency(ytdTotals.qualityCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Freight Costs",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.freightCost)),
                  fmtCurrency(ytdTotals.freightCost),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Total OPEX",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.totalOpex)),
                  fmtCurrency(ytdTotalOpex),
                ],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 2px;"></td></tr>
              ${buildIncomeRow(
                "Operating Income",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.operatingIncome)),
                  fmtCurrency(ytdOperatingIncome),
                ],
                false,
                true,
              )}
              ${buildIncomeRow(
                "Interest Expense",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.interestCost)),
                  fmtCurrency(ytdTotals.interestCost),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Net Income",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.netIncome)),
                  fmtCurrency(ytdTotals.netIncome),
                ],
                true,
              )}
            </tbody>
          </table>
        </div>

        <!-- CASH FLOW STATEMENT -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            CONSOLIDATED STATEMENTS OF CASH FLOWS
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
                ${quarterHeaders}
                <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">YTD</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Operating Activities:</td>
              </tr>
              ${buildIncomeRow(
                "Net Income",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.netIncome)),
                  fmtCurrency(ytdTotals.netIncome),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Depreciation",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Working Capital Changes",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Cash from Operations",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.netIncome)),
                  fmtCurrency(ytdTotals.netIncome),
                ],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Investing Activities:</td>
              </tr>
              ${buildIncomeRow(
                "Technology Purchases",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Cash from Investing",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Financing Activities:</td>
              </tr>
              ${buildIncomeRow(
                "Net Borrowing/(Repayment)",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Cash from Financing",
                [...quarterlyData.map(() => "$0"), "$0"],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              ${buildIncomeRow(
                "Net Change in Cash",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.netIncome)),
                  fmtCurrency(ytdTotals.netIncome),
                ],
                false,
                true,
              )}
              ${buildIncomeRow(
                "Ending Cash",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.cash)),
                  fmtCurrency(currentData.cash),
                ],
                true,
              )}
            </tbody>
          </table>
        </div>

        <!-- BALANCE SHEET -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            CONSOLIDATED BALANCE SHEETS
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
                ${quarterHeaders}
                <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">Current</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Assets:</td>
              </tr>
              ${buildIncomeRow(
                "Cash",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.cash)),
                  fmtCurrency(currentData.cash),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Inventory Value ($)",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.inventoryValue)),
                  fmtCurrency(currentData.inventoryValue),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Total Current Assets",
                [
                  ...quarterlyData.map((q) =>
                    fmtCurrency(q.cash + q.inventoryValue),
                  ),
                  fmtCurrency(currentData.cash + currentData.inventoryValue),
                ],
                false,
                true,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Liabilities & Equity:</td>
              </tr>
              ${buildIncomeRow(
                "Total Assets",
                [
                  ...quarterlyData.map((q) =>
                    fmtCurrency(q.cash + q.inventoryValue),
                  ),
                  fmtCurrency(currentData.cash + currentData.inventoryValue),
                ],
                true,
              )}
            </tbody>
          </table>
        </div>

        <!-- INVENTORY REPORT -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            INVENTORY REPORT
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Item</th>
                ${quarterHeaders}
                <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">Current</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Raw Materials:</td>
              </tr>
              ${buildIncomeRow(
                "Units",
                [
                  ...quarterlyData.map((q) => fmtNumber(q.rawMaterialUnits)),
                  fmtNumber(currentData.rawMaterialUnits),
                ],
                false,
                false,
                true,
              )}
              <tr style="background-color: #f9f9f9;">
                <td colspan="${quarterlyData.length + 2}" style="padding: 6px 12px; font-weight: 600; font-size: 10px;">Finished Goods:</td>
              </tr>
              ${buildIncomeRow(
                "Units",
                [
                  ...quarterlyData.map((q) => fmtNumber(q.finishedGoodsUnits)),
                  fmtNumber(currentData.finishedGoodsUnits),
                ],
                false,
                false,
                true,
              )}
              ${buildIncomeRow(
                "Retailer Inventory",
                [
                  ...quarterlyData.map((q) => fmtNumber(q.retailerInventory)),
                  fmtNumber(currentData.retailerInventory),
                ],
                false,
                false,
                false,
              )}
              <tr><td colspan="${quarterlyData.length + 2}" style="padding: 4px;"></td></tr>
              ${buildIncomeRow(
                "Total Inventory Value",
                [
                  ...quarterlyData.map((q) => fmtCurrency(q.inventoryValue)),
                  fmtCurrency(currentData.inventoryValue),
                ],
                false,
                true,
              )}
              ${buildIncomeRow(
                "Inventory Turnover",
                [
                  ...quarterlyData.map(
                    (q) => q.inventoryTurnover?.toFixed(1) || "0",
                  ),
                  currentData.inventoryTurnover?.toFixed(1) || "0",
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Weeks of Supply",
                [
                  ...quarterlyData.map(
                    (q) => q.weeksOfSupply?.toFixed(1) || "0",
                  ),
                  currentData.weeksOfSupply?.toFixed(1) || "0",
                ],
                false,
                false,
                false,
              )}
            </tbody>
          </table>
        </div>

        <!-- KEY METRICS -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            KEY PERFORMANCE METRICS
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: 600; width: 200px;">Metric</th>
                ${quarterHeaders}
                <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #333; font-weight: 600; background-color: #e8e8e8;">YTD/Avg</th>
              </tr>
            </thead>
            <tbody>
              ${buildIncomeRow(
                "Units Produced",
                [
                  ...quarterlyData.map((q) => fmtNumber(q.unitsProduced)),
                  fmtNumber(ytdTotals.unitsProduced),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Units Sold",
                [
                  ...quarterlyData.map((q) => fmtNumber(q.unitsSold)),
                  fmtNumber(ytdTotals.unitsSold),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Fill Rate",
                [
                  ...quarterlyData.map((q) => fmtPercent(q.fillRate)),
                  fmtPercent(
                    quarterlyData.reduce((a, q) => a + q.fillRate, 0) /
                      quarterlyData.length,
                  ),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "CSI Score",
                [
                  ...quarterlyData.map((q) => q.csi?.toFixed(0) || "0"),
                  (
                    quarterlyData.reduce((a, q) => a + (q.csi || 0), 0) /
                    quarterlyData.length
                  ).toFixed(1),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Market Share",
                [
                  ...quarterlyData.map((q) => fmtPercent(q.marketShare)),
                  fmtPercent(
                    quarterlyData.reduce((a, q) => a + q.marketShare, 0) /
                      quarterlyData.length,
                  ),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Perfect Order",
                [
                  ...quarterlyData.map((q) => fmtPercent(q.perfectOrder)),
                  fmtPercent(
                    quarterlyData.reduce((a, q) => a + q.perfectOrder, 0) /
                      quarterlyData.length,
                  ),
                ],
                false,
                false,
                false,
              )}
              ${buildIncomeRow(
                "Forecast Accuracy",
                [
                  ...quarterlyData.map((q) => fmtPercent(q.forecastAccuracy)),
                  fmtPercent(
                    quarterlyData.reduce((a, q) => a + q.forecastAccuracy, 0) /
                      quarterlyData.length,
                  ),
                ],
                false,
                false,
                false,
              )}
            </tbody>
          </table>
        </div>

        <!-- BALANCED SCORECARD SUMMARY -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px;">
            BALANCED SCORECARD - Q${selectedQuarter}
          </h3>
          <table style="width: 50%; border-collapse: collapse; font-size: 11px;">
            <tbody>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Overall Score</td>
                <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">${currentData.bscOverall?.toFixed(1) || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Grade</td>
                <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">${currentData.bscGrade || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: 600;">Industry Rank</td>
                <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px;">#${currentData.bscRank || "—"}</td>
              </tr>
              <tr><td colspan="2" style="padding: 4px;"></td></tr>
              <tr>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">Financial Perspective</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${currentData.bscFinancial?.toFixed(0) || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">Customer Perspective</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${currentData.bscCustomer?.toFixed(0) || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">Internal Process</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${currentData.bscProcess?.toFixed(0) || "0"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">Learning & Growth</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd; text-align: right; font-family: 'Courier New', monospace;">${currentData.bscLearning?.toFixed(0) || "0"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; text-align: center; font-size: 9px; color: #666;">
          <p style="margin: 0;">
            <strong>FLEXEE 2.0</strong> Supply Chain Management Simulation
          </p>
          <p style="margin: 4px 0 0 0;">
            Report Generated: ${new Date().toLocaleString()} | This report is for educational purposes only.
          </p>
        </div>
      </div>
    `;

      element.innerHTML = htmlContent;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `10-Q_${firm?.name?.replace(/\s+/g, "_") || "Firm"}_Q${selectedQuarter}_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error downloading 10-Q report:", error);
      setError("Failed to download report. Please try again.");
    }
  };

  const createSimplePDF = () => {
    const content = `
FORM 10-Q QUARTERLY REPORT
${"=".repeat(60)}

Company: ${firm?.name || "Company Name"}
Quarter: Q${selectedQuarter} - ${SEASON_CONFIG[getCalendarQuarter(selectedQuarter)]?.name || ""}
Report Date: ${new Date().toLocaleDateString()}

FINANCIAL HIGHLIGHTS
${"=".repeat(60)}
Revenue:                    $${currentData.revenue?.toLocaleString() || 0}
Cost of Goods Sold:         $${currentData.cogs?.toLocaleString() || 0}
Gross Profit:               $${((currentData.revenue || 0) - (currentData.cogs || 0)).toLocaleString()}
Operating Expenses:         $${currentData.operatingExpenses?.toLocaleString() || 0}
Net Income:                 $${currentData.netIncome?.toLocaleString() || 0}

BALANCE SHEET
${"=".repeat(60)}
Total Assets:               $${currentData.totalAssets?.toLocaleString() || 0}
Total Liabilities:          $${currentData.totalLiabilities?.toLocaleString() || 0}
Stockholders' Equity:       $${currentData.equity?.toLocaleString() || 0}

KEY METRICS
${"=".repeat(60)}
Units Sold:                 ${currentData.unitsSold?.toLocaleString() || 0}
Fill Rate:                  ${(currentData.fillRate * 100)?.toFixed(1)}%
Customer Satisfaction:      ${currentData.csi?.toFixed(1)}
Market Share:               ${(currentData.marketShare * 100)?.toFixed(2)}%
Capacity Utilization:       ${(currentData.capacityUtilization * 100)?.toFixed(1)}%

Generated on: ${new Date().toLocaleString()}
FLEXEE 2.0 Business Simulation
    `;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `10-Q_Q${selectedQuarter}_${firm?.name?.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  // Get current and previous quarter data
  const currentData = kpiReports.find((r) => r.quarter === selectedQuarter);
  const previousData = kpiReports.find(
    (r) => r.quarter === selectedQuarter - 1,
  );
  const latestQuarter =
    kpiReports.length > 0 ? kpiReports[kpiReports.length - 1].quarter : 0;

  // ==================== COMPONENTS ====================

  // Metric Card for KPI Dashboard
  const MetricCard = ({
    label,
    value,
    previousValue,
    format = "currency",
    icon,
    highlight = false,
  }) => {
    const trend = getTrendIndicator(
      typeof value === "number" ? value : 0,
      typeof previousValue === "number" ? previousValue : null,
    );

    let displayValue = value;
    if (format === "currency") displayValue = formatCurrency(value, true);
    else if (format === "percent") displayValue = formatPercent(value);
    else if (format === "number") displayValue = formatNumber(value);

    return (
      <div
        className={`p-4 rounded-lg border ${highlight ? (isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200") : theme.card}`}
      >
        <div className="flex items-start justify-between mb-2">
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} uppercase tracking-wide`}
          >
            {label}
          </span>
          {icon && <span className="text-lg opacity-60">{icon}</span>}
        </div>
        <div className="flex items-end gap-2">
          <span
            className={`text-2xl font-bold ${highlight ? (isDark ? "text-blue-400" : "text-blue-600") : isDark ? "text-white" : "text-gray-900"}`}
          >
            {displayValue}
          </span>
          {trend && (
            <span
              className={`text-xs ${trend.color || (isDark ? "text-gray-400" : "text-gray-600")} flex items-center gap-0.5 mb-1`}
            >
              {trend.direction === "up"
                ? "↑"
                : trend.direction === "down"
                  ? "↓"
                  : "→"}
              {trend.value.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  // Data Table Row
  const TableRow = ({
    label,
    values,
    format = "currency",
    highlight = false,
  }) => {
    return (
      <tr
        className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} ${highlight ? (isDark ? "bg-blue-500/5" : "bg-blue-50") : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"}`}
      >
        <td
          className={`py-3 px-4 text-sm ${highlight ? (isDark ? "font-semibold text-white" : "font-semibold text-gray-900") : isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {label}
        </td>
        {values.map((val, idx) => {
          let displayVal = val;
          if (format === "currency") displayVal = formatCurrency(val);
          else if (format === "percent") displayVal = formatPercent(val);
          else if (format === "number") displayVal = formatNumber(val);

          return (
            <td
              key={idx}
              className={`py-3 px-4 text-sm text-right font-mono ${highlight ? (isDark ? "font-semibold text-white" : "font-semibold text-gray-900") : isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {displayVal}
            </td>
          );
        })}
      </tr>
    );
  };

  // Progress Bar
  const ProgressBar = ({
    value,
    max = 100,
    color = "blue",
    showLabel = true,
  }) => {
    const pct = Math.min((value / max) * 100, 100);
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-emerald-500",
      yellow: "bg-amber-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
    };

    return (
      <div className="flex items-center gap-3">
        <div
          className={`flex-1 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
        >
          <div
            className={`h-full ${colorClasses[color]} rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {showLabel && (
          <span
            className={`text-sm font-mono ${isDark ? "text-gray-300" : "text-gray-700"} w-16 text-right`}
          >
            {formatPercent(value / 100)}
          </span>
        )}
      </div>
    );
  };

  // Quarter Selector Pills
  const QuarterSelector = () => (
    <div
      className={`flex items-center gap-1 p-1 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg`}
    >
      {kpiReports.map((report) => {
        const season = getSeason(report.quarter);
        const isSelected = selectedQuarter === report.quarter;
        return (
          <button
            key={report.quarter}
            onClick={() => setSelectedQuarter(report.quarter)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-lg"
                : isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-300"
            }`}
          >
            <span className="mr-1.5">{season.icon}</span>Q{report.quarter}
          </button>
        );
      })}
    </div>
  );

  // ==================== TAB CONTENT ====================

  // KPI Dashboard Tab
  const KPIDashboard = () => {
    if (!currentData) return null;

    return (
      <div className="space-y-6">
        {/* Top KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Revenue"
            value={currentData.revenue}
            previousValue={previousData?.revenue}
            icon="💰"
            highlight
          />
          <MetricCard
            label="Net Income"
            value={currentData.netIncome}
            previousValue={previousData?.netIncome}
            icon="📈"
          />
          <MetricCard
            label="Cash Balance"
            value={currentData.cash}
            previousValue={previousData?.cash}
            icon="🏦"
          />
          <MetricCard
            label="Gross Margin"
            value={currentData.grossMarginPct}
            previousValue={previousData?.grossMarginPct}
            format="percent"
            icon="📊"
          />
          <MetricCard
            label="CSI Score"
            value={currentData.csi}
            previousValue={previousData?.csi}
            format="number"
            icon="⭐"
            highlight
          />
          <MetricCard
            label="Market Share"
            value={currentData.marketShare * 100}
            previousValue={previousData?.marketShare * 100}
            format="percent"
            icon="🎯"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className={`${getCardClass()} p-5`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span> Operations Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={getTextSecondaryClass()}>Fill Rate</span>
                  <span className="text-emerald-400 font-medium">
                    {formatPercent(currentData.fillRate)}
                  </span>
                </div>
                <ProgressBar
                  value={currentData.fillRate * 100}
                  color="green"
                  showLabel={false}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={getTextSecondaryClass()}>
                    On-Time Delivery
                  </span>
                  <span className="text-blue-400 font-medium">
                    {formatPercent(currentData.onTimeDelivery)}
                  </span>
                </div>
                <ProgressBar
                  value={currentData.onTimeDelivery * 100}
                  color="blue"
                  showLabel={false}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Perfect Order</span>
                  <span className="text-purple-400 font-medium">
                    {formatPercent(currentData.perfectOrder)}
                  </span>
                </div>
                <ProgressBar
                  value={currentData.perfectOrder * 100}
                  color="purple"
                  showLabel={false}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Capacity Utilization</span>
                  <span className="text-amber-400 font-medium">
                    {formatPercent(currentData.capacityUtilization)}
                  </span>
                </div>
                <ProgressBar
                  value={currentData.capacityUtilization * 100}
                  color="yellow"
                  showLabel={false}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Defect Rate</span>
                  <span className="text-red-400 font-medium">
                    {formatPercent(currentData.defectRate)}
                  </span>
                </div>
                <ProgressBar
                  value={currentData.defectRate * 100}
                  max={10}
                  color="red"
                  showLabel={false}
                />
              </div>
            </div>
          </div>

          {/* Balanced Scorecard Summary */}
          <div className={`${getCardClass()} p-5`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📋</span> Balanced Scorecard
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className={`text-center p-4 ${getBgSecondaryClass()} rounded-lg`}
              >
                <div className="text-3xl font-bold text-blue-400">
                  {currentData.bscOverall.toFixed(1)}
                </div>
                <div className={`text-xs ${getTextSecondaryClass()} mt-1`}>
                  Overall Score
                </div>
              </div>
              <div
                className={`text-center p-4 ${getBgSecondaryClass()} rounded-lg`}
              >
                <div className="text-3xl font-bold text-amber-400">
                  {currentData.bscGrade}
                </div>
                <div className={`text-xs ${getTextSecondaryClass()} mt-1`}>
                  Grade
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Financial
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${currentData.bscFinancial}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {currentData.bscFinancial.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Customer
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${currentData.bscCustomer}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {currentData.bscCustomer.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Process
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${currentData.bscProcess}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {currentData.bscProcess.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Learning
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-32 h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${currentData.bscLearning}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {currentData.bscLearning.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300"} flex justify-between items-center`}
            >
              <span className={`text-sm ${getTextSecondaryClass()}`}>
                Industry Rank
              </span>
              <span className="text-xl font-bold text-white">
                #{currentData.bscRank}
              </span>
            </div>
          </div>
        </div>

        {/* Trend Table */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Quarterly Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase tracking-wide`}
                  >
                    Metric
                  </th>
                  {kpiReports.map((r) => (
                    <th
                      key={r.quarter}
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase tracking-wide`}
                    >
                      Q{r.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRow
                  label="Revenue"
                  values={kpiReports.map((r) => r.revenue)}
                  format="currency"
                  highlight
                />
                <TableRow
                  label="Net Income"
                  values={kpiReports.map((r) => r.netIncome)}
                  format="currency"
                />
                <TableRow
                  label="Gross Margin %"
                  values={kpiReports.map((r) => r.grossMarginPct)}
                  format="percent"
                />
                <TableRow
                  label="CSI Score"
                  values={kpiReports.map((r) => r.csi)}
                  format="number"
                  highlight
                />
                <TableRow
                  label="Units Sold"
                  values={kpiReports.map((r) => r.unitsSold)}
                  format="number"
                />
                <TableRow
                  label="Fill Rate"
                  values={kpiReports.map((r) => r.fillRate * 100)}
                  format="percent"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Financial Tab
  const FinancialTab = () => {
    if (!currentData) return null;

    return (
      <div className="space-y-6">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue"
            value={currentData.revenue}
            previousValue={previousData?.revenue}
            icon="💰"
            highlight
          />
          <MetricCard
            label="COGS"
            value={currentData.cogs}
            previousValue={previousData?.cogs}
            icon="🏭"
          />
          <MetricCard
            label="Operating Expenses"
            value={currentData.operatingExpenses}
            previousValue={previousData?.operatingExpenses}
            icon="📋"
          />
          <MetricCard
            label="Net Income"
            value={currentData.netIncome}
            previousValue={previousData?.netIncome}
            icon="📈"
            highlight
          />
        </div>

        {/* P&L Statement Style */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
          >
            <h3 className="text-lg font-semibold">
              Income Statement - Q{selectedQuarter}
            </h3>
            <span className={`text-sm ${getTextSecondaryClass()}`}>
              {firm?.name}
            </span>
          </div>
          <div className="p-5">
            <table className="w-full">
              <tbody
                className={`divide-y ${isDark ? "divide-gray-700/30" : "divide-gray-200"}`}
              >
                <tr className={isDark ? "bg-blue-500/5" : "bg-blue-50"}>
                  <td
                    className={`py-3 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Revenue
                  </td>
                  <td
                    className={`py-3 text-sm text-right font-mono font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  >
                    {formatCurrency(currentData.revenue)}
                  </td>
                </tr>
                <tr>
                  <td
                    className={`py-3 text-sm ${getTextSecondaryClass()} pl-4`}
                  >
                    Less: Cost of Goods Sold
                  </td>
                  <td className="py-3 text-sm text-right font-mono text-red-400">
                    ({formatCurrency(currentData.cogs)})
                  </td>
                </tr>
                <tr className={isDark ? "bg-gray-700/20" : "bg-gray-100"}>
                  <td
                    className={`py-3 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Gross Profit
                  </td>
                  <td
                    className={`py-3 text-sm text-right font-mono ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatCurrency(currentData.revenue - currentData.cogs)}
                  </td>
                </tr>
                <tr>
                  <td
                    className={`py-3 text-sm ${getTextSecondaryClass()} pl-4`}
                  >
                    Gross Margin %
                  </td>
                  <td
                    className={`py-3 text-sm text-right font-mono ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {formatPercent(currentData.grossMarginPct)}
                  </td>
                </tr>
                <tr>
                  <td
                    className={`py-3 text-sm ${getTextSecondaryClass()} pl-4`}
                  >
                    Less: Operating Expenses
                  </td>
                  <td className="py-3 text-sm text-right font-mono text-red-400">
                    ({formatCurrency(currentData.operatingExpenses)})
                  </td>
                </tr>
                <tr className={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}>
                  <td
                    className={`py-3 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Net Income
                  </td>
                  <td
                    className={`py-3 text-sm text-right font-mono font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                  >
                    {formatCurrency(currentData.netIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Cost Breakdown</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Labor",
                  value: currentData.laborCost,
                  color: "bg-blue-500",
                },
                {
                  label: "Holding",
                  value: currentData.holdingCost,
                  color: "bg-purple-500",
                },
                {
                  label: "Marketing",
                  value: currentData.marketingCost,
                  color: "bg-pink-500",
                },
                {
                  label: "Quality",
                  value: currentData.qualityCost,
                  color: "bg-amber-500",
                },
                {
                  label: "Freight",
                  value: currentData.freightCost,
                  color: "bg-emerald-500",
                },
                {
                  label: "Tech Maintenance",
                  value: currentData.techMaintenanceCost,
                  color: "bg-cyan-500",
                },
                {
                  label: "Interest",
                  value: currentData.interestCost,
                  color: "bg-red-500",
                },
              ].map((cost) => (
                <div
                  key={cost.label}
                  className={`p-3 ${getBgSecondaryClass()} rounded-lg`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${cost.color}`} />
                    <span className={`text-xs ${getTextSecondaryClass()}`}>
                      {cost.label}
                    </span>
                  </div>
                  <div className="text-lg font-semibold font-mono">
                    {formatCurrency(cost.value, true)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Trend */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Financial Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                  >
                    Metric
                  </th>
                  {kpiReports.map((r) => (
                    <th
                      key={r.quarter}
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Q{r.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRow
                  label="Revenue"
                  values={kpiReports.map((r) => r.revenue)}
                  format="currency"
                  highlight
                />
                <TableRow
                  label="COGS"
                  values={kpiReports.map((r) => r.cogs)}
                  format="currency"
                />
                <TableRow
                  label="Gross Profit"
                  values={kpiReports.map((r) => r.revenue - r.cogs)}
                  format="currency"
                />
                <TableRow
                  label="Gross Margin %"
                  values={kpiReports.map((r) => r.grossMarginPct)}
                  format="percent"
                />
                <TableRow
                  label="Operating Expenses"
                  values={kpiReports.map((r) => r.operatingExpenses)}
                  format="currency"
                />
                <TableRow
                  label="Net Income"
                  values={kpiReports.map((r) => r.netIncome)}
                  format="currency"
                  highlight
                />
                <TableRow
                  label="Cash Balance"
                  values={kpiReports.map((r) => r.cash)}
                  format="currency"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Operations Tab
  const OperationsTab = () => {
    if (!currentData) return null;

    return (
      <div className="space-y-6">
        {/* Operations KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Units Produced"
            value={currentData.unitsProduced}
            previousValue={previousData?.unitsProduced}
            format="number"
            icon="🏭"
          />
          <MetricCard
            label="Units Sold"
            value={currentData.unitsSold}
            previousValue={previousData?.unitsSold}
            format="number"
            icon="📦"
            highlight
          />
          <MetricCard
            label="Fill Rate"
            value={currentData.fillRate * 100}
            previousValue={previousData?.fillRate * 100}
            format="percent"
            icon="✅"
          />
          <MetricCard
            label="On-Time Delivery"
            value={currentData.onTimeDelivery * 100}
            previousValue={previousData?.onTimeDelivery * 100}
            format="percent"
            icon="🚚"
          />
          <MetricCard
            label="Perfect Order"
            value={currentData.perfectOrder * 100}
            previousValue={previousData?.perfectOrder * 100}
            format="percent"
            icon="⭐"
          />
          <MetricCard
            label="Defect Rate"
            value={currentData.defectRate * 100}
            previousValue={previousData?.defectRate * 100}
            format="percent"
            icon="⚠️"
          />
        </div>

        {/* Performance Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${getCardClass()} p-5`}>
            <h3 className="text-lg font-semibold mb-4">Production Metrics</h3>
            <div className="space-y-4">
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Capacity Utilization
                </span>
                <span className="text-xl font-bold text-amber-400">
                  {formatPercent(currentData.capacityUtilization)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Forecast Accuracy (MAPE)
                </span>
                <span className="text-xl font-bold text-blue-400">
                  {formatPercent(1 - currentData.mape)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Production vs Sales
                </span>
                <span
                  className={`text-xl font-bold ${currentData.unitsProduced >= currentData.unitsSold ? "text-emerald-400" : "text-red-400"}`}
                >
                  {(
                    (currentData.unitsProduced / currentData.unitsSold) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className={`${getCardClass()} p-5`}>
            <h3 className="text-lg font-semibold mb-4">Customer Metrics</h3>
            <div className="space-y-4">
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Loyal Customers
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatNumber(currentData.customersLoyal)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Customers In Play
                </span>
                <span className="text-xl font-bold text-amber-400">
                  {formatNumber(currentData.customersInPlay)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Customers Churned
                </span>
                <span className="text-xl font-bold text-red-400">
                  {formatNumber(currentData.customersChurned)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <span className={`text-sm ${getTextSecondaryClass()}`}>
                  Return Rate
                </span>
                <span className="text-xl font-bold text-red-400">
                  {formatPercent(currentData.returnRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operations Trend */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Operations Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                  >
                    Metric
                  </th>
                  {kpiReports.map((r) => (
                    <th
                      key={r.quarter}
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Q{r.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRow
                  label="Units Produced"
                  values={kpiReports.map((r) => r.unitsProduced)}
                  format="number"
                />
                <TableRow
                  label="Units Sold"
                  values={kpiReports.map((r) => r.unitsSold)}
                  format="number"
                  highlight
                />
                <TableRow
                  label="Fill Rate"
                  values={kpiReports.map((r) => r.fillRate * 100)}
                  format="percent"
                />
                <TableRow
                  label="On-Time Delivery"
                  values={kpiReports.map((r) => r.onTimeDelivery * 100)}
                  format="percent"
                />
                <TableRow
                  label="Perfect Order"
                  values={kpiReports.map((r) => r.perfectOrder * 100)}
                  format="percent"
                />
                <TableRow
                  label="Capacity Utilization"
                  values={kpiReports.map((r) => r.capacityUtilization * 100)}
                  format="percent"
                />
                <TableRow
                  label="Defect Rate"
                  values={kpiReports.map((r) => r.defectRate * 100)}
                  format="percent"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Inventory Tab
  const InventoryTab = () => {
    if (!currentData) return null;

    return (
      <div className="space-y-6">
        {/* Inventory KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Raw Materials"
            value={currentData.rawMaterialUnits}
            previousValue={previousData?.rawMaterialUnits}
            format="number"
            icon="🧱"
          />
          <MetricCard
            label="Finished Goods"
            value={currentData.finishedGoodsUnits}
            previousValue={previousData?.finishedGoodsUnits}
            format="number"
            icon="📦"
          />
          <MetricCard
            label="Inventory Value"
            value={currentData.inventoryValue}
            previousValue={previousData?.inventoryValue}
            icon="💵"
            highlight
          />
          <MetricCard
            label="Retailer Inventory"
            value={currentData.retailerInventory}
            previousValue={previousData?.retailerInventory}
            format="number"
            icon="🏪"
          />
        </div>

        {/* Inventory Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${getCardClass()} p-5`}>
            <h3 className={`text-sm ${getTextSecondaryClass()} mb-2`}>
              Inventory Turnover
            </h3>
            <div className="text-3xl font-bold text-blue-400">
              {currentData.inventoryTurnover.toFixed(2)}x
            </div>
            <p className={`text-xs ${getTextTertiaryClass()} mt-2`}>
              Times inventory is sold and replaced
            </p>
          </div>
          <div className={`${getCardClass()} p-5`}>
            <h3 className={`text-sm ${getTextSecondaryClass()} mb-2`}>
              Weeks of Supply
            </h3>
            <div className="text-3xl font-bold text-amber-400">
              {currentData.weeksOfSupply.toFixed(1)}
            </div>
            <p className={`text-xs ${getTextTertiaryClass()} mt-2`}>
              Weeks of demand covered by inventory
            </p>
          </div>
          <div className={`${getCardClass()} p-5`}>
            <h3 className={`text-sm ${getTextSecondaryClass()} mb-2`}>
              Holding Cost
            </h3>
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(currentData.holdingCost, true)}
            </div>
            <p className={`text-xs ${getTextTertiaryClass()} mt-2`}>
              Cost to store inventory this quarter
            </p>
          </div>
        </div>

        {/* Inventory Trend */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Inventory Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                  >
                    Metric
                  </th>
                  {kpiReports.map((r) => (
                    <th
                      key={r.quarter}
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Q{r.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRow
                  label="Raw Materials (units)"
                  values={kpiReports.map((r) => r.rawMaterialUnits)}
                  format="number"
                />
                <TableRow
                  label="Finished Goods (units)"
                  values={kpiReports.map((r) => r.finishedGoodsUnits)}
                  format="number"
                />
                <TableRow
                  label="Inventory Value"
                  values={kpiReports.map((r) => r.inventoryValue)}
                  format="currency"
                  highlight
                />
                <TableRow
                  label="Inventory Turnover"
                  values={kpiReports.map((r) => r.inventoryTurnover)}
                  format="number"
                />
                <TableRow
                  label="Weeks of Supply"
                  values={kpiReports.map((r) => r.weeksOfSupply)}
                  format="number"
                />
                <TableRow
                  label="Retailer Inventory"
                  values={kpiReports.map((r) => r.retailerInventory)}
                  format="number"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Scorecard Tab
  const ScorecardTab = () => {
    if (!currentData) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">
                Balanced Scorecard - Q{selectedQuarter}
              </h3>
              <p className="text-gray-400 text-sm">
                {firm?.name} Performance Assessment
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">
                  {currentData.bscOverall.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400">
                  {currentData.bscGrade}
                </div>
                <div className="text-xs text-gray-400">Grade</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400">
                  #{currentData.bscRank}
                </div>
                <div className="text-xs text-gray-400">Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Four Perspectives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial Perspective */}
          <div className={`${getCardClass()} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-emerald-400">💰</span> Financial
              </h3>
              <span className="text-2xl font-bold text-emerald-400">
                {currentData.bscFinancial.toFixed(0)}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${currentData.bscFinancial}%` }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Revenue</span>
                <span className="font-mono">
                  {formatCurrency(currentData.revenue, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Net Income</span>
                <span className="font-mono">
                  {formatCurrency(currentData.netIncome, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Gross Margin</span>
                <span className="font-mono">
                  {formatPercent(currentData.grossMarginPct)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Perspective */}
          <div className={`${getCardClass()} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-blue-400">👥</span> Customer
              </h3>
              <span className="text-2xl font-bold text-blue-400">
                {currentData.bscCustomer.toFixed(0)}
              </span>
            </div>
            <div
              className={`h-3 rounded-full overflow-hidden mb-4`}
              style={{
                backgroundColor: isDark ? "#374151" : "#d1d5db",
              }}
            >
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${currentData.bscCustomer}%` }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>CSI Score</span>
                <span className="font-mono">{currentData.csi.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Market Share</span>
                <span className="font-mono">
                  {formatPercent(currentData.marketShare * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Fill Rate</span>
                <span className="font-mono">
                  {formatPercent(currentData.fillRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Process Perspective */}
          <div className={`${getCardClass()} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-400">⚙️</span> Internal Process
              </h3>
              <span className="text-2xl font-bold text-purple-400">
                {currentData.bscProcess.toFixed(0)}
              </span>
            </div>
            <div
              className={`h-3 rounded-full overflow-hidden mb-4`}
              style={{
                backgroundColor: isDark ? "#374151" : "#d1d5db",
              }}
            >
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${currentData.bscProcess}%` }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Perfect Order</span>
                <span className="font-mono">
                  {formatPercent(currentData.perfectOrder)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>
                  On-Time Delivery
                </span>
                <span className="font-mono">
                  {formatPercent(currentData.onTimeDelivery)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>
                  Capacity Utilization
                </span>
                <span className="font-mono">
                  {formatPercent(currentData.capacityUtilization)}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Perspective */}
          <div className={`${getCardClass()} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-amber-400">📚</span> Learning & Growth
              </h3>
              <span className="text-2xl font-bold text-amber-400">
                {currentData.bscLearning.toFixed(0)}
              </span>
            </div>
            <div
              className={`h-3 rounded-full overflow-hidden mb-4`}
              style={{
                backgroundColor: isDark ? "#374151" : "#d1d5db",
              }}
            >
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${currentData.bscLearning}%` }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>Tech Systems</span>
                <span className="font-mono">
                  {currentData.techSystemsCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>SC Maturity</span>
                <span className="font-mono">{currentData.scMaturity}</span>
              </div>
              <div className="flex justify-between">
                <span className={getTextSecondaryClass()}>
                  Forecast Accuracy
                </span>
                <span className="font-mono">
                  {formatPercent(currentData.forecastAccuracy)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scorecard Trend */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold">Scorecard Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                  >
                    Perspective
                  </th>
                  {kpiReports.map((r) => (
                    <th
                      key={r.quarter}
                      className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Q{r.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableRow
                  label="Financial"
                  values={kpiReports.map((r) => r.bscFinancial)}
                  format="number"
                />
                <TableRow
                  label="Customer"
                  values={kpiReports.map((r) => r.bscCustomer)}
                  format="number"
                />
                <TableRow
                  label="Process"
                  values={kpiReports.map((r) => r.bscProcess)}
                  format="number"
                />
                <TableRow
                  label="Learning"
                  values={kpiReports.map((r) => r.bscLearning)}
                  format="number"
                />
                <TableRow
                  label="Overall Score"
                  values={kpiReports.map((r) => r.bscOverall)}
                  format="number"
                  highlight
                />
                <tr className="border-b border-gray-700/50 bg-blue-500/5">
                  <td className="py-3 px-4 text-sm font-semibold text-white">
                    Rank
                  </td>
                  {kpiReports.map((r, idx) => (
                    <td
                      key={idx}
                      className={`py-3 px-4 text-sm text-right font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      #{r.bscRank}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Competitor Tab
  const CompetitorTab = () => {
    if (!currentData) return null;

    const competitorData = competitorReports[selectedQuarter];

    return (
      <div className="space-y-6">
        {competitorData ? (
          <>
            {/* Competitors Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitorData.competitors &&
              competitorData.competitors.length > 0 ? (
                competitorData.competitors.map((competitor, idx) => (
                  <div key={idx} className={`${getCardClass()} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">
                        {competitor.firmName || `Firm ${competitor.firmNumber}`}
                      </h4>
                      {competitor.rank && (
                        <span className="text-2xl font-bold text-amber-400">
                          #{competitor.rank}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {competitor.revenue !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            Revenue
                          </span>
                          <span className="font-semibold text-green-400">
                            {formatCurrency(competitor.revenue, true)}
                          </span>
                        </div>
                      )}
                      {competitor.marketShare !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            Market Share
                          </span>
                          <span className="font-semibold text-blue-400">
                            {formatPercent(competitor.marketShare)}
                          </span>
                        </div>
                      )}
                      {competitor.csi !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            CSI Score
                          </span>
                          <span className="font-semibold text-cyan-400">
                            {competitor.csi.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {competitor.unitsSold !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            Units Sold
                          </span>
                          <span className="font-semibold text-yellow-400">
                            {formatNumber(competitor.unitsSold)}
                          </span>
                        </div>
                      )}
                      {competitor.netIncome !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            Net Income
                          </span>
                          <span
                            className={`font-semibold ${competitor.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {formatCurrency(competitor.netIncome, true)}
                          </span>
                        </div>
                      )}
                      {competitor.grossMarginPct !== undefined && (
                        <div
                          className={`flex justify-between items-center p-3 ${getBgSecondaryClass()} rounded-lg`}
                        >
                          <span
                            className={`text-sm ${getTextSecondaryClass()}`}
                          >
                            Gross Margin
                          </span>
                          <span className="font-semibold text-purple-400">
                            {formatPercent(competitor.grossMarginPct)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No competitor data available</p>
                </div>
              )}
            </div>

            {/* Market Position Analysis */}
            {competitorData.marketAnalysis && (
              <div className={`${getCardClass()} p-5`}>
                <h3 className="text-lg font-semibold mb-4">
                  Market Position Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {competitorData.marketAnalysis.marketLeader && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                        Market Leader
                      </p>
                      <p className="text-lg font-bold text-blue-400">
                        {competitorData.marketAnalysis.marketLeader}
                      </p>
                    </div>
                  )}
                  {competitorData.marketAnalysis.totalMarketSize !==
                    undefined && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                        Total Market Size
                      </p>
                      <p className="text-lg font-bold text-emerald-400">
                        {formatNumber(
                          competitorData.marketAnalysis.totalMarketSize,
                        )}
                      </p>
                    </div>
                  )}
                  {competitorData.marketAnalysis.averageMarketShare !==
                    undefined && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                        Average Market Share
                      </p>
                      <p className="text-lg font-bold text-purple-400">
                        {formatPercent(
                          competitorData.marketAnalysis.averageMarketShare,
                        )}
                      </p>
                    </div>
                  )}
                  {competitorData.marketAnalysis.competitorCount !==
                    undefined && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                        Active Competitors
                      </p>
                      <p className="text-lg font-bold text-amber-400">
                        {competitorData.marketAnalysis.competitorCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Competitive Advantages/Disadvantages */}
            {competitorData.strategicInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitorData.strategicInsights.strengths && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
                    <h4 className="font-semibold text-emerald-400 mb-3">
                      💪 Your Strengths
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {Array.isArray(
                        competitorData.strategicInsights.strengths,
                      ) ? (
                        competitorData.strategicInsights.strengths.map(
                          (strength, idx) => (
                            <li
                              key={idx}
                              className={`${getTextTertiaryClass()} flex items-start gap-2`}
                            >
                              <span className="text-emerald-400 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <li className={getTextTertiaryClass()}>
                          {competitorData.strategicInsights.strengths}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {competitorData.strategicInsights.opportunities && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                    <h4 className="font-semibold text-blue-400 mb-3">
                      🎯 Opportunities
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {Array.isArray(
                        competitorData.strategicInsights.opportunities,
                      ) ? (
                        competitorData.strategicInsights.opportunities.map(
                          (opportunity, idx) => (
                            <li
                              key={idx}
                              className={`${getTextTertiaryClass()} flex items-start gap-2`}
                            >
                              <span className="text-blue-400 mt-1">→</span>
                              <span>{opportunity}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <li className={getTextTertiaryClass()}>
                          {competitorData.strategicInsights.opportunities}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {competitorData.strategicInsights.threats && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                    <h4 className="font-semibold text-red-400 mb-3">
                      ⚠️ Threats
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {Array.isArray(
                        competitorData.strategicInsights.threats,
                      ) ? (
                        competitorData.strategicInsights.threats.map(
                          (threat, idx) => (
                            <li
                              key={idx}
                              className={`${getTextTertiaryClass()} flex items-start gap-2`}
                            >
                              <span className="text-red-400 mt-1">!</span>
                              <span>{threat}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <li className={getTextTertiaryClass()}>
                          {competitorData.strategicInsights.threats}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {competitorData.strategicInsights.weaknesses && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                    <h4 className="font-semibold text-amber-400 mb-3">
                      📍 Weaknesses to Address
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {Array.isArray(
                        competitorData.strategicInsights.weaknesses,
                      ) ? (
                        competitorData.strategicInsights.weaknesses.map(
                          (weakness, idx) => (
                            <li
                              key={idx}
                              className={`${getTextTertiaryClass()} flex items-start gap-2`}
                            >
                              <span className="text-amber-400 mt-1">•</span>
                              <span>{weakness}</span>
                            </li>
                          ),
                        )
                      ) : (
                        <li className={getTextTertiaryClass()}>
                          {competitorData.strategicInsights.weaknesses}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Competitive Metrics Comparison Table */}
            <div className={`${getCardClass()} overflow-hidden`}>
              <div
                className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
              >
                <h3 className="text-lg font-semibold">
                  Competitor Metrics Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}
                    >
                      <th
                        className={`py-3 px-4 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        Firm
                      </th>
                      <th
                        className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        Revenue
                      </th>
                      <th
                        className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        Market Share
                      </th>
                      <th
                        className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        CSI Score
                      </th>
                      <th
                        className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        Fill Rate
                      </th>
                      <th
                        className={`py-3 px-4 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                      >
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorData.competitors?.map((comp, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} ${comp.isCurrentFirm ? (isDark ? "bg-blue-500/10" : "bg-blue-50") : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"}`}
                      >
                        <td
                          className={`py-3 px-4 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {comp.firmName}
                          {comp.isCurrentFirm && (
                            <span className="ml-2 text-xs text-blue-400">
                              (You)
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {formatCurrency(comp.revenue, true)}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {formatPercent(comp.marketShare * 100)}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {comp.csi?.toFixed(1) || "N/A"}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {formatPercent(comp.fillRate)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-amber-400">
                          #{comp.rank}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className={`${getCardClass()} p-12 text-center`}>
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-lg font-semibold mb-2">Competitor Analysis</h3>
            <p className={getTextSecondaryClass()}>
              No competitor data available for Q{selectedQuarter}
            </p>
          </div>
        )}
      </div>
    );
  };
  // Credit Report Tab
  const CreditReportTab = () => {
    if (!creditHistory) {
      return (
        <div className={`${getCardClass()} p-8 text-center`}>
          <div className="text-3xl mb-3">💳</div>
          <p className={getTextSecondaryClass()}>
            Credit history data not available
          </p>
        </div>
      );
    }

    const { summary, creditScore } = creditHistory;

    const getScoreColor = (score) => {
      if (score >= 850) return "text-emerald-400";
      if (score >= 750) return "text-blue-400";
      if (score >= 650) return "text-amber-400";
      return "text-red-400";
    };

    const getTierColor = (tier) => {
      const tierMap = {
        EXCELLENT: "text-emerald-400 bg-emerald-500/10",
        GOOD: "text-blue-400 bg-blue-500/10",
        FAIR: "text-amber-400 bg-amber-500/10",
        POOR: "text-red-400 bg-red-500/10",
      };
      return tierMap[tier] || "text-gray-400 bg-gray-500/10";
    };

    return (
      <div className="space-y-6">
        {/* Credit Header */}
        <div className={`${getCardClass()} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>💳</span> Credit Profile
            </h3>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getTierColor(summary.currentTier)}`}
            >
              {summary.currentTier}
            </span>
          </div>

          {/* Credit Score Circle */}
          <div
            className={`flex items-center justify-center p-8 ${getBgSecondaryClass()} rounded-lg mb-6`}
          >
            <div className="text-center">
              <div
                className={`text-6xl font-bold ${getScoreColor(summary.currentScore)} mb-2`}
              >
                {Math.round(summary.currentScore)}
              </div>
              <div className={`${getTextSecondaryClass()} text-sm`}>
                Credit Score
              </div>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
              <div className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                Credit Limit
              </div>
              <div className="text-lg font-bold text-emerald-400">
                {formatCurrency(summary.currentCreditLimit, true)}
              </div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
              <div className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                Current Debt
              </div>
              <div className="text-lg font-bold text-amber-400">
                {formatCurrency(summary.currentDebt, true)}
              </div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
              <div className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                Utilization
              </div>
              <div className="text-lg font-bold text-blue-400">
                {formatPercent(summary.utilizationRate)}
              </div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
              <div className={`text-xs ${getTextSecondaryClass()} mb-2`}>
                Total Interest
              </div>
              <div className="text-lg font-bold text-red-400">
                {formatCurrency(summary.totalInterestPaid, true)}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {creditScore && (
          <div className={`${getCardClass()} p-6`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📊</span> Score Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={getTextSecondaryClass()}>Current Ratio</span>
                  <span className="text-emerald-400 font-semibold">
                    {creditScore.currentRatioScore}/20
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(creditScore.currentRatioScore / 20) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={getTextSecondaryClass()}>Debt/Equity</span>
                  <span className="text-blue-400 font-semibold">
                    {creditScore.debtToEquityScore}/25
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(creditScore.debtToEquityScore / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={getTextSecondaryClass()}>Profit Margin</span>
                  <span className="text-purple-400 font-semibold">
                    {creditScore.profitMarginScore}/20
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${(creditScore.profitMarginScore / 20) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={`${getBgSecondaryClass()} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={getTextSecondaryClass()}>
                    Interest Coverage
                  </span>
                  <span className="text-amber-400 font-semibold">
                    {creditScore.interestCoverageScore}/15
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(creditScore.interestCoverageScore / 15) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`${getBgSecondaryClass()} rounded-lg p-4 md:col-span-2`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={getTextSecondaryClass()}>Cash Flow</span>
                  <span className="text-cyan-400 font-semibold">
                    {creditScore.cashFlowScore}/20
                  </span>
                </div>
                <div
                  className={`w-full h-2 ${isDark ? "bg-gray-600" : "bg-gray-300"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${(creditScore.cashFlowScore / 20) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credit Events Warning */}
        {(summary.timesOverlimit > 0 ||
          summary.forcedSalesCount > 0 ||
          summary.totalOverlimitFees > 0) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <span>⚠️</span> Credit Events
            </h3>
            <div className="space-y-3">
              {summary.timesOverlimit > 0 && (
                <div
                  className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Times Over Credit Limit
                  </span>
                  <span className="text-red-400 font-bold text-lg">
                    {summary.timesOverlimit}
                  </span>
                </div>
              )}
              {summary.totalOverlimitFees > 0 && (
                <div
                  className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Over Limit Fees
                  </span>
                  <span className="text-red-400 font-bold">
                    {formatCurrency(summary.totalOverlimitFees)}
                  </span>
                </div>
              )}
              {summary.forcedSalesCount > 0 && (
                <div
                  className={`flex items-center justify-between p-3 ${isDark ? "bg-gray-800/50" : "bg-white"} rounded-lg`}
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Forced Sales Triggered
                  </span>
                  <span className="text-red-400 font-bold text-lg">
                    {summary.forcedSalesCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credit History Table */}
        {creditHistory.history && creditHistory.history.length > 0 && (
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-6 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-semibold">Credit History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}
                  >
                    <th
                      className={`py-3 px-6 text-left text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Quarter
                    </th>
                    <th
                      className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Tier
                    </th>
                    <th
                      className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Score
                    </th>
                    <th
                      className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Debt
                    </th>
                    <th
                      className={`py-3 px-6 text-right text-xs font-semibold ${getTextSecondaryClass()} uppercase`}
                    >
                      Interest Charge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.history.map((entry, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${isDark ? "border-gray-700/50 hover:bg-gray-800/30" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      <td
                        className={`py-3 px-6 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Q{entry.quarter}
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-medium`}
                      >
                        {entry.tierName || "N/A"}
                      </td>
                      <td
                        className={`py-3 px-6 text-right text-sm font-mono ${getScoreColor(entry.creditScore?.totalScore || 0)}`}
                      >
                        {Math.round(entry.creditScore?.totalScore || 0)}
                      </td>
                      <td className="py-3 px-6 text-right text-sm font-mono text-amber-400">
                        {formatCurrency(entry.endingDebt || 0, true)}
                      </td>
                      <td className="py-3 px-6 text-right text-sm font-mono text-red-400">
                        {formatCurrency(entry.interestCharge || 0, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const IntelligenceTab = ({
    theme,
    isDark,
    simulation,
    intelReports,
    loadingIntelReports,
    selectedQuarter,
    formatCurrency,
  }) => {
    return (
      <IntelligenceReportsPanel
        theme={theme}
        isDark={isDark}
        simulation={simulation}
        intelReports={intelReports}
        loadingIntelReports={loadingIntelReports}
        selectedQuarter={selectedQuarter}
        formatCurrency={formatCurrency}
      />
    );
  };

  const GreenScoreReportTab = () => {
    if (
      !greenScoreHistory ||
      !greenScoreHistory.greenScoreHistory ||
      greenScoreHistory.greenScoreHistory.length === 0
    ) {
      return (
        <div className={`${getCardClass()} p-12 text-center`}>
          <div className="text-5xl mb-4">♻️</div>
          <h3 className="text-lg font-semibold mb-2">Green Score</h3>
          <p className={getTextSecondaryClass()}>
            Green score tracking is not enabled for this simulation
          </p>
        </div>
      );
    }

    const history = greenScoreHistory.greenScoreHistory;
    const latestRecord = history[history.length - 1] || {};

    const BRACKET_CONFIG = {
      POOR: {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        label: "Poor",
      },
      BELOW_AVERAGE: {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        label: "Below Average",
      },
      AVERAGE: {
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        label: "Average",
      },
      GOOD: {
        color: "text-lime-400",
        bg: "bg-lime-500/10",
        border: "border-lime-500/30",
        label: "Good",
      },
      EXCELLENT: {
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        label: "Excellent",
      },
    };

    const getBracketConfig = (bracket) =>
      BRACKET_CONFIG[bracket] || BRACKET_CONFIG.AVERAGE;

    const getScoreColor = (score) => {
      if (score >= 80) return "text-emerald-400";
      if (score >= 60) return "text-lime-400";
      if (score >= 40) return "text-yellow-400";
      if (score >= 20) return "text-orange-400";
      return "text-red-400";
    };

    const disposalConfig = {
      RECYCLE: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        label: "♻️ Recycle",
      },
      LANDFILL: {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        label: "🏭 Landfill",
      },
      INCINERATE: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "🔥 Incinerate",
      },
      COMPOST: {
        bg: "bg-lime-500/20",
        text: "text-lime-400",
        label: "🌱 Compost",
      },
    };

    const getDiposalBadgeConfig = (method) =>
      disposalConfig[method] || disposalConfig.RECYCLE;

    // Calculate stats
    const totalImprovement =
      (latestRecord.newScore || 0) - (history[0]?.previousScore || 0);
    const avgScore =
      history.length > 0
        ? history.reduce((sum, h) => sum + (h.newScore || 0), 0) /
          history.length
        : 0;

    return (
      <div className="space-y-6">
        {/* Header Card */}
        <div className={`${getCardClass()} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme.text}`}>
              <span>♻️</span> Green Score
            </h3>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getBracketConfig(getGreenScoreBracket(latestRecord.newScore || 0)).bg} ${getBracketConfig(getGreenScoreBracket(latestRecord.newScore || 0)).color}`}
            >
              {
                getBracketConfig(
                  getGreenScoreBracket(latestRecord.newScore || 0),
                ).label
              }
            </span>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${getBgSecondaryClass()} rounded-lg p-4 text-center`}>
              <div
                className={`text-4xl font-bold ${getScoreColor(latestRecord.newScore || 0)} mb-2`}
              >
                {latestRecord.newScore || 0}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Current Score</div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4 text-center`}>
              <div
                className={`text-2xl font-bold ${totalImprovement >= 0 ? "text-emerald-400" : "text-red-400"} mb-2`}
              >
                {totalImprovement >= 0 ? "+" : ""}
                {totalImprovement}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Total Improvement</div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {formatNumber(avgScore)}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Average Score</div>
            </div>
            <div className={`${getBgSecondaryClass()} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {history.length}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Quarters Tracked</div>
            </div>
          </div>
        </div>

        {/* Latest Quarter Details */}
        {latestRecord && (
          <div className={`${getCardClass()} p-6`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme.text}`}>
              <span>Q{latestRecord.quarter}</span> Latest Quarter
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>
                  Disposal Method
                </div>
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-block ${getDiposalBadgeConfig(latestRecord.disposalMethod).bg} ${getDiposalBadgeConfig(latestRecord.disposalMethod).text}`}
                >
                  {getDiposalBadgeConfig(latestRecord.disposalMethod).label}
                </div>
              </div>
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>Score Change</div>
                <div
                  className={`text-lg font-bold ${latestRecord.scoreChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {latestRecord.scoreChange >= 0 ? "+" : ""}
                  {latestRecord.scoreChange}
                </div>
              </div>
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>Disposal Cost</div>
                <div className="text-lg font-bold text-red-400">
                  {formatCurrency(latestRecord.disposalCost || 0, true)}
                </div>
              </div>
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>Recovery Value</div>
                <div className="text-lg font-bold text-emerald-400">
                  {formatCurrency(latestRecord.disposalRecovery || 0, true)}
                </div>
              </div>
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>CSI Effect</div>
                <div
                  className={`text-lg font-bold ${latestRecord.csiEffect > 0 ? "text-emerald-400" : latestRecord.csiEffect < 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  {latestRecord.csiEffect > 0 ? "+" : ""}
                  {latestRecord.csiEffect}
                </div>
              </div>
              <div className={getBgSecondaryClass() + " rounded-lg p-4"}>
                <div className={`text-xs ${theme.textSecondary} mb-2`}>Churn Impact</div>
                <div className="text-lg font-bold text-purple-400">
                  {formatPercent(latestRecord.churnMultiplier * 100)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        {history.length > 0 && (
          <div className={`${getCardClass()} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${theme.border}`}>
              <h3 className={`text-lg font-semibold ${theme.text}`}>Green Score History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? "bg-gray-800/50" : "bg-gray-100"}>
                    <th className={`py-3 px-6 text-left text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      Quarter
                    </th>
                    <th className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      Previous
                    </th>
                    <th className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      New Score
                    </th>
                    <th className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      Change
                    </th>
                    <th className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      Method
                    </th>
                    <th className={`py-3 px-6 text-right text-xs font-semibold ${theme.textSecondary} uppercase`}>
                      Net Cost
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700/50" : "divide-gray-200"}`}>
                  {history.map((record, idx) => {
                    const netCost =
                      (record.disposalCost || 0) -
                      (record.disposalRecovery || 0);
                    return (
                      <tr
                        key={idx}
                        className={`${isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"}`}
                      >
                        <td className={`py-3 px-6 text-sm ${getTextTertiaryClass()} font-medium`}>
                          Q{record.quarter}
                        </td>
                        <td className={`py-3 px-6 text-right text-sm font-mono ${theme.textSecondary}`}>
                          {record.previousScore || 0}
                        </td>
                        <td
                          className={`py-3 px-6 text-right text-sm font-mono ${getScoreColor(record.newScore || 0)}`}
                        >
                          {record.newScore || 0}
                        </td>
                        <td
                          className={`py-3 px-6 text-right text-sm font-mono ${record.scoreChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {record.scoreChange >= 0 ? "+" : ""}
                          {record.scoreChange}
                        </td>
                        <td className="py-3 px-6 text-right text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getDiposalBadgeConfig(record.disposalMethod).bg} ${getDiposalBadgeConfig(record.disposalMethod).text}`}
                          >
                            {getDiposalBadgeConfig(record.disposalMethod).label}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-6 text-right text-sm font-mono ${netCost >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {formatCurrency(netCost, true)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };
  const QuarterlyReportTab = () => {
    if (!currentData) return null;

    const reportData = tenqReports[selectedQuarter];
    const ytdData = tenqYtd[selectedQuarter];
    const compareData = tenqCompare[selectedQuarter];
    const season = getSeason(selectedQuarter);

    // Get VMI data from API (vmiData is an array of trend objects)
    let vmiProcessed = null;
    
    console.log(`VMI trend data:`, vmiData);
    
    if (vmiData && Array.isArray(vmiData) && vmiData.length > 0) {
      // Find the matching quarter or use the latest
      const quarterRecord = vmiData.find(r => r.quarter === selectedQuarter) || vmiData[vmiData.length - 1];
      console.log(`VMI record for Q${selectedQuarter}:`, quarterRecord);
      
      if (quarterRecord) {
        // Process VMI data structure from API
        const vmiObj = quarterRecord.vmi || {};
        vmiProcessed = {
          active: vmiObj.active || false,
          setupCost: vmiObj.setupCost || 0,
          ongoingCost: vmiObj.ongoingCost || 0,
          totalCostThisQuarter: vmiObj.totalCostThisQuarter || 0,
          retailerMode: vmiObj.retailerMode || "NORMAL",
          coverageMonths: vmiObj.coverageMonths || 0,
          clearancePrevented: vmiObj.clearancePrevented || false,
          panicPrevented: vmiObj.panicPrevented || false,
          revenueProtected: vmiObj.revenueProtected || 0,
          csiProtected: vmiObj.csiProtected || 0,
          cumulativeTotalCost: vmiObj.cumulativeTotalCost || 0,
          cumulativeRevenueProtected: vmiObj.cumulativeRevenueProtected || 0,
          cumulativeNetBenefit: vmiObj.cumulativeNetBenefit || 0,
          distribution: vmiObj.distribution || [],
          avgInventoryLevel: vmiObj.avgInventoryLevel || 0,
          fillRateConsistency: vmiObj.fillRateConsistency || 0,
          numDistributors: vmiObj.numDistributors || 0,
          avgOrdersPerMonth: vmiObj.avgOrdersPerMonth || 0,
        };
        console.log(`Processed VMI data:`, vmiProcessed);
      }
    } else {
      console.log(`No VMI data available`);
    }

    // Calculate some derived metrics
    const grossProfit = currentData.revenue - currentData.cogs;
    const grossMarginPct =
      currentData.revenue > 0 ? (grossProfit / currentData.revenue) * 100 : 0;
    const netMarginPct =
      currentData.revenue > 0
        ? (currentData.netIncome / currentData.revenue) * 100
        : 0;

    const totalOperatingCosts =
      currentData.laborCost +
      currentData.holdingCost +
      currentData.marketingCost +
      currentData.qualityCost +
      currentData.freightCost +
      currentData.techMaintenanceCost;

    const totalCustomers =
      currentData.customersLoyal +
      currentData.customersInPlay +
      currentData.customersChurned;
    const loyaltyRate =
      totalCustomers > 0
        ? (currentData.customersLoyal / totalCustomers) * 100
        : 0;
    const churnRate =
      totalCustomers > 0
        ? (currentData.customersChurned / totalCustomers) * 100
        : 0;

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className={`${isDark ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30" : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"} border rounded-xl p-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{season.icon}</span>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.text}`}>
                    Q{selectedQuarter} Performance Report
                  </h2>
                  <p className={theme.textSecondary}>
                    {firm?.name} • {season.name}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${theme.textSecondary} mt-2`}>
                {season.hint}
              </p>
            </div>

            <div className="flex gap-4">
              <div
                className={`text-center px-6 py-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(currentData.netIncome, true)}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>
                  Net Income
                </div>
              </div>
              <div
                className={`text-center px-6 py-3 ${getBgSecondaryClass()} rounded-lg`}
              >
                <div className="text-2xl font-bold text-blue-400">
                  #{currentData.bscRank}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>
                  Industry Rank
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              Revenue
            </div>
            <div
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatCurrency(currentData.revenue, true)}
            </div>
            {previousData && (
              <div
                className={`text-xs mt-1 ${currentData.revenue >= previousData.revenue ? "text-emerald-400" : "text-red-400"}`}
              >
                {currentData.revenue >= previousData.revenue ? "↑" : "↓"} vs Q
                {selectedQuarter - 1}
              </div>
            )}
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              Gross Margin
            </div>
            <div
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {grossMarginPct.toFixed(1)}%
            </div>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              Units Sold
            </div>
            <div
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatNumber(currentData.unitsSold)}
            </div>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              Fill Rate
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {formatPercent(currentData.fillRate)}
            </div>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              CSI Score
            </div>
            <div className="text-xl font-bold text-blue-400">
              {currentData.csi.toFixed(1)}
            </div>
          </div>
          <div className={`${getCardClass()} p-4`}>
            <div className={`text-xs ${getTextSecondaryClass()} mb-1`}>
              Cash Balance
            </div>
            <div
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {formatCurrency(currentData.cash, true)}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div
            className={`text-center px-6 py-3 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg`}
          >
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(currentData.netIncome, true)}
            </div>
            <div className={`text-xs ${getTextSecondaryClass()}`}>
              Net Income
            </div>
          </div>
          <div
            className={`text-center px-6 py-3 ${isDark ? "bg-gray-800/50" : "bg-gray-200"} rounded-lg`}
          >
            <div className="text-2xl font-bold text-blue-400">
              #{currentData.bscRank}
            </div>
            <div className={`text-xs ${getTextSecondaryClass()}`}>
              Industry Rank
            </div>
          </div>
          <button
            onClick={handleDownload10QReport}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition flex items-center gap-2"
          >
            <span>📥</span> Download 10-Q PDF
          </button>
        </div>
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Statement */}
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <span>💰</span> Income Statement
              </h3>
              <span
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Q{selectedQuarter}
              </span>
            </div>

            <div className="p-5">
              <table className="w-full text-sm">
                <tbody>
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                  >
                    <td className="py-2 font-medium">Revenue</td>
                    <td className="py-2 text-right font-mono text-emerald-400">
                      {formatCurrency(currentData.revenue)}
                    </td>
                  </tr>
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                  >
                    <td className={`py-2 pl-4 ${getTextSecondaryClass()}`}>
                      Cost of Goods Sold
                    </td>
                    <td className="py-2 text-right font-mono text-red-400">
                      ({formatCurrency(currentData.cogs)})
                    </td>
                  </tr>
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/50 bg-gray-700/20" : "border-gray-200 bg-gray-100"}`}
                  >
                    <td className="py-2 font-medium">Gross Profit</td>
                    <td className="py-2 text-right font-mono">
                      {formatCurrency(grossProfit)}
                    </td>
                  </tr>
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                  >
                    <td className={`py-2 pl-4 ${getTextSecondaryClass()}`}>
                      Operating Expenses
                    </td>
                    <td className="py-2 text-right font-mono text-red-400">
                      ({formatCurrency(currentData.operatingExpenses)})
                    </td>
                  </tr>
                  <tr
                    className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                  >
                    <td className={`py-2 pl-4 ${getTextSecondaryClass()}`}>
                      Interest Expense
                    </td>
                    <td className="py-2 text-right font-mono text-red-400">
                      ({formatCurrency(currentData.interestCost)})
                    </td>
                  </tr>
                  <tr
                    className={isDark ? "bg-emerald-500/10" : "bg-emerald-50"}
                  >
                    <td className="py-3 font-bold">Net Income</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(currentData.netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-200"} flex justify-between text-sm`}
              >
                <span className={getTextSecondaryClass()}>Net Margin</span>
                <span
                  className={`font-semibold ${netMarginPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {netMarginPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <span>📊</span> Cost Breakdown
              </h3>
              <span className={`text-sm font-mono ${getTextSecondaryClass()}`}>
                {formatCurrency(totalOperatingCosts, true)} total
              </span>
            </div>

            <div className="p-5 space-y-3">
              {[
                {
                  label: "Labor",
                  value: currentData.laborCost,
                  color: "bg-blue-500",
                },
                {
                  label: "Holding/Storage",
                  value: currentData.holdingCost,
                  color: "bg-purple-500",
                },
                {
                  label: "Marketing",
                  value: currentData.marketingCost,
                  color: "bg-pink-500",
                },
                {
                  label: "Quality",
                  value: currentData.qualityCost,
                  color: "bg-amber-500",
                },
                {
                  label: "Freight",
                  value: currentData.freightCost,
                  color: "bg-emerald-500",
                },
                {
                  label: "Tech Maintenance",
                  value: currentData.techMaintenanceCost,
                  color: "bg-cyan-500",
                },
              ].map((cost) => {
                const pct =
                  totalOperatingCosts > 0
                    ? (cost.value / totalOperatingCosts) * 100
                    : 0;
                return (
                  <div key={cost.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{cost.label}</span>
                      <span className="font-mono text-gray-400">
                        {formatCurrency(cost.value, true)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cost.color} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {currentData.interestCost > 0 && (
                <div className="pt-3 border-t border-gray-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Interest Expense</span>
                    <span className="font-mono text-red-400">
                      {formatCurrency(currentData.interestCost, true)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supply Chain Performance Section */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${theme.border}`}>
            <h3 className="font-semibold flex items-center gap-2">
              <span>🔗</span> Supply Chain Performance
            </h3>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Production */}
              <div>
                <h4
                  className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
                >
                  Production
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Units Produced
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(currentData.unitsProduced)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Units Sold
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(currentData.unitsSold)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Capacity Used
                    </span>
                    <span className="font-mono font-semibold text-amber-400">
                      {formatPercent(currentData.capacityUtilization)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Defect Rate
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.defectRate <= 0.03 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {formatPercent(currentData.defectRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fulfillment */}
              <div>
                <h4
                  className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
                >
                  Fulfillment
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Fill Rate
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.fillRate >= 0.95 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {formatPercent(currentData.fillRate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      On-Time Delivery
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.onTimeDelivery >= 0.9 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {formatPercent(currentData.onTimeDelivery)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Perfect Order
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.perfectOrder >= 0.9 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {formatPercent(currentData.perfectOrder)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Return Rate
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.returnRate <= 0.05 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {formatPercent(currentData.returnRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h4
                  className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
                >
                  Inventory
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Raw Materials
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(currentData.rawMaterialUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Finished Goods
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(currentData.finishedGoodsUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Inventory Turnover
                    </span>
                    <span className="font-mono font-semibold text-blue-400">
                      {currentData.inventoryTurnover.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">
                      Weeks of Supply
                    </span>
                    <span
                      className={`font-mono font-semibold ${currentData.weeksOfSupply >= 4 && currentData.weeksOfSupply <= 8 ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {currentData.weeksOfSupply.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Segments */}
          <div className={`${getCardClass()} overflow-hidden`}>
            <div className={`px-5 py-4 border-b ${theme.border}`}>
              <h3 className="font-semibold flex items-center gap-2">
                <span>👥</span> Customer Base
              </h3>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatNumber(currentData.customersLoyal)}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>Loyal</div>
                </div>
                <div className="flex-1 text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">
                    {formatNumber(currentData.customersInPlay)}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>In Play</div>
                </div>
                <div className="flex-1 text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">
                    {formatNumber(currentData.customersChurned)}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>Churned</div>
                </div>
              </div>

              {/* Stacked Bar */}
              <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden flex`}>
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${loyaltyRate}%` }}
                  title={`Loyal: ${loyaltyRate.toFixed(1)}%`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{
                    width: `${(currentData.customersInPlay / totalCustomers) * 100}%`,
                  }}
                  title={`In Play: ${((currentData.customersInPlay / totalCustomers) * 100).toFixed(1)}%`}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${churnRate}%` }}
                  title={`Churned: ${churnRate.toFixed(1)}%`}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Loyalty Rate</span>
                  <span className="font-semibold text-emerald-400">
                    {loyaltyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Churn Rate</span>
                  <span className="font-semibold text-red-400">
                    {churnRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* YTD Summary */}
          {/* YTD Summary - Updated to match actual API response */}
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <span>📈</span> Year-to-Date Summary
              </h3>
              {ytdData && (
                <span
                  className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  Through Q{ytdData.throughQuarter}
                </span>
              )}
            </div>

            <div className="p-5">
              {ytdData && ytdData.ytdTotals ? (
                <div className="space-y-4">
                  {/* Main YTD Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                    >
                      <div
                        className={`text-xs ${getTextSecondaryClass()} mb-1`}
                      >
                        YTD Revenue
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        {formatCurrency(ytdData.ytdTotals.revenue, true)}
                      </div>
                    </div>
                    <div
                      className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                    >
                      <div
                        className={`text-xs ${getTextSecondaryClass()} mb-1`}
                      >
                        YTD Net Income
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        {formatCurrency(ytdData.ytdTotals.netIncome, true)}
                      </div>
                    </div>
                    <div
                      className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                    >
                      <div
                        className={`text-xs ${getTextSecondaryClass()} mb-1`}
                      >
                        YTD Units Sold
                      </div>
                      <div className="text-xl font-bold">
                        {formatNumber(ytdData.ytdTotals.unitsSold)}
                      </div>
                    </div>
                    <div
                      className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg`}
                    >
                      <div
                        className={`text-xs ${getTextSecondaryClass()} mb-1`}
                      >
                        Avg Fill Rate
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        {formatPercent(ytdData.ytdTotals.avgFillRate)}
                      </div>
                    </div>
                  </div>

                  {/* YTD Averages */}
                  <div
                    className={`pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className={getTextSecondaryClass()}>
                        Avg CSI Score
                      </span>
                      <span className="font-semibold text-blue-400">
                        {ytdData.ytdTotals.avgCsi?.toFixed(1) || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={getTextSecondaryClass()}>
                        YTD Net Margin
                      </span>
                      <span
                        className={`font-semibold ${ytdData.ytdTotals.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {ytdData.ytdTotals.revenue > 0
                          ? (
                              (ytdData.ytdTotals.netIncome /
                                ytdData.ytdTotals.revenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Quarterly Breakdown */}
                  {ytdData.quarterlySummary &&
                    ytdData.quarterlySummary.length > 0 && (
                      <div
                        className={`pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
                      >
                        <h4
                          className={`text-xs font-medium ${getTextSecondaryClass()} mb-3`}
                        >
                          Quarterly Breakdown
                        </h4>
                        <div className="space-y-2">
                          {ytdData.quarterlySummary.map((q) => {
                            const season = getSeason(q.quarter);
                            return (
                              <div
                                key={q.quarter}
                                className={`flex items-center justify-between text-sm p-2 ${isDark ? "bg-gray-700/20" : "bg-gray-100"} rounded-lg`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{season.icon}</span>
                                  <span
                                    className={
                                      isDark ? "text-gray-300" : "text-gray-700"
                                    }
                                  >
                                    Q{q.quarter}
                                  </span>
                                </div>
                                <div className="flex gap-4 text-right">
                                  <div>
                                    <div
                                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                                    >
                                      Revenue
                                    </div>
                                    <div className="font-mono text-emerald-400">
                                      {formatCurrency(q.revenue, true)}
                                    </div>
                                  </div>
                                  <div>
                                    <div
                                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                                    >
                                      Net Income
                                    </div>
                                    <div
                                      className={`font-mono ${q.netIncome >= 0 ? "text-blue-400" : "text-red-400"}`}
                                    >
                                      {formatCurrency(q.netIncome, true)}
                                    </div>
                                  </div>
                                  <div>
                                    <div
                                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                                    >
                                      Units
                                    </div>
                                    <div className="font-mono">
                                      {formatNumber(q.unitsSold)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div
                  className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  <p>YTD data not available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VMI Distribution */}
        {simulation?.features?.vmi ? (
          vmiProcessed ? (
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>📦</span> VMI Management
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  vmiProcessed.active 
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {vmiProcessed.active ? "✓ Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Costs Section */}
              <div>
                <h4 className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}>
                  Costs & Benefits
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-1`}>
                      Setup Cost
                    </div>
                    <div className={`text-lg font-bold ${vmiProcessed.setupCost > 0 ? "text-red-400" : "text-gray-500"}`}>
                      {formatCurrency(vmiProcessed.setupCost, true)}
                    </div>
                  </div>

                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-1`}>
                      Ongoing Cost
                    </div>
                    <div className={`text-lg font-bold ${vmiProcessed.ongoingCost > 0 ? "text-orange-400" : "text-gray-500"}`}>
                      {formatCurrency(vmiProcessed.ongoingCost, true)}
                    </div>
                  </div>

                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-1`}>
                      This Quarter
                    </div>
                    <div className={`text-lg font-bold ${vmiProcessed.totalCostThisQuarter > 0 ? "text-orange-400" : "text-gray-500"}`}>
                      {formatCurrency(vmiProcessed.totalCostThisQuarter, true)}
                    </div>
                  </div>

                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-1`}>
                      Net Benefit
                    </div>
                    <div className={`text-lg font-bold ${vmiProcessed.cumulativeNetBenefit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(vmiProcessed.cumulativeNetBenefit, true)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retailer Mode & Coverage */}
              <div className="border-t border-gray-700/50 pt-4">
                <h4 className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}>
                  Retailer Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-2`}>
                      Current Mode
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                      vmiProcessed.retailerMode === "PANIC" 
                        ? "bg-red-500/20 text-red-400"
                        : vmiProcessed.retailerMode === "CLEARANCE"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {vmiProcessed.retailerMode}
                    </span>
                  </div>

                  <div className={`p-4 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}>
                    <div className={`text-xs font-medium ${getTextSecondaryClass()} mb-1`}>
                      Inventory Coverage
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {vmiProcessed.coverageMonths.toFixed(2)} months
                    </div>
                  </div>
                </div>
              </div>

              {/* Protection & Loss Prev */}
              {(vmiProcessed.clearancePrevented || vmiProcessed.panicPrevented || vmiProcessed.revenueProtected > 0) && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}>
                    Issues Prevented
                  </h4>
                  <div className="space-y-2">
                    {vmiProcessed.clearancePrevented && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⚠️</span>
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Clearance prevented
                        </span>
                      </div>
                    )}
                    {vmiProcessed.panicPrevented && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">🚨</span>
                        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Panic buying prevented
                        </span>
                      </div>
                    )}
                    {vmiProcessed.revenueProtected > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">💰</span>
                          <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Revenue Protected
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(vmiProcessed.revenueProtected, true)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Distribution (if available) */}
              {vmiProcessed.distribution && vmiProcessed.distribution.length > 0 && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}>
                    Distribution by Retailer
                  </h4>
                  <div className="space-y-3">
                    {vmiProcessed.distribution.slice(0, 5).map((item, idx) => {
                      const quantity = item.quantity || 0;
                      const totalDist = vmiProcessed.distribution.reduce((sum, d) => sum + (d.quantity || 0), 0);
                      const percentage = totalDist > 0 ? (quantity / totalDist) * 100 : 0;
                      const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"];
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              {item.retailerName || `Retailer ${idx + 1}`}
                            </span>
                            <span className="font-mono font-semibold text-sm">
                              {formatNumber(quantity)}
                            </span>
                          </div>
                          <div className={`h-2 ${isDark ? "bg-gray-700" : "bg-gray-300"} rounded-full overflow-hidden`}>
                            <div
                              className={colors[idx % colors.length]}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
            <div className={`${getCardClass()} overflow-hidden`}>
              <div
                className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <span>📦</span> VMI Management
                </h3>
              </div>
              <div className={`p-8 text-center ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                <p>VMI data is not yet available for this quarter.</p>
                <p className="text-sm mt-2">Check back after decisions are processed.</p>
              </div>
            </div>
          )
        ) : null}

        {/* Peer Comparison */}
        {compareData && compareData.peers && compareData.peers.length > 0 && (
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <span>⚔️</span> How You Compare
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? "bg-gray-800/50" : "bg-gray-100"}>
                    <th
                      className={`py-3 px-4 text-left text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      Firm
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      Revenue
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      Net Income
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      Market Share
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      CSI
                    </th>
                    <th
                      className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                    >
                      Fill Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {compareData.peers.map((peer, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} ${peer.isCurrentFirm ? "bg-blue-500/10" : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-100"}`}
                    >
                      <td className="py-3 px-4 font-medium">
                        {peer.firmName || `Firm ${idx + 1}`}
                        {peer.isCurrentFirm && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(peer.revenue, true)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono ${peer.netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {formatCurrency(peer.netIncome, true)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatPercent(peer.marketShare * 100)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {peer.csi?.toFixed(1) || "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatPercent(peer.fillRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quarterly Trend */}
        <div className={`${getCardClass()} overflow-hidden`}>
          <div
            className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <span>📊</span> Quarterly Trend
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? "bg-gray-800/50" : "bg-gray-100"}>
                  <th
                    className={`py-3 px-4 text-left text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                  >
                    Metric
                  </th>
                  {kpiReports.map((r) => {
                    const s = getSeason(r.quarter);
                    return (
                      <th
                        key={r.quarter}
                        className={`py-3 px-4 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"} uppercase`}
                      >
                        <span className="mr-1">{s.icon}</span>Q{r.quarter}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-sm">
                <TableRow
                  label="Revenue"
                  values={kpiReports.map((r) => r.revenue)}
                  format="currency"
                  highlight
                />
                <TableRow
                  label="Net Income"
                  values={kpiReports.map((r) => r.netIncome)}
                  format="currency"
                />
                <TableRow
                  label="Gross Margin %"
                  values={kpiReports.map((r) => r.grossMarginPct)}
                  format="percent"
                />
                <TableRow
                  label="Units Sold"
                  values={kpiReports.map((r) => r.unitsSold)}
                  format="number"
                />
                <TableRow
                  label="Fill Rate"
                  values={kpiReports.map((r) => r.fillRate * 100)}
                  format="percent"
                />
                <TableRow
                  label="CSI Score"
                  values={kpiReports.map((r) => r.csi)}
                  format="number"
                  highlight
                />
                <TableRow
                  label="Cash Balance"
                  values={kpiReports.map((r) => r.cash)}
                  format="currency"
                />
              </tbody>
            </table>
          </div>
        </div>
        {/* Financial Trend - Updated to match actual API response */}
        {tenqTrend && tenqTrend.trend && tenqTrend.trend.length > 0 && (
          <div className={`${getCardClass()} overflow-hidden`}>
            <div
              className={`px-5 py-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"} flex items-center justify-between`}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <span>📊</span> Financial Trend
              </h3>
              <span
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Q{tenqTrend.quarterRange?.start} - Q
                {tenqTrend.quarterRange?.end}
              </span>
            </div>

            {/* Trend Summary Cards */}
            <div
              className={`p-5 border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const firstQ = tenqTrend.trend[0];
                  const lastQ = tenqTrend.trend[tenqTrend.trend.length - 1];
                  const revenueGrowth =
                    firstQ.revenue > 0
                      ? ((lastQ.revenue - firstQ.revenue) / firstQ.revenue) *
                        100
                      : 0;
                  const incomeGrowth =
                    firstQ.netIncome > 0
                      ? ((lastQ.netIncome - firstQ.netIncome) /
                          firstQ.netIncome) *
                        100
                      : 0;
                  const assetGrowth =
                    firstQ.totalAssets > 0
                      ? ((lastQ.totalAssets - firstQ.totalAssets) /
                          firstQ.totalAssets) *
                        100
                      : 0;
                  const equityGrowth =
                    firstQ.equity > 0
                      ? ((lastQ.equity - firstQ.equity) / firstQ.equity) * 100
                      : 0;

                  return (
                    <>
                      <div
                        className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg text-center`}
                      >
                        <div
                          className={`text-xs ${getTextSecondaryClass()} mb-1`}
                        >
                          Revenue Growth
                        </div>
                        <div
                          className={`text-xl font-bold ${revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {revenueGrowth >= 0 ? "+" : ""}
                          {revenueGrowth.toFixed(1)}%
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          Q{firstQ.quarter} → Q{lastQ.quarter}
                        </div>
                      </div>
                      <div
                        className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg text-center`}
                      >
                        <div
                          className={`text-xs ${getTextSecondaryClass()} mb-1`}
                        >
                          Income Growth
                        </div>
                        <div
                          className={`text-xl font-bold ${incomeGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {incomeGrowth >= 0 ? "+" : ""}
                          {incomeGrowth.toFixed(1)}%
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          Q{firstQ.quarter} → Q{lastQ.quarter}
                        </div>
                      </div>
                      <div
                        className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg text-center`}
                      >
                        <div
                          className={`text-xs ${getTextSecondaryClass()} mb-1`}
                        >
                          Asset Growth
                        </div>
                        <div
                          className={`text-xl font-bold ${assetGrowth >= 0 ? "text-blue-400" : "text-red-400"}`}
                        >
                          {assetGrowth >= 0 ? "+" : ""}
                          {assetGrowth.toFixed(1)}%
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          Q{firstQ.quarter} → Q{lastQ.quarter}
                        </div>
                      </div>
                      <div
                        className={`p-3 ${isDark ? "bg-gray-700/30" : "bg-gray-100"} rounded-lg text-center`}
                      >
                        <div
                          className={`text-xs ${getTextSecondaryClass()} mb-1`}
                        >
                          Equity Growth
                        </div>
                        <div
                          className={`text-xl font-bold ${equityGrowth >= 0 ? "text-purple-400" : "text-red-400"}`}
                        >
                          {equityGrowth >= 0 ? "+" : ""}
                          {equityGrowth.toFixed(1)}%
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          Q{firstQ.quarter} → Q{lastQ.quarter}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Income Statement Trend */}
            <div
              className={`p-5 border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
            >
              <h4
                className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
              >
                Income Statement
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${isDark ? "border-gray-600" : "border-gray-200"}`}
                    >
                      <th
                        className={`py-2 text-left text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                      >
                        Metric
                      </th>
                      {tenqTrend.trend.map((q) => {
                        const season = getSeason(q.quarter);
                        return (
                          <th
                            key={q.quarter}
                            className={`py-2 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                          >
                            {season.icon} Q{q.quarter}
                          </th>
                        );
                      })}
                      <th
                        className={`py-2 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className="py-2 font-medium">Revenue</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono text-emerald-400"
                        >
                          {formatCurrency(q.revenue, true)}
                        </td>
                      ))}
                      <td className="py-2 text-right">
                        {(() => {
                          const first = tenqTrend.trend[0].revenue;
                          const last =
                            tenqTrend.trend[tenqTrend.trend.length - 1].revenue;
                          const change =
                            first > 0 ? ((last - first) / first) * 100 : 0;
                          return (
                            <span
                              className={`text-xs font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {change >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className="py-2 font-medium">Net Income</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className={`py-2 text-right font-mono ${q.netIncome >= 0 ? "text-blue-400" : "text-red-400"}`}
                        >
                          {formatCurrency(q.netIncome, true)}
                        </td>
                      ))}
                      <td className="py-2 text-right">
                        {(() => {
                          const first = tenqTrend.trend[0].netIncome;
                          const last =
                            tenqTrend.trend[tenqTrend.trend.length - 1]
                              .netIncome;
                          const change =
                            first > 0 ? ((last - first) / first) * 100 : 0;
                          return (
                            <span
                              className={`text-xs font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {change >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className={`py-2 ${getTextSecondaryClass()}`}>
                        Operating Income
                      </td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className={`py-2 text-right font-mono ${q.operatingIncome >= 0 ? "text-gray-300" : "text-red-400"}`}
                        >
                          {q.operatingIncome < 0 ? "(" : ""}
                          {formatCurrency(Math.abs(q.operatingIncome), true)}
                          {q.operatingIncome < 0 ? ")" : ""}
                        </td>
                      ))}
                      <td className="py-2 text-right">—</td>
                    </tr>
                    <tr>
                      <td className={`py-2 ${getTextSecondaryClass()}`}>
                        Cash from Operations
                      </td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className={`py-2 text-right font-mono ${q.cashFromOperations >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {formatCurrency(q.cashFromOperations, true)}
                        </td>
                      ))}
                      <td className="py-2 text-right">
                        {(() => {
                          const first = tenqTrend.trend[0].cashFromOperations;
                          const last =
                            tenqTrend.trend[tenqTrend.trend.length - 1]
                              .cashFromOperations;
                          const change =
                            first > 0 ? ((last - first) / first) * 100 : 0;
                          return (
                            <span
                              className={`text-xs font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {change >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance Sheet Trend */}
            <div
              className={`p-5 border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
            >
              <h4
                className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
              >
                Balance Sheet
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${isDark ? "border-gray-600" : "border-gray-200"}`}
                    >
                      <th
                        className={`py-2 text-left text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                      >
                        Metric
                      </th>
                      {tenqTrend.trend.map((q) => {
                        const season = getSeason(q.quarter);
                        return (
                          <th
                            key={q.quarter}
                            className={`py-2 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                          >
                            {season.icon} Q{q.quarter}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className="py-2 font-medium">Total Assets</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono"
                        >
                          {formatCurrency(q.totalAssets, true)}
                        </td>
                      ))}
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className={getTextSecondaryClass()}>
                        Total Liabilities
                      </td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono text-red-400"
                        >
                          {formatCurrency(q.totalLiabilities, true)}
                        </td>
                      ))}
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"} ${isDark ? "bg-gray-700/10" : "bg-gray-100"}`}
                    >
                      <td className="py-2 font-medium">Equity</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono text-purple-400"
                        >
                          {formatCurrency(q.equity, true)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className={getTextSecondaryClass()}>
                        Debt-to-Equity Ratio
                      </td>
                      {tenqTrend.trend.map((q) => {
                        const deRatio =
                          q.equity > 0 ? q.totalLiabilities / q.equity : 0;
                        return (
                          <td
                            key={q.quarter}
                            className={`py-2 text-right font-mono ${deRatio > 1 ? "text-amber-400" : "text-emerald-400"}`}
                          >
                            {deRatio.toFixed(2)}x
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Operations Trend */}
            <div className="p-5">
              <h4
                className={`text-sm font-medium ${getTextSecondaryClass()} mb-3`}
              >
                Operations
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${isDark ? "border-gray-600" : "border-gray-200"}`}
                    >
                      <th
                        className={`py-2 text-left text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                      >
                        Metric
                      </th>
                      {tenqTrend.trend.map((q) => {
                        const season = getSeason(q.quarter);
                        return (
                          <th
                            key={q.quarter}
                            className={`py-2 text-right text-xs font-semibold ${isDark ? "text-gray-400" : "text-gray-700"}`}
                          >
                            {season.icon} Q{q.quarter}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className="py-2 font-medium">Units Produced</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono"
                        >
                          {formatNumber(q.unitsProduced)}
                        </td>
                      ))}
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className="py-2 font-medium">Units Sold</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono text-emerald-400"
                        >
                          {formatNumber(q.unitsSold)}
                        </td>
                      ))}
                    </tr>
                    <tr
                      className={`border-b ${isDark ? "border-gray-700/30" : "border-gray-200"}`}
                    >
                      <td className={getTextSecondaryClass()}>
                        Production vs Sales
                      </td>
                      {tenqTrend.trend.map((q) => {
                        const ratio =
                          q.unitsSold > 0
                            ? (q.unitsProduced / q.unitsSold) * 100
                            : 0;
                        const isOverproducing = ratio > 105;
                        const isUnderproducing = ratio < 95;
                        return (
                          <td
                            key={q.quarter}
                            className={`py-2 text-right font-mono ${isOverproducing ? "text-amber-400" : isUnderproducing ? "text-red-400" : "text-emerald-400"}`}
                          >
                            {ratio.toFixed(0)}%
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Inventory Value</td>
                      {tenqTrend.trend.map((q) => (
                        <td
                          key={q.quarter}
                          className="py-2 text-right font-mono text-blue-400"
                        >
                          {formatCurrency(q.inventoryValue, true)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Inventory Trend Visual */}
              <div
                className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-200"}`}
              >
                <div className="flex items-end justify-between gap-2 h-24">
                  {tenqTrend.trend.map((q) => {
                    const maxInv = Math.max(
                      ...tenqTrend.trend.map((t) => t.inventoryValue),
                    );
                    const heightPct =
                      maxInv > 0 ? (q.inventoryValue / maxInv) * 100 : 0;
                    const season = getSeason(q.quarter);
                    return (
                      <div
                        key={q.quarter}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-gray-700 rounded-t relative"
                          style={{ height: `${heightPct}%`, minHeight: "4px" }}
                        >
                          <div className="absolute inset-0 bg-blue-500/50 rounded-t" />
                        </div>
                        <span className="text-xs text-gray-400">
                          {season.icon} Q{q.quarter}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p
                  className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"} text-center mt-2`}
                >
                  Inventory Value Trend
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Performance Tips */}
        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <span>💡</span> Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {(() => {
              const insights = [];

              if (currentData.fillRate < 0.95) {
                insights.push({
                  title: "Improve Fill Rate",
                  message:
                    "Your fill rate is below 95%. Consider increasing production or safety stock.",
                });
              }
              if (currentData.capacityUtilization < 0.7) {
                insights.push({
                  title: "Low Capacity Usage",
                  message:
                    "You're using less than 70% capacity. Review demand forecasts or adjust production.",
                });
              }
              if (currentData.capacityUtilization > 0.95) {
                insights.push({
                  title: "Near Max Capacity",
                  message:
                    "Running at 95%+ capacity limits flexibility. Consider capacity expansion.",
                });
              }
              if (currentData.weeksOfSupply > 10) {
                insights.push({
                  title: "High Inventory",
                  message:
                    "10+ weeks of supply increases holding costs. Reduce production or run promotions.",
                });
              }
              if (currentData.weeksOfSupply < 4) {
                insights.push({
                  title: "Low Inventory Risk",
                  message:
                    "Under 4 weeks of supply risks stockouts. Increase safety stock.",
                });
              }
              if (churnRate > 5) {
                insights.push({
                  title: "Customer Churn",
                  message:
                    "Churn rate above 5%. Focus on service quality and fill rate improvements.",
                });
              }
              if (currentData.defectRate > 0.03) {
                insights.push({
                  title: "Quality Issues",
                  message:
                    "Defect rate over 3%. Invest in quality control to reduce returns.",
                });
              }
              if (grossMarginPct < 40) {
                insights.push({
                  title: "Margin Pressure",
                  message:
                    "Gross margin below 40%. Review pricing strategy or reduce COGS.",
                });
              }

              // If no insights, show a positive message
              if (insights.length === 0) {
                insights.push({
                  title: "✅ All Systems Green",
                  message:
                    "Your firm is performing well across all key metrics. Keep up the good work!",
                });
              }

              return insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 ${isDark ? "bg-gray-800/50" : "bg-gray-100"} rounded-lg`}
                >
                  <p className="text-amber-400 font-medium mb-1">
                    {insight.title}
                  </p>
                  <p className={getTextSecondaryClass()}>{insight.message}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    );
  };
  // ==================== RENDER ====================
  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"} flex items-center justify-center`}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Navigation */}
      <nav
        className={`fixed w-full top-0 z-40 ${isDark ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-200"} border-b backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-80">
                FLEXEE <span className="text-blue-600">2.0</span>
              </h1>
            </Link>
            <div
              className={`hidden md:flex items-center gap-2 pl-4 border-l ${isDark ? "border-gray-700 text-sm" : "border-gray-300 text-sm"}`}
            >
              <Link
                href="/dashboard/student"
                className={
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                Dashboard
              </Link>
              <span className={isDark ? "text-gray-600" : "text-gray-400"}>
                /
              </span>
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                {simulation?.name}
              </span>
              <span className={isDark ? "text-gray-600" : "text-gray-400"}>
                /
              </span>
              <span className="font-medium">Reports</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"} transition`}
            >
              <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={`pt-20 px-4 pb-8 ${isDark ? "" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/student"
                className={`p-2 rounded-lg transition ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Reports Center</h1>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {firm?.name} • {simulation?.name}
                </p>
              </div>
            </div>

            {/* Quarter Selector */}
            {kpiReports.length > 0 && <QuarterSelector />}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <span>⚠️</span>
              <p className="text-red-400 flex-1">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tabs */}
          {kpiReports.length > 0 && (
            <div
              className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
            >
              <div className="flex gap-1 overflow-x-auto pb-px">
                {REPORT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? `border-blue-500 ${isDark ? "text-white" : "text-blue-600"}`
                        : isDark
                          ? "border-transparent text-gray-400 hover:text-gray-300"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {kpiReports.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-xl font-semibold mb-2">
                No Reports Available
              </h2>
              <p className="text-gray-400 mb-4">
                Reports will appear as the simulation progresses.
              </p>
              <Link
                href="/dashboard/student"
                className="inline-block px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {activeTab === "kpi" && <KPIDashboard />}
              {activeTab === "financial" && <FinancialTab />}
              {activeTab === "operations" && <OperationsTab />}
              {activeTab === "inventory" && <InventoryTab />}
              {activeTab === "scorecard" && <ScorecardTab />}
              {activeTab === "competitor" && <CompetitorTab />}
              {activeTab === "credit" && <CreditReportTab />}
              {activeTab === "intelligence" && (
                <IntelligenceTab
                  theme={{
                    text: "text-white",
                    textMuted: "text-gray-400",
                    accentBg: "bg-blue-600",
                  }}
                  isDark={isDark}
                  simulation={simulation}
                  intelReports={intelReports}
                  loadingIntelReports={loadingIntelReports}
                  selectedQuarter={selectedQuarter}
                  formatCurrency={formatCurrency}
                />
              )}
              {activeTab === "green-score" && <GreenScoreReportTab />}
              {activeTab === "tenq" && <QuarterlyReportTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
