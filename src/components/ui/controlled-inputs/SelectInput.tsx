import type React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/utils/clsxUtils";
import { FaChevronDown } from "react-icons/fa";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[] | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
  selectClassName,
  labelClassName,
}: SelectInputProps) {
  const [currentValue, setCurrentValue] = useState(value);

  // Update internal state when props change
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    onChange(newValue);
  };

  // Normalize options to always be SelectOption[] format
  const normalizedOptions = options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option as SelectOption;
  });

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && (
        <label className={cn("text-sm font-medium", labelClassName)}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-8 px-3 py-1 text-sm rounded-sm bg-secondary text-secondary-foreground appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors border border-secondary-foreground/10 dark:border-secondary-foreground/20",
            disabled && "opacity-50 cursor-not-allowed",
            selectClassName
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <FaChevronDown className="h-4 w-4 text-secondary-foreground/70 dark:text-secondary-foreground/50" />
        </div>
      </div>
    </div>
  );
}
