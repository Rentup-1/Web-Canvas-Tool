import { type CanvasElement } from "../features/canvas/types";

export function rescaleElementsForAspectRatio(
  elements: CanvasElement[],
  oldStage: { width: number; height: number },
  newStage: { width: number; height: number }
): CanvasElement[] {
  const xScale = newStage.width / oldStage.width;
  const yScale = newStage.height / oldStage.height;

  return elements.map((el) => {
    const updated: Partial<CanvasElement> = {
      x: el.x * xScale,
      y: el.y * yScale,
      width: el.width ? el.width * xScale : undefined,
      height: el.height ? el.height * yScale : undefined,
    };

    if (el.type === "text" && el.fontSize) {
      const avgScale = (xScale + yScale) / 2;
      updated.fontSize = el.fontSize * avgScale;
    }

    return { ...el, ...updated };
  });
}
