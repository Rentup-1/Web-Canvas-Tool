import { useEffect, useRef, type RefObject } from "react";
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

type InnerAppProps = {
  stageRef: RefObject<Konva.Stage | null>;
};

const InnerApp = ({ stageRef }: InnerAppProps) => {
  const { json } = useWindowMessageListener();
  const { importTemplate } = useTemplateImporter();

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
          <main className="flex-1 p-4 overflow-auto flex justify-center items-start">
            <div className="bg-white shadow-lg" style={{ lineHeight: 0 }}>
              <Canvas stageRef={stageRef as RefObject<Konva.Stage>} />
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
  const stageRef = useRef<Konva.Stage>(null);

  return (
    <Provider store={store}>
      <CanvasProvider stageRef={stageRef as RefObject<Konva.Stage>}>
        <InnerApp stageRef={stageRef} />
      </CanvasProvider>
    </Provider>
  );
};

export default App;
