"use client";

import { useState } from "react";

// Carrier configuration based on FLEXEE 2.0
const CARRIER_CONFIG = {
  INTERMODAL: { 
    name: "Intermodal", 
    icon: "🚂", 
    color: "amber",
    costPerUnit: 1.50,
    onTimeRate: 80,           // 80%
    damageRate: 1.0,          // 1.0%
    volumeDiscount: null,
    description: "Rail + truck, cheapest but variable timing"
  },
  TRUCK: { 
    name: "Truck (FTL)", 
    icon: "🚛", 
    color: "blue",
    costPerUnit: 3.50,
    onTimeRate: 93,           // 93%
    damageRate: 0.5,          // 0.5%
    volumeDiscount: "5% over 75K",
    description: "Full truckload, balanced cost and reliability"
  },
  AIR: { 
    name: "Air Freight", 
    icon: "✈️", 
    color: "purple",
    costPerUnit: 12.00,
    onTimeRate: 100,          // 100%
    damageRate: 0.0,          // 0%
    volumeDiscount: null,
    description: "Premium speed, guaranteed delivery"
  },
};

// DC configuration based on FLEXEE 2.0
const DC_CONFIG = {
  CENTRAL: { 
    name: "R2 Central DC", 
    location: "Chicago", 
    capacity: 200000,
    setupCost: 4000000,       // $4M
    quarterlyOpex: 700000,    // $700K
    serviceBonus: 3,          // +3% on-time
    regionServed: "R2",
    icon: "🏭" 
  },
  WEST: { 
    name: "R3 West DC", 
    location: "Los Angeles", 
    capacity: 150000,
    setupCost: 6000000,       // $6M
    quarterlyOpex: 900000,    // $900K
    serviceBonus: 5,          // +5% on-time
    regionServed: "R3",
    icon: "🏪" 
  },
};

// Transfer costs
const TRANSFER_COSTS = {
  DC_TO_DC: 5,           // $5/unit
  DC_TO_FACTORY: 4,      // $4/unit
};

// Factory config
const FACTORY_CONFIG = {
  region: "R1",
  serviceBonus: 5,       // +5% on-time for R1 (local)
  disposalRate: 0.25,    // 25% of setup cost when closing
};

// TMS discount
const TMS_DISCOUNT = 0.08;  // 8%
const LAST_MILE_COST = 2.50;  // $2.50/unit

export default function LogisticsTab({
  theme,
  isDark,
  simulation,
  dcStatus,
  carrierAnalysis,
  loadingDcCarrier,
  formatCurrency,
  formatNumber,
  formatPercent,
  selectedQuarter,
}) {
  const [activeSection, setActiveSection] = useState("overview");

  const regionalDCsEnabled = simulation?.features?.regionalDCs;
  const multiCarrierEnabled = simulation?.features?.multiCarrierSelection;

  // If neither feature is enabled
  if (!regionalDCsEnabled && !multiCarrierEnabled) {
    return (
      <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-8 text-center`}>
        <div className="text-4xl mb-4">🚛</div>
        <h3 className="text-xl font-semibold mb-2">Logistics Module Not Enabled</h3>
        <p className={theme.textMuted}>
          Enable "Regional DCs" or "Multi-Carrier Selection" in the Features tab to view logistics analytics.
        </p>
      </div>
    );
  }

  // Loading state
  if (loadingDcCarrier) {
    return (
      <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-8 text-center`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={theme.textMuted}>Loading logistics data...</p>
      </div>
    );
  }

  // Calculate DC summary stats
  const dcSummary = dcStatus?.firms ? {
    totalCentralOpen: dcStatus.firms.filter(f => f.dcCentral?.open).length,
    totalWestOpen: dcStatus.firms.filter(f => f.dcWest?.open).length,
    totalCentralInventory: dcStatus.firms.reduce((sum, f) => sum + (f.dcCentral?.inventory || 0), 0),
    totalWestInventory: dcStatus.firms.reduce((sum, f) => sum + (f.dcWest?.inventory || 0), 0),
    totalOpex: dcStatus.firms.reduce((sum, f) => sum + (f.opex || 0), 0),
    totalSetupCost: dcStatus.firms.reduce((sum, f) => sum + (f.setupCostThisQuarter || 0), 0),
  } : null;

  // Calculate carrier summary stats
  const carrierSummary = carrierAnalysis?.firms ? {
    carrierCounts: carrierAnalysis.firms.reduce((acc, f) => {
      acc[f.carrier] = (acc[f.carrier] || 0) + 1;
      return acc;
    }, {}),
    totalFreightCost: carrierAnalysis.firms.reduce((sum, f) => sum + (f.freightCost || 0), 0),
    avgOnTimeRate: carrierAnalysis.firms.reduce((sum, f) => sum + (f.onTimeRate || 0), 0) / (carrierAnalysis.firms.length || 1),
    firmsWithTMS: carrierAnalysis.firms.filter(f => f.hasTMS).length,
    forcedAirCount: carrierAnalysis.firms.filter(f => f.forcedAir).length,
  } : null;

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className={`flex gap-2 p-1 rounded-lg ${theme.cardInner} w-fit`}>
        <button
          onClick={() => setActiveSection("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeSection === "overview"
              ? `${theme.accentBg} text-white`
              : theme.textMuted
          }`}
        >
          Overview
        </button>
        {regionalDCsEnabled && (
          <button
            onClick={() => setActiveSection("dcs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "dcs"
                ? `${theme.accentBg} text-white`
                : theme.textMuted
            }`}
          >
            📦 Distribution Centers
          </button>
        )}
        {multiCarrierEnabled && (
          <button
            onClick={() => setActiveSection("carriers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === "carriers"
                ? `${theme.accentBg} text-white`
                : theme.textMuted
            }`}
          >
            🚛 Carrier Analysis
          </button>
        )}
      </div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DC Summary Card */}
          {regionalDCsEnabled && dcSummary && (
            <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-6`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📦</span> Distribution Center Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Central DCs Open</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {dcSummary.totalCentralOpen}/{dcStatus?.firms?.length || 0}
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>+3% on-time for R2</p>
                </div>
                <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>West DCs Open</p>
                  <p className="text-2xl font-bold text-green-400">
                    {dcSummary.totalWestOpen}/{dcStatus?.firms?.length || 0}
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>+5% on-time for R3</p>
                </div>
                <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Total DC Inventory</p>
                  <p className="text-xl font-bold">
                    {formatNumber(dcSummary.totalCentralInventory + dcSummary.totalWestInventory)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Quarterly DC Opex</p>
                  <p className="text-xl font-bold text-orange-400">
                    {formatCurrency(dcSummary.totalOpex)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Carrier Summary Card */}
          {multiCarrierEnabled && carrierSummary && (
            <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-6`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🚛</span> Carrier Selection Summary
              </h3>
              <div className="space-y-4">
                {/* Carrier Distribution */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(carrierSummary.carrierCounts).map(([carrier, count]) => {
                    const config = CARRIER_CONFIG[carrier] || { name: carrier, icon: "📦", color: "gray" };
                    return (
                      <div
                        key={carrier}
                        className={`px-3 py-2 rounded-lg ${theme.cardInner} flex items-center gap-2`}
                      >
                        <span>{config.icon}</span>
                        <span className="font-medium">{config.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          config.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                          config.color === "amber" ? "bg-amber-500/20 text-amber-400" :
                          config.color === "purple" ? "bg-purple-500/20 text-purple-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {count} firm{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Warning for forced Air */}
                {carrierSummary.forcedAirCount > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      {carrierSummary.forcedAirCount} firm{carrierSummary.forcedAirCount > 1 ? "s" : ""} forced to Air ($12/unit) due to no DC
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
                    <p className={`text-xs ${theme.textMuted} mb-1`}>Total Freight</p>
                    <p className="text-lg font-bold text-orange-400">
                      {formatCurrency(carrierSummary.totalFreightCost)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
                    <p className={`text-xs ${theme.textMuted} mb-1`}>Avg On-Time Rate</p>
                    <p className="text-lg font-bold text-green-400">
                      {carrierSummary.avgOnTimeRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme.cardInner} text-center`}>
                    <p className={`text-xs ${theme.textMuted} mb-1`}>Firms with TMS</p>
                    <p className="text-lg font-bold text-purple-400">
                      {carrierSummary.firmsWithTMS}/{carrierAnalysis?.firms?.length || 0}
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>-8% freight</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Distribution Centers Section */}
      {activeSection === "dcs" && regionalDCsEnabled && (
        <div className="space-y-6">
          {/* DC Status Table */}
          <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="font-semibold flex items-center gap-2">
                <span>📦</span> Regional DC Operations - Q{selectedQuarter || dcStatus?.quarter || "Current"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme.cardInner}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme.textMuted}`}>Firm</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Central DC</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Central Inv</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Util %</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>West DC</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>West Inv</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Util %</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme.textMuted}`}>Opex</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  {dcStatus?.firms?.map((firm) => (
                    <tr key={firm.firmId} className={`${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: firm.firmColor }}
                          />
                          <span className="font-medium">{firm.firmName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcCentral?.open ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                            ✓ Open
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcCentral?.open ? (
                          <span>{formatNumber(firm.dcCentral?.inventory || 0)}</span>
                        ) : (
                          <span className={theme.textMuted}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcCentral?.open ? (
                          <UtilizationBar value={firm.dcCentral?.utilization || 0} isDark={isDark} />
                        ) : (
                          <span className={theme.textMuted}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcWest?.open ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                            ✓ Open
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                            Closed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcWest?.open ? (
                          <span>{formatNumber(firm.dcWest?.inventory || 0)}</span>
                        ) : (
                          <span className={theme.textMuted}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {firm.dcWest?.open ? (
                          <UtilizationBar value={firm.dcWest?.utilization || 0} isDark={isDark} />
                        ) : (
                          <span className={theme.textMuted}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-orange-400">
                        {formatCurrency(firm.opex || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DC Reference Table */}
          <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>ℹ️</span> DC Configuration Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Factory */}
              <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏭</span>
                  <span className="font-semibold">Factory (R1 East)</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Serves</span>
                    <span className="font-medium">Region 1 Direct</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Service Bonus</span>
                    <span className="font-medium text-green-400">+5% on-time</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Setup Cost</span>
                    <span className="font-medium">N/A</span>
                  </div>
                </div>
              </div>
              
              {/* Central DC */}
              <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏭</span>
                  <span className="font-semibold">Central DC (Chicago)</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Capacity</span>
                    <span className="font-medium">200,000 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Setup Cost</span>
                    <span className="font-medium">$4,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Quarterly Opex</span>
                    <span className="font-medium">$700,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Service Bonus</span>
                    <span className="font-medium text-green-400">+3% on-time (R2)</span>
                  </div>
                </div>
              </div>
              
              {/* West DC */}
              <div className={`p-4 rounded-lg ${theme.cardInner}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏪</span>
                  <span className="font-semibold">West DC (Los Angeles)</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Capacity</span>
                    <span className="font-medium">150,000 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Setup Cost</span>
                    <span className="font-medium">$6,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Quarterly Opex</span>
                    <span className="font-medium">$900,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.textMuted}>Service Bonus</span>
                    <span className="font-medium text-green-400">+5% on-time (R3)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Transfer Costs */}
            <div className={`mt-4 p-4 rounded-lg ${theme.cardInner}`}>
              <p className={`text-sm ${theme.textMuted} mb-2`}>Transfer & Disposal Costs</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={theme.textMuted}>DC to DC:</span>
                  <span className="ml-2 font-medium">$5/unit</span>
                </div>
                <div>
                  <span className={theme.textMuted}>DC to Factory:</span>
                  <span className="ml-2 font-medium">$4/unit</span>
                </div>
                <div>
                  <span className={theme.textMuted}>Closure Recovery:</span>
                  <span className="ml-2 font-medium">25% of setup</span>
                </div>
                <div>
                  <span className={theme.textMuted}>Holding Cost:</span>
                  <span className="ml-2 font-medium">20% less than factory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carrier Analysis Section */}
      {activeSection === "carriers" && multiCarrierEnabled && (
        <div className="space-y-6">
          {/* Carrier Selection Table */}
          <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="font-semibold flex items-center gap-2">
                <span>🚛</span> Carrier Selection - Q{selectedQuarter || carrierAnalysis?.quarter || "Current"}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme.cardInner}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme.textMuted}`}>Firm</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Carrier</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme.textMuted}`}>Units</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme.textMuted}`}>Cost/Unit</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase ${theme.textMuted}`}>Total Freight</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Discounts</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>On-Time</th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme.textMuted}`}>Damage</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  {carrierAnalysis?.firms?.map((firm) => {
                    const carrierConfig = CARRIER_CONFIG[firm.carrier] || { name: firm.carrier, icon: "📦" };
                    const hasDiscount = firm.volumeDiscount > 0 || firm.tmsDiscount > 0;
                    
                    return (
                      <tr key={firm.firmId} className={`${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: firm.firmColor }}
                            />
                            <span className="font-medium">{firm.firmName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              firm.carrier === "TRUCK" ? "bg-blue-500/20 text-blue-400" :
                              firm.carrier === "INTERMODAL" ? "bg-amber-500/20 text-amber-400" :
                              firm.carrier === "AIR" ? "bg-purple-500/20 text-purple-400" :
                              "bg-gray-500/20 text-gray-400"
                            }`}>
                              {carrierConfig.icon} {firm.carrierName || carrierConfig.name}
                            </span>
                            {firm.forcedAir && (
                              <span className="text-xs text-red-400">⚠️ No DC</span>
                            )}
                            {firm.lastMileCost > 0 && !firm.forcedAir && (
                              <span className="text-xs text-gray-400">+ Last Mile</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatNumber(firm.unitsShipped || 0)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <span className="font-medium">${firm.costPerUnit?.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className={`text-xs ${theme.textMuted} line-through ml-1`}>
                                ${firm.baseCostPerUnit?.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-orange-400">
                          {formatCurrency(firm.freightCost || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col gap-1">
                            {firm.volumeDiscount > 0 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                                Vol -{(firm.volumeDiscount * 100).toFixed(0)}%
                              </span>
                            )}
                            {firm.tmsDiscount > 0 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                                TMS -{(firm.tmsDiscount * 100).toFixed(0)}%
                              </span>
                            )}
                            {!hasDiscount && (
                              <span className={theme.textMuted}>—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={firm.onTimeRate >= 95 ? "text-green-400" : firm.onTimeRate >= 90 ? "text-yellow-400" : "text-orange-400"}>
                            {firm.onTimeRate?.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={firm.damageRate <= 0.5 ? "text-green-400" : firm.damageRate <= 1 ? "text-yellow-400" : "text-red-400"}>
                            {(firm.damageRate * 100)?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carrier Reference Table */}
          <div className={`${theme.card} border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>ℹ️</span> Carrier Options Reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={theme.cardInner}>
                    <th className={`px-4 py-2 text-left ${theme.textMuted}`}>Carrier</th>
                    <th className={`px-4 py-2 text-right ${theme.textMuted}`}>Cost/Unit</th>
                    <th className={`px-4 py-2 text-center ${theme.textMuted}`}>On-Time Rate</th>
                    <th className={`px-4 py-2 text-center ${theme.textMuted}`}>Damage Rate</th>
                    <th className={`px-4 py-2 text-center ${theme.textMuted}`}>Volume Discount</th>
                    <th className={`px-4 py-2 text-left ${theme.textMuted}`}>Description</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  <tr>
                    <td className="px-4 py-2 font-medium">🚂 Intermodal</td>
                    <td className="px-4 py-2 text-right text-green-400">$1.50</td>
                    <td className="px-4 py-2 text-center text-orange-400">80%</td>
                    <td className="px-4 py-2 text-center text-red-400">1.0%</td>
                    <td className="px-4 py-2 text-center">None</td>
                    <td className={`px-4 py-2 ${theme.textMuted}`}>Cheapest, variable timing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">🚛 Truck (FTL)</td>
                    <td className="px-4 py-2 text-right">$3.50</td>
                    <td className="px-4 py-2 text-center text-green-400">93%</td>
                    <td className="px-4 py-2 text-center text-green-400">0.5%</td>
                    <td className="px-4 py-2 text-center">5% over 75K units</td>
                    <td className={`px-4 py-2 ${theme.textMuted}`}>Balanced cost/reliability</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">✈️ Air Freight</td>
                    <td className="px-4 py-2 text-right text-red-400">$12.00</td>
                    <td className="px-4 py-2 text-center text-green-400">100%</td>
                    <td className="px-4 py-2 text-center text-green-400">0%</td>
                    <td className="px-4 py-2 text-center">None</td>
                    <td className={`px-4 py-2 ${theme.textMuted}`}>Premium, guaranteed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Additional notes */}
            <div className={`mt-4 p-4 rounded-lg ${theme.cardInner}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="flex items-center gap-2">
                    <span className="text-purple-400">💡</span>
                    <span>TMS Technology: <strong className="text-purple-400">-8%</strong> on all freight costs</span>
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-400">📦</span>
                    <span>Last Mile (with DC): <strong>+$2.50</strong>/unit DC to customer</span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="flex items-center gap-2 text-red-400">
                    <span>⚠️</span>
                    <span>No DC open when Regional DCs enabled = <strong>Forced Air ($12/unit)</strong></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utilization Bar Component
function UtilizationBar({ value, isDark }) {
  const getColor = (val) => {
    if (val >= 90) return "bg-red-500";
    if (val >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-16 h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
        <div
          className={`h-full ${getColor(value)} rounded-full`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs">{value.toFixed(0)}%</span>
    </div>
  );
}
