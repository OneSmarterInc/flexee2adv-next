// src/app/dashboard/admin/simulations/[id]/components/TabContent.js

import OverviewTab from "./TabContent/OverviewTab";
import FirmsTab from "./TabContent/FirmsTab";
import LeaderboardTab from "./TabContent/LeaderboardTab";
import DemandTab from "./TabContent/DemandTab";
import FeaturesTab from "./TabContent/FeaturesTab";
import EventsTab from "./TabContent/EventsTab";
import CreditTab from "./TabContent/CreditTab";
import GreenScoreTab from "./TabContent/GreenScoreTab"; // <-- added
import CapacityExpansionTab from "./TabContent/CapacityExpansionTab"; // <-- added
import LogisticsTab from "./TabContent/LogisticsTab"; // <-- added
import SCRMTab from "./TabContent/SCRMTab"; // <-- added
import IntelligenceTab from "./TabContent/IntelligenceTab"; // <-- added
import VmiTab from "./TabContent/VmiTab"; // <-- VMI

export default function TabContent({
  activeTab,
  theme,
  isDark,
  simulation,
  quarterData,
  demandHistory,
  leaderboard,
  ADVANCED_MODULES,
  CORE_FEATURES,
  getSeason,
  handleUpdateFeatures,
  actionLoading,
  formatCurrency,
  formatNumber,
  formatPercent,
  getGradeColor,
  getGreenScoreBracket,
  selectedQuarter,
  firmsCreditHistory,
  fetchAllFirmsCreditHistory,
  greenScoreHistory, // <-- added
  fetchAllGreenScoreHistory, // <-- added
  scrmData, // <-- added
  fetchScrmData, // <-- added
  fetchScrmHistory, // <-- added
  dcStatus, // <-- new
  carrierAnalysis, // <-- new
  loadingDcCarrier, // <-- new
  fetchDCAndCarrierData, // <-- new
  eventImpacts, // <-- new
  eventSummary, // <-- new
  fetchEventImpacts, // <-- new
  apiUrl, // <-- new
  getToken, // <-- new
  setShowEventModal, // <-- new
  setEventForm, // <-- new
  eventForm, // <-- new
  setShowEnrollModal, // <-- new
  setShowFeatureModal, // <-- new
  intelReports, // <-- added
  loadingIntelReports, // <-- added
  fetchAllIntelReports, // <-- added
  vmiHistory, // <-- VMI
  loadingVmiHistory, // <-- VMI
  fetchAllVmiHistory, // <-- VMI
  dataVisibility, // <-- quarter data visibility
  fetchQuarterDataVisibility, // <-- fetch quarter data visibility
}) {
  const commonProps = { theme, isDark, simulation, getSeason, dataVisibility, fetchQuarterDataVisibility };

  switch (activeTab) {
    case "overview":
      return <OverviewTab {...commonProps} selectedQuarter={selectedQuarter} />;
    case "firms":
      return (
        <FirmsTab
          {...commonProps}
          quarterData={quarterData}
          selectedQuarter={selectedQuarter}
        />
      );
    case "leaderboard":
      return <LeaderboardTab {...commonProps} leaderboard={leaderboard} />;
    case "demand":
      return (
        <DemandTab
          {...commonProps}
          demandHistory={demandHistory}
          quarterData={quarterData}
          selectedQuarter={selectedQuarter}
        />
      );
    case "features":
      return (
        <FeaturesTab
          {...commonProps}
          ADVANCED_MODULES={ADVANCED_MODULES}
          handleUpdateFeatures={handleUpdateFeatures}
          actionLoading={actionLoading}
        />
      );
    case "events":
      return (
        <EventsTab
          {...commonProps}
          setShowEventModal={setShowEventModal}
          setEventForm={setEventForm}
          eventForm={eventForm}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
          selectedQuarter={selectedQuarter}
          apiUrl={apiUrl}
          getToken={getToken}
          eventImpacts={eventImpacts}
          eventSummary={eventSummary}
          fetchEventImpacts={fetchEventImpacts}
        />
      );
    case "credit":
      return (
        <CreditTab
          {...commonProps}
          firmsCreditHistory={firmsCreditHistory}
          fetchAllFirmsCreditHistory={fetchAllFirmsCreditHistory}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      );
    case "green-score": // <-- added
      return (
        <GreenScoreTab
          {...commonProps}
          greenScoreHistory={greenScoreHistory}
          fetchAllGreenScoreHistory={fetchAllGreenScoreHistory}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
          getGreenScoreBracket={getGreenScoreBracket}
          selectedQuarter={selectedQuarter} // <-- add this
        />
      );
    case "capacity-expansion": // <-- added
      return (
        <CapacityExpansionTab
          {...commonProps}
          quarterData={quarterData}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          selectedQuarter={selectedQuarter}
        />
      );
    case "logistics": // <-- new
      return (
        <LogisticsTab
          {...commonProps}
          dcStatus={dcStatus}
          carrierAnalysis={carrierAnalysis}
          loadingDcCarrier={loadingDcCarrier}
          fetchDCAndCarrierData={fetchDCAndCarrierData}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
          selectedQuarter={selectedQuarter}
        />
      );
    case "scrm": // <-- added
      return (
        <SCRMTab
          {...commonProps}
          scrmData={scrmData}
          fetchScrmData={fetchScrmData}
          fetchScrmHistory={fetchScrmHistory}
          selectedQuarter={selectedQuarter}
        />
      );
    case "intelligence": // <-- added
      return (
        <IntelligenceTab
          {...commonProps}
          intelReports={intelReports}
          loadingIntelReports={loadingIntelReports}
          fetchAllIntelReports={fetchAllIntelReports}
          selectedQuarter={selectedQuarter}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      );
    case "vmi": // <-- VMI
      return (
        <VmiTab
          {...commonProps}
          vmiHistory={vmiHistory}
          loadingVmiHistory={loadingVmiHistory}
          fetchAllVmiHistory={fetchAllVmiHistory}
          selectedQuarter={selectedQuarter}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
        />
      );
    default:
      return null;
  }
}
