// src/app/dashboard/faculty/simulations/[id]/components/modals/EventModal.js

import { EVENT_TYPES } from "../../constants";

export default function EventModal({
  showEventModal,
  setShowEventModal,
  theme,
  isDark,
  eventForm,
  setEventForm,
  handleTriggerEvent,
  actionLoading,
}) {
  if (!showEventModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme.card} border rounded-xl w-full max-w-md`}>
        <div
          className={`px-5 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-between items-center`}
        >
          <h3 className="font-semibold">Trigger Event</h3>
          <button
            onClick={() => setShowEventModal(false)}
            className={`p-2 rounded-lg ${theme.secondaryBg}`}
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Type
            </label>
            <select
              value={eventForm.type}
              onChange={(e) =>
                setEventForm({ ...eventForm, type: e.target.value })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${theme.input}`}
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map((e) => (
                <option key={e.type} value={e.type}>
                  {e.icon} {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Magnitude ({(eventForm.magnitude * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              value={eventForm.magnitude}
              onChange={(e) =>
                setEventForm({
                  ...eventForm,
                  magnitude: parseFloat(e.target.value),
                })
              }
              className="w-full"
              min="0.1"
              max="1.0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (quarters)
            </label>
            <input
              type="number"
              value={eventForm.duration}
              onChange={(e) =>
                setEventForm({
                  ...eventForm,
                  duration: parseInt(e.target.value),
                })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${theme.input}`}
              min="1"
              max="4"
            />
          </div>
        </div>
        <div
          className={`px-5 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex gap-3`}
        >
          <button
            onClick={() => setShowEventModal(false)}
            className={`flex-1 px-4 py-2.5 ${theme.secondaryBg} rounded-lg font-medium`}
          >
            Cancel
          </button>
          <button
            onClick={handleTriggerEvent}
            disabled={!eventForm.type || actionLoading}
            className={`flex-1 px-4 py-2.5 ${theme.accentBg} text-white rounded-lg font-medium disabled:opacity-50`}
          >
            {actionLoading ? "Triggering..." : "Trigger Event"}
          </button>
        </div>
      </div>
    </div>
  );
}