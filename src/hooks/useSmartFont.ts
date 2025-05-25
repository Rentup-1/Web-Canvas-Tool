import type { RootState } from "@/app/store";
import type { SmartFont } from "@/types/SmartFont";
import { useSelector } from "react-redux";

export const useSmartFont = (font: SmartFont): string => {
  const fonts = useSelector((state: RootState) => state.branding.fontFamilies);

  if (font.type === "fixed") return font.value;

  return fonts[font.key] ?? "Arial";
};
