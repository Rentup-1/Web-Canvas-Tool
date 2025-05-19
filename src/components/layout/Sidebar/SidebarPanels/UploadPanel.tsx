import { useDispatch } from "react-redux";
import { addImageElement } from "../../../../features/canvas/canvasSlice";

export function UploadPanel() {
  const dispatch = useDispatch();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        dispatch(
          addImageElement({
            src: img.src,
            width,
            height,
          })
        );
      };
  };

  reader.readAsDataURL(file);
  };


  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e)}
      />
    </div>
  );
}
