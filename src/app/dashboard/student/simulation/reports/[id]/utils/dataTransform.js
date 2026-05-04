// Transform raw competitor data into structured format
export const transformCompetitorData = (rawData) => {
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

// Transform raw KPI data into structured format
export const transformKpiData = (kpi, quarter) => {
  return {
    quarter,
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
  };
};

// Transform credit history into summary
export const transformCreditHistory = (history) => {
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
    forcedSalesCount: history.filter((h) => !!h.forcedSaleTriggered).length,
  };

  return {
    summary,
    history,
    creditScore: history[0]?.creditScore || null,
  };
};
