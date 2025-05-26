import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  addColor,
  removeColor,
  setColor,
} from "@/features/branding/brandingSlice";
import { Button } from "../../../ui/Button";
import { TextInput } from "../../../ui/controlled-inputs/TextInput";
import { MdDeleteOutline } from "react-icons/md";
import { ColorInput } from "../../../ui/controlled-inputs/ColorInput";

export function BrandingPanel() {
  const dispatch = useAppDispatch();
  const colors = useAppSelector((state) => state.branding.colors);

  const [newKey, setNewKey] = useState("");
  const [newColor, setNewColor] = useState("#000000");

  const handleAdd = () => {
    if (newKey.trim()) {
      dispatch(addColor({ key: newKey.trim(), value: newColor }));
      setNewKey("");
      setNewColor("#000000");
    }
  };

  const handleUpdate = (key: string, value: string) => {
    dispatch(setColor({ key, value }));
  };

  const handleDelete = (key: string) => {
    dispatch(removeColor(key));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Branding Colors</h2>

      {/* Existing Colors */}
      <div className="space-y-2">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-24 font-medium">{key}</span>
            <input
              type="color"
              value={value}
              onChange={(e) => handleUpdate(key, e.target.value)}
              className="w-12 h-8 border"
            />
            <Button variant="outline" onClick={() => handleDelete(key)}>
              <MdDeleteOutline />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">Add New Color</h3>
        <div className="flex items-center gap-2 mb-3">
          <TextInput
            value={newKey}
            placeholder="e.g. highlight"
            onChange={(e: any) => setNewKey(e.target.value)}
          />
          <ColorInput
            value={newColor}
            onChange={(e: any) => setNewColor(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>Add New Color Branding</Button>
      </div>
    </div>
  );
}
