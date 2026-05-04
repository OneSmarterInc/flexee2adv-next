import { REPORT_TABS } from "../constants";

export function TabNavigation({ activeTab, onTabChange, isDark }) {
  return (
    <div className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <div className="flex gap-1 overflow-x-auto pb-px">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
  );
}
