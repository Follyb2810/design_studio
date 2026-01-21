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
} from "react-konva";
import {
  Pencil,
  Square,
  Circle as CircleIcon,
  Type,
  Eraser,
  MousePointer,
  Minus,
  Move,
  RotateCw,
  Layers,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Lock,
  Unlock,
  MessageCircle,
  Zap,
  Grid,
  Plus,
  Copy,
} from "lucide-react";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface CanvasElementItem {
  id: string;
  layerId: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  points?: number[];
  radius?: number;
  text?: string;
  fontSize?: number;
}

interface AppState {
  elements: CanvasElementItem[];
  selectedIds: string[];
  tool: string;
  history: CanvasElementItem[][];
  historyIndex: number;
  zoom: number;
  layers: Layer[];
  activeLayer: string;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

// ============================================================================
// STATE STORE using TanStack Store pattern (simplified for this implementation)
// ============================================================================
const createStore = <T,>(initialState: T) => {
  let state = initialState;
  const listeners = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (newState: T | ((prev: T) => T)) => {
      state =
        typeof newState === "function"
          ? (newState as (prev: T) => T)(state)
          : newState;
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

// Main application store
const store = createStore<AppState>({
  elements: [],
  selectedIds: [],
  tool: "select",
  history: [],
  historyIndex: -1,
  zoom: 1,
  layers: [{ id: "layer1", name: "Layer 1", visible: true, locked: false }],
  activeLayer: "layer1",
  strokeColor: "#000000",
  fillColor: "#ffffff",
  strokeWidth: 2,
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const generateId = () =>
  `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const addToHistory = (elements: CanvasElementItem[]) => {
  const state = store.getState();
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(elements)));
  store.setState({
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  });
};

// ============================================================================
// CANVAS ELEMENT COMPONENTS
// ============================================================================
interface CanvasElementProps {
  element: CanvasElementItem;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (element: CanvasElementItem) => void;
}

const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onChange,
}: CanvasElementProps) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    draggable: isSelected,
    onDragEnd: (e: any) => {
      onChange({
        ...element,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      onChange({
        ...element,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    },
  };

  const renderShape = () => {
    switch (element.type) {
      case "line":
        return (
          <Line
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
          />
        );

      case "rect":
        return (
          <Rect
            {...commonProps}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
          />
        );

      case "circle":
        return (
          <Circle
            {...commonProps}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );

      case "text":
        return (
          <Text
            {...commonProps}
            x={element.x}
            y={element.y}
            text={element.text}
            fontSize={element.fontSize}
            fill={element.fill}
            width={element.width}
            rotation={element.rotation}
          />
        );

      case "speechBubble":
        return (
          <Group {...commonProps} x={element.x} y={element.y}>
            <Rect
              width={element.width}
              height={element.height}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={2}
              cornerRadius={10}
            />
            <Line
              points={[
                element.width / 2,
                element.height,
                element.width / 2 + 20,
                element.height + 30,
              ]}
              stroke="#000000"
              strokeWidth={2}
              lineCap="round"
            />
            <Text
              text={element.text}
              fontSize={16}
              fill="#000000"
              width={element.width - 20}
              x={10}
              y={10}
              align="center"
            />
          </Group>
        );

      case "speedLines":
        return (
          <Group {...commonProps} x={element.x} y={element.y}>
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / 20;
              const startRadius = 50;
              const endRadius = 150;
              return (
                <Line
                  key={i}
                  points={[
                    Math.cos(angle) * startRadius,
                    Math.sin(angle) * startRadius,
                    Math.cos(angle) * endRadius,
                    Math.sin(angle) * endRadius,
                  ]}
                  stroke="#000000"
                  strokeWidth={2}
                />
              );
            })}
          </Group>
        );

      case "panel":
        return (
          <Rect
            {...commonProps}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            stroke="#000000"
            strokeWidth={4}
            fill="transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================
const DrawingCanvas = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const [state, setState] = useState(store.getState());
  const stageRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<CanvasElementItem | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const handleMouseDown = (e: any) => {
    if (state.tool === "select") return;

    const pos = e.target.getStage().getPointerPosition();
    const newElement: CanvasElementItem = {
      id: generateId(),
      layerId: state.activeLayer,
      x: pos.x,
      y: pos.y,
      stroke: state.strokeColor,
      fill: state.fillColor,
      strokeWidth: state.strokeWidth,
      type: "", // Will be set below
    };

    switch (state.tool) {
      case "pen":
        newElement.type = "line";
        newElement.points = [0, 0];
        break;
      case "rect":
        newElement.type = "rect";
        newElement.width = 0;
        newElement.height = 0;
        newElement.rotation = 0;
        break;
      case "circle":
        newElement.type = "circle";
        newElement.radius = 0;
        break;
      case "text":
        newElement.type = "text";
        newElement.text = "Double click to edit";
        newElement.fontSize = 20;
        newElement.width = 200;
        newElement.rotation = 0;
        break;
      case "speechBubble":
        newElement.type = "speechBubble";
        newElement.width = 150;
        newElement.height = 100;
        newElement.text = "Text here";
        break;
      case "speedLines":
        newElement.type = "speedLines";
        break;
      case "panel":
        newElement.type = "panel";
        newElement.width = 200;
        newElement.height = 300;
        break;
      default:
        return;
    }

    setCurrentShape(newElement);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentShape) return;

    const pos = e.target.getStage().getPointerPosition();
    const updatedShape = { ...currentShape };

    switch (currentShape.type) {
      case "line":
        const newPoints = (currentShape.points || []).concat([
          pos.x - currentShape.x,
          pos.y - currentShape.y,
        ]);
        updatedShape.points = newPoints;
        break;
      case "rect":
      case "panel":
        updatedShape.width = pos.x - currentShape.x;
        updatedShape.height = pos.y - currentShape.y;
        break;
      case "circle":
        const dx = pos.x - currentShape.x;
        const dy = pos.y - currentShape.y;
        updatedShape.radius = Math.sqrt(dx * dx + dy * dy);
        break;
    }

    setCurrentShape(updatedShape);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;

    const newElements = [...state.elements, currentShape];
    store.setState({ ...state, elements: newElements });
    addToHistory(newElements);

    setIsDrawing(false);
    setCurrentShape(null);
  };

  const handleSelect = (id: string) => {
    store.setState({
      ...state,
      selectedIds: [id],
    });
  };

  const handleChange = (updatedElement: CanvasElementItem) => {
    const newElements = state.elements.map((el) =>
      el.id === updatedElement.id ? updatedElement : el,
    );
    store.setState({ ...state, elements: newElements });
    addToHistory(newElements);
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      store.setState({ ...state, selectedIds: [] });
    }
  };

  return (
    <Stage
      width={width}
      height={height}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onClick={handleStageClick}
      scaleX={state.zoom}
      scaleY={state.zoom}
      style={{ background: "#f0f0f0" }}
    >
      <Layer>
        {/* Grid background */}
        {Array.from({ length: 50 }).map((_, i) => (
          <React.Fragment key={i}>
            <Line
              points={[i * 50, 0, i * 50, 5000]}
              stroke="#ddd"
              strokeWidth={1}
            />
            <Line
              points={[0, i * 50, 5000, i * 50]}
              stroke="#ddd"
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {/* Render all elements */}
        {state.elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={state.selectedIds.includes(element.id)}
            onSelect={() => handleSelect(element.id)}
            onChange={handleChange}
          />
        ))}

        {/* Render current drawing shape */}
        {currentShape && (
          <CanvasElement
            element={currentShape}
            isSelected={false}
            onSelect={() => {}}
            onChange={() => {}}
          />
        )}
      </Layer>
    </Stage>
  );
};

// ============================================================================
// TOOLBAR COMPONENT
// ============================================================================
const Toolbar = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: Pencil, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
    { id: "text", icon: Type, label: "Text" },
    { id: "speechBubble", icon: MessageCircle, label: "Speech Bubble" },
    { id: "speedLines", icon: Zap, label: "Speed Lines" },
    { id: "panel", icon: Grid, label: "Panel Frame" },
  ];

  const setTool = (tool: string) => {
    store.setState({ ...state, tool, selectedIds: [] });
  };

  return (
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4 gap-2">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setTool(id)}
          className={`p-3 rounded-lg transition-all ${
            state.tool === id
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
          title={label}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// PROPERTIES PANEL
// ============================================================================
const PropertiesPanel = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const selectedElement = state.elements.find((el) =>
    state.selectedIds.includes(el.id),
  );

  const updateColor = (type: "strokeColor" | "fillColor", value: string) => {
    store.setState({
      ...state,
      [type]: value,
    });

    if (selectedElement) {
      const newElements = state.elements.map((el) =>
        el.id === selectedElement.id
          ? { ...el, [type === "strokeColor" ? "stroke" : "fill"]: value }
          : el,
      );
      store.setState({ ...state, elements: newElements });
    }
  };

  return (
    <div className="w-64 bg-gray-800 p-4 text-white overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Properties</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Stroke Color</label>
          <input
            type="color"
            value={state.strokeColor}
            onChange={(e) => updateColor("strokeColor", e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Fill Color</label>
          <input
            type="color"
            value={state.fillColor}
            onChange={(e) => updateColor("fillColor", e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Stroke Width</label>
          <input
            type="range"
            min="1"
            max="20"
            value={state.strokeWidth}
            onChange={(e) =>
              store.setState({ ...state, strokeWidth: Number(e.target.value) })
            }
            className="w-full"
          />
          <span className="text-xs">{state.strokeWidth}px</span>
        </div>

        {selectedElement && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="font-semibold mb-2">Selected Object</h4>
            <p className="text-sm text-gray-400">
              Type: {selectedElement.type}
            </p>
            <p className="text-sm text-gray-400">
              ID: {selectedElement.id.slice(0, 12)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// LAYERS PANEL
// ============================================================================
const LayersPanel = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const addLayer = () => {
    const newLayer = {
      id: `layer${state.layers.length + 1}`,
      name: `Layer ${state.layers.length + 1}`,
      visible: true,
      locked: false,
    };
    store.setState({
      ...state,
      layers: [...state.layers, newLayer],
      activeLayer: newLayer.id,
    });
  };

  const toggleLock = (layerId: string) => {
    const newLayers = state.layers.map((layer) =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
    );
    store.setState({ ...state, layers: newLayers });
  };

  return (
    <div className="w-64 bg-gray-800 p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Layers</h3>
        <button
          onClick={addLayer}
          className="p-1 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {state.layers.map((layer) => (
          <div
            key={layer.id}
            className={`p-2 rounded cursor-pointer flex items-center justify-between ${
              state.activeLayer === layer.id ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => store.setState({ ...state, activeLayer: layer.id })}
          >
            <span className="text-sm">{layer.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(layer.id);
              }}
              className="p-1 hover:bg-gray-600 rounded"
            >
              {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TOP MENU BAR
// ============================================================================
const MenuBar = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  const undo = () => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      store.setState({
        ...state,
        elements: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  };

  const redo = () => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      store.setState({
        ...state,
        elements: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  };

  const deleteSelected = () => {
    const newElements = state.elements.filter(
      (el) => !state.selectedIds.includes(el.id),
    );
    store.setState({ ...state, elements: newElements, selectedIds: [] });
    addToHistory(newElements);
  };

  const exportPNG = () => {
    const stage = document.querySelector("canvas");
    if (stage) {
      const url = stage.toDataURL();
      const link = document.createElement("a");
      link.download = "manga-artwork.png";
      link.href = url;
      link.click();
    }
  };

  const zoomIn = () => {
    store.setState({ ...state, zoom: Math.min(state.zoom + 0.1, 3) });
  };

  const zoomOut = () => {
    store.setState({ ...state, zoom: Math.max(state.zoom - 0.1, 0.1) });
  };

  return (
    <div className="h-14 bg-gray-900 text-white flex items-center px-4 gap-2">
      <h1 className="text-xl font-bold mr-4">Manga Studio</h1>

      <button
        onClick={undo}
        disabled={state.historyIndex <= 0}
        className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        title="Undo"
      >
        <Undo2 size={18} />
      </button>

      <button
        onClick={redo}
        disabled={state.historyIndex >= state.history.length - 1}
        className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        title="Redo"
      >
        <Redo2 size={18} />
      </button>

      <div className="h-8 w-px bg-gray-600 mx-2" />

      <button
        onClick={deleteSelected}
        disabled={state.selectedIds.length === 0}
        className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        title="Delete"
      >
        <Trash2 size={18} />
      </button>

      <div className="h-8 w-px bg-gray-600 mx-2" />

      <button
        onClick={zoomOut}
        className="p-2 bg-gray-700 rounded hover:bg-gray-600"
        title="Zoom Out"
      >
        -
      </button>

      <span className="text-sm px-2">{Math.round(state.zoom * 100)}%</span>

      <button
        onClick={zoomIn}
        className="p-2 bg-gray-700 rounded hover:bg-gray-600"
        title="Zoom In"
      >
        +
      </button>

      <div className="flex-1" />

      <button
        onClick={exportPNG}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 flex items-center gap-2"
      >
        <Download size={18} />
        Export PNG
      </button>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      const toolbarWidth = 64;
      const propertiesWidth = 256;
      const layersWidth = 256;
      const menuHeight = 56;

      setCanvasSize({
        width: window.innerWidth - toolbarWidth - propertiesWidth - layersWidth,
        height: window.innerHeight - menuHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <MenuBar />

      <div className="flex-1 flex overflow-hidden">
        <Toolbar />

        <div className="flex-1 overflow-auto">
          <DrawingCanvas width={canvasSize.width} height={canvasSize.height} />
        </div>

        <PropertiesPanel />
        <LayersPanel />
      </div>
    </div>
  );
}
