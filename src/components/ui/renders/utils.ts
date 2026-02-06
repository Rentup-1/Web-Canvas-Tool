// d:\web-canvas-tool\src\components\ui\renderers\utils.ts

import Konva from "konva";
import { CanvasElement } from "@/features/canvas/types";
import { GuideLineType } from "./types";

export const calculateSnappingPosition = (
  node: Konva.Node,
  elements: CanvasElement[],
  currentElement: CanvasElement,
  snapThreshold: number,
  offsetX: number,
  offsetY: number,
): { newX: number; newY: number } => {
  const shapeRect = node.getClientRect();
  let newX = node.x();
  let newY = node.y();
  let minDistanceX = snapThreshold + 1;
  let minDistanceY = snapThreshold + 1;

  elements.forEach((otherElement) => {
    if (
      otherElement.id === currentElement.id ||
      !(otherElement.visible ?? true)
    )
      return;

    const otherRect = {
      x: otherElement.x - otherElement.width / 2,
      y: otherElement.y - otherElement.height / 2,
      width: otherElement.width,
      height: otherElement.height,
    };

    // Horizontal alignment
    const currentEdgesY = [
      shapeRect.y,
      shapeRect.y + shapeRect.height / 2,
      shapeRect.y + shapeRect.height,
    ];
    const otherEdgesY = [
      otherRect.y,
      otherRect.y + otherRect.height / 2,
      otherRect.y + otherRect.height,
    ];

    currentEdgesY.forEach((currentY) => {
      otherEdgesY.forEach((otherY) => {
        const distance = Math.abs(currentY - otherY);
        if (distance < snapThreshold && distance < minDistanceY) {
          minDistanceY = distance;
          newY = otherY + offsetY - (currentY - shapeRect.y);
        }
      });
    });

    // Vertical alignment
    const currentEdgesX = [
      shapeRect.x,
      shapeRect.x + shapeRect.width / 2,
      shapeRect.x + shapeRect.width,
    ];
    const otherEdgesX = [
      otherRect.x,
      otherRect.x + otherRect.width / 2,
      otherRect.x + otherRect.width,
    ];

    currentEdgesX.forEach((currentX) => {
      otherEdgesX.forEach((otherX) => {
        const distance = Math.abs(currentX - otherX);
        if (distance < snapThreshold && distance < minDistanceX) {
          minDistanceX = distance;
          newX = otherX + offsetX - (currentX - shapeRect.x);
        }
      });
    });
  });

  return { newX, newY };
};

export const loadGoogleFont = (fontFamily: string) => {
  if (
    document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, "+")}"]`)
  ) {
    return;
  }

  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
    /\s+/g,
    "+",
  )}:wght@400;700&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

export const calculateGuidelines = (
  node: Konva.Node,
  elements: CanvasElement[],
  stageWidth: number,
  stageHeight: number,
  stageRef: React.RefObject<Konva.Stage>,
): GuideLineType[] => {
  const nodeBox = node.getClientRect();
  const nodeCenterX = nodeBox.x + nodeBox.width / 2;
  const nodeCenterY = nodeBox.y + nodeBox.height / 2;

  const canvasCenterX = stageWidth / 2;
  const canvasCenterY = stageHeight / 2;
  const threshold = 4;

  const newGuides: GuideLineType[] = [];

  elements.forEach((el: CanvasElement) => {
    if (el.id === node.id()) return;

    const otherNode = stageRef.current?.findOne(`#${el.id}`);
    if (!otherNode) return;

    const otherBox = otherNode.getClientRect();
    const otherCenterX = otherBox.x + otherBox.width / 2;
    const otherCenterY = otherBox.y + otherBox.height / 2;

    // Left
    const leftDiff = Math.abs(nodeBox.x - otherBox.x);
    if (leftDiff < threshold) {
      newGuides.push({
        points: [otherBox.x, 0, otherBox.x, stageHeight],
        text: `${leftDiff.toFixed(0)}px`,
        textPosition: { x: otherBox.x + 5, y: 10 },
      });
    }

    // Right
    const rightDiff = Math.abs(
      nodeBox.x + nodeBox.width - (otherBox.x + otherBox.width),
    );
    if (rightDiff < threshold) {
      const x = otherBox.x + otherBox.width;
      newGuides.push({
        points: [x, 0, x, stageHeight],
        text: `${rightDiff.toFixed(0)}px`,
        textPosition: { x: x + 5, y: 10 },
      });
    }

    // Top
    const topDiff = Math.abs(nodeBox.y - otherBox.y);
    if (topDiff < threshold) {
      newGuides.push({
        points: [0, otherBox.y, stageWidth, otherBox.y],
        text: `${topDiff.toFixed(0)}px`,
        textPosition: { x: 10, y: otherBox.y + 5 },
      });
    }

    // Bottom
    const bottomDiff = Math.abs(
      nodeBox.y + nodeBox.height - (otherBox.y + otherBox.height),
    );
    if (bottomDiff < threshold) {
      const y = otherBox.y + otherBox.height;
      newGuides.push({
        points: [0, y, stageWidth, y],
        text: `${bottomDiff.toFixed(0)}px`,
        textPosition: { x: 10, y: y + 5 },
      });
    }

    // Top to Bottom
    const topToBottomDiff = Math.abs(
      nodeBox.y - (otherBox.y + otherBox.height),
    );
    if (topToBottomDiff < threshold) {
      const y = otherBox.y + otherBox.height;
      newGuides.push({
        points: [0, y, stageWidth, y],
        text: `${topToBottomDiff.toFixed(0)}px`,
        textPosition: { x: 10, y: y + 5 },
      });
    }

    // Bottom to Top
    const bottomToTopDiff = Math.abs(nodeBox.y + nodeBox.height - otherBox.y);
    if (bottomToTopDiff < threshold) {
      const y = otherBox.y;
      newGuides.push({
        points: [0, y, stageWidth, y],
        text: `${bottomToTopDiff.toFixed(0)}px`,
        textPosition: { x: 10, y: y + 5 },
      });
    }

    // Left to Right
    const leftToRightDiff = Math.abs(nodeBox.x - (otherBox.x + otherBox.width));
    if (leftToRightDiff < threshold) {
      const x = otherBox.x + otherBox.width;
      newGuides.push({
        points: [x, 0, x, stageHeight],
        text: `${leftToRightDiff.toFixed(0)}px`,
        textPosition: { x: x + 5, y: nodeBox.y + 10 },
      });
    }

    // Right to Left
    const rightToLeftDiff = Math.abs(nodeBox.x + nodeBox.width - otherBox.x);
    if (rightToLeftDiff < threshold) {
      const x = otherBox.x;
      newGuides.push({
        points: [x, 0, x, stageHeight],
        text: `${rightToLeftDiff.toFixed(0)}px`,
        textPosition: { x: x + 5, y: nodeBox.y + 10 },
      });
    }

    // Center X to Center X
    const centerToCenterXDiff = Math.abs(nodeCenterX - otherCenterX);
    if (centerToCenterXDiff < threshold) {
      newGuides.push({
        points: [otherCenterX, 0, otherCenterX, stageHeight],
        text: `${centerToCenterXDiff.toFixed(0)}px`,
        textPosition: { x: otherCenterX + 5, y: nodeBox.y + 10 },
      });
    }

    // Center Y to Center Y
    const centerToCenterYDiff = Math.abs(nodeCenterY - otherCenterY);
    if (centerToCenterYDiff < threshold) {
      newGuides.push({
        points: [0, otherCenterY, stageWidth, otherCenterY],
        text: `${centerToCenterYDiff.toFixed(0)}px`,
        textPosition: { x: nodeBox.x + 10, y: otherCenterY + 5 },
      });
    }

    // Center X to Left
    const centerXToLeftDiff = Math.abs(nodeCenterX - otherBox.x);
    if (centerXToLeftDiff < threshold) {
      newGuides.push({
        points: [otherBox.x, 0, otherBox.x, stageHeight],
        text: `${centerXToLeftDiff.toFixed(0)}px`,
        textPosition: { x: otherBox.x + 5, y: nodeBox.y + 10 },
      });
    }

    // Center X to Right
    const centerXToRightDiff = Math.abs(
      nodeCenterX - (otherBox.x + otherBox.width),
    );
    if (centerXToRightDiff < threshold) {
      const x = otherBox.x + otherBox.width;
      newGuides.push({
        points: [x, 0, x, stageHeight],
        text: `${centerXToRightDiff.toFixed(0)}px`,
        textPosition: { x: x + 5, y: nodeBox.y + 10 },
      });
    }

    // Center Y to Top
    const centerYToTopDiff = Math.abs(nodeCenterY - otherBox.y);
    if (centerYToTopDiff < threshold) {
      newGuides.push({
        points: [0, otherBox.y, stageWidth, otherBox.y],
        text: `${centerYToTopDiff.toFixed(0)}px`,
        textPosition: { x: nodeBox.x + 10, y: otherBox.y + 5 },
      });
    }

    // Center Y to Bottom
    const centerYToBottomDiff = Math.abs(
      nodeCenterY - (otherBox.y + otherBox.height),
    );
    if (centerYToBottomDiff < threshold) {
      const y = otherBox.y + otherBox.height;
      newGuides.push({
        points: [0, y, stageWidth, y],
        text: `${centerYToBottomDiff.toFixed(0)}px`,
        textPosition: { x: nodeBox.x + 10, y: y + 5 },
      });
    }

    // Top inside center of another
    const topInCenterDiff = Math.abs(otherCenterY - nodeBox.y);
    if (topInCenterDiff < threshold) {
      newGuides.push({
        points: [0, nodeBox.y, stageWidth, nodeBox.y],
        text: `${topInCenterDiff.toFixed(0)}px`,
        textPosition: { x: nodeBox.x + 10, y: nodeBox.y + 5 },
      });
    }

    // Bottom inside center of another
    const bottomInCenterDiff = Math.abs(
      otherCenterY - (nodeBox.y + nodeBox.height),
    );
    if (bottomInCenterDiff < threshold) {
      const y = nodeBox.y + nodeBox.height;
      newGuides.push({
        points: [0, y, stageWidth, y],
        text: `${bottomInCenterDiff.toFixed(0)}px`,
        textPosition: { x: nodeBox.x + 10, y: y + 5 },
      });
    }
  });

  // Center X of canvas
  const centerXDiff = Math.abs(nodeCenterX - canvasCenterX);
  if (centerXDiff < threshold) {
    newGuides.push({
      points: [canvasCenterX, 0, canvasCenterX, stageHeight],
      text: `${Math.round(centerXDiff)}px`,
      textPosition: {
        x: canvasCenterX + 10,
        y: nodeBox.y + nodeBox.height / 2 - 30,
      },
    });
  }

  // Center Y of canvas
  const centerYDiff = Math.abs(nodeCenterY - canvasCenterY);
  if (centerYDiff < threshold) {
    newGuides.push({
      points: [0, canvasCenterY, stageWidth, canvasCenterY],
      text: `${Math.round(centerYDiff)}px`,
      textPosition: {
        x: nodeBox.x + nodeBox.width / 2 + 10,
        y: canvasCenterY + 20,
      },
    });
  }

  return newGuides;
};
