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
  const [isEditMode, setIsEditMode] = useState(false);
  const { setProjectIdMixer, projectIdMixer, stageRef } = useCanvas();

  const downloadDataUrl = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "canvas.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadCanvasPng = async (dataUrl: string, origin: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "canvas.png");
    formData.append("name", "myCanvasImage");
    formData.append("type", "mixer_image");
    formData.append("public", "true");
    formData.append("project", String(projectIdMixer));

    const rawBaseUrl =
      localStorage.getItem("apiBaseUrl") || "https://api.markomlabs.com/";
    const apiBaseUrl = rawBaseUrl
      .trim()
      .replace(/^['\"]+|['\"]+$/g, "")
      .replace(/\/+$/, "");
    const accessToken = localStorage.getItem("accessToken")?.trim();
    const userId = localStorage.getItem("userId")?.trim();

    if (userId) {
      formData.append("user", userId);
    }

    const uploadRes = await fetch(`${apiBaseUrl}/creatives/assets/`, {
      method: "POST",
      body: formData,
      headers: accessToken
        ? {
            Authorization: `Token ${accessToken}`,
            Accept: "application/json",
          }
        : {
            Accept: "application/json",
          },
    });

    if (!uploadRes.ok) {
      const errorBody = await uploadRes.text();
      throw new Error(
        `Upload failed (${uploadRes.status} ${uploadRes.statusText}): ${errorBody}`,
      );
    }

    const result = await uploadRes.json();

    if (result?.image) {
      const normalizedImagePath = String(result.image).startsWith("/")
        ? result.image
        : `/${result.image}`;
      const fullImageUrl = `${apiBaseUrl}${normalizedImagePath}`;
      window.parent.postMessage(
        {
          type: "IMAGE_SELECTED",
          payload: { url: fullImageUrl, id: result.id },
        },
        origin,
      );
    }
  };

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
          setIsEditMode(Boolean(data?.payload?.editMode));
          localStorage.setItem(
            "designToolEditMode",
            Boolean(data?.payload?.editMode).toString(),
          );

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
          if (!stageRef.current) return;

          try {
            const dataUrl = stageRef.current.toDataURL({
              pixelRatio: 1,
              quality: 1,
            });

            if (isEditMode) {
              window.parent.postMessage(
                { type: "RECEIVE_PNG", payload: { dataUrl } },
                event.origin,
              );
            } else {
              void uploadCanvasPng(dataUrl, event.origin)
                .then(() => downloadDataUrl(dataUrl))
                .catch((error) => {
                  console.error("Failed to upload canvas PNG:", error);
                });
            }
          } catch (error) {
            console.error("Failed to export canvas PNG:", error);
          }
          break;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setProjectIdMixer, isEditMode, projectIdMixer, stageRef]);

  return { json };
};
