// src/app/dashboard/faculty/simulations/[id]/components/Tabs.js

import { TAB_CONFIG } from "../constants";

export default function Tabs({ activeTab, setActiveTab, isDark, theme, simulation }) {
  // Filter tabs based on enabled features
  const visibleTabs = TAB_CONFIG.filter((tab) => {
    if (!tab.feature) return true; // Always show base tabs
    // Check if simulation has this feature enabled
    return simulation?.features?.[tab.feature];
  });

  return (
    <div
      className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex gap-1 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? `${
                    isDark
                      ? "border-blue-500 text-white"
                      : "border-red-500 text-gray-900"
                  }`
                : `border-transparent ${theme.textMuted} hover:${theme.text}`
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}