// src/components/ui/controlled-inputs/NumberInput.tsx
import { cn } from "@/utils/clsxUtils";
import React, { forwardRef } from "react";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  label?: string | React.ReactNode;
  value?: number | string;
  onChange?: (val: number) => void;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      className,
      inputClassName,
      labelClassName,
      disabled,
      min,
      max,
      step,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="flex items-center bg-secondary text-secondary-foreground rounded-sm overflow-hidden">
          {label && (
            <label
              htmlFor={props.id || props.name}
              className={cn("text-xs px-2 whitespace-nowrap", labelClassName)}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value ?? ""}
            onChange={(e) => {
              const parsed = Number.parseFloat(e.target.value);
              onChange?.(Number.isNaN(parsed) ? 0 : parsed);
            }}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent text-sm py-1 px-2 focus:outline-none",
              inputClassName
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
export default NumberInput;
