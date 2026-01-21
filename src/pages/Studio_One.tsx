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
import useImage from "use-image";

const URLImage = ({ imageObj, isSelected, onSelect, onTransform }) => {
  const [img] = useImage(imageObj.src, "anonymous");
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Apply Manga Filters (Grayscale/Contrast)
  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.cache();
    }
  }, [img, imageObj.contrast, imageObj.grayscale]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={imageObj.x}
        y={imageObj.y}
        width={imageObj.width}
        height={imageObj.height}
        rotation={imageObj.rotation}
        draggable={isSelected}
        onClick={onSelect}
        onTap={onSelect}
        filters={
          imageObj.grayscale
            ? [window.Konva.Filters.Grayscale, window.Konva.Filters.Contrast]
            : [window.Konva.Filters.Contrast]
        }
        contrast={imageObj.contrast || 0}
        onTransformEnd={() => {
          const node = shapeRef.current;
          onTransform(imageObj.id, {
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};
// Zustand-like state management with hooks
const useStore = () => {
  const [state, setState] = useState({
    elements: [],
    selectedId: null,
    tool: "select",
    color: "#000000",
    strokeWidth: 2,
    fontSize: 16,
    layers: [{ id: "layer1", name: "Layer 1", visible: true, locked: false }],
    currentLayer: "layer1",
    history: [],
    historyStep: -1,
    zoom: 1,
    stagePos: { x: 0, y: 0 },
  });

  const addElement = (element) => {
    setState((prev) => {
      const newElements = [
        ...prev.elements,
        { ...element, id: Date.now().toString(), layerId: prev.currentLayer },
      ];
      return {
        ...prev,
        elements: newElements,
        history: [...prev.history.slice(0, prev.historyStep + 1), newElements],
        historyStep: prev.historyStep + 1,
      };
    });
  };

  const updateElement = (id, changes) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...changes } : el,
      ),
    }));
  };

  const deleteElement = (id) => {
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
const CanvasElement = ({ element, isSelected, onSelect, onTransform }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
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
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            onClick={onSelect}
            onTap={onSelect}
            draggable={isSelected}
          />
          {isSelected && <Transformer ref={trRef} />}
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
              text={element.text}
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
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
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

export default function Studio_One() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState("select");
  const [assets, setAssets] = useState([]);
  const [zoom, setZoom] = useState(1);

  const stageRef = useRef();
  const fileInputRef = useRef();

  // --- Image Upload Logic ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newAsset = { id: Date.now(), src: reader.result };
        setAssets([...assets, newAsset]);
        // Automatically add to canvas
        addImageToCanvas(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageToCanvas = (src) => {
    const newImg = {
      id: Date.now().toString(),
      type: "image",
      src: src,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      grayscale: false,
      contrast: 10,
    };
    setElements([...elements, newImg]);
  };

  const updateElement = (id, changes) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...changes } : el)),
    );
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <div className="flex h-screen bg-black text-slate-200 font-sans">
      {/* Left Sidebar: Tools */}
      <div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 space-y-4">
        <ToolBtn
          icon={MousePointer}
          active={tool === "select"}
          onClick={() => setTool("select")}
          label="Select"
        />
        <ToolBtn
          icon={Grid3x3}
          active={tool === "panel"}
          onClick={() => setTool("panel")}
          label="Panel"
        />
        <ToolBtn
          icon={ImageIcon}
          onClick={() => fileInputRef.current.click()}
          label="Upload Image"
        />
        <ToolBtn
          icon={MessageSquare}
          onClick={() => setTool("bubble")}
          label="Speech"
        />
        <ToolBtn icon={Type} onClick={() => setTool("text")} label="Text" />
        <ToolBtn
          icon={Pencil}
          active={tool === "pen"}
          onClick={() => setTool("pen")}
          label="Draw"
        />
        <div className="flex-1" />
        <ToolBtn
          icon={Trash2}
          onClick={() =>
            setElements(elements.filter((e) => e.id !== selectedId))
          }
          className="text-red-400"
        />
      </div>

      {/* Assets Library */}
      <div className="w-48 bg-zinc-900 border-r border-zinc-800 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Assets
        </h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="aspect-square bg-zinc-800 rounded border border-zinc-700 overflow-hidden cursor-pointer hover:border-blue-500"
              onClick={() => addImageToCanvas(asset.src)}
            >
              <img
                src={asset.src}
                alt="asset"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current.click()}
            className="aspect-square border-2 border-dashed border-zinc-700 rounded flex items-center justify-center hover:bg-zinc-800"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="flex-1 bg-zinc-950 flex flex-col relative">
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
          <span className="text-sm font-medium">Manga Project v1.0</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const uri = stageRef.current.toDataURL();
                const link = document.createElement("a");
                link.download = "manga-page.png";
                link.href = uri;
                link.click();
              }}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm flex items-center"
            >
              <Download size={14} className="mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-800 p-10 flex justify-center">
          <div className="bg-white shadow-2xl">
            <Stage
              ref={stageRef}
              width={600}
              height={800}
              scaleX={zoom}
              scaleY={zoom}
              onClick={(e) => {
                if (e.target === e.target.getStage()) setSelectedId(null);
              }}
            >
              <Layer>
                {elements.map((el) => {
                  if (el.type === "image") {
                    return (
                      <URLImage
                        key={el.id}
                        imageObj={el}
                        isSelected={el.id === selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onTransform={updateElement}
                      />
                    );
                  }
                  if (el.type === "rect" || el.type === "panel") {
                    return (
                      <Rect
                        key={el.id}
                        {...el}
                        stroke="black"
                        strokeWidth={el.type === "panel" ? 4 : 1}
                        draggable
                        onClick={() => setSelectedId(el.id)}
                      />
                    );
                  }
                  // Standard Konva Text for speech
                  if (el.type === "text" || el.type === "bubble") {
                    return (
                      <Text
                        key={el.id}
                        {...el}
                        draggable
                        onClick={() => setSelectedId(el.id)}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-64 bg-zinc-900 border-l border-zinc-800 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center">
          <Sliders size={14} className="mr-2" /> Inspector
        </h3>

        {selectedElement ? (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-zinc-500 block mb-2">
                Layer Type
              </label>
              <div className="text-sm font-bold capitalize text-white">
                {selectedElement.type}
              </div>
            </div>

            {selectedElement.type === "image" && (
              <div className="space-y-4 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manga Effect (BW)</span>
                  <input
                    type="checkbox"
                    checked={selectedElement.grayscale}
                    onChange={(e) =>
                      updateElement(selectedId, { grayscale: e.target.checked })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2">
                    Contrast ({selectedElement.contrast})
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    className="w-full"
                    value={selectedElement.contrast}
                    onChange={(e) =>
                      updateElement(selectedId, {
                        contrast: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4">
              <button
                onClick={() =>
                  setElements(elements.filter((e) => e.id !== selectedId))
                }
                className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-2 rounded text-sm hover:bg-red-900/40"
              >
                Delete Layer
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-zinc-600 mt-20 text-sm italic">
            Select an item to edit properties
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for buttons
function ToolBtn({ icon: Icon, active, onClick, label, className = "" }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-3 rounded-xl transition-all ${active ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-800"} ${className}`}
    >
      <Icon size={20} />
    </button>
  );
}
