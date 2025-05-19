import { LayerPanel } from "./SidebarPanels/LayerPanel";
import { TextPanel } from "./SidebarPanels/TextPanel";
import { UploadPanel } from "./SidebarPanels/UploadPanel";
import { ShapesPanel } from "./SidebarPanels/ShapesPanel";
import { HistoryControls } from "../history";

export function SidebarPanel({ activePanel }: { activePanel: string | null }) {
  return (
    <aside
      className={`w-64 bg-white border-r p-4 transition-all duration-300 ease-in-out ${
        activePanel ? "block" : "hidden"
      }`}
    >
      {activePanel === "text" && <TextPanel />}
      {activePanel === "upload" && <UploadPanel />}
      {activePanel === "layers" && <LayerPanel />}
      {activePanel === "history" && <HistoryControls />}
      {activePanel === "shapes" && <ShapesPanel />}
    </aside>
  );
}
