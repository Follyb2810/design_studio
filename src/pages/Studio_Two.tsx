import React, { useState, useRef, useEffect } from "react";
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
} from "react-konva";
import {
  Pencil,
  Square,
  Circle as CircleIcon,
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
  Layers,
  Plus,
  ChevronRight,
  MessageSquare,
  Zap,
  Grid3x3,
  Save,
} from "lucide-react";

// TypeScript interfaces
interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: "line" | "rect" | "circle" | "text" | "bubble" | "panel" | "speedlines";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  rotation?: number;
  layerId: string;
}

interface LayerState {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface AppState {
  elements: Element[];
  selectedId: string | null;
  tool: string;
  color: string;
  strokeWidth: number;
  fontSize: number;
  layers: LayerState[];
  currentLayer: string;
  history: Element[][];
  historyStep: number;
  zoom: number;
  stagePos: Point;
}

interface Tool {
  id: string;
  icon: React.ElementType;
  name: string;
}

// Zustand-like state management with hooks
const useStore = () => {
  const [state, setState] = useState<AppState>({
    elements: [],
    selectedId: null,
    tool: "select",
    color: "#000000",
    strokeWidth: 2,
    fontSize: 16,
    layers: [{ id: "layer1", name: "Layer 1", visible: true, locked: false }],
    currentLayer: "layer1",
    history: [[]],
    historyStep: 0,
    zoom: 1,
    stagePos: { x: 0, y: 0 },
  });

  const addElement = (element: Omit<Element, "id" | "layerId">) => {
    setState((prev) => {
      const newElement: Element = {
        ...element,
        id: Date.now().toString(),
        layerId: prev.currentLayer,
      };
      const newElements = [...prev.elements, newElement];
      return {
        ...prev,
        elements: newElements,
        history: [...prev.history.slice(0, prev.historyStep + 1), newElements],
        historyStep: prev.historyStep + 1,
      };
    });
  };

  const updateElement = (id: string, changes: Partial<Element>) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...changes } : el,
      ),
    }));
  };

  const deleteElement = (id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  };

  const undo = () => {
    setState((prev) => {
      if (prev.historyStep > 0) {
        return {
          ...prev,
          elements: prev.history[prev.historyStep - 1],
          historyStep: prev.historyStep - 1,
        };
      }
      return prev;
    });
  };

  const redo = () => {
    setState((prev) => {
      if (prev.historyStep < prev.history.length - 1) {
        return {
          ...prev,
          elements: prev.history[prev.historyStep + 1],
          historyStep: prev.historyStep + 1,
        };
      }
      return prev;
    });
  };

  return {
    state,
    setState,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
  };
};

// Canvas Element Component
interface CanvasElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (id: string, changes: Partial<Element>) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  onTransform,
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<Transformer|null>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransform(element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  switch (element.type) {
    case "line":
      return (
        <>
          <Line
            ref={shapeRef}
            points={element.points || []}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
          />
          {isSelected && <Transformer />}
        </>
      );

    case "rect":
      return (
        <>
          <Rect
            ref={shapeRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation || 0}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "circle":
      return (
        <>
          <Circle
            ref={shapeRef}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "text":
    case "bubble":
      return (
        <>
          <Group
            ref={shapeRef}
            x={element.x}
            y={element.y}
            rotation={element.rotation || 0}
            draggable={isSelected}
            onClick={onSelect}
            onTap={onSelect}
            onTransformEnd={handleTransformEnd}
          >
            {element.type === "bubble" && (
              <Rect
                width={element.width}
                height={element.height}
                fill="white"
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                cornerRadius={10}
              />
            )}
            <Text
              text={element.text || ""}
              fontSize={element.fontSize}
              fontFamily={element.fontFamily || "Arial"}
              fill={element.fill}
              width={element.width}
              height={element.height}
              align="center"
              verticalAlign="middle"
              padding={10}
            />
          </Group>
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "panel":
      return (
        <>
          <Rect
            ref={shapeRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill="white"
            stroke="#000000"
            strokeWidth={4}
            rotation={element.rotation || 0}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
            onTransformEnd={handleTransformEnd}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    case "speedlines":
      const lines = [];
      const centerX = (element.x || 0) + (element.width || 0) / 2;
      const centerY = (element.y || 0) + (element.height || 0) / 2;
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const startX = centerX + Math.cos(angle) * 50;
        const startY = centerY + Math.sin(angle) * 50;
        const endX = centerX + Math.cos(angle) * 200;
        const endY = centerY + Math.sin(angle) * 200;
        lines.push(
          <Line
            key={i}
            points={[startX, startY, endX, endY]}
            stroke="#000000"
            strokeWidth={2}
          />,
        );
      }
      return (
        <>
          <Group
            ref={shapeRef}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
          >
            {lines}
          </Group>
          {isSelected && <Transformer ref={trRef} />}
        </>
      );

    default:
      return null;
  }
};

// Main App Component
export default function Studio_Two() {
  const {
    state,
    setState,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
  } = useStore();
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const currentLine = useRef<Element | null>(null);

  const tools: Tool[] = [
    { id: "select", icon: MousePointer, name: "Select" },
    { id: "pan", icon: Hand, name: "Pan" },
    { id: "pen", icon: Pencil, name: "Pen" },
    { id: "eraser", icon: Eraser, name: "Eraser" },
    { id: "rect", icon: Square, name: "Rectangle" },
    { id: "circle", icon: CircleIcon, name: "Circle" },
    { id: "text", icon: Type, name: "Text" },
    { id: "bubble", icon: MessageSquare, name: "Speech Bubble" },
    { id: "panel", icon: Grid3x3, name: "Panel" },
    { id: "speedlines", icon: Zap, name: "Speed Lines" },
  ];

  const handleMouseDown = (e: any) => {
    if (state.tool === "select" || state.tool === "pan") return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const relativePos: Point = {
      x: (pos.x - state.stagePos.x) / state.zoom,
      y: (pos.y - state.stagePos.y) / state.zoom,
    };

    isDrawing.current = true;

    if (state.tool === "pen") {
      currentLine.current = {
        type: "line",
        points: [relativePos.x, relativePos.y],
        stroke: state.color,
        strokeWidth: state.strokeWidth,
        layerId: state.currentLayer,
      };
    } else if (state.tool === "rect") {
      currentLine.current = {
        type: "rect",
        x: relativePos.x,
        y: relativePos.y,
        width: 0,
        height: 0,
        fill: "transparent",
        stroke: state.color,
        strokeWidth: state.strokeWidth,
        layerId: state.currentLayer,
      };
    } else if (state.tool === "circle") {
      currentLine.current = {
        type: "circle",
        x: relativePos.x,
        y: relativePos.y,
        radius: 0,
        fill: "transparent",
        stroke: state.color,
        strokeWidth: state.strokeWidth,
        layerId: state.currentLayer,
      };
    } else if (state.tool === "panel") {
      currentLine.current = {
        type: "panel",
        x: relativePos.x,
        y: relativePos.y,
        width: 0,
        height: 0,
        layerId: state.currentLayer,
      };
    } else if (state.tool === "bubble") {
      addElement({
        type: "bubble",
        x: relativePos.x,
        y: relativePos.y,
        width: 150,
        height: 80,
        text: "Dialogue here...",
        fontSize: state.fontSize,
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: 2,
      });
      isDrawing.current = false;
    } else if (state.tool === "text") {
      addElement({
        type: "text",
        x: relativePos.x,
        y: relativePos.y,
        width: 200,
        height: 50,
        text: "Type here...",
        fontSize: state.fontSize,
        fill: state.color,
      });
      isDrawing.current = false;
    } else if (state.tool === "speedlines") {
      addElement({
        type: "speedlines",
        x: relativePos.x,
        y: relativePos.y,
        width: 200,
        height: 200,
      });
      isDrawing.current = false;
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !currentLine.current) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const relativePos: Point = {
      x: (pos.x - state.stagePos.x) / state.zoom,
      y: (pos.y - state.stagePos.y) / state.zoom,
    };

    if (state.tool === "pen") {
      const points = [
        ...(currentLine.current.points || []),
        relativePos.x,
        relativePos.y,
      ];
      currentLine.current = { ...currentLine.current, points };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([
            { ...currentLine.current, id: "temp", layerId: prev.currentLayer },
          ]),
      }));
    } else if (state.tool === "rect" || state.tool === "panel") {
      const width = relativePos.x - (currentLine.current.x || 0);
      const height = relativePos.y - (currentLine.current.y || 0);
      currentLine.current = { ...currentLine.current, width, height };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([
            { ...currentLine.current, id: "temp", layerId: prev.currentLayer },
          ]),
      }));
    } else if (state.tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(relativePos.x - (currentLine.current.x || 0), 2) +
          Math.pow(relativePos.y - (currentLine.current.y || 0), 2),
      );
      currentLine.current = { ...currentLine.current, radius };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([
            { ...currentLine.current, id: "temp", layerId: prev.currentLayer },
          ]),
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current && currentLine.current) {
      setState((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => el.id !== "temp"),
      }));

      if (state.tool === "rect" || state.tool === "panel") {
        if (
          Math.abs(currentLine.current.width || 0) > 5 &&
          Math.abs(currentLine.current.height || 0) > 5
        ) {
          addElement(currentLine.current);
        }
      } else if (state.tool === "circle") {
        if ((currentLine.current.radius || 0) > 5) {
          addElement(currentLine.current);
        }
      } else if (state.tool === "pen") {
        if ((currentLine.current.points?.length || 0) > 2) {
          addElement(currentLine.current);
        }
      }
    }

    isDrawing.current = false;
    currentLine.current = null;
  };

  const handleExport = (format: string) => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `manga-creation.${format}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setState((prev) => ({
      ...prev,
      zoom: newScale,
      stagePos: {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      },
    }));
  };

  const selectedElement = state.elements.find(
    (el) => el.id === state.selectedId,
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  tool: tool.id,
                  selectedId: null,
                }))
              }
              className={`p-3 rounded-lg transition-colors ${
                state.tool === tool.id ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
              title={tool.name}
            >
              <Icon size={20} />
            </button>
          );
        })}

        <div className="border-t border-gray-700 w-full my-2"></div>

        <button
          onClick={undo}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={redo}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Redo"
        >
          <Redo size={20} />
        </button>
        <button
          onClick={() => state.selectedId && deleteElement(state.selectedId)}
          className="p-3 rounded-lg hover:bg-red-600"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-700 overflow-hidden relative">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 64 - 300}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          scaleX={state.zoom}
          scaleY={state.zoom}
          x={state.stagePos.x}
          y={state.stagePos.y}
        >
          <Layer>
            {state.elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={element.id === state.selectedId}
                onSelect={() =>
                  setState((prev) => ({
                    ...prev,
                    selectedId: element.id,
                    tool: "select",
                  }))
                }
                onTransform={(id, changes) => updateElement(id, changes)}
              />
            ))}
          </Layer>
        </Stage>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-gray-800 px-3 py-1 rounded">
          {Math.round(state.zoom * 100)}%
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Properties</h2>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Color</label>
          <input
            type="color"
            value={state.color}
            onChange={(e) =>
              setState((prev) => ({ ...prev, color: e.target.value }))
            }
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Stroke Width */}
        <div className="mb-4">
          <label className="block text-sm mb-2">
            Stroke Width: {state.strokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={state.strokeWidth}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                strokeWidth: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Font Size */}
        <div className="mb-4">
          <label className="block text-sm mb-2">
            Font Size: {state.fontSize}px
          </label>
          <input
            type="range"
            min="8"
            max="72"
            value={state.fontSize}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                fontSize: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        {/* Selected Element Properties */}
        {selectedElement && (
          <div className="mb-4 p-3 bg-gray-700 rounded">
            <h3 className="font-semibold mb-2">
              Selected: {selectedElement.type}
            </h3>

            {(selectedElement.type === "text" ||
              selectedElement.type === "bubble") && (
              <div className="mb-2">
                <label className="block text-sm mb-1">Text</label>
                <textarea
                  value={selectedElement.text || ""}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { text: e.target.value })
                  }
                  className="w-full p-2 bg-gray-600 rounded text-sm"
                  rows={3}
                />
              </div>
            )}

            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="w-full bg-red-600 hover:bg-red-700 py-2 rounded mt-2"
            >
              Delete Element
            </button>
          </div>
        )}

        {/* Layers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Layers</h3>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Plus size={16} />
            </button>
          </div>

          {state.layers.map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center justify-between p-2 rounded mb-1 cursor-pointer ${
                state.currentLayer === layer.id ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() =>
                setState((prev) => ({ ...prev, currentLayer: layer.id }))
              }
            >
              <span className="text-sm">{layer.name}</span>
              <div className="flex space-x-1">
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
              </div>
            </div>
          ))}
        </div>

        {/* Export */}
        <div className="space-y-2">
          <button
            onClick={() => handleExport("png")}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded flex items-center justify-center space-x-2"
          >
            <Download size={16} />
            <span>Export PNG</span>
          </button>

          <button
            onClick={() => handleExport("jpg")}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded flex items-center justify-center space-x-2"
          >
            <Save size={16} />
            <span>Export JPG</span>
          </button>
        </div>

        {/* Quick Templates */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Manga Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                addElement({
                  type: "panel",
                  x: 50,
                  y: 50,
                  width: 300,
                  height: 400,
                });
                addElement({
                  type: "bubble",
                  x: 100,
                  y: 100,
                  width: 150,
                  height: 80,
                  text: "Speech!",
                  fontSize: 14,
                  fill: "#000",
                  stroke: "#000",
                  strokeWidth: 2,
                });
              }}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Single Panel
            </button>
            <button
              onClick={() => {
                addElement({
                  type: "panel",
                  x: 50,
                  y: 50,
                  width: 200,
                  height: 300,
                });
                addElement({
                  type: "panel",
                  x: 270,
                  y: 50,
                  width: 200,
                  height: 300,
                });
              }}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              2-Panel
            </button>
            <button
              onClick={() => {
                addElement({
                  type: "speedlines",
                  x: 200,
                  y: 200,
                  width: 300,
                  height: 300,
                });
              }}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Action Scene
            </button>
            <button
              onClick={() => {
                addElement({
                  type: "bubble",
                  x: 200,
                  y: 150,
                  width: 180,
                  height: 100,
                  text: "!!!",
                  fontSize: 32,
                  fill: "#000",
                  stroke: "#000",
                  strokeWidth: 3,
                });
              }}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              Impact Bubble
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
