import { useCallback } from "react";
import { transformKpiData, transformCreditHistory } from "../utils/dataTransform";

export const useReportsApi = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const getToken = useCallback(() => localStorage.getItem("access_token"), []);

  // Fetch GreenScore history
  const fetchGreenScoreHistory = useCallback(
    async (simId, firmId, quarter = null) => {
      try {
        const url = quarter
          ? `${apiUrl}/simulations/${simId}/firms/${firmId}/green-score?quarters=${quarter}`
          : `${apiUrl}/simulations/${simId}/firms/${firmId}/green-score`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error("Error fetching green score history:", err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch Credit history
  const fetchCreditHistory = useCallback(
    async (simId, firmId) => {
      try {
        const response = await fetch(
          `${apiUrl}/simulations/${simId}/firms/${firmId}/credit-history`,
          {
            headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const history = Array.isArray(data.history) ? data.history : [];
          return transformCreditHistory(history);
        }
      } catch (err) {
        console.error("Error fetching credit history:", err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch Intelligence reports for a single firm
  const fetchIntelReportsForFirm = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const url = quarter
          ? `${apiUrl}/simulations/${simId}/firms/${firmId}/intelligence-reports?quarter=${quarter}`
          : `${apiUrl}/simulations/${simId}/firms/${firmId}/intelligence-reports`;
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
            `Failed to fetch intelligence reports for ${firmId}: ${response.status}`
          );
        }
      } catch (err) {
        console.error(
          `Error fetching intelligence reports for firm ${firmId}:`,
          err
        );
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch all intelligence reports
  const fetchAllIntelReports = useCallback(
    async (simId, firms, quarter = null) => {
      if (!firms || firms.length === 0) {
        console.warn("No firms available to fetch intelligence reports");
        return {};
      }

      try {
        const reports = {};
        for (const firm of firms) {
          const firmId = firm._id || firm.id;
          console.log(`Fetching intel reports for firm ${firmId}`);
          const data = await fetchIntelReportsForFirm(simId, firmId, quarter);
          if (data) {
            reports[firmId] = data;
          }
        }
        console.log("All intelligence reports fetched:", reports);
        return reports;
      } catch (err) {
        console.error("Error fetching all intelligence reports:", err);
        return {};
      }
    },
    [fetchIntelReportsForFirm]
  );

  // Fetch KPI history
  const fetchKpiHistory = useCallback(
    async (simId, firmId) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/kpi-history/${simId}/${firmId}`,
          {
            headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawReports = Array.isArray(data) ? data : data.history || [];

          const reports = rawReports.map((kpi) =>
            transformKpiData(kpi, kpi.quarter)
          );

          // Sort by quarter ascending
          reports.sort((a, b) => a.quarter - b.quarter);
          return reports;
        }
        return [];
      } catch (err) {
        console.error("Error fetching KPI history:", err);
        return [];
      }
    },
    [apiUrl, getToken]
  );

  // Fetch TenQ report for specific quarter
  const fetchTenQReport = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/tenq/${simId}/${firmId}/${quarter}`,
          { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error(`Error fetching quarterly report for Q${quarter}:`, err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch TenQ YTD
  const fetchTenQYtd = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/tenq/${simId}/${firmId}/${quarter}/ytd`,
          { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error(`Error fetching YTD for Q${quarter}:`, err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch TenQ trend
  const fetchTenQTrend = useCallback(
    async (simId, firmId) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/tenq/${simId}/${firmId}/trend`,
          { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error("Error fetching financial trend:", err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch TenQ comparison
  const fetchTenQCompare = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/tenq/${simId}/${firmId}/${quarter}/compare`,
          { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error(`Error fetching peer comparison for Q${quarter}:`, err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch scorecard report
  const fetchScorecardReport = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/balanced-scorecard/${simId}/${firmId}/${quarter}`,
          {
            headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
          }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error(`Error fetching scorecard for Q${quarter}:`, err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch competitor report
  const fetchCompetitorReport = useCallback(
    async (simId, firmId, quarter) => {
      try {
        const response = await fetch(
          `${apiUrl}/reports/competitor-comparison/${simId}/${firmId}/${quarter}`,
          {
            headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
          }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.error(`Error fetching competitor for Q${quarter}:`, err);
      }
      return null;
    },
    [apiUrl, getToken]
  );

  // Fetch VMI data
  const fetchVmiData = useCallback(
    async (simId, firmId, startQuarter = 1, endQuarter = null) => {
      try {
        const maxQuarter = endQuarter || 1;
        const url = `${apiUrl}/reports/vmi/${simId}/${firmId}/${startQuarter}/${maxQuarter}`;

        console.log(`Fetching VMI data from: ${url}`);
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(
            `Failed to load VMI data for firm ${firmId}:`,
            errData.message || response.statusText
          );
          return null;
        }

        const data = await response.json();
        console.log(`VMI data received for firm ${firmId}:`, data);

        if (data && data.trend && Array.isArray(data.trend)) {
          return data.trend;
        }
        return null;
      } catch (err) {
        console.error(`Error fetching VMI data for firm ${firmId}:`, err);
        return null;
      }
    },
    [apiUrl, getToken]
  );

  // Fetch simulation details
  const fetchSimulation = useCallback(
    async (simId) => {
      try {
        const response = await fetch(`${apiUrl}/simulations/${simId}`, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        });

        if (!response.ok) {
          console.error("Failed to load simulation");
          return null;
        }

        return await response.json();
      } catch (err) {
        console.error("Error fetching simulation:", err);
        return null;
      }
    },
    [apiUrl, getToken]
  );

  return {
    fetchGreenScoreHistory,
    fetchCreditHistory,
    fetchIntelReportsForFirm,
    fetchAllIntelReports,
    fetchKpiHistory,
    fetchTenQReport,
    fetchTenQYtd,
    fetchTenQTrend,
    fetchTenQCompare,
    fetchScorecardReport,
    fetchCompetitorReport,
    fetchVmiData,
    fetchSimulation,
  };
};
