import type { RootState } from "@/app/store";
import type { SmartColor } from "@/types/SmartColor";
import { useSelector } from "react-redux";

export const useSmartColor = (color: SmartColor): string => {
  const brandingColors = useSelector(
    (state: RootState) => state.branding.colors
  );

  if (color.type === "fixed") return color.value;

  return brandingColors[color.key] ?? "#000000"; // fallback if not found
};
