import { useEffect, useState } from "react";
import { useCanvas } from "./context/CanvasContext";

export const useWindowMessageListener = () => {
  const [json, setJson] = useState<string | null>(null);
  const { setProjectIdMixer } = useCanvas();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const { data } = event;
      if (!data || typeof data !== "object" || !data.type) return;

      switch (data.type) {
        case "SEND_JSON":
          setJson(data.payload.json);
          break;
        case "PROJECT_SELECTED":
          setProjectIdMixer(data.payload.projectId);
          localStorage.setItem("accessToken", data.payload.token);
          break;
        case "EDIT_IMAGE": {
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
          setJson(newJson);
          break;
        }
        case "INIT":
          window.parent.postMessage({ type: "TOOL_READY" }, event.origin);
          break;
        case "UPDATE_TEMPLATE":
          // Logic for template update can be handled here
          break;
        case "REQUEST_EXPORT":
          // This should be connected to the actual export logic
          break;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setProjectIdMixer]);

  return { json };
};
