import { useDispatch } from "react-redux";
import { addImageElement } from "../../features/canvas/canvasSlice";
import { FaCloudUploadAlt } from "react-icons/fa";

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
    <div className="w-full max-w-xl mx-auto ">
      <div className="border-2 border-dashed border-gray-400 rounded-lg p-5 flex flex-col items-center justify-center">
        <div className="w-10 h-10 mb-2 text-gray-700">
          <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center">
            <FaCloudUploadAlt className="w-5 h-5" />
          </div>
        </div>

        <h2 className="text-xl font-medium text-gray-200 mb-2">Choose a file</h2>

        <p className="text-gray-300 text-[12px] mb-4">JPEG, PNG, PDG, SVG</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e)}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="border border-gray-400 rounded-lg px-4 py-2 text-sm text-gray-300 hover:border-white transition-colors duration-200 cursor-pointer">
          Browse File
        </label>
      </div>
    </div>
  );
}

