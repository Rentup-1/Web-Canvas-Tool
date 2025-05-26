import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Rect,
  Text,
  Image as KonvaImage,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Star,
  Wedge,
  Ring,
  Group,
  Transformer,
} from "react-konva";
import type {
  CanvasElementUnion,
  CanvasTextElement,
  RectangleShape,
  CircleShape,
  EllipseShape,
  LineShape,
  TriangleShape,
  StarShape,
  WedgeShape,
  RingShape,
  CanvasElement,
} from "../../features/canvas/types";
import { useSelector } from "react-redux";
import useImage from "use-image";
import { updateElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Html } from 'react-konva-utils';
import * as MdIcons from 'react-icons/md';
import { Icon } from "@iconify/react/dist/iconify.js";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  element: CanvasElementUnion;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasElementUnion>) => void;
}

// Update the ElementRenderer to apply stroke and strokeWidth to all shapes
export const ElementRenderer = forwardRef<any, Props>(
  ({ element, onSelect, onChange }, ref) => {
    const elements = useSelector((store:any) => store.canvas.elements);
    const [isOverFrame, setIsOverFrame] = useState(false);
    const dispatch = useAppDispatch();

    switch (element.type) {

      case "text":
        const textElement = element as CanvasTextElement;
        const refText = useRef(null);
        const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
        const trRef = useRef(null);
        const [isSelected, setIsSelected] = useState(false);
        const [isEditing, setIsEditing] = useState(false);
        const [editableText, setEditableText] = useState(textElement.text);

        const textAlign = useSelector((state:any) =>
          state.canvas.elements.find((el:any) => el.id === textElement.id)?.align || 'left'
        );
        const fontWeight = useSelector((state: { canvas: { elements: { id: string; fontWeight?: string }[] } }) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.fontWeight || "normal"
        );

        const fontStyle = useSelector((state: { canvas: { elements: { id: string; fontStyle?: string }[] } }) =>
          state.canvas.elements.find((el) => el.id === textElement.id)?.fontStyle || "normal"
        );


        const borderRadius = textElement.borderRadius || {};
        const textCornerRadius = [
          borderRadius.topLeft || 0,
          borderRadius.topRight || 0,
          borderRadius.bottomRight || 0,
          borderRadius.bottomLeft || 0,
        ];

        useEffect(() => {
          if (refText.current) {
            const fontStyleFinal =
              fontWeight === 'bold'
                ? fontStyle === 'italic'
                  ? 'bold italic'
                  : 'bold'
                : fontStyle;

            refText.current.fontStyle(fontStyleFinal);

            refText.current._setTextData(); 

            refText.current.getLayer()?.batchDraw();

            const box = refText.current.getClientRect({ skipTransform: true });

            setBgSize({ width: box.width, height: box.height });

            dispatch(updateElement({
              id: textElement.id,
              updates: {
                width: box.width,
                height: box.height,
              },
            }));
          }
        }, [
          textElement.text,
          textElement.fontSize,
          textElement.fontFamily,
          textElement.padding,
          textAlign,
          fontWeight,
          fontStyle,
        ]);



        useEffect(() => {
          if (isSelected && trRef.current && !isEditing) {
            trRef.current.nodes([refText.current]);
            trRef.current.getLayer().batchDraw();
          }
        }, [isSelected, isEditing]);

        const handleSelect = (e) => {
          setIsSelected(true);
          if (onSelect) onSelect(e, textElement.id);
        };

        const handleDoubleClick = () => {
          setIsEditing(true);
        };

        const handleTextChange = (e) => {
          setEditableText(e.target.value);
          if (refText.current) {
            refText.current.text(e.target.value);
            const box = refText.current.getClientRect({ skipTransform: true });
            setBgSize({ width: box.width, height: box.height });
          }
        };

        const handleTextBlur = () => {
          setIsEditing(false);
          dispatch(updateElement({
            id: textElement.id,
            updates: {
              text: editableText,
              width: bgSize.width,
              height: bgSize.height,
              align: textAlign,
            },
          }));
        };

        const handleKeyPress = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            dispatch(updateElement({
              id: textElement.id,
              updates: {
                text: editableText,
                width: bgSize.width,
                height: bgSize.height,
                align: textAlign,
              },
            }));
          }
        };

        return (
  
          <>
            {textElement.background && (
              <Rect
                x={textElement.x - (textElement.padding || 0)}
                y={textElement.y - (textElement.padding || 0)}
                width={bgSize.width + (textElement.padding || 0) * 2}
                height={bgSize.height + (textElement.padding || 0) * 2}
                fill={textElement.background}
                stroke={textElement.backgroundStroke}
                strokeWidth={textElement.backgroundStrokeWidth}
                opacity={textElement.opacity}
                rotation={textElement.rotation}
                cornerRadius={textCornerRadius}
              />
            )}
            <Text
              ref={refText}
              x={textElement.x}
              y={textElement.y}
              text={editableText}
              fill={textElement.fill || "#000"}
              stroke={textElement.stroke}
              padding={textElement.padding}
              fontSize={textElement.fontSize}
              fontFamily={textElement.fontFamily || "Arial"}
              opacity={textElement.opacity}
              verticalAlign="middle"
              align={textAlign}
              fontStyle={fontWeight} // 🟢 Apply fontWeight as fontStyle for Konva
              draggable
              width={textElement.width}
              wrap="word"
              onClick={handleSelect}
              onDblClick={handleDoubleClick}
              onDragMove={(e) => dispatch(updateElement({
                id: textElement.id,
                updates: { x: e.target.x(), y: e.target.y() },
              }))}
              onTransform={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, e.target.width() * e.target.scaleX());
                node.width(newWidth);
                node.scaleX(1);
                node.scaleY(1);
                const newHeight = node.height();
                setBgSize({ width: newWidth, height: newHeight });
              }}
              onTransformEnd={(e) => {
                const node = refText.current;
                const newWidth = Math.max(30, node.width());
                node.width(newWidth);
                const newHeight = node.height();

                setBgSize({ width: newWidth, height: newHeight });

                dispatch(updateElement({
                  id: textElement.id,
                  updates: {
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight,
                    align: textAlign,
                    fontWeight,
                  },
                }));

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
            {isSelected && !isEditing && (
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 30 || newBox.height < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onClick={(e) => e.cancelBubble = true}
              />
            )}
            {isEditing && (
              <Html>
                <textarea
                  style={{
                    position: 'absolute',
                    top: textElement.y,
                    left: textElement.x,
                    width: bgSize.width,
                    height: bgSize.height,
                    fontSize: textElement.fontSize,
                    fontFamily: textElement.fontFamily || 'Arial',
                    padding: textElement.padding || 0,
                    color: textElement.fill,
                    background: 'white',
                    border: '1px dashed #ccc',
                    resize: 'none',
                    outline: 'none',
                    overflow: 'hidden',
                    lineHeight: '1',
                    textAlign: textAlign,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle, 
                  }}
                  value={editableText}
                  onChange={handleTextChange}
                  onBlur={handleTextBlur}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </Html>
            )}
          </>
        );

      // case "frame": {
      //   const isFrame = element.type === "frame";
        
      //   return (
      //     <Rect
      //       ref={ref}
      //       x={element.x}
      //       y={element.y}
      //       width={element.width}
      //       height={element.height}
      //       fill={element.fill}
      //       dash={[4, 4]}
      //       stroke={element.stroke}
      //       strokeWidth={element.strokeWidth}
      //       rotation={element.rotation}
      //       draggable
      //       onClick={onSelect}
      //       onDragMove={(e) => {
      //         const node = e.target;
      //         const newX = node.x();
      //         const newY = node.y();
      //         dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));
      //       }}
      //       onTransform={(e) => {
      //         const node = e.target;
      //         const newWidth = node.width() * node.scaleX();
      //         const newHeight = node.height() * node.scaleY();
      //         console.log(e.target);
              
      //         onChange({
      //           x: node.x(),
      //           y: node.y(),
      //           width: newWidth,
      //           height: newHeight,
      //           rotation: node.rotation(),
      //         });

      //         node.scaleX(1);
      //         node.scaleY(1);
      //       }}
      //   />

      //   );
      // }

      // case "frame": {
      //   const isFrame = element.type === "frame";

      //   return (
      //     <Rect
      //       ref={ref}
      //       x={element.x}
      //       y={element.y}
      //       width={element.width}
      //       height={element.height}
      //       fill={element.fill}
      //       dash={[4, 4]}
      //       stroke={element.stroke}
      //       strokeWidth={element.strokeWidth}
      //       rotation={element.rotation}
      //       draggable
      //       onClick={onSelect}
      //       onDragMove={(e) => {
      //         const node = e.target;
      //         const newX = node.x();
      //         const newY = node.y();

      //         // Update the frame's position
      //         dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));

      //         // Update all images inside this frame
      //         const imagesInFrame = elements.filter(
      //           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
      //         );

      //         imagesInFrame.forEach((image: CanvasElement) => {
      //           const offsetX = image.x - element.x; // Current offset relative to frame
      //           const offsetY = image.y - element.y;

      //           dispatch(
      //             updateElement({
      //               id: image.id,
      //               updates: {
      //                 x: newX + offsetX, // New frame x + offset
      //                 y: newY + offsetY, // New frame y + offset
      //               },
      //             })
      //           );
      //         });
      //       }}

      //       onTransform={(e) => {
      //         const node = e.target;
      //         const oldWidth = element.width;
      //         const oldHeight = element.height;

      //         const newWidth = node.width() * node.scaleX();
      //         const newHeight = node.height() * node.scaleY();

      //         const scaleX = newWidth / oldWidth;
      //         const scaleY = newHeight / oldHeight;

      //         // Update the frame
      //         onChange({
      //           x: node.x(),
      //           y: node.y(),
      //           width: newWidth,
      //           height: newHeight,
      //           rotation: node.rotation(),
      //         });

      //         node.scaleX(1);
      //         node.scaleY(1);

      //         // Resize the images inside the frame
      //         const imagesInFrame = elements.filter(
      //           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
      //         );

      //         imagesInFrame.forEach((img) => {
      //           const relativeX = img.x - element.x;
      //           const relativeY = img.y - element.y;

      //           const newImgX = node.x() + relativeX * scaleX;
      //           const newImgY = node.y() + relativeY * scaleY;

      //           const newImgWidth = img.width * scaleX;
      //           const newImgHeight = img.height * scaleY;

      //           dispatch(
      //             updateElement({
      //               id: img.id,
      //               updates: {
      //                 x: newImgX,
      //                 y: newImgY,
      //                 width: newImgWidth,
      //                 height: newImgHeight,
      //               },
      //             })
      //           );
      //         });
      //       }}

      //     />
      //   );
      // }

  //    case "frame": {
  // const isFrame = element.type === "frame";

  // return (
  //   <Rect
  //     ref={ref}
  //     x={element.x}
  //     y={element.y}
  //     width={element.width}
  //     height={element.height}
  //     fill={element.fill}
  //     dash={[4, 4]}
  //     stroke={element.stroke}
  //     strokeWidth={element.strokeWidth}
  //     rotation={element.rotation}
  //     draggable
  //     onClick={onSelect}
  //     onDragMove={(e) => {
  //       const node = e.target;
  //       const newX = node.x();
  //       const newY = node.y();

  //       // Update the frame's position
  //       dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));

  //       // Update all images inside this frame
  //       const imagesInFrame = elements.filter(
  //         (el: CanvasElement) => el.type === "image" && el.frameId === element.id
  //       );

  //       imagesInFrame.forEach((image: CanvasElement) => {
  //         const offsetX = image.x - element.x; // Current offset relative to frame
  //         const offsetY = image.y - element.y;

  //         dispatch(
  //           updateElement({
  //             id: image.id,
  //             updates: {
  //               x: newX + offsetX, // New frame x + offset
  //               y: newY + offsetY, // New frame y + offset
  //             },
  //           })
  //         );
  //       });
  //     }}
  //     onTransform={(e) => {
  //       const node = e.target;
  //       const oldWidth = element.width;
  //       const oldHeight = element.height;

  //       const newWidth = node.width() * node.scaleX();
  //       const newHeight = node.height() * node.scaleY();

  //       const scaleX = newWidth / oldWidth;
  //       const scaleY = newHeight / oldHeight;

  //       // Update the frame
  //       onChange({
  //         x: node.x(),
  //         y: node.y(),
  //         width: newWidth,
  //         height: newHeight,
  //         rotation: node.rotation(),
  //       });

  //       node.scaleX(1);
  //       node.scaleY(1);

  //       // Resize the images inside the frame
  //       const imagesInFrame = elements.filter(
  //         (el: CanvasElement) => el.type === "image" && el.frameId === element.id
  //       );

  //       imagesInFrame.forEach((img) => {
  //         const relativeX = img.x - element.x;
  //         const relativeY = img.y - element.y;

  //         const newImgX = node.x() + relativeX * scaleX;
  //         const newImgY = node.y() + relativeY * scaleY;

  //         const newImgWidth = img.width * scaleX;
  //         const newImgHeight = img.height * scaleY;

  //         dispatch(
  //           updateElement({
  //             id: img.id,
  //             updates: {
  //               x: newImgX,
  //               y: newImgY,
  //               width: newImgWidth,
  //               height: newImgHeight,
  //             },
  //           })
  //         );
  //       });
  //     }}
  //   />
  // );
  //     }

//   case "frame": {
//   const isFrame = element.type === "frame";

//   return (
//     <Rect
//       ref={ref}
//       x={element.x}
//       y={element.y}
//       width={element.width}
//       height={element.height}
//       fill={element.fill}
//       dash={[4, 4]}
//       stroke={element.stroke}
//       strokeWidth={element.strokeWidth}
//       rotation={element.rotation}
//       draggable
//       onClick={onSelect}
//       onDragMove={(e) => {
//         const node = e.target;
//         const newX = node.x();
//         const newY = node.y();

//         // Update the frame's position
//         dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));

//         // Update all images inside this frame
//         const imagesInFrame = elements.filter(
//           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
//         );

//         imagesInFrame.forEach((image: CanvasElement) => {
//           const offsetX = image.x - element.x; // Current offset relative to frame
//           const offsetY = image.y - element.y;

//           dispatch(
//             updateElement({
//               id: image.id,
//               updates: {
//                 x: newX + offsetX, // New frame x + offset
//                 y: newY + offsetY, // New frame y + offset
//               },
//             })
//           );
//         });
//       }}
//       onTransform={(e) => {
//         const node = e.target;
//         const oldWidth = element.width;
//         const oldHeight = element.height;

//         const newWidth = node.width() * node.scaleX();
//         const newHeight = node.height() * node.scaleY();

//         const scaleX = newWidth / oldWidth;
//         const scaleY = newHeight / oldHeight;

//         // Update the frame
//         onChange({
//           x: node.x(),
//           y: node.y(),
//           width: newWidth,
//           height: newHeight,
//           rotation: node.rotation(),
//         });

//         node.scaleX(1);
//         node.scaleY(1);

//         // Resize the images inside the frame
//         const imagesInFrame = elements.filter(
//           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
//         );

//         imagesInFrame.forEach((img) => {
//           const relativeX = img.x - element.x;
//           const relativeY = img.y - element.y;

//           const newImgX = node.x() + relativeX * scaleX;
//           const newImgY = node.y() + relativeY * scaleY;

//           const newImgWidth = img.width * scaleX;
//           const newImgHeight = img.height * scaleY;

//           dispatch(
//             updateElement({
//               id: img.id,
//               updates: {
//                 x: newImgX,
//                 y: newImgY,
//                 width: newImgWidth,
//                 height: newImgHeight,
//               },
//             })
//           );
//         });
//       }}
//     />
//   );
// }








// case "frame": {
//   const isFrame = element.type === "frame";

//   return (
//     <Rect
//       ref={ref}
//       x={element.x}
//       y={element.y}
//       width={element.width}
//       height={element.height}
//       fill={element.fill}
//       dash={[4, 4]}
//       stroke={element.stroke}
//       strokeWidth={element.strokeWidth}
//       rotation={element.rotation}
//       draggable
//       onClick={onSelect}
//       onDragMove={(e) => {
//         const node = e.target;
//         const newX = node.x();
//         const newY = node.y();

//         // Update the frame's position
//         dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));

//         // Update all images inside this frame
//         const imagesInFrame = elements.filter(
//           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
//         );

//         imagesInFrame.forEach((image: CanvasElement) => {
//           // Calculate the new position based on the original offset
//           const offsetX = image.x - element.x; // Original offset
//           const offsetY = image.y - element.y;

//           const newImageX = newX + offsetX;
//           const newImageY = newY + offsetY;

//           dispatch(
//             updateElement({
//               id: image.id,
//               updates: {
//                 x: newImageX,
//                 y: newImageY,
//               },
//             })
//           );
//         });
//       }}
//       onTransform={(e) => {
//         const node = e.target;
//         const oldWidth = element.width;
//         const oldHeight = element.height;

//         const newWidth = node.width() * node.scaleX();
//         const newHeight = node.height() * node.scaleY();

//         const scaleX = newWidth / oldWidth;
//         const scaleY = newHeight / oldHeight;

//         // Update the frame
//         onChange({
//           x: node.x(),
//           y: node.y(),
//           width: newWidth,
//           height: newHeight,
//           rotation: node.rotation(),
//         });

//         node.scaleX(1);
//         node.scaleY(1);

//         // Resize the images inside the frame
//         const imagesInFrame = elements.filter(
//           (el: CanvasElement) => el.type === "image" && el.frameId === element.id
//         );

//         imagesInFrame.forEach((img) => {
//           const relativeX = img.x - element.x;
//           const relativeY = img.y - element.y;

//           const newImgX = node.x() + relativeX * scaleX;
//           const newImgY = node.y() + relativeY * scaleY;

//           const newImgWidth = img.width * scaleX;
//           const newImgHeight = img.height * scaleY;

//           dispatch(
//             updateElement({
//               id: img.id,
//               updates: {
//                 x: newImgX,
//                 y: newImgY,
//                 width: newImgWidth,
//                 height: newImgHeight,
//               },
//             })
//           );
//         });
//       }}
//     />
//   );
// } 

// case "image": {
//   const [image] = useImage(element.src || "");
//   const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
//   const wasOverFrameRef = useRef(false); // Use useRef to persist state
//   const [currentFitMode, setCurrentFitMode] = useState(element.fitMode || "fill"); // Default to 'fill'
//   const isDraggingImageRef = useRef(false); // Flag to prevent recursive updates

//   // Function to apply fitMode to the image (used when changing fitMode)
//   const applyFitMode = (newFitMode: string, targetFrame: CanvasElement) => {
//     const frameAspect = targetFrame.width / targetFrame.height;
//     const imgAspect = element.width / element.height;

//     let newWidth, newHeight, offsetX, offsetY;

//     switch (newFitMode) {
//       case "fit":
//         if (imgAspect > frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;

//       case "fill":
//         if (imgAspect < frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;

//       case "stretch":
//         newWidth = targetFrame.width;
//         newHeight = targetFrame.height;
//         break;

//       default:
//         // Fallback to fill
//         if (imgAspect < frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;
//     }

//     offsetX = (targetFrame.width - newWidth) / 2;
//     offsetY = (targetFrame.height - newHeight) / 2;

//     onChange({
//       x: targetFrame.x + offsetX,
//       y: targetFrame.y + offsetY,
//       width: newWidth,
//       height: newHeight,
//       frameId: targetFrame.id,
//       fitMode: newFitMode,
//     });
//   };

//   if (frame) {
//     return (
//       <>
//         <Group
//           x={frame.x}
//           y={frame.y}
//           clipFunc={(ctx) => {
//             ctx.rect(0, 0, frame.width, frame.height);
//           }}
//         >
//           <KonvaImage
//             ref={ref}
//             image={image}
//             x={element.x - frame.x} // Relative to frame
//             y={element.y - frame.y} // Relative to frame
//             width={element.width}
//             height={element.height}
//             draggable
//             onClick={() => {
//               onSelect(); // Select the image to show fitMode options
//             }}
//             onDragStart={() => {
//               isDraggingImageRef.current = true; // Set flag when drag starts
//             }}
//             onDragMove={(e) => {
//               if (!isDraggingImageRef.current) return; // Prevent recursive updates

//               const imageNode = e.target;
//               const newX = imageNode.x(); // Relative to frame
//               const newY = imageNode.y(); // Relative to frame

//               // Check if the image stays within frame bounds
//               const isInside =
//                 newX >= 0 &&
//                 newY >= 0 &&
//                 newX + element.width <= frame.width &&
//                 newY + element.height <= frame.height;

//               if (!isInside) {
//                 // Reset to previous position if dragged outside frame
//                 imageNode.x(element.x - frame.x);
//                 imageNode.y(element.y - frame.y);
//                 return;
//               }

//               // Calculate new absolute image position
//               const newImageX = newX + frame.x;
//               const newImageY = newY + frame.y;

//               // Update image position in state
//               onChange({
//                 x: newImageX,
//                 y: newImageY,
//                 width: element.width,
//                 height: element.height,
//               });

//               // Calculate new frame position to maintain relative offset
//               const offsetX = element.x - frame.x; // Original offset
//               const offsetY = element.y - frame.y;
//               const newFrameX = newImageX - offsetX;
//               const newFrameY = newImageY - offsetY;

//               // Update frame position
//               dispatch(
//                 updateElement({
//                   id: frame.id,
//                   updates: {
//                     x: newFrameX,
//                     y: newFrameY,
//                   },
//                 })
//               );
//             }}
//             onDragEnd={() => {
//               isDraggingImageRef.current = false; // Reset flag when drag ends
//             }}
//             onTransform={(e) => {
//               const node = e.target;
//               const newWidth = node.width() * node.scaleX();
//               const newHeight = node.height() * node.scaleY();
//               const newX = node.x();
//               const newY = node.y();

//               // Check if the image stays within frame bounds
//               const isInside =
//                 newX >= 0 &&
//                 newY >= 0 &&
//                 newX + newWidth <= frame.width &&
//                 newY + newHeight <= frame.height;

//               if (!isInside) {
//                 node.scaleX(1);
//                 node.scaleY(1);
//                 node.x(element.x - frame.x);
//                 node.y(element.y - frame.y);
//                 return;
//               }

//               onChange({
//                 x: newX + frame.x,
//                 y: newY + frame.y,
//                 width: newWidth,
//                 height: newHeight,
//                 rotation: node.rotation(),
//               });

//               node.scaleX(1);
//               node.scaleY(1);
//             }}
//           />
//         </Group>
//         {/* UI for changing fitMode when image is selected */}
//         {element.isSelected && (
//           <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
//             <select
//               value={currentFitMode}
//               onChange={(e) => {
//                 setCurrentFitMode(e.target.value);
//                 if (frame) {
//                   applyFitMode(e.target.value, frame); // Apply new fitMode
//                 }
//               }}
//             >
//               <option value="fit">Fit</option>
//               <option value="fill">Fill</option>
//               <option value="stretch">Stretch</option>
//             </select>
//           </div>
//         )}
//       </>
//     );
//   }

//   // Image without a frame (unchanged)
//   return (
//     <>
//       <KonvaImage
//         ref={ref}
//         image={image}
//         x={element.x}
//         y={element.y}
//         width={element.width}
//         height={element.height}
//         draggable
//         onClick={() => {
//           onSelect(); // Select the image
//         }}
//         onDragMove={(e) => {
//           const imageNode = e.target;
//           const imgX = imageNode.x();
//           const imgY = imageNode.y();
//           const imgW = imageNode.width();
//           const imgH = imageNode.height();

//           const centerX = imgX + imgW / 2;
//           const centerY = imgY + imgH / 2;

//           dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

//           const frames = elements
//             .filter(
//               (el: CanvasElement) =>
//                 el.type === "frame" &&
//                 centerX >= el.x &&
//                 centerX <= el.x + el.width &&
//                 centerY >= el.y &&
//                 centerY <= el.y + el.height
//             )
//             .sort((a, b) => elements.indexOf(b) - elements.indexOf(a));

//           const frame = frames[0];

//           if (!frame) {
//             wasOverFrameRef.current = false;
//             return;
//           }

//           const isAlreadyHasImage = elements.some(
//             (el: CanvasElement) =>
//               el.type === "image" &&
//               el.frameId === frame.id &&
//               el.id !== element.id
//           );

//           if (isAlreadyHasImage) {
//             return;
//           }

//           if (!wasOverFrameRef.current) {
//             const frameAspect = frame.width / frame.height;
//             const imgAspect = imgW / imgH;

//             let newWidth, newHeight, offsetX, offsetY;

//             switch (currentFitMode) {
//               case "fit":
//                 if (imgAspect > frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "fill":
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "stretch":
//                 newWidth = frame.width;
//                 newHeight = frame.height;
//                 break;

//               default:
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;
//             }

//             offsetX = (frame.width - newWidth) / 2;
//             offsetY = (frame.height - newHeight) / 2;

//             onChange({
//               x: frame.x + offsetX,
//               y: frame.y + offsetY,
//               width: newWidth,
//               height: newHeight,
//               frameId: frame.id,
//               fitMode: currentFitMode,
//             });

//             wasOverFrameRef.current = true;
//           }
//         }}
//         onDragEnd={(e) => {
//           const img = e.target;
//           const imgW = img.width();
//           const imgH = img.height();

//           const centerX = img.x() + imgW / 2;
//           const centerY = img.y() + imgH / 2;

//           const frames = elements
//             .filter(
//               (el: CanvasElement) =>
//                 el.type === "frame" &&
//                 centerX >= el.x &&
//                 centerX <= el.x + el.width &&
//                 centerY >= el.y &&
//                 centerY <= el.y + el.height
//             )
//             .sort((a, b) => elements.indexOf(b) - elements.indexOf(a));

//           const frame = frames[0];

//           if (frame) {
//             const isAlreadyHasImage = elements.some(
//               (el: CanvasElement) =>
//                 el.type === "image" &&
//                 el.frameId === frame.id &&
//                 el.id !== element.id
//             );

//             if (isAlreadyHasImage) {
//               onChange({ x: img.x(), y: img.y(), frameId: null });
//               wasOverFrameRef.current = false;
//               return;
//             }

//             const frameAspect = frame.width / frame.height;
//             const imgAspect = imgW / imgH;

//             let newWidth, newHeight, offsetX, offsetY;

//             switch (currentFitMode) {
//               case "fit":
//                 if (imgAspect > frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "fill":
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "stretch":
//                 newWidth = frame.width;
//                 newHeight = frame.height;
//                 break;

//               default:
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;
//             }

//             offsetX = (frame.width - newWidth) / 2;
//             offsetY = (frame.height - newHeight) / 2;

//             onChange({
//               x: frame.x + offsetX,
//               y: frame.y + offsetY,
//               width: newWidth,
//               height: newHeight,
//               frameId: frame.id,
//               fitMode: currentFitMode,
//             });
//           } else {
//             onChange({ x: img.x(), y: img.y(), frameId: null });
//           }

//           wasOverFrameRef.current = false;
//         }}
//         onTransform={(e) => {
//           const node = e.target;
//           const newWidth = node.width() * node.scaleX();
//           const newHeight = node.height() * node.scaleY();
//           const newX = node.x();
//           const newY = node.y();

//           onChange({
//             x: newX,
//             y: newY,
//             width: newWidth,
//             height: newHeight,
//             rotation: node.rotation(),
//           });

//           node.scaleX(1);
//           node.scaleY(1);
//         }}
//       />
//       {element.isSelected && (
//         <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
//           <select
//             value={currentFitMode}
//             onChange={(e) => {
//               setCurrentFitMode(e.target.value);
//               if (frame) {
//                 applyFitMode(e.target.value, frame);
//               }
//             }}
//           >
//             <option value="fit">Fit</option>
//             <option value="fill">Fill</option>
//             <option value="stretch">Stretch</option>
//           </select>
//         </div>
//       )}
//     </>
//   );
// }

case "frame": {
  const isFrame = element.type === "frame";

  return (
    <Rect
      ref={ref}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      fill={element.fill}
      dash={[4, 4]}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onDragMove={(e) => {
        const node = e.target;
        const newX = node.x();
        const newY = node.y();

        // Update the frame's position
        dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));

        // Update all images inside this frame
        const imagesInFrame = elements.filter(
          (el: CanvasElement) => el.type === "image" && el.frameId === element.id
        );

        imagesInFrame.forEach((image: CanvasElement) => {
          // Calculate the new position based on the original offset
          const offsetX = image.x - element.x; // Original offset
          const offsetY = image.y - element.y;

          const newImageX = newX + offsetX;
          const newImageY = newY + offsetY;

          dispatch(
            updateElement({
              id: image.id,
              updates: {
                x: newImageX,
                y: newImageY,
              },
            })
          );
        });
      }}
      onTransform={(e) => {
        const node = e.target;
        const oldWidth = element.width;
        const oldHeight = element.height;

        const newWidth = node.width() * node.scaleX();
        const newHeight = node.height() * node.scaleY();

        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Update the frame
        onChange({
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        });

        node.scaleX(1);
        node.scaleY(1);

        // Resize the images inside the frame and keep them centered
        const imagesInFrame = elements.filter(
          (el: CanvasElement) => el.type === "image" && el.frameId === element.id
        );

        imagesInFrame.forEach((img) => {
          const relativeX = img.x - element.x; // Original relative position
          const relativeY = img.y - element.y;

          const newImgWidth = img.width * scaleX;
          const newImgHeight = img.height * scaleY;

          // Center the image in the new frame dimensions
          const newImgX = node.x() + (node.width() - newImgWidth) / 2;
          const newImgY = node.y() + (node.height() - newImgHeight) / 2;

          dispatch(
            updateElement({
              id: img.id,
              updates: {
                x: newImgX,
                y: newImgY,
                width: newImgWidth,
                height: newImgHeight,
              },
            })
          );
        });
      }}
    />
  );
}

case "image": {
  const [image] = useImage(element.src || "");
  const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
  const wasOverFrameRef = useRef(false); // Use useRef to persist state
  const [currentFitMode, setCurrentFitMode] = useState(element.fitMode || "fill"); // Default to 'fill'
  const isDraggingImageRef = useRef(false); // Flag to prevent recursive updates

  // Function to apply fitMode to the image (used when changing fitMode)
  const applyFitMode = (newFitMode: string, targetFrame: CanvasElement) => {
    const frameAspect = targetFrame.width / targetFrame.height;
    const imgAspect = element.width / element.height;

    let newWidth, newHeight, offsetX, offsetY;

    switch (newFitMode) {
      case "fit":
        if (imgAspect > frameAspect) {
          newWidth = targetFrame.width;
          newHeight = targetFrame.width / imgAspect;
        } else {
          newHeight = targetFrame.height;
          newWidth = targetFrame.height * imgAspect;
        }
        break;

      case "fill":
        if (imgAspect < frameAspect) {
          newWidth = targetFrame.width;
          newHeight = targetFrame.width / imgAspect;
        } else {
          newHeight = targetFrame.height;
          newWidth = targetFrame.height * imgAspect;
        }
        break;

      case "stretch":
        newWidth = targetFrame.width;
        newHeight = targetFrame.height;
        break;

      default:
        if (imgAspect < frameAspect) {
          newWidth = targetFrame.width;
          newHeight = targetFrame.width / imgAspect;
        } else {
          newHeight = targetFrame.height;
          newWidth = targetFrame.height * imgAspect;
        }
        break;
    }

    offsetX = (targetFrame.width - newWidth) / 2;
    offsetY = (targetFrame.height - newHeight) / 2;

    onChange({
      x: targetFrame.x + offsetX,
      y: targetFrame.y + offsetY,
      width: newWidth,
      height: newHeight,
      frameId: targetFrame.id,
      fitMode: newFitMode,
    });
  };

  if (frame) {
    return (
      <>
        <Group
          x={frame.x}
          y={frame.y}
          clipFunc={(ctx) => {
            ctx.rect(0, 0, frame.width, frame.height);
          }}
        >
          <KonvaImage
            ref={ref}
            image={image}
            x={element.x - frame.x} // Relative to frame
            y={element.y - frame.y} // Relative to frame
            width={element.width}
            height={element.height}
            draggable
            onClick={() => {
              onSelect(); // Select the image to show fitMode options
            }}
            onDragStart={() => {
              isDraggingImageRef.current = true; // Set flag when drag starts
            }}
            onDragMove={(e) => {
              if (!isDraggingImageRef.current) return; // Prevent recursive updates

              const imageNode = e.target;
              const newX = imageNode.x(); // Relative to frame
              const newY = imageNode.y(); // Relative to frame

              // Calculate new absolute image position
              const newImageX = newX + frame.x;
              const newImageY = newY + frame.y;

              // Calculate the offset of the image center relative to the frame center
              const frameCenterX = frame.x + frame.width / 2;
              const frameCenterY = frame.y + frame.height / 2;
              const imageCenterX = newImageX + element.width / 2;
              const imageCenterY = newImageY + element.height / 2;
              const offsetX = imageCenterX - frameCenterX;
              const offsetY = imageCenterY - frameCenterY;

              // Update frame position to keep it centered with the image
              const newFrameX = imageCenterX - frame.width / 2;
              const newFrameY = imageCenterY - frame.height / 2;

              // Update frame position
              dispatch(
                updateElement({
                  id: frame.id,
                  updates: {
                    x: newFrameX,
                    y: newFrameY,
                  },
                })
              );

              // Update image position
              onChange({
                x: newImageX,
                y: newImageY,
                width: element.width,
                height: element.height,
              });
            }}
            onDragEnd={() => {
              isDraggingImageRef.current = false; // Reset flag when drag ends
            }}
            onTransform={(e) => {
              const node = e.target;
              const oldWidth = element.width;
              const oldHeight = element.height;
              const newWidth = node.width() * node.scaleX();
              const newHeight = node.height() * node.scaleY();
              const newX = node.x(); // Relative to frame
              const newY = node.y(); // Relative to frame

              // Calculate scaling factors
              const scaleX = newWidth / oldWidth;
              const scaleY = newHeight / oldHeight;

              // Calculate new absolute image position
              const newImageX = newX + frame.x;
              const newImageY = newY + frame.y;

              // Update image
              onChange({
                x: newImageX,
                y: newImageY,
                width: newWidth,
                height: newHeight,
                rotation: node.rotation(),
              });

              // Reset scale to avoid compounding
              node.scaleX(1);
              node.scaleY(1);

              // Update frame size to match image resize
              const newFrameWidth = frame.width * scaleX;
              const newFrameHeight = frame.height * scaleY;

              // Center the frame around the image
              const imageCenterX = newImageX + newWidth / 2;
              const imageCenterY = newImageY + newHeight / 2;
              const newFrameX = imageCenterX - newFrameWidth / 2;
              const newFrameY = imageCenterY - newFrameHeight / 2;

              dispatch(
                updateElement({
                  id: frame.id,
                  updates: {
                    x: newFrameX,
                    y: newFrameY,
                    width: newFrameWidth,
                    height: newFrameHeight,
                    rotation: node.rotation(),
                  },
                })
              );
            }}
          />
        </Group>
        {/* UI for changing fitMode when image is selected */}
        {element.isSelected && (
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
            <select
              value={currentFitMode}
              onChange={(e) => {
                setCurrentFitMode(e.target.value);
                if (frame) {
                  applyFitMode(e.target.value, frame); // Apply new fitMode
                }
              }}
            >
              <option value="fit">Fit</option>
              <option value="fill">Fill</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>
        )}
      </>
    );
  }

  // Image without a frame (unchanged)
  return (
    <>
      <KonvaImage
        ref={ref}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        draggable
        onClick={() => {
          onSelect(); // Select the image
        }}
        onDragMove={(e) => {
          const imageNode = e.target;
          const imgX = imageNode.x();
          const imgY = imageNode.y();
          const imgW = imageNode.width();
          const imgH = imageNode.height();

          const centerX = imgX + imgW / 2;
          const centerY = imgY + imgH / 2;

          dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

          const frames = elements
            .filter(
              (el: CanvasElement) =>
                el.type === "frame" &&
                centerX >= el.x &&
                centerX <= el.x + el.width &&
                centerY >= el.y &&
                centerY <= el.y + el.height
            )
            .sort((a, b) => elements.indexOf(b) - elements.indexOf(a));

          const frame = frames[0];

          if (!frame) {
            wasOverFrameRef.current = false;
            return;
          }

          const isAlreadyHasImage = elements.some(
            (el: CanvasElement) =>
              el.type === "image" &&
              el.frameId === frame.id &&
              el.id !== element.id
          );

          if (isAlreadyHasImage) {
            return;
          }

          if (!wasOverFrameRef.current) {
            const frameAspect = frame.width / frame.height;
            const imgAspect = imgW / imgH;

            let newWidth, newHeight, offsetX, offsetY;

            switch (currentFitMode) {
              case "fit":
                if (imgAspect > frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;

              case "fill":
                if (imgAspect < frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;

              case "stretch":
                newWidth = frame.width;
                newHeight = frame.height;
                break;

              default:
                if (imgAspect < frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;
            }

            offsetX = (frame.width - newWidth) / 2;
            offsetY = (frame.height - newHeight) / 2;

            onChange({
              x: frame.x + offsetX,
              y: frame.y + offsetY,
              width: newWidth,
              height: newHeight,
              frameId: frame.id,
              fitMode: currentFitMode,
            });

            wasOverFrameRef.current = true;
          }
        }}
        onDragEnd={(e) => {
          const img = e.target;
          const imgW = img.width();
          const imgH = img.height();

          const centerX = img.x() + imgW / 2;
          const centerY = img.y() + imgH / 2;

          const frames = elements
            .filter(
              (el: CanvasElement) =>
                el.type === "frame" &&
                centerX >= el.x &&
                centerX <= el.x + el.width &&
                centerY >= el.y &&
                centerY <= el.y + el.height
            )
            .sort((a, b) => elements.indexOf(b) - elements.indexOf(a));

          const frame = frames[0];

          if (frame) {
            const isAlreadyHasImage = elements.some(
              (el: CanvasElement) =>
                el.type === "image" &&
                el.frameId === frame.id &&
                el.id !== element.id
            );

            if (isAlreadyHasImage) {
              onChange({ x: img.x(), y: img.y(), frameId: null });
              wasOverFrameRef.current = false;
              return;
            }

            const frameAspect = frame.width / frame.height;
            const imgAspect = imgW / imgH;

            let newWidth, newHeight, offsetX, offsetY;

            switch (currentFitMode) {
              case "fit":
                if (imgAspect > frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;

              case "fill":
                if (imgAspect < frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;

              case "stretch":
                newWidth = frame.width;
                newHeight = frame.height;
                break;

              default:
                if (imgAspect < frameAspect) {
                  newWidth = frame.width;
                  newHeight = frame.width / imgAspect;
                } else {
                  newHeight = frame.height;
                  newWidth = frame.height * imgAspect;
                }
                break;
            }

            offsetX = (frame.width - newWidth) / 2;
            offsetY = (frame.height - newHeight) / 2;

            onChange({
              x: frame.x + offsetX,
              y: frame.y + offsetY,
              width: newWidth,
              height: newHeight,
              frameId: frame.id,
              fitMode: currentFitMode,
            });
          } else {
            onChange({ x: img.x(), y: img.y(), frameId: null });
          }

          wasOverFrameRef.current = false;
        }}
        onTransform={(e) => {
          const node = e.target;
          const newWidth = node.width() * node.scaleX();
          const newHeight = node.height() * node.scaleY();
          const newX = node.x();
          const newY = node.y();

          onChange({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          });

          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {element.isSelected && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
          <select
            value={currentFitMode}
            onChange={(e) => {
              setCurrentFitMode(e.target.value);
              if (frame) {
                applyFitMode(e.target.value, frame);
              }
            }}
          >
            <option value="fit">Fit</option>
            <option value="fill">Fill</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      )}
    </>
  );
}












//       case "image": {
//   const [image] = useImage(element.src || "");
//   const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
//   const wasOverFrameRef = useRef(false); // Use useRef to persist state
//   const [currentFitMode, setCurrentFitMode] = useState(element.fitMode || "fill"); // Default to 'fill'

//   // Function to apply fitMode to the image (used when changing fitMode)
//   const applyFitMode = (newFitMode: string, targetFrame: CanvasElement) => {
//     const frameAspect = targetFrame.width / targetFrame.height;
//     const imgAspect = element.width / element.height;

//     let newWidth, newHeight, offsetX, offsetY;

//     switch (newFitMode) {
//       case "fit":
//         if (imgAspect > frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;

//       case "fill":
//         if (imgAspect < frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;

//       case "stretch":
//         newWidth = targetFrame.width;
//         newHeight = targetFrame.height;
//         break;

//       default:
//         // Fallback to fill
//         if (imgAspect < frameAspect) {
//           newWidth = targetFrame.width;
//           newHeight = targetFrame.width / imgAspect;
//         } else {
//           newHeight = targetFrame.height;
//           newWidth = targetFrame.height * imgAspect;
//         }
//         break;
//     }

//     offsetX = (targetFrame.width - newWidth) / 2;
//     offsetY = (targetFrame.height - newHeight) / 2;

//     onChange({
//       x: targetFrame.x + offsetX,
//       y: targetFrame.y + offsetY,
//       width: newWidth,
//       height: newHeight,
//       frameId: targetFrame.id,
//       fitMode: newFitMode,
//     });
//   };

//   if (frame) {
//     return (
//       <>
//         <Group
//           x={frame.x}
//           y={frame.y}
//           clipFunc={(ctx) => {
//             ctx.rect(0, 0, frame.width, frame.height);
//           }}
//         >
//           <KonvaImage
//             ref={ref}
//             image={image}
//             x={element.x - frame.x} // Relative to frame
//             y={element.y - frame.y} // Relative to frame
//             width={element.width}
//             height={element.height}
//             draggable
//             onClick={() => {
//               onSelect(); // Select the image
//               // You can trigger UI to show fitMode options here
//             }}
//             onDragMove={(e) => {
//               const imageNode = e.target;
//               const newX = imageNode.x();
//               const newY = imageNode.y();

//               // Check if the image stays within frame bounds
//               const isInside =
//                 newX >= 0 &&
//                 newY >= 0 &&
//                 newX + element.width <= frame.width &&
//                 newY + element.height <= frame.height;

//               if (!isInside) {
//                 // Reset to previous position if dragged outside frame
//                 imageNode.x(element.x - frame.x);
//                 imageNode.y(element.y - frame.y);
//                 return;
//               }

//               // Update image position in state (absolute coordinates)
//               onChange({
//                 x: newX + frame.x,
//                 y: newY + frame.y,
//                 width: element.width,
//                 height: element.height,
//               });
//             }}
//             onTransform={(e) => {
//               const node = e.target;
//               const newWidth = node.width() * node.scaleX();
//               const newHeight = node.height() * node.scaleY();
//               const newX = node.x();
//               const newY = node.y();

//               // Check if the image stays within frame bounds
//               const isInside =
//                 newX >= 0 &&
//                 newY >= 0 &&
//                 newX + newWidth <= frame.width &&
//                 newY + newHeight <= frame.height;

//               if (!isInside) {
//                 node.scaleX(1);
//                 node.scaleY(1);
//                 node.x(element.x - frame.x);
//                 node.y(element.y - frame.y);
//                 return;
//               }

//               onChange({
//                 x: newX + frame.x,
//                 y: newY + frame.y,
//                 width: newWidth,
//                 height: newHeight,
//                 rotation: node.rotation(),
//               });

//               node.scaleX(1);
//               node.scaleY(1);
//             }}
//           />
//         </Group>
//         {/* Example UI for changing fitMode after selecting the image */}
//         {element.isSelected && (
//           <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
//             <select
//               value={currentFitMode}
//               onChange={(e) => {
//                 setCurrentFitMode(e.target.value);
//                 if (frame) {
//                   applyFitMode(e.target.value, frame); // Apply new fitMode immediately
//                 }
//               }}
//             >
//               <option value="fit">Fit</option>
//               <option value="fill">Fill</option>
//               <option value="stretch">Stretch</option>
//             </select>
//           </div>
//         )}
//       </>
//     );
//   }

//   // Image without a frame
//   return (
//     <>
//       <KonvaImage
//         ref={ref}
//         image={image}
//         x={element.x}
//         y={element.y}
//         width={element.width}
//         height={element.height}
//         draggable
//         onClick={() => {
//           onSelect(); // Select the image
//           // You can trigger UI to show fitMode options here
//         }}
//         onDragMove={(e) => {
//           const imageNode = e.target;
//           const imgX = imageNode.x();
//           const imgY = imageNode.y();
//           const imgW = imageNode.width();
//           const imgH = imageNode.height();

//           const centerX = imgX + imgW / 2;
//           const centerY = imgY + imgH / 2;

//           dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

//           // Find all frames that the image center is over, and pick the topmost one
//           const frames = elements
//             .filter(
//               (el: CanvasElement) =>
//                 el.type === "frame" &&
//                 centerX >= el.x &&
//                 centerX <= el.x + el.width &&
//                 centerY >= el.y &&
//                 centerY <= el.y + el.height
//             )
//             .sort((a, b) => elements.indexOf(b) - elements.indexOf(a)); // Sort by index to get topmost frame

//           const frame = frames[0]; // Take the topmost frame

//           if (!frame) {
//             wasOverFrameRef.current = false;
//             return;
//           }

//           // Check if this specific frame already has another image
//           const isAlreadyHasImage = elements.some(
//             (el: CanvasElement) =>
//               el.type === "image" &&
//               el.frameId === frame.id &&
//               el.id !== element.id
//           );

//           if (isAlreadyHasImage) {
//             return; // Skip if the frame already has another image
//           }

//           if (!wasOverFrameRef.current) {
//             const frameAspect = frame.width / frame.height;
//             const imgAspect = imgW / imgH;

//             let newWidth, newHeight, offsetX, offsetY;

//             // Use currentFitMode for sizing
//             switch (currentFitMode) {
//               case "fit":
//                 if (imgAspect > frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "fill":
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "stretch":
//                 newWidth = frame.width;
//                 newHeight = frame.height;
//                 break;

//               default:
//                 // Fallback to fill
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;
//             }

//             offsetX = (frame.width - newWidth) / 2;
//             offsetY = (frame.height - newHeight) / 2;

//             onChange({
//               x: frame.x + offsetX,
//               y: frame.y + offsetY,
//               width: newWidth,
//               height: newHeight,
//               frameId: frame.id,
//               fitMode: currentFitMode, // Save the selected fitMode
//             });

//             wasOverFrameRef.current = true;
//           }
//         }}
//         onDragEnd={(e) => {
//           const img = e.target;
//           const imgW = img.width();
//           const imgH = img.height();

//           const centerX = img.x() + imgW / 2;
//           const centerY = img.y() + imgH / 2;

//           // Find all frames that the image center is over, and pick the topmost one
//           const frames = elements
//             .filter(
//               (el: CanvasElement) =>
//                 el.type === "frame" &&
//                 centerX >= el.x &&
//                 centerX <= el.x + el.width &&
//                 centerY >= el.y &&
//                 centerY <= el.y + el.height
//             )
//             .sort((a, b) => elements.indexOf(b) - elements.indexOf(a)); // Sort by index to get topmost frame

//           const frame = frames[0]; // Take the topmost frame

//           if (frame) {
//             // Check if this specific frame already has another image
//             const isAlreadyHasImage = elements.some(
//               (el: CanvasElement) =>
//                 el.type === "image" &&
//                 el.frameId === frame.id &&
//                 el.id !== element.id
//             );

//             if (isAlreadyHasImage) {
//               onChange({ x: img.x(), y: img.y(), frameId: null });
//               wasOverFrameRef.current = false;
//               return;
//             }

//             const frameAspect = frame.width / frame.height;
//             const imgAspect = imgW / imgH;

//             let newWidth, newHeight, offsetX, offsetY;

//             // Use currentFitMode for sizing
//             switch (currentFitMode) {
//               case "fit":
//                 if (imgAspect > frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "fill":
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;

//               case "stretch":
//                 newWidth = frame.width;
//                 newHeight = frame.height;
//                 break;

//               default:
//                 // Fallback to fill
//                 if (imgAspect < frameAspect) {
//                   newWidth = frame.width;
//                   newHeight = frame.width / imgAspect;
//                 } else {
//                   newHeight = frame.height;
//                   newWidth = frame.height * imgAspect;
//                 }
//                 break;
//             }

//             offsetX = (frame.width - newWidth) / 2;
//             offsetY = (frame.height - newHeight) / 2;

//             onChange({
//               x: frame.x + offsetX,
//               y: frame.y + offsetY,
//               width: newWidth,
//               height: newHeight,
//               frameId: frame.id,
//               fitMode: currentFitMode, // Save the selected fitMode
//             });
//           } else {
//             onChange({ x: img.x(), y: img.y(), frameId: null });
//           }

//           wasOverFrameRef.current = false;
//         }}
//         onTransform={(e) => {
//           const node = e.target;
//           const newWidth = node.width() * node.scaleX();
//           const newHeight = node.height() * node.scaleY();
//           const newX = node.x();
//           const newY = node.y();

//           onChange({
//             x: newX,
//             y: newY,
//             width: newWidth,
//             height: newHeight,
//             rotation: node.rotation(),
//           });

//           node.scaleX(1);
//           node.scaleY(1);
//         }}
//       />
//       {/* Example UI for changing fitMode after selecting the image */}
//       {element.isSelected && (
//         <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
//           <select
//             value={currentFitMode}
//             onChange={(e) => {
//               setCurrentFitMode(e.target.value);
//               if (frame) {
//                 applyFitMode(e.target.value, frame); // Apply new fitMode immediately
//               }
//             }}
//           >
//             <option value="fit">Fit</option>
//             <option value="fill">Fill</option>
//             <option value="stretch">Stretch</option>
//           </select>
//         </div>
//       )}
//     </>
//   );
// }

      // case "image": {
      //   const [image] = useImage(element.src || "");
      //   const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
      //   let wasOverFrame = false; // خليها خارج الكومبوننت أو في useRef لو هتعملها persistent

      //   if (frame) {
      //     return (
      //       <Group
      //         x={frame.x}
      //         y={frame.y}
      //         clipFunc={(ctx) => {
      //           ctx.rect(0, 0, frame.width, frame.height);
      //         }}>

      //         <KonvaImage
      //           ref={ref}
      //           image={image}
      //           x={element.x - frame.x} 
      //           y={element.y - frame.y}
      //           width={element.width}
      //           height={element.height}
      //           draggable
      //           onClick={onSelect}
      //           onDragMove={(e) => {
      //             const imageNode = e.target;
      //             const newX = imageNode.x();
      //             const newY = imageNode.y();

      //             onChange({ x: newX + frame.x, y: newY + frame.y });
      //           }}
      //           onTransform={(e) => {
      //             const node = e.target;
      //             const newWidth = node.width() * node.scaleX();
      //             const newHeight = node.height() * node.scaleY();
      //             const newX = node.x();
      //             const newY = node.y();

      //             onChange({
      //               x: newX + frame.x,
      //               y: newY + frame.y,
      //               width: newWidth,
      //               height: newHeight,
      //               rotation: node.rotation(),
      //             });

      //             node.scaleX(1);
      //             node.scaleY(1);
      //           }}
      //         />
      //       </Group>

      //     );
      //   }

      //   return (
      //   <KonvaImage
      //     ref={ref}
      //     image={image}
      //     x={element.x}
      //     y={element.y}
      //     width={element.width}
      //     height={element.height}
      //     draggable
      //     onClick={onSelect}
      //     onTransform={(e) => {
      //       const node = e.target;
      //       const newWidth = node.width() * node.scaleX();
      //       const newHeight = node.height() * node.scaleY();
      //       const newX = node.x();
      //       const newY = node.y();

      //       const frame = elements.find((f:CanvasElement) => f.id === element.frameId);
      //       if (frame) {
      //         const isInside =
      //           newX >= frame.x &&
      //           newY >= frame.y &&
      //           newX + newWidth <= frame.x + frame.width &&
      //           newY + newHeight <= frame.y + frame.height;

      //         if (!isInside) {
      //           node.scaleX(1);
      //           node.scaleY(1);
      //           node.x(element.x);
      //           node.y(element.y);
      //           return;
      //         }
      //       }

      //       onChange({
      //         x: newX,
      //         y: newY,
      //         width: newWidth,
      //         height: newHeight,
      //         rotation: node.rotation(),
      //       });

      //       node.scaleX(1);
      //       node.scaleY(1);
      //     }}

      //     onDragMove={(e) => {

      //     const imageNode = e.target;
      //     const imgX = imageNode.x();
      //     const imgY = imageNode.y();
      //     const imgW = imageNode.width();
      //     const imgH = imageNode.height();

      //     const centerX = imgX + imgW / 2;
      //     const centerY = imgY + imgH / 2;
      //     dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

      //     const frame = elements.find(
      //       (el: CanvasElement) =>
      //         el.type === "frame" &&
      //         centerX >= el.x &&
      //         centerX <= el.x + el.width &&
      //         centerY >= el.y &&
      //         centerY <= el.y + el.height
      //     );

      //     const isAlreadyHasImage = elements.some(
      //         (el: CanvasElement) =>
      //           el.type === "image" &&
      //           el.frameId === frame.id &&
      //           el.id !== element.id 
      //       );

      //       if (isAlreadyHasImage) {
      //         return;
      //       }

      //     if (!frame) {
      //       wasOverFrame = false;
      //       return;
      //     }

      //     if (!wasOverFrame) {
      //       const frameAspect = frame.width / frame.height;
      //       const imgAspect = imgW / imgH;

      //       let newWidth, newHeight, offsetX, offsetY;

      //       switch (element.fitMode) {
      //         case "fit":
      //           if (imgAspect > frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "fill":
      //         default:
      //           if (imgAspect < frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "stretch":
      //           newWidth = frame.width;
      //           newHeight = frame.height;
      //           break;
      //       }

      //       offsetX = (frame.width - newWidth) / 2;
      //       offsetY = (frame.height - newHeight) / 2;

      //       onChange({
      //         x: frame.x + offsetX,
      //         y: frame.y + offsetY,
      //         width: newWidth,
      //         height: newHeight,
      //         frameId: frame.id,
      //       });

      //       wasOverFrame = true;
      //     }
      //   }}

      //   onDragEnd={(e) => {
      //     const img = e.target;
      //     const imgW = img.width();
      //     const imgH = img.height();

      //     const centerX = img.x() + imgW / 2;
      //     const centerY = img.y() + imgH / 2;

      //     const frame = elements.find(
      //       (el: CanvasElement) =>
      //         el.type === "frame" &&
      //         centerX >= el.x &&
      //         centerX <= el.x + el.width &&
      //         centerY >= el.y &&
      //         centerY <= el.y + el.height
      //     );

      //     if (frame) {
      //       const frameAspect = frame.width / frame.height;
      //       const imgAspect = imgW / imgH;
      //       const isAlreadyHasImage = elements.some(
      //         (el: CanvasElement) =>
      //           el.type === "image" &&
      //           el.frameId === frame.id &&
      //           el.id !== element.id // عشان تسمح لنفس الصورة تتحرك جوه الفريم
      //       );

      //       if (isAlreadyHasImage) {
      //         // الفريم فيه صورة تانية خلاص، متعملش fit تاني
      //         return;
      //       }

      //       let newWidth, newHeight, offsetX, offsetY;

      //       switch (element.fitMode) {
      //         case "fit":
      //           if (imgAspect > frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "fill":
      //         default:
      //           if (imgAspect < frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "stretch":
      //           newWidth = frame.width;
      //           newHeight = frame.height;
      //           break;
      //       }

      //       offsetX = (frame.width - newWidth) / 2;
      //       offsetY = (frame.height - newHeight) / 2;

      //       onChange({
      //         x: frame.x + offsetX,
      //         y: frame.y + offsetY,
      //         width: newWidth,
      //         height: newHeight,
      //         frameId: frame.id,
      //       });
      //     } else {
      //       onChange({ x: img.x(), y: img.y(), frameId: null });
      //     }

      //     setIsOverFrame(false);
      //     wasOverFrame = false;
      //   }}


      // />
      //   );
      // }

      // case "image": {
      //   const [image] = useImage(element.src || "");
      //   const frame = elements.find((f: CanvasElement) => f.id === element.frameId);
      //   let wasOverFrame = false; // خليها خارج الكومبوننت أو في useRef لو هتعملها persistent

      //   if (frame) {
      //     return (
      //       <Group
      //         x={frame.x}
      //         y={frame.y}
      //         clipFunc={(ctx) => {
      //           ctx.rect(0, 0, frame.width, frame.height);
      //         }}>

      //         <KonvaImage
      //           ref={ref}
      //           image={image}
      //           x={element.x - frame.x} 
      //           y={element.y - frame.y}
      //           width={element.width}
      //           height={element.height}
      //           draggable
      //           onClick={onSelect}
      //           onDragMove={(e) => {
      //             const imageNode = e.target;
      //             const newX = imageNode.x();
      //             const newY = imageNode.y();

      //             onChange({ x: newX + frame.x, y: newY + frame.y });
      //           }}
      //           onTransform={(e) => {
      //             const node = e.target;
      //             const newWidth = node.width() * node.scaleX();
      //             const newHeight = node.height() * node.scaleY();
      //             const newX = node.x();
      //             const newY = node.y();

      //             onChange({
      //               x: newX + frame.x,
      //               y: newY + frame.y,
      //               width: newWidth,
      //               height: newHeight,
      //               rotation: node.rotation(),
      //             });

      //             node.scaleX(1);
      //             node.scaleY(1);
      //           }}
      //         />
      //       </Group>

      //     );
      //   }

      //   return (
      //   <KonvaImage
      //     ref={ref}
      //     image={image}
      //     x={element.x}
      //     y={element.y}
      //     width={element.width}
      //     height={element.height}
      //     draggable
      //     onClick={onSelect}
      //     onTransform={(e) => {
      //       const node = e.target;
      //       const newWidth = node.width() * node.scaleX();
      //       const newHeight = node.height() * node.scaleY();
      //       const newX = node.x();
      //       const newY = node.y();

      //       const frame = elements.find((f:CanvasElement) => f.id === element.frameId);
      //       if (frame) {
      //         const isInside =
      //           newX >= frame.x &&
      //           newY >= frame.y &&
      //           newX + newWidth <= frame.x + frame.width &&
      //           newY + newHeight <= frame.y + frame.height;

      //         if (!isInside) {
      //           node.scaleX(1);
      //           node.scaleY(1);
      //           node.x(element.x);
      //           node.y(element.y);
      //           return;
      //         }
      //       }

      //       onChange({
      //         x: newX,
      //         y: newY,
      //         width: newWidth,
      //         height: newHeight,
      //         rotation: node.rotation(),
      //       });

      //       node.scaleX(1);
      //       node.scaleY(1);
      //     }}

      //     onDragMove={(e) => {

      //     const imageNode = e.target;
      //     const imgX = imageNode.x();
      //     const imgY = imageNode.y();
      //     const imgW = imageNode.width();
      //     const imgH = imageNode.height();

      //     const centerX = imgX + imgW / 2;
      //     const centerY = imgY + imgH / 2;
      //     dispatch(updateElement({ id: element.id, updates: { x: imgX, y: imgY } }));

      //     const frame = elements.find(
      //       (el: CanvasElement) =>
      //         el.type === "frame" &&
      //         centerX >= el.x &&
      //         centerX <= el.x + el.width &&
      //         centerY >= el.y &&
      //         centerY <= el.y + el.height
      //     );

      //     if (!frame) {
      //       wasOverFrame = false;
      //       return;
      //     }

      //     if (!wasOverFrame) {
      //       const frameAspect = frame.width / frame.height;
      //       const imgAspect = imgW / imgH;

      //       let newWidth, newHeight, offsetX, offsetY;

      //       switch (element.fitMode) {
      //         case "fit":
      //           if (imgAspect > frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "fill":
      //         default:
      //           if (imgAspect < frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "stretch":
      //           newWidth = frame.width;
      //           newHeight = frame.height;
      //           break;
      //       }

      //       offsetX = (frame.width - newWidth) / 2;
      //       offsetY = (frame.height - newHeight) / 2;

      //       onChange({
      //         x: frame.x + offsetX,
      //         y: frame.y + offsetY,
      //         width: newWidth,
      //         height: newHeight,
      //         frameId: frame.id,
      //       });

      //       wasOverFrame = true;
      //     }
      //   }}

      //   onDragEnd={(e) => {
      //     const img = e.target;
      //     const imgW = img.width();
      //     const imgH = img.height();

      //     const centerX = img.x() + imgW / 2;
      //     const centerY = img.y() + imgH / 2;

      //     const frame = elements.find(
      //       (el: CanvasElement) =>
      //         el.type === "frame" &&
      //         centerX >= el.x &&
      //         centerX <= el.x + el.width &&
      //         centerY >= el.y &&
      //         centerY <= el.y + el.height
      //     );

      //     if (frame) {
      //       const frameAspect = frame.width / frame.height;
      //       const imgAspect = imgW / imgH;

      //       let newWidth, newHeight, offsetX, offsetY;

      //       switch (element.fitMode) {
      //         case "fit":
      //           if (imgAspect > frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "fill":
      //         default:
      //           if (imgAspect < frameAspect) {
      //             newWidth = frame.width;
      //             newHeight = frame.width / imgAspect;
      //           } else {
      //             newHeight = frame.height;
      //             newWidth = frame.height * imgAspect;
      //           }
      //           break;

      //         case "stretch":
      //           newWidth = frame.width;
      //           newHeight = frame.height;
      //           break;
      //       }

      //       offsetX = (frame.width - newWidth) / 2;
      //       offsetY = (frame.height - newHeight) / 2;

      //       onChange({
      //         x: frame.x + offsetX,
      //         y: frame.y + offsetY,
      //         width: newWidth,
      //         height: newHeight,
      //         frameId: frame.id,
      //       });
      //     } else {
      //       onChange({ x: img.x(), y: img.y(), frameId: null });
      //     }

      //     setIsOverFrame(false);
      //     wasOverFrame = false;
      //   }}


      // />
      //   );
      // }

      case "icon": {
        const IconComponent = MdIcons[element.iconName as keyof typeof MdIcons];
        console.log(IconComponent);
        
        return (
          <Html
            groupProps={{
              x: element.x,
              y: element.y,
              draggable: true,
              onDragMove: (e) => {
                const node = e.target;
                const newX = node.x();
                const newY = node.y();
                dispatch(updateElement({ id: element.id, updates: { x: newX, y: newY } }));
              },
              onClick: onSelect,
            }}
          >
            <div
              style={{
                width: element.width,
                height: element.height,
                fontSize: element.width,
                color: element.color || 'black',
                border: "2px solid #000",
                cursor: 'move',
              }}
            >
              <Icon icon="mdi:home" width={50} height={50} color="#000000" />
              {/* {IconComponent ? <IconComponent color={element.color || "black"} /> : null} */}
            </div>
          </Html>
        );
      }

      case "rectangle":
        const rectangleElement = element as RectangleShape;
        // Convert borderRadius object to cornerRadius array if it exists
        let cornerRadiusValue = rectangleElement.cornerRadius;
        if (rectangleElement.borderRadius) {
          const br = rectangleElement.borderRadius;
          cornerRadiusValue = [
            br.topLeft || 0,
            br.topRight || 0,
            br.bottomRight || 0,
            br.bottomLeft || 0,
          ];
        }
        return (
          <Rect
            ref={ref}
            x={rectangleElement.x}
            y={rectangleElement.y}
            width={rectangleElement.width}
            height={rectangleElement.height}
            fill={rectangleElement.fill}
            stroke={rectangleElement.stroke}
            strokeWidth={rectangleElement.strokeWidth}
            rotation={rectangleElement.rotation}
            cornerRadius={cornerRadiusValue}
            opacity={rectangleElement.opacity}
            draggable
            offsetX={rectangleElement.width / 2}
            offsetY={rectangleElement.height / 2}
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => {
              const node = e.target;
              const newWidth = node.width() * node.scaleX();
              const newHeight = node.height() * node.scaleY();
              console.log(e.target);

              onChange({
                x: node.x(),
                y: node.y(),
                width: newWidth,
                height: newHeight,
                rotation: node.rotation(),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "circle":
        const circleElement = element as CircleShape;
        return (
          <Circle
            ref={ref}
            x={circleElement.x}
            y={circleElement.y}
            radius={circleElement.radius}
            fill={circleElement.fill}
            stroke={circleElement.stroke}
            strokeWidth={circleElement.strokeWidth}
            rotation={circleElement.rotation}
            opacity={circleElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => {
              onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // ناخد متوسط مقياس X و Y علشان نعدل radius
              const newRadius = (circleElement.radius * (scaleX + scaleY)) / 2;

              onChange({
                x: node.x(),
                y: node.y(),
                radius: newRadius,
                rotation: node.rotation(),
              });

              // نرجع الـ scale علشان منكررهاش
              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "ellipse":
        const ellipseElement = element as EllipseShape;
        return (
          <Ellipse
            ref={ref}
            x={ellipseElement.x}
            y={ellipseElement.y}
            radiusX={ellipseElement.radiusX}
            radiusY={ellipseElement.radiusY}
            fill={ellipseElement.fill}
            stroke={ellipseElement.stroke}
            strokeWidth={ellipseElement.strokeWidth}
            rotation={ellipseElement.rotation}
            opacity={ellipseElement.opacity}
            draggable
            onClick={onSelect}
             onDragMove={(e) => {
              onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransform={(e) => {
              const node = e.target;

              const newRadiusX = ellipseElement.radiusX * node.scaleX();
              const newRadiusY = ellipseElement.radiusY * node.scaleY();

              onChange({
                x: node.x(),
                y: node.y(),
                radiusX: newRadiusX,
                radiusY: newRadiusY,
                rotation: node.rotation(),
              });

              // Reset scale to 1 to avoid compounding transforms
              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "line":
        const lineElement = element as LineShape;

        // حساب منتصف الخط (لو خط بسيط بنقطتين فقط)
        const [x1, y1, x2, y2] = lineElement.points;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        // نعدل الـ points علشان نرسم الخط حوالين (0, 0)، ونستخدم offset
        const adjustedPoints = [
          x1 - centerX,
          y1 - centerY,
          x2 - centerX,
          y2 - centerY,
        ];

        return (
          <Line
            ref={ref}
            x={lineElement.x + centerX}
            y={lineElement.y + centerY}
            points={adjustedPoints}
            fill={lineElement.fill}
            stroke={lineElement.stroke}
            strokeWidth={lineElement.strokeWidth}
            rotation={lineElement.rotation}
            opacity={lineElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) =>
              onChange({ x: e.target.x() - centerX, y: e.target.y() - centerY })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              const newPoints = adjustedPoints.map((point, index) =>
                index % 2 === 0 ? point * scaleX : point * scaleY
              );

              onChange({
                x: node.x() - centerX,
                y: node.y() - centerY,
                rotation: node.rotation(),
                points: newPoints.map((p, i) =>
                  i % 2 === 0 ? p + centerX : p + centerY
                ),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "triangle":
        const triangleElement = element as TriangleShape;
        return (
          <RegularPolygon
            ref={ref}
            x={triangleElement.x}
            y={triangleElement.y}
            sides={3}
            radius={Math.max(triangleElement.width, triangleElement.height) / 2}
            fill={triangleElement.fill}
            stroke={triangleElement.stroke}
            strokeWidth={triangleElement.strokeWidth}
            rotation={triangleElement.rotation}
            opacity={triangleElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // نحسب نصف القطر الجديد من التحجيم
              const newRadius =
                (Math.max(triangleElement.width, triangleElement.height) / 2) *
                Math.max(scaleX, scaleY);

              onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                width: newRadius * 2,
                height: newRadius * 2,
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "star":
        const starElement = element as StarShape;
        return (
          <Star
            ref={ref}
            x={starElement.x}
            y={starElement.y}
            innerRadius={starElement.innerRadius}
            outerRadius={starElement.outerRadius}
            numPoints={starElement.numPoints}
            fill={starElement.fill}
            stroke={starElement.stroke}
            strokeWidth={starElement.strokeWidth}
            rotation={starElement.rotation}
            opacity={starElement.opacity}
            draggable
            onClick={onSelect}
             onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onDragMove={(e) =>
              onChange({
                x: e.target.x(),
                y: e.target.y(),
              })
            }
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              // نحسب الأنصاف الجديدة بعد التحجيم
              const newInnerRadius =
                starElement.innerRadius * Math.min(scaleX, scaleY);
              const newOuterRadius =
                starElement.outerRadius * Math.max(scaleX, scaleY);

              onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                innerRadius: newInnerRadius,
                outerRadius: newOuterRadius,
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      case "wedge":
        const wedgeElement = element as WedgeShape;
        return (
          <Wedge
            ref={ref}
            x={wedgeElement.x}
            y={wedgeElement.y}
            radius={wedgeElement.radius}
            angle={wedgeElement.angle}
            fill={wedgeElement.fill}
            stroke={wedgeElement.stroke}
            strokeWidth={wedgeElement.strokeWidth}
            rotation={wedgeElement.rotation}
            opacity={wedgeElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const scale = (scaleX + scaleY) / 2; // Average scale for uniform scaling

              onChange({
                x: node.x(),
                y: node.y(),
                radius: wedgeElement.radius * scale,
                rotation: node.rotation(),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );
      case "ring":
        const ringElement = element as RingShape;
        return (
          <Ring
            ref={ref}
            x={ringElement.x}
            y={ringElement.y}
            innerRadius={ringElement.innerRadius}
            outerRadius={ringElement.outerRadius}
            fill={ringElement.fill}
            stroke={ringElement.stroke}
            strokeWidth={ringElement.strokeWidth}
            rotation={ringElement.rotation}
            opacity={ringElement.opacity}
            draggable
            onClick={onSelect}
            onDragMove={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransform={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const scale = (scaleX + scaleY) / 2; // Average scale for uniform scaling

              onChange({
                x: node.x(),
                y: node.y(),
                innerRadius: ringElement.innerRadius * scale,
                outerRadius: ringElement.outerRadius * scale,
                rotation: node.rotation(),
              });

              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        );

      /* qr code */
      // case "qrcode": {
      //   const qrElement = element as QRCodeElement;
      //   const [qrError, setQrError] = useState<string | null>(null);

      //   // Validate QR code data
      //   const isValidQRData = qrElement.value && qrElement.value.trim() !== "";

      //   if (!isValidQRData) {
      //     return (
      //       <Html
      //         groupProps={{
      //           x: qrElement.x,
      //           y: qrElement.y,
      //           draggable: true,
      //           onClick: onSelect,
      //         }}
      //       >
      //         <div
      //           style={{
      //             width: qrElement.width,
      //             height: qrElement.height,
      //             cursor: "move",
      //             display: "flex",
      //             alignItems: "center",
      //             justifyContent: "center",
      //             border: "2px dashed #ccc",
      //             backgroundColor: "#f5f5f5",
      //             color: "#666",
      //             fontSize: "12px",
      //             textAlign: "center",
      //           }}
      //         >
      //           Invalid QR Data
      //         </div>
      //       </Html>
      //     );
      //   }

      default:
        return null;
    }
});
