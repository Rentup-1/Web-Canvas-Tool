import { useAppDispatch } from "../hooks";
import { addElement, addImageElement } from "../features/canvas/canvasSlice";
import { ToolbarButton } from "./ui/ToolbarButton";
import { UploadButton } from "./ui/UploadButton";

export function Toolbar() {
  const dispatch = useAppDispatch();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        dispatch(
          addImageElement({
            src: reader.result as string,
            width: img.width,
            height: img.height,
          })
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <ToolbarButton label="Add Rectangle" onClick={() => dispatch(addElement({ type: "rect" }))} />
      <ToolbarButton label="Add Text" onClick={() => dispatch(addElement({ type: "text" }))} />
      <ToolbarButton label="Add Frame" onClick={() => dispatch(addElement({ type: "frame" }))} />
      <UploadButton label="Upload Image" onFileSelect={handleImageUpload} />
    </div>
  );
}
