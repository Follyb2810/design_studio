import React from "react";
import type { Page, CanvasElement } from "@/types";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Group,
  Circle,
  Line as KonvaLine,
  Path,
} from "react-konva";

interface CanvasStageProps {
  stageRef: React.RefObject<any>;
  page: Page;
  onSelect: (id: string, panelId?: string) => void;
  onUpdatePos: (id: string, x: number, y: number, panelId?: string) => void;
  clearSelection: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  stageRef,
  page,
  onSelect,
  onUpdatePos,
  clearSelection,
}) => {
  const renderElement = (el: CanvasElement, panelId?: string) => {
    const common = {
      key: el.id,
      x: el.x,
      y: el.y,
      rotation: el.rotation,
      scaleX: el.scaleX,
      scaleY: el.scaleY,
      opacity: el.opacity,
      visible: el.visible ?? true,
      draggable: !el.locked,
      onClick: () => onSelect(el.id, panelId),
      onTap: () => onSelect(el.id, panelId),
      onDragEnd: (e: any) =>
        onUpdatePos(el.id, e.target.x(), e.target.y(), panelId),
    };

    switch (el.type) {
      case "rect":
        return (
          <Rect
            {...common}
            width={el.width}
            height={el.height}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            cornerRadius={el.cornerRadius}
          />
        );
      case "ellipse":
        return (
          <Circle
            {...common}
            radiusX={el.radiusX}
            radiusY={el.radiusY}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
        );
      case "line":
        return (
          <KonvaLine
            {...common}
            points={el.points}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
        );
      case "text":
        return (
          <Text
            {...common}
            text={el.text}
            fontSize={el.fontSize}
            fill={el.fill}
            fontFamily={el.fontFamily}
            fontStyle={el.fontStyle}
            textDecoration={el.textDecoration}
            align={el.align}
            letterSpacing={el.letterSpacing}
            lineHeight={el.lineHeight}
          />
        );
      case "image":
        return (
          <KonvaImage
            {...common}
            image={el.image}
            width={el.width}
            height={el.height}
          />
        );
      case "bubble":
        const tailPath = () => {
          const tailSize = el.tailSize ?? 20;
          switch (el.tailDirection) {
            case "left":
              return `M0,${el.height / 2} L-${tailSize},${el.height / 2 - tailSize / 2} L-${tailSize},${el.height / 2 + tailSize / 2} Z`;
            // Add for other directions...
            default:
              return "";
          }
        };
        return (
          <Group {...common}>
            <Rect
              x={0}
              y={0}
              width={el.width}
              height={el.height}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              cornerRadius={el.cornerRadius}
            />
            {el.tailDirection !== "none" && (
              <Path
                data={tailPath()}
                fill={el.fill}
                stroke={el.stroke}
                strokeWidth={el.strokeWidth}
              />
            )}
            <Text
              x={10}
              y={10}
              text={el.text}
              fontSize={el.fontSize}
              width={el.width - 20}
              wrap="word"
            />
          </Group>
        );
      case "sfx":
        return (
          <Text
            {...common}
            text={el.text}
            fontSize={el.fontSize}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fontFamily={el.fontFamily}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-2">
      <Stage
        ref={stageRef}
        width={900}
        height={600}
        onMouseDown={(e) =>
          e.target === e.target.getStage() && clearSelection()
        }
      >
        <Layer>
          {/* Render loose elements */}
          {page.elements.map((el) => renderElement(el))}

          {/* Render panels and their nested elements */}
          {page.panels.map((panel) => (
            <Group
              key={panel.id}
              x={panel.x}
              y={panel.y}
              draggable={!panel.locked}
              onClick={() => onSelect(panel.id)}
              onTap={() => onSelect(panel.id)}
              onDragEnd={(e: any) =>
                onUpdatePos(panel.id, e.target.x(), e.target.y())
              }
            >
              <Rect
                width={panel.width}
                height={panel.height}
                fill={panel.backgroundColor}
                stroke={panel.borderColor}
                strokeWidth={panel.borderWidth}
                cornerRadius={4}
              />
              {panel.backgroundImage && (
                <KonvaImage
                  image={panel.backgroundImage}
                  width={panel.width}
                  height={panel.height}
                />
              )}
              {panel.elements.map((el) => renderElement(el, panel.id))}
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

// import React from "react";
// import type { CanvasElement } from "@/types";
// import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";

// interface CanvasStageProps {
//   stageRef: React.RefObject<any>;
//   elements: CanvasElement[];
//   onSelect: (id: string) => void;
//   onUpdatePos: (id: string, x: number, y: number) => void;
//   clearSelection: () => void;
// }

// export const CanvasStage: React.FC<CanvasStageProps> = ({
//   stageRef,
//   elements,
//   onSelect,
//   onUpdatePos,
//   clearSelection,
// }) => (
//   <div className="bg-white rounded-2xl shadow-xl p-2">
//     <Stage
//       ref={stageRef}
//       width={900}
//       height={600}
//       onMouseDown={(e) => e.target === e.target.getStage() && clearSelection()}
//     >
//       <Layer>
//         {elements.map((el) => {
//           const common = {
//             key: el.id,
//             x: el.x,
//             y: el.y,
//             draggable: true,
//             onClick: () => onSelect(el.id),
//             onTap: () => onSelect(el.id),
//             onDragEnd: (e: any) =>
//               onUpdatePos(el.id, e.target.x(), e.target.y()),
//           };

//           if (el.type === "rect") {
//             return (
//               <Rect
//                 {...common}
//                 width={(el as any).width}
//                 height={(el as any).height}
//                 fill={(el as any).fill}
//               />
//             );
//           }

//           if (el.type === "text") {
//             const t = el as any;
//             return (
//               <Text
//                 {...common}
//                 text={t.text}
//                 fontSize={t.fontSize}
//                 fill={t.fill}
//                 fontFamily={t.fontFamily}
//                 fontStyle={t.fontStyle}
//                 align={t.align}
//               />
//             );
//           }

//           if (el.type === "image") {
//             const img = el as any;
//             return (
//               <KonvaImage
//                 {...common}
//                 image={img.image}
//                 width={img.width}
//                 height={img.height}
//               />
//             );
//           }
//           return null;
//         })}
//       </Layer>
//     </Stage>
//   </div>
// );
