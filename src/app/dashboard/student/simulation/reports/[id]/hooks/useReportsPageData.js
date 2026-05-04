import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReportsApi } from "./useReportsApi";
import { transformCompetitorData } from "../utils/dataTransform";

export const useReportsPageData = () => {
  const router = useRouter();
  const params = useParams();
  const api = useReportsApi();

  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [firm, setFirm] = useState(null);

  // Reports data
  const [kpiReports, setKpiReports] = useState([]);
  const [creditHistory, setCreditHistory] = useState(null);
  const [greenScoreHistory, setGreenScoreHistory] = useState(null);
  const [scorecardReports, setScorecardReports] = useState({});
  const [competitorReports, setCompetitorReports] = useState({});
  const [tenqReports, setTenqReports] = useState({});
  const [tenqYtd, setTenqYtd] = useState({});
  const [tenqTrend, setTenqTrend] = useState(null);
  const [tenqCompare, setTenqCompare] = useState({});
  const [intelReports, setIntelReports] = useState({});
  const [loadingIntelReports, setLoadingIntelReports] = useState(false);
  const [vmiData, setVmiData] = useState([]);

  // Get token from localStorage
  const getToken = useCallback(() => localStorage.getItem("access_token"), []);

  // Main data loading function
  const loadAllData = useCallback(async () => {
    try {
      const userRole = localStorage.getItem("userRole");
      const userId = localStorage.getItem("userId");

      if (userRole !== "student") {
        router.push("/login");
        return;
      }

      // Fetch simulation
      const simData = await api.fetchSimulation(params.id);
      if (!simData) {
        setError("Failed to load simulation");
        setLoading(false);
        return;
      }

      setSimulation(simData);

      // Find student's firm
      let studentFirm = null;
      if (simData.firms && simData.firms.length > 0) {
        for (const f of simData.firms) {
          if (f.enrollments && f.enrollments.length > 0) {
            const userEnrollment = f.enrollments.find(
              (e) => e.user.id === userId
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

      // Fetch KPI history
      const kpiReports = await api.fetchKpiHistory(params.id, studentFirm.id);
      setKpiReports(kpiReports);

      // Fetch credit history
      const creditData = await api.fetchCreditHistory(
        params.id,
        studentFirm.id
      );
      if (creditData) {
        setCreditHistory(creditData);
      }

      // Fetch green score history
      const gsData = await api.fetchGreenScoreHistory(
        params.id,
        studentFirm.id
      );
      if (gsData) {
        setGreenScoreHistory(gsData);
      }

      // Fetch intelligence reports if feature enabled
      console.log("Simulation features:", simData.features);
      console.log(
        "Intelligence Center enabled:",
        simData.features?.intelligenceCenter
      );
      if (simData.features?.intelligenceCenter) {
        console.log("Fetching intelligence reports for firms:", simData.firms);
        const intelData = await api.fetchAllIntelReports(
          params.id,
          simData.firms
        );
        setIntelReports(intelData);
      } else {
        console.log("Intelligence Center feature is not enabled");
      }

      // Fetch VMI data if feature enabled
      if (simData.features?.vmi) {
        console.log("Fetching VMI data for firm:", studentFirm.id);
        const latestQuarter =
          kpiReports.length > 0
            ? kpiReports[kpiReports.length - 1].quarter
            : null;
        console.log("Latest quarter from KPI reports:", latestQuarter);
        if (latestQuarter) {
          const vmiTrendData = await api.fetchVmiData(
            params.id,
            studentFirm.id,
            1,
            latestQuarter
          );
          if (vmiTrendData) {
            setVmiData(vmiTrendData);
          }
        }
      }

      // Fetch additional reports for each quarter
      if (kpiReports.length > 0) {
        for (const report of kpiReports) {
          // Fetch scorecard
          const scorecardData = await api.fetchScorecardReport(
            params.id,
            studentFirm.id,
            report.quarter
          );
          if (scorecardData) {
            setScorecardReports((prev) => ({
              ...prev,
              [report.quarter]: scorecardData,
            }));
          }

          // Fetch competitor
          const competitorData = await api.fetchCompetitorReport(
            params.id,
            studentFirm.id,
            report.quarter
          );
          if (competitorData) {
            const transformedData = transformCompetitorData(competitorData);
            setCompetitorReports((prev) => ({
              ...prev,
              [report.quarter]: transformedData,
            }));
          }

          // Fetch TenQ
          const tenqData = await api.fetchTenQReport(
            params.id,
            studentFirm.id,
            report.quarter
          );
          if (tenqData) {
            setTenqReports((prev) => ({
              ...prev,
              [report.quarter]: tenqData,
            }));
          }

          // Fetch TenQ YTD
          const tenqYtdData = await api.fetchTenQYtd(
            params.id,
            studentFirm.id,
            report.quarter
          );
          if (tenqYtdData) {
            setTenqYtd((prev) => ({
              ...prev,
              [report.quarter]: tenqYtdData,
            }));
          }

          // Fetch TenQ Compare
          const tenqCompareData = await api.fetchTenQCompare(
            params.id,
            studentFirm.id,
            report.quarter
          );
          if (tenqCompareData) {
            setTenqCompare((prev) => ({
              ...prev,
              [report.quarter]: tenqCompareData,
            }));
          }
        }

        // Fetch TenQ Trend
        const tenqTrendData = await api.fetchTenQTrend(
          params.id,
          studentFirm.id
        );
        if (tenqTrendData) {
          setTenqTrend(tenqTrendData);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load reports data");
      setLoading(false);
    }
  }, [api, params.id, router]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [params.id, loadAllData]);

  return {
    // State
    user,
    loading,
    error,
    simulation,
    firm,
    kpiReports,
    creditHistory,
    greenScoreHistory,
    scorecardReports,
    competitorReports,
    tenqReports,
    tenqYtd,
    tenqTrend,
    tenqCompare,
    intelReports,
    loadingIntelReports,
    vmiData,
    // Setters
    setError,
    setUser,
    setLoading,
    // Utilities
    getToken,
  };
};
