interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="fancy-label">{label}</label>}
      <select className="fancy-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
