// src/app/dashboard/faculty/simulations/[id]/components/modals/FeatureModal.js

export default function FeatureModal({
  showFeatureModal,
  setShowFeatureModal,
  theme,
  isDark,
  simulation,
  ADVANCED_MODULES,
  handleUpdateFeatures,
  actionLoading,
}) {
  if (!showFeatureModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme.card} border rounded-xl w-full max-w-2xl`}>
        <div
          className={`px-5 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-between items-center`}
        >
          <h3 className="font-semibold">Manage Features</h3>
          <button
            onClick={() => setShowFeatureModal(false)}
            className={`p-2 rounded-lg ${theme.secondaryBg}`}
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className="font-medium mb-3">Advanced Modules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ADVANCED_MODULES).map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    simulation.features?.[key]
                      ? "border-purple-500 bg-purple-500/10"
                      : `${theme.cardInner} border-transparent`
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={simulation.features?.[key] || false}
                    onChange={() =>
                      handleUpdateFeatures({
                        [key]: !simulation.features?.[key],
                      })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {config.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`px-5 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-end`}
        >
          <button
            onClick={() => setShowFeatureModal(false)}
            className={`px-5 py-2.5 ${theme.accentBg} text-white rounded-lg font-medium`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}