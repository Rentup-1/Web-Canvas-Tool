import { useState } from "react";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
  CanvasElementUnion,
  RectangleShape,
  TriangleShape,
  CircleShape,
  WedgeShape,
  RingShape,
  StarShape,
  LineShape,
  EllipseShape,
} from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaH, FaW, FaLock, FaLockOpen } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/Button";

export default function ScaleProperties({
  element,
}: {
  element: CanvasElementUnion;
}) {
  const dispatch = useAppDispatch();
  const [lockAspect, setLockAspect] = useState(false);

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  const { toPercent } = usePercentConverter();
  const stageWidth = useSelector((state: any) => state.canvas.stageWidth);
  const stageHeight = useSelector((state: any) => state.canvas.stageHeight);

  const renderScaleInputs = () => {
    switch (element.type) {
      /** ========== RECTANGLE ========== */
      case "rectangle": {
        const rect = element as RectangleShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label={<FaW />}
              type="number"
              value={rect.width.toFixed(0)}
              onChange={(val) => {
                const newWidth = Number(val);
                const ratio = rect.height / rect.width;
                update({
                  width: newWidth,
                  width_percent: toPercent(newWidth, stageWidth),
                  ...(lockAspect && {
                    height: newWidth * ratio,
                    height_percent: toPercent(newWidth * ratio, stageHeight),
                  }),
                });
              }}
            />
            <TextInput
              label={<FaH />}
              type="number"
              value={rect.height.toFixed(0)}
              onChange={(val) => {
                const newHeight = Number(val);
                const ratio = rect.width / rect.height;
                update({
                  height: newHeight,
                  height_percent: toPercent(newHeight, stageHeight),
                  ...(lockAspect && {
                    width: newHeight * ratio,
                    width_percent: toPercent(newHeight * ratio, stageWidth),
                  }),
                });
              }}
            />
          </div>
        );
      }

      /** ========== TRIANGLE ========== */
      case "triangle": {
        const tri = element as TriangleShape;
        return (
          <TextInput
            label="Size"
            type="number"
            value={tri.radius.toFixed(0)}
            onChange={(val) => update({ radius: Number(val) })}
          />
        );
      }

      /** ========== CIRCLE ========== */
      case "circle": {
        const circ = element as CircleShape;
        return (
          <TextInput
            label="Radius"
            type="number"
            value={circ.radius.toFixed(0)}
            onChange={(val) => update({ radius: Number(val) })}
          />
        );
      }

      /** ========== ELLIPSE ========== */
      case "ellipse": {
        const ell = element as EllipseShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label="Radius X"
              type="number"
              value={ell.radiusX.toFixed(0)}
              onChange={(val) => {
                const newX = Number(val);
                const ratio = ell.radiusY / ell.radiusX;
                update({
                  radiusX: newX,
                  ...(lockAspect && { radiusY: newX * ratio }),
                });
              }}
            />
            <TextInput
              label="Radius Y"
              type="number"
              value={ell.radiusY.toFixed(0)}
              onChange={(val) => {
                const newY = Number(val);
                const ratio = ell.radiusX / ell.radiusY;
                update({
                  radiusY: newY,
                  ...(lockAspect && { radiusX: newY * ratio }),
                });
              }}
            />
          </div>
        );
      }

      /** ========== WEDGE ========== */
      case "wedge": {
        const wedge = element as WedgeShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label="Radius"
              type="number"
              value={wedge.radius.toFixed(0)}
              onChange={(val) => update({ radius: Number(val) })}
            />
            <TextInput
              label="Angle"
              type="number"
              value={wedge.angle.toFixed(0)}
              onChange={(val) => update({ angle: Number(val) })}
            />
          </div>
        );
      }

      /** ========== RING ========== */
      case "ring": {
        const ring = element as RingShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label="Inner Radius"
              type="number"
              value={ring.innerRadius.toFixed(0)}
              onChange={(val) => {
                const newInner = Number(val);
                const ratio = ring.outerRadius / ring.innerRadius;
                update({
                  innerRadius: newInner,
                  ...(lockAspect && { outerRadius: newInner * ratio }),
                });
              }}
            />
            <TextInput
              label="Outer Radius"
              type="number"
              value={ring.outerRadius.toFixed(0)}
              onChange={(val) => {
                const newOuter = Number(val);
                const ratio = ring.innerRadius / ring.outerRadius;
                update({
                  outerRadius: newOuter,
                  ...(lockAspect && { innerRadius: newOuter * ratio }),
                });
              }}
            />
          </div>
        );
      }

      /** ========== STAR ========== */
      case "star": {
        const star = element as StarShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label="Points"
              type="number"
              value={star.numPoints}
              onChange={(val) => update({ numPoints: Number(val) })}
            />
            <TextInput
              label="Inner Radius"
              type="number"
              value={star.innerRadius.toFixed(0)}
              onChange={(val) => {
                const newInner = Number(val);
                const ratio = star.outerRadius / star.innerRadius;
                update({
                  innerRadius: newInner,
                  ...(lockAspect && { outerRadius: newInner * ratio }),
                });
              }}
            />
            <TextInput
              label="Outer Radius"
              type="number"
              value={star.outerRadius.toFixed(0)}
              onChange={(val) => {
                const newOuter = Number(val);
                const ratio = star.innerRadius / star.outerRadius;
                update({
                  outerRadius: newOuter,
                  ...(lockAspect && { innerRadius: newOuter * ratio }),
                });
              }}
            />
          </div>
        );
      }

      /** ========== LINE ========== */
      case "line": {
        const line = element as LineShape;
        return (
          <div className="flex gap-4">
            <TextInput
              label="X2"
              type="number"
              value={line.points?.[2] ?? 0}
              onChange={(val) => {
                const points = [...(line.points ?? [0, 0, 0, 0])];
                points[2] = Number(val);
                update({ points });
              }}
            />
            <TextInput
              label="Y2"
              type="number"
              value={line.points?.[3] ?? 0}
              onChange={(val) => {
                const points = [...(line.points ?? [0, 0, 0, 0])];
                points[3] = Number(val);
                update({ points });
              }}
            />
          </div>
        );
      }

      default:
        return <p>No scale options for this shape</p>;
    }
  };

  // Show lock button only for rectangle, ellipse, ring, star
  const supportsLock = ["rectangle", "ellipse", "ring", "star"].includes(
    element.type
  );

  return (
    <>
      <h4 className="mb-2 flex items-center gap-2">
        Scale
        {supportsLock && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLockAspect((prev) => !prev)}
            title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
          >
            {lockAspect ? <FaLock /> : <FaLockOpen />}
          </Button>
        )}
      </h4>
      <div className="flex gap-4 flex-wrap">{renderScaleInputs()}</div>
    </>
  );
}
