import { Button } from "@/components/ui/Button";
import {
  groupSelectedElements,
  ungroupElement,
} from "@/features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

export default function ElementGrouping() {
  const dispatch = useAppDispatch();
  const selectedElements = useAppSelector((state) =>
    state.canvas.elements.filter((el) => el.selected)
  );
  const selectedGroup =
    selectedElements.length === 1 && selectedElements[0].type === "group"
      ? selectedElements[0]
      : null;

  return (
    <div className="flex gap-2">
      {/* Group button (you probably already have this) */}
      {selectedElements.length > 1 && (
        <Button
          variant="outline"
          onClick={() => dispatch(groupSelectedElements())}
        >
          Group
        </Button>
      )}

      {/* Ungroup button */}
      {selectedGroup && (
        <Button
          variant="outline"
          onClick={() =>
            selectedGroup && dispatch(ungroupElement({ id: selectedGroup.id }))
          }
        >
          Ungroup
        </Button>
      )}
    </div>
  );
}
