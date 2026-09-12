export function Switch({
  checked,
  onChange,
  disabled,
  label,
  hint,
  tone = "orange",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  hint?: string;
  tone?: "orange" | "blue";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`switch switch-${tone}${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-copy">
        <span className="switch-label">{label}</span>
        {hint ? <span className="switch-hint">{hint}</span> : null}
      </span>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
    </button>
  );
}
