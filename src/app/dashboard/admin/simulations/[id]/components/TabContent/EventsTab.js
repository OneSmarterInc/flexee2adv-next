// src/app/dashboard/faculty/simulations/[id]/components/TabContent/EventsTab.js

import { useState, useEffect } from "react";

// Event type configs (array format for mapping)
const EVENT_TYPE_LIST = [
  {
    type: "SUPPLY_DISRUPTION",
    label: "Supply Disruption",
    desc: "Delays incoming parts shipments",
    icon: "🚢",
    color: "orange",
  },
  {
    type: "DEMAND_SURGE",
    label: "Demand Surge",
    desc: "Temporary increase in market demand",
    icon: "📈",
    color: "green",
  },
  {
    type: "COMPETITOR_STUMBLE",
    label: "Competitor Stumble",
    desc: "Competitor PR crisis creates opportunity",
    icon: "🎯",
    color: "blue",
  },
  {
    type: "ECONOMIC_DOWNTURN",
    label: "Economic Downturn",
    desc: "Market-wide demand reduction",
    icon: "📉",
    color: "red",
  },
  {
    type: "RAW_MATERIAL_SPIKE",
    label: "Raw Material Spike",
    desc: "Increase in production costs",
    icon: "💰",
    color: "yellow",
  },
];

// Lookup map for quick access
const EVENT_TYPE_MAP = EVENT_TYPE_LIST.reduce((acc, et) => {
  acc[et.type] = et;
  return acc;
}, {});

export default function EventsTab({
  theme,
  isDark,
  simulation,
  setShowEventModal,
  setEventForm,
  eventForm,
  formatNumber,
  formatPercent,
  selectedQuarter,
  apiUrl,
  getToken,
}) {
  const [eventImpacts, setEventImpacts] = useState([]);
  const [eventSummary, setEventSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Fetch event impacts
  const fetchEventImpacts = async () => {
    if (!simulation?._id) return;
    
    setLoading(true);
    try {
      const quarter = selectedQuarter || simulation.currentQuarter;
      const response = await fetch(
        `${apiUrl}/simulations/${simulation._id}/event-impacts?quarter=${quarter}`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEventImpacts(Array.isArray(data) ? data : data.impacts || []);
      }
    } catch (err) {
      console.error("Failed to load event impacts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch event summary
  const fetchEventSummary = async () => {
    if (!simulation?._id) return;
    
    try {
      const response = await fetch(
        `${apiUrl}/simulations/${simulation._id}/faculty-event-summary`,
        {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEventSummary(data);
      }
    } catch (err) {
      console.error("Failed to load event summary:", err);
    }
  };

  useEffect(() => {
    fetchEventImpacts();
    fetchEventSummary();
  }, [simulation?._id, selectedQuarter, simulation?.currentQuarter]);

  // Group impacts by event for display
  const groupedByEvent = eventImpacts.reduce((acc, impact) => {
    const eventId = impact.event?._id || impact.event || `${impact.eventType}-${impact.quarter}`;
    if (!acc[eventId]) {
      acc[eventId] = {
        eventId,
        eventType: impact.eventType,
        eventEffect: impact.eventEffect,
        eventName: impact.event?.name || EVENT_TYPE_MAP[impact.eventType]?.label || impact.eventType,
        source: impact.source,
        triggeredBy: impact.triggeredBy,
        quarter: impact.quarter,
        rawMagnitude: impact.rawMagnitude,
        firms: [],
      };
    }
    acc[eventId].firms.push(impact);
    return acc;
  }, {});

  const groupedEvents = Object.values(groupedByEvent);

  // Calculate summary stats
  const summaryStats = {
    totalEvents: groupedEvents.length,
    activeEvents: simulation.activeEvents?.length || 0,
    avgMagnitude: groupedEvents.length > 0
      ? groupedEvents.reduce((sum, e) => sum + e.rawMagnitude, 0) / groupedEvents.length
      : 0,
    firmsWithMitigation: eventImpacts.filter((i) => i.hasControlTower).length,
    totalFirmImpacts: eventImpacts.length,
  };

  // Render impact details based on effect type
  const renderImpactDetails = (impact) => {
    const { impacts: impactData, eventEffect } = impact;
    if (!impactData) return null;

    switch (eventEffect) {
      case "PARTS_DELAYED":
        return (
          <span>
            <span className="text-orange-400 font-medium">
              {formatNumber(impactData.partsDelayed || 0)}
            </span>{" "}
            parts delayed
          </span>
        );
      case "DEMAND_SPIKE":
        // demandChangePercent is already stored as percentage (e.g., 30 for +30%)
        return (
          <span>
            <span className="text-green-400 font-medium">
              +{(impactData.demandChangePercent || 0).toFixed(1)}%
            </span>{" "}
            demand
          </span>
        );
      case "DEMAND_DROP":
        // demandChangePercent is stored as negative percentage (e.g., -20 for -20%)
        return (
          <span>
            <span className="text-red-400 font-medium">
              {(impactData.demandChangePercent || 0).toFixed(1)}%
            </span>{" "}
            demand
          </span>
        );
      case "COST_INCREASE":
        // costIncreasePercent is already stored as percentage (e.g., 30 for 30%)
        // Don't multiply by 100 again
        return (
          <span>
            <span className="text-yellow-400 font-medium">
              +{(impactData.costIncreasePercent || 0).toFixed(1)}%
            </span>{" "}
            costs
          </span>
        );
      case "STEAL_INPLAY":
        // marketShareChange is already stored as percentage
        return (
          <span>
            <span className="text-blue-400 font-medium">
              +{(impactData.marketShareChange || 0).toFixed(1)}%
            </span>{" "}
            market opportunity
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Active Events + Trigger Event */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Active Events */}
        <div className={`${theme.card} border ${theme.border} rounded-xl p-5`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            ⚡ Active Events
          </h3>
          {simulation.activeEvents?.length > 0 ? (
            <div className="space-y-3">
              {simulation.activeEvents.map((event, idx) => {
                const eventConfig = EVENT_TYPE_MAP[event.type] || {};
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${theme.cardInner} border-l-4 border-orange-500`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium flex items-center gap-2">
                        <span>{eventConfig.icon || "⚡"}</span>
                        {event.name || eventConfig.label || event.type}
                      </p>
                      <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                    <p className={`text-sm ${theme.textMuted} mt-1`}>
                      {event.description ||
                        `Magnitude: ${formatPercent((event.magnitude || 0) )}`}
                    </p>
                    <div className={`flex gap-4 mt-2 text-xs ${theme.textMuted}`}>
                      <span>Started: Q{event.startQuarter}</span>
                      <span>Duration: {event.duration} quarter(s)</span>
                      <span>Ends: Q{event.startQuarter + event.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-8 rounded-lg ${theme.cardInner} text-center`}>
              <span className="text-4xl">🌤️</span>
              <p className={`mt-3 ${theme.textMuted}`}>No active events</p>
            </div>
          )}
        </div>

        {/* Trigger Event */}
        <div className={`${theme.card} border ${theme.border} rounded-xl p-5`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            🎯 Trigger Event
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {EVENT_TYPE_LIST.map((event) => (
              <button
                key={event.type}
                onClick={() => {
                  setEventForm({ ...eventForm, type: event.type });
                  setShowEventModal(true);
                }}
                className={`p-4 rounded-lg ${theme.cardInner} text-left transition-all hover:ring-2 hover:ring-blue-500/50`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{event.icon}</span>
                  <div>
                    <p className="font-medium">{event.label}</p>
                    <p className={`text-xs ${theme.textMuted}`}>{event.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Summary Stats */}
      <div className={`${theme.card} border ${theme.border} rounded-xl p-5`}>
        <h3 className="font-semibold mb-4">📊 Event Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Active Events</p>
            <p className="text-lg font-bold text-orange-400">
              {summaryStats.activeEvents}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Events This Quarter</p>
            <p className="text-lg font-bold">{summaryStats.totalEvents}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Firm Impacts</p>
            <p className="text-lg font-bold">{summaryStats.totalFirmImpacts}</p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Avg Magnitude</p>
            <p className="text-lg font-bold">
              {formatPercent(summaryStats.avgMagnitude )}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${theme.cardInner}`}>
            <p className={`text-xs ${theme.textMuted}`}>Firms Mitigated</p>
            <p className="text-lg font-bold text-emerald-400">
              {summaryStats.firmsWithMitigation}
            </p>
          </div>
        </div>
      </div>

      {/* Event Impacts - Grouped by Event */}
      <div className={`${theme.card} border ${theme.border} rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            📈 Event Impacts
            <span className={`text-sm font-normal ${theme.textMuted}`}>
              Q{selectedQuarter || simulation.currentQuarter}
            </span>
          </h3>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          )}
        </div>

        {groupedEvents.length > 0 ? (
          <div className="space-y-4">
            {groupedEvents.map((event) => {
              const eventConfig = EVENT_TYPE_MAP[event.eventType] || {};
              const isExpanded = expandedEvent === event.eventId;

              return (
                <div
                  key={event.eventId}
                  className={`rounded-lg overflow-hidden border ${theme.border}`}
                >
                  {/* Event Header - Clickable */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.eventId)}
                    className={`w-full p-4 ${theme.cardInner} flex items-center justify-between hover:opacity-80 transition`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{eventConfig.icon || "⚡"}</span>
                      <div className="text-left">
                        <p className="font-medium flex items-center gap-2">
                          {event.eventName}
                          {event.source === "FACULTY_TRIGGERED" && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                              Faculty
                            </span>
                          )}
                        </p>
                        <p className={`text-sm ${theme.textMuted}`}>
                          {formatPercent(event.rawMagnitude )} magnitude •{" "}
                          {event.firms.length} firm{event.firms.length !== 1 ? "s" : ""} affected
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expanded: Per-Firm Impacts */}
                  {isExpanded && (
                    <div className={`border-t ${theme.border} p-4 space-y-3`}>
                      {event.firms.map((firmImpact, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-100"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: firmImpact.firm?.color || "#3B82F6",
                                }}
                              />
                              <span className="font-medium">
                                {firmImpact.firm?.name || `Firm ${firmImpact.firm?.firmNumber}`}
                              </span>
                            </div>
                            {firmImpact.hasControlTower ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {formatPercent(firmImpact.mitigationApplied )} mitigated
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">
                                No mitigation
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <div>{renderImpactDetails(firmImpact)}</div>
                            <div className={theme.textMuted}>
                              Effective: {formatPercent(firmImpact.effectiveMagnitude )}
                            </div>
                          </div>

                          {/* Firm context at time of impact */}
                          {firmImpact.firmContext && (
                            <div
                              className={`mt-2 pt-2 border-t ${theme.border} grid grid-cols-4 gap-2 text-xs ${theme.textMuted}`}
                            >
                              <div>
                                Cash: ${formatNumber(firmImpact.firmContext.cashBefore || 0)}
                              </div>
                              <div>
                                Inventory: {formatNumber(firmImpact.firmContext.inventoryBefore || 0)}
                              </div>
                              <div>
                                Share: {formatPercent((firmImpact.firmContext.marketShareBefore || 0) )}
                              </div>
                              <div>
                                CSI: {formatNumber(firmImpact.firmContext.csiBefore || 0)}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Triggered by info */}
                      {event.source === "FACULTY_TRIGGERED" && event.triggeredBy && (
                        <div className={`text-sm ${theme.textMuted} pt-2`}>
                          Triggered by:{" "}
                          <span className="text-purple-400">
                            {event.triggeredBy.name || event.triggeredBy.email}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-8 rounded-lg ${theme.cardInner} text-center`}>
            <span className="text-4xl">📊</span>
            <p className={`mt-3 ${theme.textMuted}`}>
              No event impacts recorded for Q{selectedQuarter || simulation.currentQuarter}
            </p>
          </div>
        )}
      </div>

      {/* Faculty Event History (from summary endpoint) */}
      {eventSummary?.impacts && eventSummary.impacts.length > 0 && (
        <div className={`${theme.card} border ${theme.border} rounded-xl p-5`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-purple-400">👨‍🏫</span> Faculty-Triggered Event History
          </h3>
          <div className="space-y-3">
            {eventSummary.impacts.map((item, idx) => {
              const eventConfig = EVENT_TYPE_MAP[item._id?.eventType] || {};
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${theme.cardInner} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{eventConfig.icon || "⚡"}</span>
                    <div>
                      <p className="font-medium">
                        {eventConfig.label || item._id?.eventType}
                      </p>
                      <p className={`text-sm ${theme.textMuted}`}>
                        Quarter {item._id?.quarter}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{item.firmsAffected}</p>
                      <p className={theme.textMuted}>Firms</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-400">
                        {item.firmsWithMitigation}
                      </p>
                      <p className={theme.textMuted}>Mitigated</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">
                        {formatPercent((item.avgEffectiveMagnitude || 0) )}
                      </p>
                      <p className={theme.textMuted}>Avg Impact</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}