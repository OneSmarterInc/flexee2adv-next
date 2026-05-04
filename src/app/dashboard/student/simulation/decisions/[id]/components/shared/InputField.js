export function InputField({ label, type = "number", value, onChange, disabled, min, max, step, theme, icon, suffix, helper }) {
  const hasPrefix = icon || type === "number";
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-1">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${icon ? "pl-8" : "pl-4"} ${suffix ? "pr-8" : "pr-4"} py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{suffix}</span>}
      </div>
      {helper && <p className={`text-xs ${theme.textMuted} mt-1`}>{helper}</p>}
    </label>
  );
}