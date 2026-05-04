export function ErrorAlert({ error, onClose, isDark }) {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
      <span>⚠️</span>
      <p className="text-red-400 flex-1">{error}</p>
      <button
        onClick={onClose}
        className="text-red-400 hover:text-red-300"
      >
        ✕
      </button>
    </div>
  );
}
