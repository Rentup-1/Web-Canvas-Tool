import { Button } from "@/components/ui/Button";
import { groupSelectedElements } from "@/features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

export default function ElementGrouping() {
    const dispatch = useAppDispatch();
    const elements = useAppSelector((state) => state.canvas.elements);
    const isMultipleElementsSelected = elements.filter((el) => el.selected).length > 1;
    return (
        <>
            {isMultipleElementsSelected &&  (
                <Button onClick={() => dispatch(groupSelectedElements())}>
                    Group
                </Button>
            )}
        </>
    );
}
