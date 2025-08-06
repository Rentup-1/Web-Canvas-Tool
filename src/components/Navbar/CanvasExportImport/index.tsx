import { useEffect, useRef, useState, type FC } from "react";
import { FaFileImport, FaSave } from "react-icons/fa";
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
import { processImportedJson } from "./parseJson";

const CanvasExportImport: FC = () => {
  const dispatch = useAppDispatch();
  const {
    handleExportJSON,
    handleExportPNG,
    handleExportSVG,
    handleExportSummary,
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
          Array.isArray(importedData.results.templates[0].json_template.elements) &&
          importedData.results.templates[0].json_template.stage &&
          importedData.results.templates[0].json_template.stage.height &&
          importedData.results.templates[0].json_template.stage.width &&
          importedData.results.templates[0].json_template.stage.aspectRatio
        ) {
          const elements = [...importedData.results.templates[0].json_template.elements];

          importedData.results.templates[0].frames.forEach((frame: any) => {
            const frameIndex = elements.findIndex(
              (el: any) =>
                el.frame_position_in_template == frame.frame_position_in_template
            );

            if (frameIndex !== -1) {
              const frameElement = elements[frameIndex];

              elements[frameIndex] = {
                ...frameElement,
                type: "frame",
                zIndex: 1,
              };

              if (frame.assets?.[0]?.image_url) {
                const fitMode = mapFitMode(frame.objectFit || frame.fitMode || "fill");

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
              height: importedData.results.templates[0].json_template.stage.height,
              width: importedData.results.templates[0].json_template.stage.width,
            })
          );
          dispatch(
            setAspectRatio(
              importedData.results.templates[0].json_template.stage.aspectRatio
            )
          );

          // Import branding
          if (importedData.results.templates[0].json_template.branding) {
            const branding = importedData.results.templates[0].json_template.branding;

            if (branding.colors) {
              Object.entries(branding.colors).forEach(([key, value]) => {
                dispatch(addColor({ key, value: String(value) }));
              });
            }

            if (branding.fonts) {
              Object.entries(branding.fonts).forEach(([key, fontData]: [string, any]) => {
                dispatch(
                  addFont({
                    key,
                    value: fontData.value,
                    isFile: fontData.isFile,
                    variant: fontData.variant,
                  })
                );
              });
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
                Number(el.frame_position_in_template) === Number(frame.frame_position_in_template)
            );

            if (frameIndex !== -1) {
              const frameElement = elements[frameIndex];

              elements[frameIndex] = {
                ...frameElement,
                type: "frame",
                zIndex: 1,
              };

              if (frame.assets?.[0]?.image_url) {
                const fitMode = mapFitMode(frame.objectFit || frame.fitMode || "fill");

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
              Object.entries(branding.fonts).forEach(([key, fontData]: [string, any]) => {
                dispatch(
                  addFont({
                    key,
                    value: fontData.value,
                    isFile: fontData.isFile,
                    variant: fontData.variant,
                  })
                );
              });
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
              Number(el.frame_position_in_template) === Number(frame.frame_position_in_template)
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
              const fitMode = mapFitMode(frame.objectFit || frame.fitMode || "fill");

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
            Object.entries(branding.fonts).forEach(([key, fontData]: [string, any]) => {
              dispatch(
                addFont({
                  key,
                  value: fontData.value,
                  isFile: fontData.isFile,
                  variant: fontData.variant,
                })
              );
            });
          }
        }
      } else {
        throw new Error("Invalid JSON format. Required fields: elements (array), width, height, scale.");
      }
    } catch (error) {
      console.error("Import error:", error);
    }
  };

  const handleJsonTextImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      handleImportJson(parsedJson);
      setJsonInput(""); // Clear textarea after import
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
      console.error("JSON parse error:", error);
    }
  };

  // const jsonTest = `{"elements":[{"id":"1","x":0,"y":0,"width":1080,"height":1080,"x_percent":0,"y_percent":0,"width_percent":1,"height_percent":1,"rotation":0,"selected":true,"fill":"transparent","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"frame","stroke":"transparent","strokeWidth":1,"dash":[5,5],"assetType":"image","tags":["horizontal"],"visible":true,"fitMode":"fill","objectFit":"cover","borderRadiusSpecial":0,"borderStyle":[5,5],"borderWidth":1,"borderColor":"transparent","frame_position_in_template":"1"},{"id":"2","x":0,"y":0,"width":1080,"height":1080,"x_percent":0,"y_percent":0,"width_percent":1,"height_percent":1,"rotation":0,"selected":false,"fill":"rgb(11, 17, 34)","opacity":0.67,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"rectangle","cornerRadius":0,"borderRadius":{"topLeft":0,"topRight":0,"bottomRight":0,"bottomLeft":0},"stroke":"#000000","strokeWidth":0,"visible":true,"borderColor":"#000000","borderWidth":0},{"id":"text-3","x":257.0371150362944,"y":279.9999999999998,"width":566.9257699274128,"height":120,"x_percent":0.2379973287373096,"y_percent":0.259259259259259,"width_percent":0.5249312684513082,"height_percent":0.07407407407407407,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","fontSize_percent":0.037037037037037035,"text":"A smart investment for a brighter tomorrow.","toi_labels":"punchline_list","background":"transparent","padding":0,"fontSize":40,"type":"text","backgroundStroke":"#A3A3A3","backgroundStrokeWidth":0,"fontFamily":"Inter","fontVariant":"regular","fontWeight":"bold","fontStyle":"normal","strokeTextWidth":0,"fontBrandingType":"fixed","borderRadius":{"topLeft":4,"topRight":4,"bottomRight":4,"bottomLeft":4},"alignment":"left","visible":true,"align":"center","borderWidth":0,"borderColor":"#A3A3A3","white_space":"wrap"},{"id":"text-4","x":101.8292753484326,"y":482.99999999999926,"width":154.12456849219896,"height":80,"x_percent":0.09428636606336352,"y_percent":0.4472222222222215,"width_percent":0.14270793378907312,"height_percent":0.07407407407407407,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","fontSize_percent":0.07407407407407407,"text":"5%","toi_labels":"Down Payment_No._&_%","background":"transparent","padding":0,"fontSize":80,"type":"text","backgroundStroke":"#A3A3A3","backgroundStrokeWidth":0,"fontFamily":"GFS Didot","fontVariant":"regular","fontWeight":"normal","fontStyle":"italic","strokeTextWidth":0,"fontBrandingType":"fixed","borderRadius":{"topLeft":4,"topRight":4,"bottomRight":4,"bottomLeft":4},"alignment":"left","visible":true,"align":"left","borderWidth":0,"borderColor":"#A3A3A3","white_space":"stretch"},{"id":"text-5","x":267.38095378034757,"y":480.33333484037416,"width":233.0000000000001,"height":80,"x_percent":0.24757495720402553,"y_percent":0.44475308781516126,"width_percent":0.21574074074074084,"height_percent":0.07407407407407407,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","fontSize_percent":0.037037037037037035,"text":"Down Payment","toi_labels":"Down Payment","background":"transparent","padding":0,"fontSize":40,"type":"text","backgroundStroke":"#A3A3A3","backgroundStrokeWidth":0,"fontFamily":"Lexend Deca","fontVariant":"regular","fontWeight":"normal","fontStyle":"normal","strokeTextWidth":0,"fontBrandingType":"fixed","borderRadius":{"topLeft":4,"topRight":4,"bottomRight":4,"bottomLeft":4},"alignment":"left","visible":true,"align":"left","borderWidth":0,"borderColor":"#A3A3A3","white_space":"wrap"},{"id":"text-6","x":607.7773270463726,"y":485.00000067816774,"width":88.58295685492782,"height":80,"x_percent":0.5627567843021969,"y_percent":0.44907407470200716,"width_percent":0.08202125634715539,"height_percent":0.07407407407407407,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","fontSize_percent":0.07407407407407407,"text":"9","toi_labels":"Years Instalments_No.","background":"transparent","padding":0,"fontSize":80,"type":"text","backgroundStroke":"#A3A3A3","backgroundStrokeWidth":0,"fontFamily":"GFS Didot","fontVariant":"regular","fontWeight":"normal","fontStyle":"normal","strokeTextWidth":0,"fontBrandingType":"fixed","borderRadius":{"topLeft":4,"topRight":4,"bottomRight":4,"bottomLeft":4},"alignment":"left","visible":true,"align":"left","borderWidth":0,"borderColor":"#A3A3A3","white_space":"stretch"},{"id":"text-7","x":682.274457463419,"y":484.0000000000001,"width":325.78538545757465,"height":80,"x_percent":0.6317356087624251,"y_percent":0.44814814814814824,"width_percent":0.30165313468293947,"height_percent":0.07407407407407407,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","fontSize_percent":0.037037037037037035,"text":"Years Instalments","toi_labels":"Years Instalments","background":"transparent","padding":0,"fontSize":40,"type":"text","backgroundStroke":"#A3A3A3","backgroundStrokeWidth":0,"fontFamily":"Lexend Deca","fontVariant":"regular","fontWeight":"normal","fontStyle":"normal","strokeTextWidth":0,"fontBrandingType":"fixed","borderRadius":{"topLeft":4,"topRight":4,"bottomRight":4,"bottomLeft":4},"alignment":"left","visible":true,"align":"left","borderWidth":0,"borderColor":"#A3A3A3","white_space":"wrap"},{"id":"8","x":533.9523810600261,"y":443.99999999999915,"width":12.000000000000004,"height":209.33334162205935,"x_percent":0.49440035283335754,"y_percent":0.4111111111111103,"width_percent":0.011111111111111115,"height_percent":0.19382716816857348,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"rectangle","cornerRadius":0,"borderRadius":{"topLeft":0,"topRight":0,"bottomRight":0,"bottomLeft":0},"stroke":"#000000","strokeWidth":0,"visible":true,"borderColor":"#000000","borderWidth":0},{"id":"9","x":0,"y":97.00000000000013,"width":794.999992879231,"height":12.000000000000023,"x_percent":0,"y_percent":0.08981481481481493,"width_percent":0.7361111045178065,"height_percent":0.011111111111111132,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"rectangle","cornerRadius":0,"borderRadius":{"topLeft":0,"topRight":0,"bottomRight":0,"bottomLeft":0},"stroke":"#000000","strokeWidth":0,"visible":true,"borderColor":"#000000","borderWidth":0},{"id":"10","x":283.9999276620289,"y":981.0000016954217,"width":795,"height":11.999999999999986,"x_percent":0.2629628959833601,"y_percent":0.9083333349031683,"width_percent":0.7361111111111112,"height_percent":0.011111111111111098,"rotation":0,"selected":false,"fill":"rgb(255, 255, 255)","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"rectangle","cornerRadius":0,"borderRadius":{"topLeft":0,"topRight":0,"bottomRight":0,"bottomLeft":0},"stroke":"#000000","strokeWidth":0,"visible":true,"borderColor":"#000000","borderWidth":0},{"id":"11","x":819.9905380750921,"y":49.698190084682444,"width":234.04030329806935,"height":108.31083425067966,"x_percent":0.7592504982176779,"y_percent":0.04601684267100226,"width_percent":0.2167039845352494,"height_percent":0.10028780949137006,"rotation":0,"selected":false,"fill":"transparent","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"frame","stroke":"transparent","strokeWidth":1,"dash":[5,5],"assetType":"project_logo","tags":["horizontal","TXT W/O Icon"],"visible":true,"fitMode":"fit","objectFit":"contain","borderRadiusSpecial":0,"borderStyle":[5,5],"borderWidth":1,"borderColor":"transparent","frame_position_in_template":"3"},{"id":"12","x":27.977635702887692,"y":938.9501651740751,"width":239.02650044994152,"height":102.329505547269,"x_percent":0.02590521824341453,"y_percent":0.8693983010871066,"width_percent":0.22132083374994585,"height_percent":0.09474954217339722,"rotation":0,"selected":false,"fill":"transparent","opacity":1,"fillBrandingType":"fixed","strokeBrandingType":"fixed","type":"frame","stroke":"transparent","strokeWidth":1,"dash":[5,5],"assetType":"developer_logo","tags":["horizontal","Icon + Txt"],"visible":true,"fitMode":"fit","objectFit":"contain","borderRadiusSpecial":0,"borderStyle":[5,5],"borderWidth":1,"borderColor":"transparent","frame_position_in_template":"2"}],"frames":[{"frame_id":161,"type":"image","fitMode":"fill","objectFit":"cover","frame_position_in_template":1,"tags":["horizontal"],"assets":[{"id":51,"name":"Badya img 1- Hddddddd","image_url":"/media/assets/images/1_1.png","project_name":"Badya2","type":"image","tags":["horizontal","Apartment","H Logo","H logo"],"fitMode":"fill","objectFit":"cover"}]},{"frame_id":162,"type":"project_logo","fitMode":"fit","objectFit":"contain","frame_position_in_template":3,"tags":["horizontal","TXT W/O Icon"],"assets":[{"id":50,"name":"Badya Logo","image_url":"/media/assets/images/32313992_271440643397943_4946298154430496768_n-removebg-preview_1_2.png","project_name":"Badya2","type":"project_logo","tags":["horizontal","TXT W/O Icon","On Dark Bgd"],"fitMode":"fit","objectFit":"contain"}]},{"frame_id":163,"type":"developer_logo","fitMode":"fit","objectFit":"contain","frame_position_in_template":2,"tags":["horizontal","Icon + Txt"],"assets":[{"id":48,"name":"Palm Hills Developments3","image_url":"/media/assets/images/V_with_Logo.svg","project_name":"Badya2","type":"developer_logo","tags":["vertical","Icon + Txt","On Dark Bgd"],"fitMode":"fit","objectFit":"contain"}]}],"width":1080,"height":1080,"scale":0.44}`
  
  //   useEffect(() => {
  //     const result = processImportedJson(JSON.parse(jsonTest));
  //     if (result) {
  //       dispatch(setElements(result.elements));
  //       dispatch(setStageSize({ width: result.width, height: result.height }));
  //       dispatch(setAspectRatio(result.scale));

  //       if (result.branding?.colors) {
  //         Object.entries(result.branding.colors).forEach(([key, value]) =>
  //           dispatch(addColor({ key, value: String(value) }))
  //         );
  //       }

  //       if (result.branding?.fonts) {
  //         Object.entries(result.branding.fonts).forEach(([key, fontData]: [string, any]) =>
  //           dispatch(
  //             addFont({
  //               key,
  //               value: fontData.value,
  //               isFile: fontData.isFile,
  //               variant: fontData.variant,
  //             })
  //           )
  //         );
  //       }
  //     }
  // }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row items-center justify-center gap-2">
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
                <DropdownMenuItem onClick={handleExportPNG}>PNG</DropdownMenuItem>
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

        {/* New UI for direct JSON import */}
        
        <div className="w-full max-w-md">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-32 mb-2"
          />
          <Button
            variant="secondary"
            onClick={handleJsonTextImport}
            disabled={!jsonInput.trim()}
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