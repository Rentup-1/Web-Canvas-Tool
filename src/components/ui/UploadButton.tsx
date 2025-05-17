import { FaUpload } from "react-icons/fa";

interface UploadButtonProps {
  label?: string;
  onFileSelect: (file: File) => void;
}

export function UploadButton({ label = "Upload", onFileSelect }: UploadButtonProps) {
  return (
    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm">
      <FaUpload className="w-4 h-4" /> {/* Upload icon */}
      {label}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />
    </label>
  );
}
