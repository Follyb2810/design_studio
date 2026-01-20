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
  Transformer,
} from "react-konva";

interface CanvasStageProps {
  stageRef: React.RefObject<any>;
  page: Page;
  selectedId: string | null;
  onSelect: (id: string, panelId?: string) => void;
  onElementChange: (id: string, patch: any, panelId?: string) => void;
  clearSelection: () => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  stageRef,
  page,
  selectedId,
  onSelect,
  onElementChange,
  clearSelection,
}) => {
  const trRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const stage = stageRef.current.getStage();
      // We use the id attribute on Konva nodes to find them
      const selectedNode = stage.findOne("#" + selectedId);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, page]);

  const renderElement = (el: CanvasElement, panelId?: string) => {
    const common = {
      key: el.id,
      id: el.id, // Important for Transformer to find the node
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
        onElementChange(el.id, { x: e.target.x(), y: e.target.y() }, panelId),
      onTransformEnd: (e: any) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 and update width/height to avoid compounding scale
        node.scaleX(1);
        node.scaleY(1);

        const patch: any = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        };

        if (el.type === "text" || el.type === "sfx") {
          patch.fontSize = node.fontSize() * scaleX; // Text scales by font size
        } else if (el.type === "ellipse") {
          patch.radiusX = (node.radiusX() || 0) * scaleX;
          patch.radiusY = (node.radiusY() || 0) * scaleY;
        } else {
          patch.width = Math.max(5, node.width() * scaleX);
          patch.height = Math.max(5, node.height() * scaleY);
        }
        onElementChange(el.id, patch, panelId);
      },
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
              id={panel.id}
              x={panel.x}
              y={panel.y}
              draggable={!panel.locked}
              onClick={() => onSelect(panel.id)}
              onTap={() => onSelect(panel.id)}
              onDragEnd={(e: any) =>
                onElementChange(panel.id, { x: e.target.x(), y: e.target.y() })
              }
              // Clip content to panel bounds
              clipX={0}
              clipY={0}
              clipWidth={panel.width}
              clipHeight={panel.height}
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
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
};
