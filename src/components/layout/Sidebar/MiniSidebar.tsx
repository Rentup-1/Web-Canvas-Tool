import { FaTextWidth, FaImage, FaLayerGroup } from "react-icons/fa";

export function MiniSidebar({
  activePanel,
  setActivePanel,
}: {
  activePanel: string | null;
  setActivePanel: (panel: "text" | "upload" | "layers" | null) => void;
}) {
  const buttons = [
    { id: "text", icon: <FaTextWidth />, label: "Text" },
    { id: "upload", icon: <FaImage />, label: "Upload" },
    { id: "layers", icon: <FaLayerGroup />, label: "Layers" },
  ];

  return (
    <aside className="w-16 bg-gray-200 border-r flex flex-col items-center py-4 space-y-4">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          title={btn.label}
          onClick={() => setActivePanel(activePanel === btn.id ? null : (btn.id as any))}
          className={`fancy-button ${activePanel === btn.id ? "fancy-button-hovered" : ""}`}
        >
          {btn.icon}
        </button>
      ))}
    </aside>
  );
}
