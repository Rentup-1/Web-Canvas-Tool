import logoBlue from "@/assets/Marcomz AI_ICON.png";
import LogoWhite from "@/assets/Marcomz AI_ICON.png";
import type { FC } from "react";
import { ShortcutsHelp } from "../ui/ShortcutsHelp";
import { useTheme } from "../ui/theme-provider";
import CanvasExportImport from "./CanvasExportImport";
import ElementGrouping from "./ElementGrouping/ElementGrouping";
import { HistoryControls } from "./HistoryControls";
import { SaveToDataBase } from "./SaveToDataBase";
import ToggleTheme from "./ToggleTheme";

const Navbar: FC = () => {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between px-4 py-4 overflow-hidden border-b">
      <div className="flex items-center space-x-10">
        <div className="flex  gap-2 items-center justify-center ">
          <img
            src={theme === "dark" ? LogoWhite : logoBlue}
            alt="Logo"
            className="w-15"
          />
          <p className="text-3xl font-bold font-['Satisfy'] bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
            Canvas
          </p>
        </div>
        <HistoryControls />
      </div>
      <div>
        <ElementGrouping />
      </div>
      <div className="flex items-center space-x-4">
        <CanvasExportImport />
        <SaveToDataBase />
        <ShortcutsHelp />
        <ToggleTheme />
      </div>
    </div>
  );
};

export default Navbar;
