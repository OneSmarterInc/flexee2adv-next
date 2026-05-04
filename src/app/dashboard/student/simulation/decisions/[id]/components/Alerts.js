export function AlertError({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
      <span>⚠️</span>
      <p className="text-red-400 flex-1">{message}</p>
      <button onClick={onClose} className="text-red-400 hover:text-red-300">✕</button>
    </div>
  );
}

export function AlertSuccess({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
      <span>✓</span>
      <p className="text-green-400 flex-1">{message}</p>
      <button onClick={onClose} className="text-green-400 hover:text-green-300">✕</button>
    </div>
  );
}

export function ValidationErrorsAlert({ errors, theme }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span>⚠️</span>
        <p className="text-orange-400 font-medium">Please fix the following issues before submitting:</p>
      </div>
      <ul className={`text-sm ${theme.textMuted} space-y-1 ml-6`}>
        {errors.map((err, idx) => (
          <li key={idx} className="list-disc text-orange-300">{err}</li>
        ))}
      </ul>
    </div>
  );
}