import { useAppSelector } from "@/hooks/useRedux";
import type { FC } from "react";
import { ShapesPanel } from "../LeftPanels/Shapes";

const MainSidebar: FC = () => {
  const { activeCategory } = useAppSelector((state) => state.ui);

  return (
    <div className="h-full w-64 bg-card border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 capitalize">
          {activeCategory}
        </h2>
        {activeCategory === "shapes" && <ShapesPanel />}
      </div>
    </div>
  );
};

export default MainSidebar;
