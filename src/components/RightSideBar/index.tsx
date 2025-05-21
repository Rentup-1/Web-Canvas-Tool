import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { togglePropertiesSidebar } from "@/features/ui/uiSlice";
import { Button } from "../ui/Button";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const RightSideBar: FC = () => {
  const dispatch = useAppDispatch();
  const propertiesSidebarOpen = useAppSelector(
    (state) => state.ui.propertiesSidebarOpen
  );
  if (!propertiesSidebarOpen) {
    return (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="mt-4 mx-2"
          onClick={() => dispatch(togglePropertiesSidebar())}
          title="Open properties"
        >
          <IoIosArrowBack className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full min-w-64 max-w-2xs bg-card border-l overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Properties</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(togglePropertiesSidebar())}
          title="Close properties"
        >
          <IoIosArrowForward className="h-5 w-5" />
        </Button>
      </div>

      {/* <div className="p-4">
        {!selectedElement && <CanvasSettings />}
        {selectedElement && <ShapeProperties element={selectedElement} />}
      </div> */}
    </div>
  );
};

export default RightSideBar;
