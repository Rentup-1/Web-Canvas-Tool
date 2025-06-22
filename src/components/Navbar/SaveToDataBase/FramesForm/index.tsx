import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetAllTagQuery } from "@/services/TagsApi";
import { useCreateTemplateFrameMutation } from "@/services/templateFramesApi";

export default function FramesForm() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const templateId = useAppSelector((state) => state.saveForm.templateId);
  const [createTemplateFrame, { isLoading }] = useCreateTemplateFrameMutation();
  const { data: frameTags } = useGetAllTagQuery();

  const getTagById = (id: number) => {
    return frameTags?.find((tag) => tag.id === id);
  };

  const frames = elements
    .filter((el) => el.type === "frame")
    .map((el) => ({
      assetType: el.assetType || null,
      tags: el.tags || [],
      frame_position_in_template: el.frame_position_in_template ?? null,
      template: templateId,
      type: el.assetType || "", // Assuming type from assetType
    }));

  const handleSubmitAll = async () => {
    try {
      for (const frame of frames) {
        await createTemplateFrame(frame).unwrap();
        console.log("Frame submitted:", frame);
      }
      alert("All frames submitted successfully!");
    } catch (error) {
      console.error("Error submitting frames:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Frames Preview</h1>

      {frames.length === 0 ? (
        <p>No frames available to submit.</p>
      ) : (
        <div className="space-y-4">
          {frames.map((frame, index) => (
            <div
              key={index}
              className="p-4 border rounded flex justify-between items-start"
            >
              <p>Frame {index + 1}</p>
              <div>
                <p>
                  <strong>Position:</strong> {frame.frame_position_in_template}
                </p>
                <p>
                  <strong>Type:</strong> {frame.assetType}
                </p>
                <p>
                  <strong>Tags:</strong>
                  {frame.tags.join(", ")}
                </p>
              </div>
            </div>
          ))}

          <Button
            onClick={handleSubmitAll}
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit All Frames"}
          </Button>
        </div>
      )}
    </div>
  );
}
