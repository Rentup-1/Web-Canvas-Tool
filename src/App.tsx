import { useEffect, useRef, useState, type RefObject } from "react";
import Konva from "konva";
import { Provider } from "react-redux";
import { Canvas } from "./components/Canvas";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import RightSideBar from "./components/RightSideBar";
import { CanvasProvider } from "./context/CanvasContext";
import { KeyboardShortcutsHandler } from "./components/KeyboardShortcutsHandler";
import { Toaster } from "./components/ui/sonner";
import { store } from "./app/store";
import { useWindowMessageListener } from "./useWindowMessageListener";
import { useTemplateImporter } from "./useTemplateImporter";

type AppProps = {
  templateJson?: string;
};

const InnerApp = () => {
  const { json } = useWindowMessageListener();
  const { importTemplate } = useTemplateImporter();
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    importTemplate(json);
  }, [json, importTemplate]);

  return (
    <>
      <KeyboardShortcutsHandler />
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <LeftSideBar />
          <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
            <div className="bg-white shadow-lg">
              <Canvas stageRef={stageRef} />
            </div>
          </main>
          <RightSideBar />
        </div>
      </div>
      <Toaster position="top-right" closeButton />
    </>
  );
};

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <CanvasProvider>
        <InnerApp />
      </CanvasProvider>
    </Provider>
  );
};

export default App;
