import { useState } from "react";
import { Canvas } from "./components/layout/Canvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { MiniSidebar } from "./components/layout/Sidebar/MiniSidebar";
import { SidebarPanel } from "./components/layout/Sidebar";

function App() {
  const [activePanel, setActivePanel] = useState<null | "text" | "upload" | "layers">(null);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white shadow flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-800">🎨 Mini Canva Clone</h1>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mini Sidebar */}
        <MiniSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

        {/* Sidebar Panel Content */}
        <SidebarPanel activePanel={activePanel} />

        {/* Canvas Area */}
        <main className="flex-1 p-4 overflow-auto flex justify-center items-start">
          <div className="bg-white shadow-lg rounded-md">
            <Canvas />
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l p-4 overflow-y-auto">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
}

export default App;
