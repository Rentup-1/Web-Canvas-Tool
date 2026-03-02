import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  CanvasElementUnion,
  CanvasTextElement,
} from "@/features/canvas/types";
import { useAppSelector } from "@/hooks/useRedux";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { useGetAllTagQuery, type TagResponse } from "@/services/TagsApi";
import {
  useGetAllTextLabelsQuery,
  type LabelResponse,
} from "@/services/textLabelsApi"; // Assuming you have this API
import {
  useCreateTemplateTextBoxMutation,
  useDeleteTemplateTextBoxMutation,
  useGetTemplateTextBoxesByTemplateQuery,
} from "@/services/templateTextsApi";
import { useGetTemplateFramesByTemplateQuery } from "@/services/templateFramesApi";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type TextSummaryElement = {
  toi_labels: number;
  tags: number[];
  text: string;
};

interface FormData {
  textBoxes: TextSummaryElement[];
}

function isCanvasTextElement(el: CanvasElementUnion): el is CanvasTextElement {
  return el.type === "text";
}

export default function TextsForm() {
  const { data: tags, isLoading: isTagsLoading } = useGetAllTagQuery();
  const { data: labels, isLoading: isLabelsLoading } =
    useGetAllTextLabelsQuery();
  const [createText, { isLoading: isCreatingText }] =
    useCreateTemplateTextBoxMutation();
  const [deleteText] = useDeleteTemplateTextBoxMutation();

  const elements = useAppSelector(
    (state) => state.canvas.elements,
  ) as CanvasElementUnion[];
  const templateId = useAppSelector((state) => state.saveForm.templateId);

  const {
    data: existingTexts,
    isLoading: isLoadingTexts,
    refetch,
  } = useGetTemplateTextBoxesByTemplateQuery(templateId!, {
    skip: !templateId,
  });

  const { data: existingFrames, isLoading: isLoadingFrames } =
    useGetTemplateFramesByTemplateQuery(templateId!, {
      skip: !templateId,
    });

  const [isSaving, setIsSaving] = useState(false);

  const getIdByTag = (tag: string): number | null => {
    const item = tags?.find((obj: TagResponse) => obj.tag === tag);
    return item ? item.id : null;
  };

  const getIdByLabel = (label: string): number | null => {
    const item = labels?.find((obj: LabelResponse) => obj.label === label);
    return item ? item.id : null;
  };

  // Generate text boxes array
  const textBoxes = (): TextSummaryElement[] => {
    return elements.filter(isCanvasTextElement).map((el) => ({
      tags:
        el.tags
          ?.map((tag) => getIdByTag(tag))
          .filter((id): id is number => id !== null) || [],
      toi_labels: el.toi_labels ? (getIdByLabel(el.toi_labels) ?? 0) : 0,
      text: el.text || "",
    }));
  };

  // Handle form submission - delete existing and create new
  const handleSubmit = async () => {
    if (!templateId) {
      toast.error(
        "Template ID is missing. Please submit the general form first.",
      );
      return;
    }

    // Check if frames exist first
    if (!existingFrames || existingFrames.length === 0) {
      toast.error("Please save frames first before saving text boxes.");
      return;
    }

    const allTextBoxes = textBoxes();

    if (allTextBoxes.length === 0) {
      toast.error(
        "No text boxes to submit. Please add text elements to the canvas.",
      );
      return;
    }

    setIsSaving(true);

    try {
      // Delete all existing text boxes for this template first
      // SAFETY CHECK: Only delete text boxes that belong to this template
      if (existingTexts && existingTexts.length > 0) {
        console.log(
          `Deleting ${existingTexts.length} text boxes for template ID: ${templateId}`,
        );
        for (const existingText of existingTexts) {
          // Double-check the text box belongs to this template before deleting
          if (existingText.id && existingText.template === templateId) {
            await deleteText(existingText.id).unwrap();
            console.log(
              `Deleted text box ID: ${existingText.id} from template: ${existingText.template}`,
            );
          } else {
            console.warn(
              `Skipping text box ID: ${existingText.id} - does not belong to template: ${templateId}`,
            );
          }
        }
      }

      // Create all text boxes from current canvas state
      for (let i = 0; i < allTextBoxes.length; i++) {
        const textBox = allTextBoxes[i];

        const payload = {
          template: templateId,
          initial_value: textBox.text,
          toi_label: textBox.toi_labels,
          tags: textBox.tags,
        };

        await createText(payload).unwrap();
        console.log("Created text box at index:", i);
      }

      toast.success("Text boxes saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving text boxes:", error);
      toast.error("Failed to save text boxes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const methods = useForm<FormData>({
    defaultValues: {
      textBoxes: [], // Initialize with empty array; we'll populate dynamically
    },
  });

  if (isTagsLoading || isLabelsLoading || isLoadingTexts || isLoadingFrames) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!elements || elements.length === 0) {
    return <p>Please add text elements to the canvas</p>;
  }

  if (!templateId) {
    return <p>Please submit the general form first</p>;
  }

  if (!existingFrames || existingFrames.length === 0) {
    return <p>Please save frames first before saving text boxes</p>;
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        {textBoxes().map((textBox, index) => (
          <div
            key={index}
            className="space-y-2 border-2 border-accent p-2 rounded"
          >
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  value={`Text Box ${index + 1}`}
                  placeholder="Text Box Name"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Input
                  value={textBox.text}
                  placeholder="Text content"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>TOI Label</FormLabel>
              <FormControl>
                <Input
                  value={
                    labels?.find(
                      (l: LabelResponse) => l.id === textBox.toi_labels,
                    )?.label || "No label assigned"
                  }
                  placeholder="TOI Label"
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                {textBox.tags.length > 0 ? (
                  textBox.tags.map((tagId, tagIndex) => {
                    const tagName =
                      tags?.find((t: TagResponse) => t.id === tagId)?.tag ||
                      "Unknown";
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
          </div>
        ))}

        <Button onClick={handleSubmit} className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {existingTexts && existingTexts.length > 0
                ? "Updating..."
                : "Saving..."}
            </>
          ) : existingTexts && existingTexts.length > 0 ? (
            "Update Text Boxes"
          ) : (
            "Save Text Boxes"
          )}
        </Button>
      </div>
    </FormProvider>
  );
}
