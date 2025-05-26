import { cn } from "@/utils/clsxUtils";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import Select, {
  type MultiValue,
  type SingleValue,
  type StylesConfig,
  components,
} from "react-select";

// Define the option type
type OptionType = {
  value: string;
  label: string;
};

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
}

// Custom dropdown indicator component
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <FaChevronDown className="h-4 w-4 text-muted-foreground" />
    </components.DropdownIndicator>
  );
};

// Custom clear indicator component
const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <FaX className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </components.ClearIndicator>
  );
};

export function SelectInput({
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
}: EnhancedSelectInputProps) {
  const [currentValue, setCurrentValue] = useState<
    OptionType | OptionType[] | null
  >(null);

  // Normalize options to always be OptionType[] format
  const normalizedOptions: OptionType[] = options.map((option) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option as OptionType;
  });

  // Update internal state when props change
  useEffect(() => {
    if (isMulti) {
      const values = Array.isArray(value) ? value : [value].filter(Boolean);
      const selectedOptions = normalizedOptions.filter((option) =>
        values.includes(option.value)
      );
      setCurrentValue(selectedOptions);
    } else {
      const selectedOption =
        normalizedOptions.find((option) => option.value === value) || null;
      setCurrentValue(selectedOption);
    }
  }, [value, normalizedOptions, isMulti]);

  const handleChange = (
    newValue: MultiValue<OptionType> | SingleValue<OptionType>
  ) => {
    if (isMulti) {
      const multiValue = newValue as MultiValue<OptionType>;
      const values = multiValue ? multiValue.map((option) => option.value) : [];
      setCurrentValue(multiValue ? [...multiValue] : []);
      onChange(values);
    } else {
      const singleValue = newValue as SingleValue<OptionType>;
      setCurrentValue(singleValue);
      onChange(singleValue ? singleValue.value : "");
    }
  };

  // Custom styles for react-select with Tailwind classes
  const customStyles: StylesConfig<OptionType, boolean> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "32px",
      height: "32px",
      fontSize: "14px",
      borderRadius: "6px",
      borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
      backgroundColor: "hsl(var(--background))",
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.2)" : "none",
      "&:hover": {
        borderColor: "hsl(var(--border))",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "30px",
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
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
      backgroundColor: "var(--card)",
      border: "2px solid white",
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
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "hsl(var(--secondary-foreground))",
      padding: "2px 6px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "hsl(var(--secondary-foreground))",
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
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && (
        <label
          className={cn("text-sm font-medium text-foreground", labelClassName)}
        >
          {label}
        </label>
      )}
      <div className={cn("relative", selectClassName)}>
        <Select
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
        />
      </div>
    </div>
  );
}

// Export the type for external use
export type { OptionType as SelectOption };
