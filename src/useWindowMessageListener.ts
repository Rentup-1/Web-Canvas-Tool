import { useEffect, useState } from "react";
import { useCanvas } from "./context/CanvasContext";

const parseProjectId = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asString = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

const normalizeBaseUrl = (value: string): string => {
  const cleaned = value.trim().replace(/^['\"]+|['\"]+$/g, "");
  if (!cleaned) {
    return "";
  }

  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
};

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
          if (data?.payload) {
            const projectId = parseProjectId(data.payload.projectId);
            const token = asString(data.payload.token);
            const userId = asString(data.payload.userId);

            setProjectIdMixer(projectId);

            if (token) {
              localStorage.setItem("accessToken", token);
            }

            if (userId) {
              localStorage.setItem("userId", userId);
            }
          }
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
          if (data?.payload?.apiBaseUrl) {
            const normalizedBaseUrl = normalizeBaseUrl(
              asString(data.payload.apiBaseUrl),
            );
            if (normalizedBaseUrl) {
              localStorage.setItem("apiBaseUrl", normalizedBaseUrl);
            }
          }

          // Backward-compatible auth bootstrap for standalone parent flows.
          if (data?.payload?.auth?.token) {
            localStorage.setItem("accessToken", data.payload.auth.token);
          }

          if (data?.payload?.auth?.userId) {
            localStorage.setItem("userId", data.payload.auth.userId);
          }

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
