export function UploadPanel() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
      <input type="file" accept="image/*" />
    </div>
  );
}
