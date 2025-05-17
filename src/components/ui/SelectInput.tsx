interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select className="border rounded px-2 py-1 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
