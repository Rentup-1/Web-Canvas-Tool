import { useAppDispatch } from "../../../../hooks/useRedux";
import { addElement } from "../../../../features/canvas/canvasSlice";
import {
  FaCircle,
  FaSquare,
  FaDrawPolygon,
  FaShapes,
  FaLongArrowAltRight,
  FaRegCircle,
  FaStar,
  FaRing,
  FaEllipsisH,
} from "react-icons/fa";
import { GiTriangleTarget } from "react-icons/gi";
import { BsSlashLg } from "react-icons/bs";

export function ShapesPanel() {
  const dispatch = useAppDispatch();

  const shapes = [
    { type: "circle", label: "Circle", icon: <FaCircle /> },
    { type: "rectangle", label: "Rectangle", icon: <FaSquare /> },
    { type: "triangle", label: "Triangle", icon: <GiTriangleTarget /> },
    { type: "ellipse", label: "Ellipse", icon: <FaEllipsisH /> },
    { type: "line", label: "Line", icon: <BsSlashLg /> },
    { type: "arrow", label: "Arrow", icon: <FaLongArrowAltRight /> },
    { type: "star", label: "Star", icon: <FaStar /> },
    { type: "ring", label: "Ring", icon: <FaRing /> },
    { type: "arc", label: "Arc", icon: <FaRegCircle /> },
    { type: "wedge", label: "Wedge", icon: <FaShapes /> },
    { type: "custom", label: "Polygon", icon: <FaDrawPolygon /> },
  ];

  return (
    <div className="flex flex-col gap-2 p-2">
      <h3 className="text-sm font-semibold text-gray-600 mb-1">Shapes</h3>
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            className="fancy-button flex flex-col items-center justify-center gap-1 p-2 text-xs"
            onClick={() => dispatch(addElement({ type: shape.type as any }))}
            title={`Add ${shape.label}`}
          >
            <span className="text-lg">{shape.icon}</span>
            <span>{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
