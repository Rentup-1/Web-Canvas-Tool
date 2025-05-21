interface TextInputProps {
  label?: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: "text" | "number";
  className?: string;
}

export function TextInput({ label, value, onChange, type = "text", className = "" }: TextInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label>{label}</label>}
      <input type={type} className="input-text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
