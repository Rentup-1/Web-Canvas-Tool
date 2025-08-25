import { Button } from "@/components/ui/Button";
import {
  groupSelectedElements,
  ungroupElement,
} from "@/features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  selectSelectedElements,
  selectSelectedGroup,
} from "@/features/canvas/canvasSelectors";

export default function ElementGrouping() {
  const dispatch = useAppDispatch();
  const selectedElements = useAppSelector(selectSelectedElements);
  const selectedGroup = useAppSelector(selectSelectedGroup);

  return (
    <div className="flex gap-2">
      {selectedElements.length > 1 && (
        <Button
          variant="outline"
          onClick={() => dispatch(groupSelectedElements())}
        >
          Group
        </Button>
      )}

      {selectedGroup && (
        <Button
          variant="outline"
          onClick={() => dispatch(ungroupElement({ id: selectedGroup.id }))}
        >
          Ungroup
        </Button>
      )}
    </div>
  );
}
