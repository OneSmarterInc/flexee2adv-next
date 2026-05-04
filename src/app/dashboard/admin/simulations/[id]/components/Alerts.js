// src/app/dashboard/faculty/simulations/[id]/components/Alerts.js

export default function Alerts({ error, success, setError, setSuccess }) {
  return (
    <>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-red-400 flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <span>✓</span>
          <p className="text-green-400 flex-1">{success}</p>
          <button
            onClick={() => setSuccess("")}
            className="text-green-400 hover:text-green-300"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}