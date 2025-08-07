import { useRef, type RefObject } from "react";
import Konva from "konva";
import { Canvas } from "./components/Canvas";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import RightSideBar from "./components/RightSideBar";
import { CanvasProvider } from "./context/CanvasContext";
import { KeyboardShortcutsHandler } from "./components/KeyboardShortcutsHandler";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "./app/store";

import "@fontsource/roboto";
import "@fontsource/open-sans";
import "@fontsource/lato";
import "@fontsource/montserrat";
import "@fontsource/poppins";
import "@fontsource/raleway";
import "@fontsource/oswald";
import "@fontsource/merriweather";
import "@fontsource/playfair-display";
import "@fontsource/nunito";
import "@fontsource/ubuntu";
import "@fontsource/pt-sans";
import "@fontsource/inter";
import "@fontsource/quicksand";
import "@fontsource/source-sans-pro";
import "@fontsource/cabin";
import "@fontsource/rubik";
import "@fontsource/fira-sans";
import "@fontsource/inconsolata";
import "@fontsource/manrope";

import "./index.css";

function App() {
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <Provider store={store}>
      <CanvasProvider stageRef={stageRef as RefObject<Konva.Stage>}>
        <KeyboardShortcutsHandler />
        <div className="h-screen flex flex-col">
          {/* Header */}
          <Navbar />

          {/* Main Layout */}
          <div className="flex flex-1 overflow-hidden">
            <LeftSideBar />

            {/* Canvas Area */}
            <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
              <div className="bg-white shadow-lg">
                <Canvas stageRef={stageRef as RefObject<Konva.Stage>} />
              </div>
            </main>
            <RightSideBar />
          </div>
        </div>
        <Toaster position="top-right" closeButton={true} />
      </CanvasProvider>
    </Provider>
  );
}

export default App;
