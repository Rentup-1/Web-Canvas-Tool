import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { PropertiesPanel } from "./components/PropertiesPanel";

function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white shadow flex items-center px-6">
        <h1 className="text-xl font-semibold text-gray-800">🖌️ Mini Canva Clone</h1>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white border-r p-4 space-y-4">
          <Toolbar />
          {/* Future: Upload, Layers, Shapes */}
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 p-4 overflow-auto flex justify-center items-start">
          <div className="bg-white shadow rounded overflow-hidden border">
            <Canvas />
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-80  border-l p-4">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
}

export default App;
