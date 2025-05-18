import { LayerPanel } from "../../ui/panels/LayerPanel";
import { TextPanel } from "../../ui/panels/TextPanel";
import { UploadPanel } from "../../ui/panels/UploadPanel";

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
    </aside>
  );
}
