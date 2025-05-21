import { useState } from "react";
import { Canvas } from "./components/layout/Canvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { MiniSidebar } from "./components/layout/Sidebar/MiniSidebar";
import { SidebarPanel } from "./components/layout/Sidebar";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";

function App() {
  const [activePanel] = useState<null | "text" | "upload" | "layers">(null);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBar />

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
