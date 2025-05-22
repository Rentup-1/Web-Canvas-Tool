import { cn } from "@/utils/clsxUtils";
import type React from "react";

import { useState, useEffect, useRef } from "react";

interface ColorInputProps {
  label?: string;
  value: string;
  opacity?: number;
  onChange: (val: string, opacity?: number) => void;
  className?: string;
  showOpacity?: boolean;
}

export function ColorInput({
  label,
  value,
  opacity = 100,
  onChange,
  className,
  showOpacity = false,
}: ColorInputProps) {
  const [hexValue, setHexValue] = useState(value);
  const [opacityValue, setOpacityValue] = useState(opacity);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexValue(value);
  }, [value]);

  useEffect(() => {
    setOpacityValue(opacity);
  }, [opacity]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    onChange(newValue, opacityValue);
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number.parseInt(e.target.value);
    setOpacityValue(newOpacity);
    onChange(hexValue, newOpacity);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    onChange(newValue, opacityValue);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <div className="flex items-center  bg-secondary text-secondary-foreground rounded-sm  overflow-hidden">
        <div className="flex items-center flex-1">
          <div
            className="w-4 h-4 ml-2 rounded-sm cursor-pointer"
            style={{ backgroundColor: hexValue }}
            onClick={() => colorPickerRef.current?.click()}
          />
          <input
            type="text"
            value={hexValue.toUpperCase()}
            onChange={handleHexChange}
            className="bg-transparent text-xs px-2 py-1 w-20 focus:outline-none"
          />
        </div>
        {showOpacity && (
          <div className="flex items-center pr-2">
            <input
              type="number"
              min="0"
              max="100"
              value={opacityValue}
              onChange={handleOpacityChange}
              className="bg-transparent text-xs w-8 text-right focus:outline-none"
            />
            <span className="text-xs ml-1">%</span>
          </div>
        )}
        <input
          type="color"
          value={hexValue}
          onChange={handleColorPickerChange}
          className="sr-only"
          id="color-picker"
          ref={colorPickerRef}
        />
      </div>
    </div>
  );
}
