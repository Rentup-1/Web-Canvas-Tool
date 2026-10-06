// src/components/RightSideBar/RightPanels/FrameProperties/index.tsx
import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasElementUnion,
  CanvasFrameElement,
} from "@/features/canvas/types";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";
import { Button } from "@/components/ui/Button";
import { MdBlurOn } from "react-icons/md";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { useGetAllTagQuery, usePostFrameTagMutation } from "@/services/TagsApi";
import { useCanvas } from "@/context/CanvasContext";
import { useGetTemplateVocabularyQuery } from "@/services/templateVocabularyApi";
import NumberInput from "@/components/ui/controlled-inputs/NumberInput";

export function FrameProperties({ element }: { element: CanvasFrameElement }) {
  const { projectIdMixer } = useCanvas();
  const { data: vocabData, isLoading: vocabLoading } =
    useGetTemplateVocabularyQuery(
      { projectId: projectIdMixer },
      { skip: !projectIdMixer }
    );

  const {
    data: tagsData,
    isLoading: tagsLoading,
    error: errorTags,
  } = useGetAllTagQuery();

  const [postFrameTag, { isLoading: postTagLoading, error: postTagError }] =
    usePostFrameTagMutation();
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  const assetTypeOptions = vocabData?.asset_types
    ? vocabData.asset_types.map((type) => ({
        value: type,
        label:
          type === "project_logo"
            ? "Project Logo"
            : type === "developer_logo"
            ? "Developer Logo"
            : type === "other_logo"
            ? "Other Logo"
            : "Image",
      }))
    : [
        { value: "image", label: "Image" },
        { value: "project_logo", label: "Project Logo" },
        { value: "developer_logo", label: "Developer Logo" },
        { value: "other_logo", label: "Other Logo" },
      ];

  const fitOptions = [
    { value: "cover", label: "Cover (Fill)" },
    { value: "contain", label: "Contain (Fit)" },
    { value: "stretch", label: "Stretch" },
  ];

  // Combine tags from vocabulary (with counts) and fallback tagsData
  const tagOptions = vocabData?.tags
    ? vocabData.tags.map((t) => ({
        id: t.tag,
        tag: t.count > 0 ? `${t.tag} (${t.count})` : t.tag,
        rawValue: t.tag,
      }))
    : tagsData
    ? tagsData.map((item) => ({
        id: String(item.id),
        tag: item.tag,
        rawValue: item.tag,
      }))
    : [];

  const errorMessage = errorTags
    ? "Failed to load tags."
    : postTagError
    ? (postTagError as any).data?.tag?.[0] || "Failed to create tag."
    : null;

  const handleTagsChange = async (val: string | string[]) => {
    const values = Array.isArray(val) ? val : val ? [val] : [];
    const currentTags = tagOptions.map((opt) => opt.rawValue || opt.tag);

    const newTags = values.filter(
      (tag) => tag && !currentTags.includes(tag) && tag.trim().length > 0
    );

    for (const newTag of newTags) {
      try {
        await postFrameTag({ tag: newTag }).unwrap();
      } catch (err) {
        console.error("Failed to create tag:", newTag, err);
      }
    }

    update({ tags: values });
  };

  const currentSlotIndex = String(
    element.slotIndex || element.frame_position_in_template || 1
  );

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <RotationProperties element={element} />

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-4 items-center">
            <ColorInput
              label="Border Color"
              value={element.stroke ?? "#000000"}
              onChange={(val) => update({ stroke: val })}
            />
            <div>
              <div className="text-sm font-medium mb-1">Transparent</div>
              <Button
                size="sm"
                variant={"outline"}
                className="text-gray-500 font-bold"
                onClick={() => update({ stroke: "transparent" })}
              >
                <MdBlurOn />
              </Button>
            </div>
          </div>

          <NumberInput
            label="Border Width"
            value={element.strokeWidth ?? 0}
            onChange={(val) => update({ strokeWidth: Number(val) || 0 })}
            min={0}
            max={50}
          />

          <NumberInput
            label="Corner Radius"
            value={
              typeof element.cornerRadius === "number"
                ? element.cornerRadius
                : element.borderRadiusSpecial ?? 0
            }
            onChange={(val) =>
              update({
                cornerRadius: Number(val) || 0,
                borderRadiusSpecial: Number(val) || 0,
              })
            }
            min={0}
            max={200}
          />

          <SelectInput
            isSearchable
            label="Fit Mode"
            value={element.fitMode || element.objectFit || "cover"}
            options={fitOptions}
            onChange={(val) => {
              if (typeof val === "string") {
                update({
                  fitMode: val,
                  objectFit: val === "contain" ? "contain" : "cover",
                });
              }
            }}
          />

          <SelectInput
            isLoading={vocabLoading}
            isSearchable
            className="col-span-full"
            label="Asset Type"
            value={element.assetType || "image"}
            options={assetTypeOptions}
            onChange={(val) => {
              if (typeof val === "string") {
                update({ assetType: val });
              }
            }}
          />

          <SelectInput
            isSearchable
            className="col-span-full"
            label="Slot Index (Frame Position)"
            value={currentSlotIndex}
            options={Array.from({ length: 20 }, (_, i) => ({
              value: String(i + 1),
              label: `Slot ${i + 1}`,
            }))}
            onChange={(val) => {
              if (typeof val === "string") {
                const num = Number(val);
                update({
                  slotIndex: num,
                  frame_position_in_template: val,
                });
              }
            }}
            placeholder="Select slot index..."
          />

          <SelectInput
            creatable
            isMulti
            isSearchable
            className="col-span-full"
            label="Tags"
            value={element.tags || []}
            options={tagOptions}
            valueKey="rawValue"
            labelKey="tag"
            onChange={handleTagsChange}
            isLoading={tagsLoading || postTagLoading}
            error={errorMessage}
            placeholder="Create or select tags..."
          />
        </div>
      </div>
    </div>
  );
}
