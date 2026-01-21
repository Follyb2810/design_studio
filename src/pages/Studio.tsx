import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text,
  Transformer,
  Group,
  Image as KonvaImage,
  RegularPolygon,
} from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import {
  Pencil,
  Square,
  Type,
  Hand,
  MousePointer,
  Eraser,
  Undo,
  Redo,
  Download,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  MessageSquare,
  Zap,
  Grid3x3,
  Save,
  Image as ImageIcon,
  Upload,
  BookOpen,
  User,
} from "lucide-react";

/* ==================== TYPES ==================== */

type ToolType =
  | "select"
  | "pan"
  | "pen"
  | "eraser"
  | "rect"
  | "circle"
  | "text"
  | "bubble"
  | "panel"
  | "speedlines"
  | "image"
  | "character";

type ElementType =
  | "line"
  | "rect"
  | "circle"
  | "text"
  | "bubble"
  | "panel"
  | "speedlines"
  | "image"
  | "character";

interface ElementBase {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation?: number;
  layerId: string;
  visible: boolean;
  locked: boolean;
}

interface LineElement extends ElementBase {
  type: "line";
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface RectElement extends ElementBase {
  type: "rect";
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface CircleElement extends ElementBase {
  type: "circle";
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface TextElement extends ElementBase {
  type: "text";
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: "left" | "center" | "right";
}

interface BubbleElement extends ElementBase {
  type: "bubble";
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  tailDirection?: "left" | "right" | "top" | "bottom";
}

interface PanelElement extends ElementBase {
  type: "panel";
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

interface SpeedlinesElement extends ElementBase {
  type: "speedlines";
  width: number;
  height: number;
  intensity: number;
}

interface ImageElement extends ElementBase {
  type: "image";
  src: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

interface CharacterElement extends ElementBase {
  type: "character";
  characterId: string;
  pose: string;
  expression: string;
  width: number;
  height: number;
  color?: string;
}

type CanvasElement =
  | LineElement
  | RectElement
  | CircleElement
  | TextElement
  | BubbleElement
  | PanelElement
  | SpeedlinesElement
  | ImageElement
  | CharacterElement;

/* renamed to avoid Konva Layer conflict */
interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

/* ==================== STORE ==================== */

interface AppState {
  elements: CanvasElement[];
  selectedId: string | null;
  tool: ToolType;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  layers: CanvasLayer[];
  currentLayer: string;
  history: CanvasElement[][];
  historyStep: number;
  zoom: number;
  stagePos: { x: number; y: number };
}

const useStore = () => {
  const [state, setState] = useState<AppState>({
    elements: [],
    selectedId: null,
    tool: "select",
    color: "#000",
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: "Arial",
    layers: [
      {
        id: "layer1",
        name: "Background",
        visible: true,
        locked: false,
        opacity: 1,
      },
      {
        id: "layer2",
        name: "Characters",
        visible: true,
        locked: false,
        opacity: 1,
      },
    ],
    currentLayer: "layer2",
    history: [[]],
    historyStep: 0,
    zoom: 1,
    stagePos: { x: 0, y: 0 },
  });

  const addElement = useCallback(
    (element: Omit<CanvasElement, "id" | "layerId" | "visible" | "locked">) => {
      setState((prev) => {
        const newElement: CanvasElement = {
          ...element,
          id: Date.now().toString(),
          layerId: prev.currentLayer,
          visible: true,
          locked: false,
        } as CanvasElement;

        const newElements = [...prev.elements, newElement];
        const newHistory = [
          ...prev.history.slice(0, prev.historyStep + 1),
          newElements,
        ];

        return {
          ...prev,
          elements: newElements,
          history: newHistory,
          historyStep: prev.historyStep + 1,
        };
      });
    },
    [],
  );

  const updateElement = useCallback(
    (id: string, changes: Partial<CanvasElement>) => {
      setState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, ...changes } : el,
        ),
      }));
    },
    [],
  );

  const deleteElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  return { state, setState, addElement, updateElement, deleteElement };
};

/* ==================== HELPERS ==================== */

const getTailPoints = (bubble: BubbleElement) => {
  const cx = bubble.width / 2;
  const cy = bubble.height / 2;
  switch (bubble.tailDirection) {
    case "left":
      return { x: -10, y: cy, rotation: 90 };
    case "right":
      return { x: bubble.width + 10, y: cy, rotation: -90 };
    case "top":
      return { x: cx, y: -10, rotation: 0 };
    case "bottom":
      return { x: cx, y: bubble.height + 10, rotation: 180 };
    default:
      return null;
  }
};

/* ==================== RENDERER ==================== */

interface RendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (c: Partial<CanvasElement>) => void;
}

const CanvasElementRenderer: React.FC<RendererProps> = ({
  element,
  isSelected,
  onSelect,
  onTransform,
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [image] = useImage(element.type === "image" ? element.src : "");

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const common = {
    ref: shapeRef,
    onClick: onSelect,
    draggable: isSelected && !element.locked,
    visible: element.visible,
  };

  switch (element.type) {
    case "image":
      return (
        <>
          <KonvaImage
            {...common}
            image={image}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "rect":
      return (
        <>
          <Rect {...common} {...element} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "circle":
      return (
        <>
          <Circle {...common} {...element} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "line":
      return (
        <>
          <Line {...common} {...element} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "text":
      return (
        <>
          <Text {...common} {...element} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "bubble": {
      const tail = getTailPoints(element);
      return (
        <>
          <Group {...common} x={element.x} y={element.y}>
            <Rect
              width={element.width}
              height={element.height}
              fill="white"
              stroke={element.stroke}
            />
            {tail && (
              <RegularPolygon
                sides={3}
                radius={15}
                fill="white"
                stroke={element.stroke}
                x={tail.x}
                y={tail.y}
                rotation={tail.rotation}
              />
            )}
            <Text
              text={element.text}
              width={element.width}
              align="center"
              padding={10}
            />
          </Group>
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    }

    default:
      return null;
  }
};

/* ==================== MAIN ==================== */

const MangaStudio: React.FC = () => {
  const { state, setState, addElement, updateElement, deleteElement } =
    useStore();
  const stageRef = useRef<any>(null);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 bg-gray-700">
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={state.zoom}
          scaleY={state.zoom}
          x={state.stagePos.x}
          y={state.stagePos.y}
        >
          <Layer>
            {state.elements.map((el) => (
              <CanvasElementRenderer
                key={el.id}
                element={el}
                isSelected={el.id === state.selectedId}
                onSelect={() => setState((p) => ({ ...p, selectedId: el.id }))}
                onTransform={(c) => updateElement(el.id, c)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default MangaStudio;
