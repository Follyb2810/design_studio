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
            onDragEnd: (e: any) =>
              onUpdatePos(el.id, e.target.x(), e.target.y()),
          };

          if (el.type === "rect")
            return (
              <Rect
                {...common}
                width={el.width}
                height={el.height}
                fill={el.fill}
              />
            );
          if (el.type === "text")
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
              />
            );
          if (el.type === "image")
            return (
              <KonvaImage
                {...common}
                image={el.image}
                width={el.width}
                height={el.height}
              />
            );
          return null;
        })}
      </Layer>
    </Stage>
  </div>
);
