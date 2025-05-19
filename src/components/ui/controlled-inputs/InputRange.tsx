interface InputRangeProps {
  label?: string;
  value: number;
  onChange: (val: string) => void;
  className?: string;
}

export const InputRange: React.FC<InputRangeProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div>
      <label className={`fancy-label ${className}`}>
        Opacity {Math.ceil(value * 100)}%
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="fancy-range"
      />
    </div>
  );
};
