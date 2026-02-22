import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form"; // Adjust imports as needed
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/useRedux";
import { useGetAllTagQuery } from "@/services/TagsApi";
import {
  useCreateTemplateFrameMutation,
  useDeleteTemplateFrameMutation,
  useGetTemplateFramesByTemplateQuery,
} from "@/services/templateFramesApi";
import { FormProvider, useForm } from "react-hook-form"; // Import React Hook Form
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define interfaces for type safety
interface Tag {
  id: number;
  tag: string;
}

interface Frame {
  assetType: string | null;
  fitMode: string | null;
  objectFit: string | null;
  tags: number[];
  frame_position_in_template: number | null;
}

interface CanvasElement {
  type: string;
  assetType?: string;
  fitMode?: string | null;
  objectFit?: string | null;
  tags?: string[];
  frame_position_in_template?: number;
}

// Form data type (for read-only display, we don't need editable fields, but defining for clarity)
interface FormData {
  frames: Frame[];
}

export default function FramesForm() {
  const { data: tags, isLoading: isTagsLoading } = useGetAllTagQuery();
  const [createFrame, { isLoading: isCreatingFrame }] =
    useCreateTemplateFrameMutation();
  const [deleteFrame] = useDeleteTemplateFrameMutation();
  const elements = useAppSelector(
    (state) => state.canvas.elements,
  ) as CanvasElement[];
  const templateId = useAppSelector((state) => state.saveForm.templateId);

  const {
    data: existingFrames,
    isLoading: isLoadingFrames,
    refetch,
  } = useGetTemplateFramesByTemplateQuery(templateId!, {
    skip: !templateId,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize React Hook Form
  const methods = useForm<FormData>({
    defaultValues: {
      frames: [], // Initialize with empty frames; we'll populate dynamically
    },
  });

  // Function to get tag ID by tag name
  const getIdByTag = (tag: string): number | null => {
    const item = tags?.find((obj: Tag) => obj.tag === tag);
    return item ? item.id : null;
  };

  console.log(elements);

  // Generate frames array
  const frames = (): Frame[] => {
    const result: Frame[] = [];

    elements.forEach((el) => {
      if (el.type === "frame") {
        result.push({
          assetType: el.assetType || null,
          fitMode: el.fitMode || null,
          objectFit: el.objectFit || null,
          tags:
            el.tags
              ?.map((tag) => getIdByTag(tag))
              .filter((id): id is number => id !== null) || [],
          frame_position_in_template: el.frame_position_in_template ?? null,
        });
      }
    });

    return result;
  };

  // Handle form submission - delete existing and create new
  const handleSubmit = async () => {
    if (!templateId) {
      toast.error(
        "Template ID is missing. Please submit the general form first.",
      );
      return;
    }

    const allFrames = frames();

    if (allFrames.length === 0) {
      toast.error("No frames to submit. Please add frames to the canvas.");
      return;
    }

    setIsSaving(true);

    try {
      // Delete all existing frames for this template first
      // SAFETY CHECK: Only delete frames that belong to this template
      if (existingFrames && existingFrames.length > 0) {
        console.log(
          `Deleting ${existingFrames.length} frames for template ID: ${templateId}`,
        );
        for (const existingFrame of existingFrames) {
          // Double-check the frame belongs to this template before deleting
          if (existingFrame.id && existingFrame.template === templateId) {
            await deleteFrame(existingFrame.id).unwrap();
          }
        }
      }

      // Create all frames from current canvas state
      for (let i = 0; i < allFrames.length; i++) {
        const frame = allFrames[i];
        const framePosition = frame.frame_position_in_template ?? i;

        // Make sure we don't send "frame" as the type
        const validType =
          frame.assetType && frame.assetType !== "frame"
            ? frame.assetType
            : "image";

        const payload = {
          frame_position_in_template: framePosition,
          template: templateId,
          type: validType,
          fitMode: frame.fitMode,
          objectFit: frame.objectFit,
          tags: frame.tags,
        };

        await createFrame(payload).unwrap();
      }

      toast.success("Frames saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving frames:", error);
      toast.error("Failed to save frames. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isTagsLoading || isLoadingFrames) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!elements || elements.length === 0) {
    return <p>Please add frames to the canvas</p>;
  }

  if (!templateId) {
    return <p>Please submit the general form first</p>;
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4 mt-2">
        {frames().map((frame, index) => (
          <div
            key={index}
            className="space-y-2 border-2 border-accent p-2 rounded"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  value={`Frame ${index + 1}`}
                  placeholder="Frame Name"
                  disabled
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <FormControl>
                <Input
                  value={frame.assetType || "N/A"}
                  placeholder="Asset Type"
                  disabled
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                {frame.tags.length > 0 ? (
                  frame.tags.map((tagId, tagIndex) => {
                    const tagName =
                      tags?.find((t: Tag) => t.id === tagId)?.tag || "Unknown";
                    return (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {tagName}
                      </Badge>
                    );
                  })
                ) : (
                  <p>No tags assigned</p>
                )}
              </div>
            </FormItem>
            <FormItem>
              <FormLabel>Frame Position</FormLabel>
              <FormControl>
                <Input
                  value={frame.frame_position_in_template ?? "Not Set"}
                  placeholder="Frame Position"
                  disabled
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Frame FitMode</FormLabel>
              <FormControl>
                <Input
                  value={frame.fitMode as ""}
                  placeholder="Frame FitMode"
                  disabled
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Frame ObjectFit</FormLabel>
              <FormControl>
                <Input
                  value={frame.objectFit ?? ""}
                  placeholder="Frame ObjectFit"
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>
        ))}
        <Button
          onClick={() => handleSubmit()}
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Frames"
          )}
        </Button>
      </div>
    </FormProvider>
  );
}
