"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import Select, {
  type MultiValue,
  type SingleValue,
  type StylesConfig,
  components,
  type DropdownIndicatorProps,
  type ClearIndicatorProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { cn } from "@/utils/clsxUtils";

// Define the option type
export type OptionType = {
  value: string;
  label: string;
};

// Define component props
export interface EnhancedSelectInputProps {
  label?: string;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  options: OptionType[] | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  closeMenuOnSelect?: boolean;
  maxMenuHeight?: number;
  creatable?: boolean;
}

// Custom dropdown indicator component
const DropdownIndicator = (
  props: DropdownIndicatorProps<OptionType, boolean>
) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </components.DropdownIndicator>
  );
};

// Custom clear indicator component
const ClearIndicator = (props: ClearIndicatorProps<OptionType, boolean>) => {
  return (
    <components.ClearIndicator {...props}>
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </components.ClearIndicator>
  );
};

// Move custom styles outside the component to prevent recalculation
const getCustomStyles = (
  maxMenuHeight: number,
  isMulti: boolean
): StylesConfig<OptionType, boolean> => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "32px",
    height: isMulti ? "auto" : "32px",
    fontSize: "14px",
    borderRadius: "6px",
    borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
    backgroundColor: "hsl(var(--background))",
    boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.2)" : "none",
    "&:hover": {
      borderColor: "hsl(var(--border))",
    },
    padding: isMulti ? "2px 0" : "0",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
    flexWrap: "wrap",
    gap: "4px",
    maxHeight: isMulti ? "120px" : "30px",
    overflowY: isMulti ? "auto" : "hidden",
    alignItems: "center",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "hsl(var(--muted))",
      borderRadius: "2px",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0",
    color: "hsl(var(--foreground))",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "30px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: "4px",
    maxHeight: maxMenuHeight,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(var(--accent))"
      : state.isFocused
      ? "hsl(var(--accent) / 0.5)"
      : "transparent",
    color: state.isSelected
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--foreground))",
    padding: "8px 12px",
    borderRadius: "4px",
    margin: "1px 0",
    cursor: "pointer",
    fontSize: "14px",
    "&:active": {
      backgroundColor: "hsl(var(--accent))",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    fontSize: "14px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
    fontSize: "14px",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "hsl(var(--secondary))",
    borderRadius: "4px",
    fontSize: "12px",
    margin: "0",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "hsl(var(--secondary-foreground))",
    padding: "2px 6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "150px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "hsl(var(--secondary-foreground))",
    padding: "0 4px",
    "&:hover": {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    fontSize: "14px",
  }),
});

const SelectInput = memo(
  ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    className,
    selectClassName,
    labelClassName,
    isMulti = false,
    isSearchable = true,
    isClearable = true,
    closeMenuOnSelect = true,
    maxMenuHeight = 200,
    creatable = false,
  }: EnhancedSelectInputProps) => {
    const [currentValue, setCurrentValue] = useState<
      OptionType | OptionType[] | null
    >(null);
    const prevValueRef = useRef<string | string[] | null>(null);

    // Normalize options to always be OptionType[] format
    const normalizedOptions = useMemo<OptionType[]>(() => {
      return options.map((option) =>
        typeof option === "string" ? { value: option, label: option } : option
      );
    }, [options]);

    // Update internal state when props change
    useEffect(() => {
      if (JSON.stringify(value) !== JSON.stringify(prevValueRef.current)) {
        if (isMulti) {
          const values = Array.isArray(value) ? value : [value].filter(Boolean);
          const selectedOptions = values.map((val) => {
            const existingOption = normalizedOptions.find(
              (opt) => opt.value === val
            );
            return existingOption || { value: val, label: val };
          });
          setCurrentValue(selectedOptions);
        } else {
          const selectedOption =
            normalizedOptions.find((option) => option.value === value) || null;
          setCurrentValue(selectedOption);
        }
        prevValueRef.current = value;
      }
    }, [value, normalizedOptions, isMulti]);

    // Memoized change handler
    const handleChange = useCallback(
      (newValue: MultiValue<OptionType> | SingleValue<OptionType>) => {
        if (isMulti) {
          const multiValue = newValue as MultiValue<OptionType>;
          const values = multiValue
            ? multiValue.map((option) => option.value)
            : [];
          setCurrentValue(multiValue ? [...multiValue] : []);
          onChange(values);
        } else {
          const singleValue = newValue as SingleValue<OptionType>;
          setCurrentValue(singleValue);
          onChange(singleValue ? singleValue.value : "");
        }
      },
      [isMulti, onChange]
    );

    // Use memoized custom styles
    const customStyles = useMemo(
      () => getCustomStyles(maxMenuHeight, isMulti),
      [maxMenuHeight, isMulti]
    );

    const SelectComponent = creatable ? CreatableSelect : Select;

    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        {label && (
          <label
            className={cn(
              "text-sm font-medium text-foreground",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className={cn("relative", selectClassName)}>
          <SelectComponent
            value={currentValue}
            onChange={handleChange}
            options={normalizedOptions}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={disabled}
            placeholder={placeholder}
            closeMenuOnSelect={closeMenuOnSelect && !isMulti}
            styles={customStyles}
            components={{
              DropdownIndicator,
              ClearIndicator,
            }}
            classNamePrefix="react-select"
            noOptionsMessage={() => "No options found"}
            menuPlacement="auto"
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
          />
        </div>
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";

// Export the type for external use
export type { OptionType as SelectOption };

export default SelectInput;
