function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function ChipSelect<T extends string>({
  label,
  options,
  values,
  onChange,
  disabled,
  optionLabel,
}: {
  label: string;
  options: T[];
  values: T[];
  onChange: (next: T[]) => void;
  disabled?: boolean;
  optionLabel?: (value: T) => string;
}) {
  return (
    <fieldset className="chip-fieldset" disabled={disabled}>
      <legend>{label}</legend>
      <div className="chip-row" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`chip${selected ? " selected" : ""}`}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(toggleValue(values, option))}
            >
              {optionLabel ? optionLabel(option) : option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
