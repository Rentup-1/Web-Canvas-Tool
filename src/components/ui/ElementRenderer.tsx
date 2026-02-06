import Konva from "konva";
import { forwardRef } from "react";
import { TextRenderer } from "./renders/TextRenderer";
import { ImageRenderer } from "./renders/ImageRenderer";
import { FrameRenderer } from "./renders/FrameRenderer";
import { GroupRenderer } from "./renders/GroupRenderer";
import {
  CircleRenderer,
  EllipseRenderer,
  IconRenderer,
  LineRenderer,
  RectangleRenderer,
  RingRenderer,
  StarRenderer,
  TriangleRenderer,
  WedgeRenderer,
} from "./renders/ShapeRenderers";
import { ElementRendererProps } from "./renders/types";

export const ElementRenderer = forwardRef<any, ElementRendererProps>(
  (props, ref) => {
    const { element } = props;

    switch (element.type) {
      case "text":
        return <TextRenderer {...props} ref={ref} />;
      case "image":
        return <ImageRenderer {...props} ref={ref} />;
      case "frame":
        return <FrameRenderer {...props} ref={ref} />;
      case "group":
        return <GroupRenderer {...props} ref={ref} />;
      case "rectangle":
        return <RectangleRenderer {...props} ref={ref} />;
      case "circle":
        return <CircleRenderer {...props} ref={ref} />;
      case "ellipse":
        return <EllipseRenderer {...props} ref={ref} />;
      case "line":
        return <LineRenderer {...props} ref={ref} />;
      case "triangle":
        return <TriangleRenderer {...props} ref={ref} />;
      case "star":
        return <StarRenderer {...props} ref={ref} />;
      case "wedge":
        return <WedgeRenderer {...props} ref={ref} />;
      case "ring":
        return <RingRenderer {...props} ref={ref} />;
      case "icon":
        return <IconRenderer {...props} ref={ref} />;
      default:
        return null;
    }
  },
);
