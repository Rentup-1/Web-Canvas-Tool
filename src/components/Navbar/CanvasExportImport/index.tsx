import { useEffect, useRef, useState, type FC } from "react";
import { FaFileImport, FaImage, FaSave } from "react-icons/fa";
import { Button } from "../../ui/Button";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  setElements,
  setStageSize,
  setAspectRatio,
} from "@/features/canvas/canvasSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCanvas } from "@/context/CanvasContext";
import { addColor, addFont } from "@/features/branding/brandingSlice";
import { Textarea } from "@/components/ui/textarea";

const CanvasExportImport: FC = () => {
  const dispatch = useAppDispatch();
  const {
    handleExportJSON,
    handleExportPNG,
    handleExportSVG,
    handleExportSummary,
    stageRef,
    projectIdMixer,
    setImageSrc,
  } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileViaBackEndInputRef = useRef<HTMLInputElement>(null);
  const fileViaMixer = useRef<HTMLInputElement>(null);
  const [jsonInput, setJsonInput] = useState<string>("");

  // Handle import from file (original format)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);

        if (
          importedData &&
          Array.isArray(importedData.elements) &&
          importedData.stage &&
          importedData.stage.height &&
          importedData.stage.width &&
          importedData.stage.aspectRatio
        ) {
          dispatch(setElements(importedData.elements));
          dispatch(
            setStageSize({
              height: importedData.stage.height,
              width: importedData.stage.width,
            })
          );
          dispatch(setAspectRatio(importedData.stage.aspectRatio));

          // Import branding
          if (importedData.branding) {
            if (importedData.branding.colors) {
              Object.entries(importedData.branding.colors).forEach(
                ([key, value]) => {
                  dispatch(addColor({ key, value: String(value) }));
                }
              );
            }

            if (importedData.branding.fonts) {
              Object.entries(importedData.branding.fonts).forEach(
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
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
      }
    };

    reader.readAsText(file);
  };

  // Handle import via back-end
  const handleImportViaBackEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    const mapFitMode = (backendFit: string): "fit" | "fill" | "stretch" => {
      switch (backendFit) {
        case "contain":
          return "fit";
        case "cover":
          return "fill";
        case "stretch":
          return "stretch";
        default:
          return "fill";
      }
    };

    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);
        console.log("Imported Data:", importedData);

        if (
          importedData &&
          Array.isArray(
            importedData.results.templates[0].json_template.elements
          ) &&
          importedData.results.templates[0].json_template.stage &&
          importedData.results.templates[0].json_template.stage.height &&
          importedData.results.templates[0].json_template.stage.width &&
          importedData.results.templates[0].json_template.stage.aspectRatio
        ) {
          const elements = [
            ...importedData.results.templates[0].json_template.elements,
          ];

          importedData.results.templates[0].frames.forEach((frame: any) => {
            const frameIndex = elements.findIndex(
              (el: any) =>
                el.frame_position_in_template ==
                frame.frame_position_in_template
            );

            if (frameIndex !== -1) {
              const frameElement = elements[frameIndex];

              elements[frameIndex] = {
                ...frameElement,
                type: "frame",
                zIndex: 1,
              };

              if (frame.assets?.[0]?.image_url) {
                const fitMode = mapFitMode(
                  frame.objectFit || frame.fitMode || "fill"
                );

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

          elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

          dispatch(setElements([...elements]));
          dispatch(
            setStageSize({
              height:
                importedData.results.templates[0].json_template.stage.height,
              width:
                importedData.results.templates[0].json_template.stage.width,
            })
          );
          dispatch(
            setAspectRatio(
              importedData.results.templates[0].json_template.stage.aspectRatio
            )
          );

          // Import branding
          if (importedData.results.templates[0].json_template.branding) {
            const branding =
              importedData.results.templates[0].json_template.branding;

            if (branding.colors) {
              Object.entries(branding.colors).forEach(([key, value]) => {
                dispatch(addColor({ key, value: String(value) }));
              });
            }

            if (branding.fonts) {
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
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
        console.error("Import error:", error);
      }
    };

    reader.readAsText(file);
  };

  // Handle import new format (file-based)
  const handleImportNewFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    const mapFitMode = (backendFit: string): "fit" | "fill" | "stretch" => {
      switch (backendFit) {
        case "contain":
          return "fit";
        case "cover":
          return "fill";
        case "stretch":
          return "stretch";
        default:
          return "fill";
      }
    };

    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);
        console.log("Imported Data:", importedData);

        if (
          importedData &&
          Array.isArray(importedData.elements) &&
          importedData.width &&
          importedData.height &&
          importedData.scale
        ) {
          const elements = [...importedData.elements];

          importedData.frames.forEach((frame: any) => {
            const frameIndex = elements.findIndex(
              (el: any) =>
                Number(el.frame_position_in_template) ===
                Number(frame.frame_position_in_template)
            );

            if (frameIndex !== -1) {
              const frameElement = elements[frameIndex];

              elements[frameIndex] = {
                ...frameElement,
                type: "frame",
                zIndex: 1,
              };

              if (frame.assets?.[0]?.image_url) {
                const fitMode = mapFitMode(
                  frame.objectFit || frame.fitMode || "fill"
                );

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

          elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

          dispatch(setElements([...elements]));
          dispatch(
            setStageSize({
              height: importedData.height,
              width: importedData.width,
            })
          );
          dispatch(setAspectRatio(importedData.scale));

          // Import branding
          if (importedData.branding) {
            const branding = importedData.branding;

            if (branding.colors) {
              Object.entries(branding.colors).forEach(([key, value]) => {
                dispatch(addColor({ key, value: String(value) }));
              });
            }

            if (branding.fonts) {
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
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
        console.error("Import error:", error);
      }
    };

    reader.readAsText(file);
  };

  const handleImportJson = (importedData: any) => {
    try {
      console.log("Imported JSON Data:", importedData);

      // Validate JSON structure
      if (
        importedData &&
        Array.isArray(importedData.elements) &&
        importedData.width &&
        importedData.height &&
        importedData.scale
      ) {
        const mapFitMode = (backendFit: string): "fit" | "fill" | "stretch" => {
          switch (backendFit) {
            case "contain":
              return "fit";
            case "cover":
              return "fill";
            case "stretch":
              return "stretch";
            default:
              return "fill";
          }
        };

        const elements = [...importedData.elements];

        // Process frames
        importedData.frames?.forEach((frame: any) => {
          const frameIndex = elements.findIndex(
            (el: any) =>
              Number(el.frame_position_in_template) ===
              Number(frame.frame_position_in_template)
          );

          if (frameIndex !== -1) {
            const frameElement = elements[frameIndex];

            // Update frame element
            elements[frameIndex] = {
              ...frameElement,
              type: "frame",
              zIndex: 1,
            };

            // Add image element if asset exists
            if (frame.assets?.[0]?.image_url) {
              const fitMode = mapFitMode(
                frame.objectFit || frame.fitMode || "fill"
              );

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

        // Sort elements by zIndex
        elements.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));

        // Dispatch to Redux
        dispatch(setElements([...elements]));
        dispatch(
          setStageSize({
            height: importedData.height,
            width: importedData.width,
          })
        );
        dispatch(setAspectRatio(importedData.scale));

        // Import branding if present
        if (importedData.branding) {
          const branding = importedData.branding;

          if (branding.colors) {
            Object.entries(branding.colors).forEach(([key, value]) => {
              dispatch(addColor({ key, value: String(value) }));
            });
          }

          if (branding.fonts) {
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
        }
      } else {
        throw new Error(
          "Invalid JSON format. Required fields: elements (array), width, height, scale."
        );
      }
    } catch (error) {
      console.error("Import error:", error);
    }
  };

  useEffect(() => {
    const storedTemplate = localStorage.getItem("mixerTemplate");
    if (storedTemplate) {
      setJsonInput(storedTemplate);
    }
  }, []);

  const handleJsonTextImport = () => {
    if (!jsonInput?.trim()) return;

    try {
      const parsedJson = JSON.parse(jsonInput);
      handleImportJson(parsedJson);
      setJsonInput("");
    } catch (error) {
      console.error("JSON parse error:", error);
      alert("Invalid JSON in storage or input. Please check the data.");
    }
  };

  const handleExportPNGToParent = async () => {
    try {
      const stage = stageRef.current;
      if (!stage) return;

      const dataURL = stage.toDataURL({ pixelRatio: 1, quality: 1 });
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "canvas.png");
      formData.append("name", "myCanvasImage");
      formData.append("type", "mixer_image");
      formData.append("public", "true");
      formData.append("project", projectIdMixer);

      const uploadRes = await fetch(
        "https://api.markomlabs.com/creatives/assets/",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await uploadRes.json();

      if (result?.image) {
        console.log("✅ Uploaded image URL:", result.image);

        window.parent.postMessage(
          {
            type: "IMAGE_SELECTED",
            payload: { url: result.image },
          },
          "*" // أو خليها TOOL_ORIGIN لو عايز تأمّنها
        );
      }
    } catch (error) {
      console.error("Export PNG failed:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center gap-2">
          <Button variant="secondary" onClick={handleExportPNGToParent}>
            <FaImage className="mr-1" />
            Save as PNG {projectIdMixer}
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileViaMixer.current?.click()}
          >
            <FaFileImport className="mr-2" />
            Import from mixer
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileViaBackEndInputRef.current?.click()}
          >
            <FaFileImport className="mr-2" />
            Import Via Back-End
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaFileImport className="mr-2" />
            Import
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                <FaSave className="mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Save As</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleExportPNG}>
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  JSON File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSummary}>
                  Summary File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG} disabled>
                  SVG
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-full max-w-md " style={{ display: "none" }}>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-32 mb-2 "
          />
          <Button
            variant="secondary"
            onClick={handleJsonTextImport}
            disabled={!jsonInput.trim()}
            className="hidden"
          >
            <FaFileImport className="mr-2" />
            Import JSON Text
          </Button>
        </div>
      </div>

      <input
        type="file"
        accept=".json"
        ref={fileViaMixer}
        className="hidden"
        onChange={handleImportNewFormat}
      />
      <input
        type="file"
        accept=".json"
        ref={fileViaBackEndInputRef}
        className="hidden"
        onChange={handleImportViaBackEnd}
      />
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImport}
      />
    </>
  );
};

export default CanvasExportImport;
