import React from "react";
import type { CanvasElement } from "@/types";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";

interface CanvasStageProps {
  stageRef: React.RefObject<any>;
  elements: CanvasElement[];
  onSelect: (id: string) => void;
  onUpdatePos: (id: string, x: number, y: number) => void;
  clearSelection: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  stageRef,
  elements,
  onSelect,
  onUpdatePos,
  clearSelection,
}) => (
  <div className="bg-white rounded-2xl shadow-xl p-2">
    <Stage
      ref={stageRef}
      width={900}
      height={600}
      onMouseDown={(e) => e.target === e.target.getStage() && clearSelection()}
    >
      <Layer>
        {elements.map((el) => {
          const common = {
            key: el.id,
            x: el.x,
            y: el.y,
            draggable: true,
            onClick: () => onSelect(el.id),
            onTap: () => onSelect(el.id),
            onDragEnd: (e: any) =>
              onUpdatePos(el.id, e.target.x(), e.target.y()),
          };

          if (el.type === "rect") {
            return (
              <Rect
                {...common}
                width={(el as any).width}
                height={(el as any).height}
                fill={(el as any).fill}
              />
            );
          }

          if (el.type === "text") {
            const t = el as any;
            return (
              <Text
                {...common}
                text={t.text}
                fontSize={t.fontSize}
                fill={t.fill}
                fontFamily={t.fontFamily}
                fontStyle={t.fontStyle}
                align={t.align}
              />
            );
          }

          if (el.type === "image") {
            const img = el as any;
            return (
              <KonvaImage
                {...common}
                image={img.image}
                width={img.width}
                height={img.height}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  </div>
);
