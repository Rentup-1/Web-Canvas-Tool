import { useAppDispatch, useAppSelector } from "../hooks";
import { updateElement } from "../features/canvas/canvasSlice";
import { type CanvasElement } from "../features/canvas/types";
import { TextInput } from "./ui/TextInput";
import { ColorInput } from "./ui/ColorInput";
import { SelectInput } from "./ui/SelectInput";
import { InputRange } from "./ui/InputRange";

export const BRAND_OPTIONS: ["primary", "secondary", "additional", "fixed"] = [
  "primary",
  "secondary",
  "additional",
  "fixed",
] as const;

export function PropertiesPanel() {
  const element = useAppSelector((state) => state.canvas.elements.find((el) => el.selected));
  const dispatch = useAppDispatch();

  if (!element) return null;

  const update = (updates: Partial<CanvasElement>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  return (
    <div className="p-4 shadow space-y-5">
      <h2 className="text-xl font-semibold">Properties</h2>

      {/* Shared: Position, Rotation */}
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="X"
          type="number"
          value={element.x.toFixed(2)}
          onChange={(val) => update({ x: parseFloat(val) })}
        />
        <TextInput
          label="Y"
          type="number"
          value={element.y.toFixed(2)}
          onChange={(val) => update({ y: parseFloat(val) })}
        />
        <TextInput
          label="Width"
          type="number"
          value={element.width.toFixed(2)}
          onChange={(val) => update({ width: parseFloat(val) })}
        />
        <TextInput
          label="Height"
          type="number"
          value={element.height.toFixed(2)}
          onChange={(val) => update({ height: parseFloat(val) })}
        />
        <TextInput
          label="Rotation"
          type="number"
          value={element.rotation.toFixed(2)}
          onChange={(val) => update({ rotation: parseFloat(val) })}
        />
      </div>

      {/* Fill Color */}
      {(element.type === "rect" || element.type === "text") && (
        <>
          <div className="flex items-center gap-4">
            <ColorInput
              label="Fill Color"
              value={element.fill || "#000000"}
              onChange={(val) => update({ fill: val })}
            />
            <ColorInput
              label="Background Color"
              value={element.background || "#ffffff"}
              onChange={(val) => update({ background: val })}
            />
          </div>
          <InputRange
            value={element.opacity!}
            onChange={(val) => update({ opacity: Math.min(1, Math.max(0, parseFloat(val))) })}
          />
        </>
      )}

      {/* Text-specific Fields */}
      {element.type === "text" && (
        <>
          <TextInput label="Text" value={element.text || ""} onChange={(val) => update({ text: val })} />
          <TextInput
            label="Font Size"
            type="number"
            value={parseInt(element.fontSize!.toString())}
            onChange={(val) => update({ fontSize: parseInt(val) })}
          />
          <SelectInput
            label="Font Family"
            value={element.fontFamily || "Arial"}
            onChange={(val) => update({ fontFamily: val })}
            options={[
              "Arial",
              "Helvetica",
              "Georgia",
              "Times New Roman",
              "Courier New",
              "Comic Sans MS",
              "Trebuchet MS",
              "Verdana",
              "Impact",
            ]}
          />
          <TextInput
            label="Padding"
            type="number"
            value={element.padding ?? 10}
            onChange={(val) => update({ padding: parseFloat(val) })}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Top Left Radius"
              type="number"
              value={element.borderRadius?.topLeft ?? 0}
              onChange={(val) =>
                update({
                  borderRadius: {
                    ...element.borderRadius,
                    topLeft: parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Top Right Radius"
              type="number"
              value={element.borderRadius?.topRight ?? 0}
              onChange={(val) =>
                update({
                  borderRadius: {
                    ...element.borderRadius,
                    topRight: parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Right Radius"
              type="number"
              value={element.borderRadius?.bottomRight ?? 0}
              onChange={(val) =>
                update({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomRight: parseFloat(val),
                  },
                })
              }
            />
            <TextInput
              label="Bottom Left Radius"
              type="number"
              value={element.borderRadius?.bottomLeft ?? 0}
              onChange={(val) =>
                update({
                  borderRadius: {
                    ...element.borderRadius,
                    bottomLeft: parseFloat(val),
                  },
                })
              }
            />
          </div>

          <TextInput
            label="Label"
            type="text"
            value={element.label ?? "Give me label"}
            onChange={(val) => update({ label: val })}
          />
          <SelectInput
            label="Branding Color"
            value={element.colorBrandingType ?? ""}
            onChange={(val) => update({ colorBrandingType: val as any })}
            options={BRAND_OPTIONS}
          />
          <SelectInput
            label="Branding Background"
            value={element.backgroundBrandingType ?? ""}
            onChange={(val) => update({ backgroundBrandingType: val as any })}
            options={BRAND_OPTIONS}
          />
          <SelectInput
            label="Branding Font"
            value={element.fontBrandingType ?? ""}
            onChange={(val) => update({ fontBrandingType: val as any })}
            options={BRAND_OPTIONS}
          />
        </>
      )}

      {/* Image Preview */}
      {element.type === "image" && element.src && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Image Preview</label>
          <img src={element.src} alt="Preview" className="w-full h-auto rounded border" />
        </div>
      )}
    </div>
  );
}
