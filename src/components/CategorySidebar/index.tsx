import type { FC } from "react";

import { FaFolder, FaImages, FaQrcode, FaShapes } from "react-icons/fa";
import { HiTemplate } from "react-icons/hi";
import { CgFormatText } from "react-icons/cg";
import { GoVideo } from "react-icons/go";
import { IoLayers } from "react-icons/io5";
import { BsStars } from "react-icons/bs";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setActiveCategory, toggleMainSidebar } from "@/features/ui/uiSlice";
import { Button } from "@/components/ui/Button";
import { IoIosArrowForward } from "react-icons/io";
const categories = [
  { id: "designes", icon: FaFolder, label: "my designs" },
  { id: "templates", icon: HiTemplate, label: "templates" },
  { id: "text", icon: CgFormatText, label: "text" },
  { id: "photos", icon: FaImages, label: "photos" },
  { id: "shapes", icon: FaShapes, label: "shapes" },
  { id: "videos", icon: GoVideo, label: "videos" },
  { id: "layers", icon: IoLayers, label: "layers" },
  { id: "qrCode", icon: FaQrcode, label: "qr code" },
  { id: "ai", icon: BsStars, label: "ai image" },
];

const CategorySidebar: FC = () => {
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector((state) => state.ui.activeCategory);
  const mainSidebarOpen = useAppSelector((state) => state.ui.mainSidebarOpen);

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setActiveCategory(categoryId));
  };

  return (
    <div className="h-full w-fit bg-card border-r flex flex-col items-center pb-4 overflow-y-auto">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`flex flex-col items-center justify-center px-2 py-4 hover:bg-accent transition-colors w-full ${
            activeCategory === category.id ? "bg-accent" : ""
          }`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <category.icon className="h-5 w-5" />
          <span className="capitalize">{category.label}</span>
        </button>
      ))}

      <Button
        variant="ghost"
        className="mt-auto"
        onClick={() => dispatch(toggleMainSidebar())}
        title={mainSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <IoIosArrowForward
          className={`h-5 w-5 transition-transform
            ${mainSidebarOpen ? "rotate-180" : ""} `}
        />
      </Button>
    </div>
  );
};

export default CategorySidebar;
