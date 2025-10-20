import { useEffect, useRef, useState, type RefObject } from "react";
import Konva from "konva";
import { Canvas } from "./components/Canvas";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import RightSideBar from "./components/RightSideBar";
import { CanvasProvider, useCanvas } from "./context/CanvasContext";
import { KeyboardShortcutsHandler } from "./components/KeyboardShortcutsHandler";
import { Toaster } from "./components/ui/sonner";
import { Provider, useDispatch } from "react-redux";
import { store } from "./app/store";

import {
  setAspectRatio,
  setElements,
  setStageSize,
} from "./features/canvas/canvasSlice";
import { addColor, addFont } from "./features/branding/brandingSlice";

type AppProps = {
  templateJson?: string;
};

const App: React.FC<AppProps> = () => {
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <Provider store={store}>
      <CanvasProvider stageRef={stageRef as RefObject<Konva.Stage>}>
        <InnerApp />
      </CanvasProvider>
    </Provider>
  );
};

const InnerApp: React.FC<AppProps> = () => {
  const dispatch = useDispatch();
  const [json, setJson] = useState(null);
  const { stageRef, setProjectIdMixer, imageSrc } = useCanvas();
  const handleImportJson = (importedData: any) => {
    try {
      if (!importedData || !Array.isArray(importedData.elements)) return;

      const elements = [...importedData.elements];

      importedData.frames?.forEach((frame: any) => {
        const frameIndex = elements.findIndex(
          (el: any) =>
            Number(el.frame_position_in_template) ===
            Number(frame.frame_position_in_template)
        );

        if (frameIndex !== -1) {
          const frameElement = elements[frameIndex];
          elements[frameIndex] = { ...frameElement, type: "frame", zIndex: 1 };

          if (frame.assets?.[0]?.image_url) {
            const fitMode =
              frame.objectFit === "contain"
                ? "fit"
                : frame.objectFit === "cover"
                ? "fill"
                : "stretch";
            const imageElement = {
              id: `image-${frameElement.id}`,
              type: "image",
              frameId: frameElement.id,
              x: frameElement.x,
              y: frameElement.y,
              width: frameElement.width,
              height: frameElement.height,
              src: `https://api.markomlabs.com${frame.assets[0].image_url}`,
              originalWidth: frame.assets[0].width || frameElement.width,
              originalHeight: frame.assets[0].height || frameElement.height,
              fitMode,
              opacity: frameElement.opacity ?? 1,
              zIndex: 0,
            };
            elements.splice(frameIndex + 1, 0, imageElement);
          }
        }
      });

      elements.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));

      dispatch(setElements(elements));
      dispatch(
        setStageSize({ width: importedData.width, height: importedData.height })
      );
      dispatch(setAspectRatio(importedData.scale));

      if (importedData.branding) {
        const branding = importedData.branding;
        branding.colors &&
          Object.entries(branding.colors).forEach(([key, value]) => {
            dispatch(addColor({ key, value: String(value) }));
          });
        branding.fonts &&
          Object.entries(branding.fonts).forEach(
            ([key, fontData]: [string, any]) => {
              dispatch(
                addFont({
                  key,
                  value: fontData.value,
                  isFile: fontData.isFile,
                  variant: fontData.variant,
                })
              );
            }
          );
      }
    } catch (error) {
      console.error("Import error:", error);
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case "SEND_JSON":
          setJson(data.payload.json);
          break;
        case "PROJECT_SELECTED":
          setProjectIdMixer(data.payload.projectId);
          break;

        case "EDIT_IMAGE":
          console.log("🖼️ Received image URL from parent:", data.payload);

          const imageUrl = data.payload.url;

          const newJson = JSON.stringify({
            elements: [
              {
                id: "image-1",
                type: "image",
                src: imageUrl,
                x: 0,
                y: 0,
                width: 1080,
                height: 1080,
                zIndex: 1,
              },
            ],
            width: 1080,
            height: 1080,
            scale: 1,
          });

          setJson(newJson as any);
          break;

        case "INIT":
          window.parent.postMessage({ type: "TOOL_READY" }, event.origin);
          break;

        case "UPDATE_TEMPLATE":
          const template = JSON.parse(data.payload.json);
          console.log("Template version:", data.payload.version, template);
          break;

        case "REQUEST_EXPORT":
          const exportedData = { json: JSON.stringify({ my: "data" }) };
          window.parent.postMessage(
            { type: "EXPORT_RESULT", payload: exportedData },
            event.origin
          );
          break;
        default:
          console.warn("Unknown message type:", data.type);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (json) {
      handleImportJson(JSON.parse(json));
    }
  }, [json]);

  return (
    <>
      <KeyboardShortcutsHandler />
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <LeftSideBar />
          <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
            <div className="bg-white shadow-lg">
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

export default App;
