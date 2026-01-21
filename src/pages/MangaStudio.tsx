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
  PanelLeft,
  PanelTop,
  BookOpen,
  User,
} from "lucide-react";

// ==================== TYPE DEFINITIONS ====================
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
  align: string;
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

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

interface Dialogue {
  id: string;
  character: string;
  text: string;
  emotion: string;
  position: { x: number; y: number };
  elementId?: string;
}

interface Scene {
  id: string;
  panelNumber: number;
  description: string;
  dialogues: Dialogue[];
  background: string;
  cameraAngle: string;
}

interface Script {
  title: string;
  episode: string;
  author: string;
  scenes: Scene[];
}

interface CharacterDesign {
  id: string;
  name: string;
  description: string;
  colors: {
    hair: string;
    eyes: string;
    skin: string;
    clothing: string;
  };
  poses: string[];
  expressions: string[];
}

interface AppState {
  elements: CanvasElement[];
  selectedId: string | null;
  tool: ToolType;
  color: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  layers: Layer[];
  currentLayer: string;
  history: CanvasElement[][];
  historyStep: number;
  zoom: number;
  stagePos: { x: number; y: number };
  script: Script;
  showScriptPanel: boolean;
  showCharacterPanel: boolean;
  characters: CharacterDesign[];
  activeSceneId: string;
  imageUploads: File[];
}

// ==================== CUSTOM HOOKS ====================
const useStore = () => {
  const [state, setState] = useState<AppState>({
    elements: [],
    selectedId: null,
    tool: "select",
    color: "#000000",
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: "Arial",
    layers: [
      { id: "layer1", name: "Background", visible: true, locked: false, opacity: 1 },
      { id: "layer2", name: "Characters", visible: true, locked: false, opacity: 1 },
      { id: "layer3", name: "Effects", visible: true, locked: false, opacity: 1 },
      { id: "layer4", name: "Dialogue", visible: true, locked: false, opacity: 1 },
    ],
    currentLayer: "layer2",
    history: [[]],
    historyStep: 0,
    zoom: 1,
    stagePos: { x: 0, y: 0 },
    script: {
      title: "Untitled Manga",
      episode: "Episode 1",
      author: "Author Name",
      scenes: [
        {
          id: "scene1",
          panelNumber: 1,
          description: "Opening scene - Character introduction",
          dialogues: [
            {
              id: "dial1",
              character: "Protagonist",
              text: "This is where the dialogue goes...",
              emotion: "neutral",
              position: { x: 100, y: 100 },
            },
          ],
          background: "street",
          cameraAngle: "medium shot",
        },
      ],
    },
    showScriptPanel: true,
    showCharacterPanel: false,
    characters: [
      {
        id: "char1",
        name: "Protagonist",
        description: "Main character with determination",
        colors: {
          hair: "#2C3E50",
          eyes: "#3498DB",
          skin: "#FAD7A0",
          clothing: "#E74C3C",
        },
        poses: ["standing", "running", "fighting", "sitting"],
        expressions: ["neutral", "happy", "angry", "surprised", "sad"],
      },
      {
        id: "char2",
        name: "Support",
        description: "Supporting character",
        colors: {
          hair: "#F1C40F",
          eyes: "#27AE60",
          skin: "#FAD7A0",
          clothing: "#9B59B6",
        },
        poses: ["standing", "talking", "thinking"],
        expressions: ["neutral", "smiling", "worried"],
      },
    ],
    activeSceneId: "scene1",
    imageUploads: [],
  });

  const addElement = useCallback((element: Omit<CanvasElement, "id" | "layerId" | "visible" | "locked">) => {
    setState((prev) => {
      const newElement: CanvasElement = {
        ...element,
        id: Date.now().toString(),
        layerId: prev.currentLayer,
        visible: true,
        locked: false,
      } as CanvasElement;

      const newElements = [...prev.elements, newElement];
      const newHistory = [...prev.history.slice(0, prev.historyStep + 1), newElements];
      
      return {
        ...prev,
        elements: newElements,
        history: newHistory,
        historyStep: prev.historyStep + 1,
      };
    });
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<CanvasElement>) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...changes } : el
      ),
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  const undo = useCallback(() => {
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
  }, []);

  const redo = useCallback(() => {
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
  }, []);

  const addDialogue = useCallback((sceneId: string, dialogue: Omit<Dialogue, "id">) => {
    setState((prev) => ({
      ...prev,
      script: {
        ...prev.script,
        scenes: prev.script.scenes.map((scene) =>
          scene.id === sceneId
            ? {
                ...scene,
                dialogues: [
                  ...scene.dialogues,
                  { ...dialogue, id: Date.now().toString() },
                ],
              }
            : scene
        ),
      },
    }));
  }, []);

  const updateDialogue = useCallback((sceneId: string, dialogueId: string, changes: Partial<Dialogue>) => {
    setState((prev) => ({
      ...prev,
      script: {
        ...prev.script,
        scenes: prev.script.scenes.map((scene) =>
          scene.id === sceneId
            ? {
                ...scene,
                dialogues: scene.dialogues.map((dial) =>
                  dial.id === dialogueId ? { ...dial, ...changes } : dial
                ),
              }
            : scene
        ),
      },
    }));
  }, []);

  const addCharacter = useCallback((character: Omit<CharacterDesign, "id">) => {
    setState((prev) => ({
      ...prev,
      characters: [
        ...prev.characters,
        { ...character, id: Date.now().toString() },
      ],
    }));
  }, []);

  return {
    state,
    setState,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
    addDialogue,
    updateDialogue,
    addCharacter,
  };
};

// ==================== CANVAS ELEMENT COMPONENTS ====================
interface CanvasElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (changes: Partial<CanvasElement>) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ element, isSelected, onSelect, onTransform }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const commonProps = {
    ref: shapeRef,
    onClick: onSelect,
    onTap: onSelect,
    draggable: isSelected && !element.locked,
    onTransformEnd: handleTransformEnd,
    visible: element.visible,
  };

  switch (element.type) {
    case "line": {
      const lineEl = element as LineElement;
      return (
        <>
          <Line
            {...commonProps}
            points={lineEl.points}
            stroke={lineEl.stroke}
            strokeWidth={lineEl.strokeWidth}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "rect": {
      const rectEl = element as RectElement;
      return (
        <>
          <Rect
            {...commonProps}
            x={rectEl.x}
            y={rectEl.y}
            width={rectEl.width}
            height={rectEl.height}
            fill={rectEl.fill}
            stroke={rectEl.stroke}
            strokeWidth={rectEl.strokeWidth}
            rotation={rectEl.rotation || 0}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "circle": {
      const circleEl = element as CircleElement;
      return (
        <>
          <Circle
            {...commonProps}
            x={circleEl.x}
            y={circleEl.y}
            radius={circleEl.radius}
            fill={circleEl.fill}
            stroke={circleEl.stroke}
            strokeWidth={circleEl.strokeWidth}
            rotation={circleEl.rotation || 0}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "text": {
      const textEl = element as TextElement;
      return (
        <>
          <Text
            {...commonProps}
            x={textEl.x}
            y={textEl.y}
            width={textEl.width}
            height={textEl.height}
            text={textEl.text}
            fontSize={textEl.fontSize}
            fontFamily={textEl.fontFamily}
            fill={textEl.fill}
            align={textEl.align as any}
            rotation={textEl.rotation || 0}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "bubble": {
      const bubbleEl = element as BubbleElement;
      const tailPoints = getTailPoints(bubbleEl);
      
      return (
        <>
          <Group {...commonProps} x={bubbleEl.x} y={bubbleEl.y} rotation={bubbleEl.rotation || 0}>
            {/* Bubble body */}
            <Rect
              width={bubbleEl.width}
              height={bubbleEl.height}
              fill="white"
              stroke={bubbleEl.stroke}
              strokeWidth={bubbleEl.strokeWidth}
              cornerRadius={10}
            />
            
            {/* Speech bubble tail */}
            {tailPoints && (
              <RegularPolygon
                sides={3}
                radius={15}
                fill="white"
                stroke={bubbleEl.stroke}
                strokeWidth={bubbleEl.strokeWidth}
                x={tailPoints.x}
                y={tailPoints.y}
                rotation={tailPoints.rotation}
              />
            )}
            
            {/* Text inside bubble */}
            <Text
              text={bubbleEl.text}
              fontSize={bubbleEl.fontSize}
              fontFamily={bubbleEl.fontFamily}
              fill={bubbleEl.fill}
              width={bubbleEl.width}
              height={bubbleEl.height}
              align="center"
              verticalAlign="middle"
              padding={10}
            />
          </Group>
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "panel": {
      const panelEl = element as PanelElement;
      return (
        <>
          <Rect
            {...commonProps}
            x={panelEl.x}
            y={panelEl.y}
            width={panelEl.width}
            height={panelEl.height}
            fill="rgba(255, 255, 255, 0.1)"
            stroke={panelEl.stroke}
            strokeWidth={panelEl.strokeWidth}
            dash={[5, 5]}
            rotation={panelEl.rotation || 0}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "speedlines": {
      const speedEl = element as SpeedlinesElement;
      const lines = [];
      const centerX = speedEl.x + speedEl.width / 2;
      const centerY = speedEl.y + speedEl.height / 2;
      
      for (let i = 0; i < 15 * speedEl.intensity; i++) {
        const angle = (Math.PI * 2 * i) / (15 * speedEl.intensity);
        const length = 100 + Math.random() * 100;
        const startX = centerX + Math.cos(angle) * 30;
        const startY = centerY + Math.sin(angle) * 30;
        const endX = centerX + Math.cos(angle) * length;
        const endY = centerY + Math.sin(angle) * length;
        
        lines.push(
          <Line
            key={i}
            points={[startX, startY, endX, endY]}
            stroke="#000000"
            strokeWidth={1 + Math.random() * 2}
            opacity={0.6 + Math.random() * 0.4}
          />
        );
      }
      
      return (
        <>
          <Group {...commonProps}>
            {lines}
          </Group>
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "image": {
      const imageEl = element as ImageElement;
      const [image] = useImage(imageEl.src);
      
      return (
        <>
          <KonvaImage
            {...commonProps}
            image={image}
            x={imageEl.x}
            y={imageEl.y}
            width={imageEl.width}
            height={imageEl.height}
            rotation={imageEl.rotation || 0}
          />
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    case "character": {
      const charEl = element as CharacterElement;
      const characterDesign = charEl.color ? { colors: { clothing: charEl.color } } : null;
      
      return (
        <>
          <Group {...commonProps} x={charEl.x} y={charEl.y} rotation={charEl.rotation || 0}>
            {/* Simplified character representation */}
            <Circle
              x={charEl.width / 2}
              y={charEl.height / 3}
              radius={charEl.height / 4}
              fill={characterDesign?.colors?.clothing || "#4A90E2"}
            />
            <Rect
              x={charEl.width / 2 - charEl.width / 8}
              y={charEl.height / 3 + charEl.height / 4}
              width={charEl.width / 4}
              height={charEl.height / 2}
              fill={characterDesign?.colors?.clothing || "#4A90E2"}
              cornerRadius={5}
            />
            <Circle
              x={charEl.width / 2}
              y={charEl.height / 3}
              radius={charEl.height / 8}
              fill="#FAD7A0"
            />
            <Text
              text={`${charEl.expression} ${charEl.pose}`}
              x={0}
              y={charEl.height + 5}
              width={charEl.width}
              align="center"
              fontSize={10}
              fill="#333"
            />
          </Group>
          {isSelected && !element.locked && <Transformer ref={trRef} />}
        </>
      );
    }

    default:
      return null;
  }
};

const getTailPoints = (bubble: BubbleElement) => {
  if (!bubble.tailDirection) return null;
  
  const centerX = bubble.width / 2;
  const centerY = bubble.height / 2;
  
  switch (bubble.tailDirection) {
    case "left":
      return { x: -10, y: centerY, rotation: 90 };
    case "right":
      return { x: bubble.width + 10, y: centerY, rotation: -90 };
    case "top":
      return { x: centerX, y: -10, rotation: 0 };
    case "bottom":
      return { x: centerX, y: bubble.height + 10, rotation: 180 };
    default:
      return { x: -10, y: centerY, rotation: 90 };
  }
};

// ==================== MAIN COMPONENT ====================
const MangaStudio: React.FC = () => {
  const {
    state,
    setState,
    addElement,
    updateElement,
    deleteElement,
    undo,
    redo,
    addDialogue,
    updateDialogue,
    addCharacter,
  } = useStore();
  
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const currentLine = useRef<any>(null);

  const tools = [
    { id: "select" as ToolType, icon: MousePointer, name: "Select" },
    { id: "pan" as ToolType, icon: Hand, name: "Pan" },
    { id: "pen" as ToolType, icon: Pencil, name: "Pen" },
    { id: "eraser" as ToolType, icon: Eraser, name: "Eraser" },
    { id: "rect" as ToolType, icon: Square, name: "Rectangle" },
    { id: "circle" as ToolType, icon: Plus, name: "Circle" },
    { id: "text" as ToolType, icon: Type, name: "Text" },
    { id: "bubble" as ToolType, icon: MessageSquare, name: "Speech Bubble" },
    { id: "panel" as ToolType, icon: Grid3x3, name: "Panel" },
    { id: "speedlines" as ToolType, icon: Zap, name: "Speed Lines" },
    { id: "image" as ToolType, icon: ImageIcon, name: "Image" },
    { id: "character" as ToolType, icon: User, name: "Character" },
  ];

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const relativePos = {
      x: (pos.x - state.stagePos.x) / state.zoom,
      y: (pos.y - state.stagePos.y) / state.zoom,
    };

    // Deselect if clicking on empty space
    if (state.tool === "select" && e.target === stage) {
      setState((prev) => ({ ...prev, selectedId: null }));
      return;
    }

    if (state.tool === "pan") {
      stage.container().style.cursor = "grabbing";
      return;
    }

    if (state.tool === "eraser") {
      // Find element at click position and delete it
      const clickedElement = state.elements.find((el) => {
        if (!el.visible) return false;
        
        // Simple bounding box check (for demo purposes)
        return (
          relativePos.x >= el.x &&
          relativePos.x <= el.x + (el as any).width &&
          relativePos.y >= el.y &&
          relativePos.y <= el.y + (el as any).height
        );
      });
      
      if (clickedElement) {
        deleteElement(clickedElement.id);
      }
      return;
    }

    if (["pen", "rect", "circle", "panel", "speedlines"].includes(state.tool)) {
      isDrawing.current = true;

      if (state.tool === "pen") {
        currentLine.current = {
          type: "line",
          points: [relativePos.x, relativePos.y],
          stroke: state.color,
          strokeWidth: state.strokeWidth,
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
        };
      } else if (state.tool === "panel") {
        currentLine.current = {
          type: "panel",
          x: relativePos.x,
          y: relativePos.y,
          width: 0,
          height: 0,
          stroke: "#000000",
          strokeWidth: 4,
        };
      } else if (state.tool === "speedlines") {
        currentLine.current = {
          type: "speedlines",
          x: relativePos.x,
          y: relativePos.y,
          width: 200,
          height: 200,
          intensity: 2,
        };
      }
    } else if (state.tool === "bubble") {
      addElement({
        type: "bubble",
        x: relativePos.x,
        y: relativePos.y,
        width: 200,
        height: 100,
        text: "Click to edit dialogue...",
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: 2,
        tailDirection: "left",
      });
    } else if (state.tool === "text") {
      addElement({
        type: "text",
        x: relativePos.x,
        y: relativePos.y,
        width: 150,
        height: 40,
        text: "Edit text...",
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        fill: state.color,
        align: "left",
      });
    } else if (state.tool === "character") {
      const randomCharacter = state.characters[Math.floor(Math.random() * state.characters.length)];
      addElement({
        type: "character",
        x: relativePos.x,
        y: relativePos.y,
        characterId: randomCharacter.id,
        pose: randomCharacter.poses[0],
        expression: randomCharacter.expressions[0],
        width: 100,
        height: 200,
        color: randomCharacter.colors.clothing,
      });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.tool === "pan" && isDrawing.current) {
      const stage = e.target.getStage();
      if (!stage) return;

      const point = stage.getPointerPosition();
      if (!point) return;

      setState((prev) => ({
        ...prev,
        stagePos: {
          x: prev.stagePos.x + e.evt.movementX,
          y: prev.stagePos.y + e.evt.movementY,
        },
      }));
      return;
    }

    if (!isDrawing.current || !currentLine.current) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const relativePos = {
      x: (pos.x - state.stagePos.x) / state.zoom,
      y: (pos.y - state.stagePos.y) / state.zoom,
    };

    if (state.tool === "pen" && currentLine.current.type === "line") {
      const points = [...currentLine.current.points, relativePos.x, relativePos.y];
      currentLine.current = { ...currentLine.current, points };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([{ ...currentLine.current, id: "temp", layerId: prev.currentLayer } as CanvasElement]),
      }));
    } else if (["rect", "panel"].includes(state.tool) && ["rect", "panel"].includes(currentLine.current.type)) {
      const width = relativePos.x - currentLine.current.x;
      const height = relativePos.y - currentLine.current.y;
      currentLine.current = { ...currentLine.current, width, height };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([{ ...currentLine.current, id: "temp", layerId: prev.currentLayer } as CanvasElement]),
      }));
    } else if (state.tool === "circle" && currentLine.current.type === "circle") {
      const dx = relativePos.x - currentLine.current.x;
      const dy = relativePos.y - currentLine.current.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      currentLine.current = { ...currentLine.current, radius };

      setState((prev) => ({
        ...prev,
        elements: prev.elements
          .filter((el) => el.id !== "temp")
          .concat([{ ...currentLine.current, id: "temp", layerId: prev.currentLayer } as CanvasElement]),
      }));
    }
  };

  const handleMouseUp = () => {
    if (state.tool === "pan") {
      const stage = stageRef.current;
      if (stage) {
        stage.container().style.cursor = "grab";
      }
    }

    if (isDrawing.current && currentLine.current) {
      setState((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => el.id !== "temp"),
      }));

      if (["rect", "panel", "circle", "speedlines"].includes(currentLine.current.type)) {
        if (
          (currentLine.current.type === "rect" || currentLine.current.type === "panel") &&
          Math.abs(currentLine.current.width) > 5 &&
          Math.abs(currentLine.current.height) > 5
        ) {
          addElement(currentLine.current);
        } else if (currentLine.current.type === "circle" && currentLine.current.radius > 5) {
          addElement(currentLine.current);
        } else if (currentLine.current.type === "speedlines") {
          addElement(currentLine.current);
        }
      } else if (currentLine.current.type === "line" && currentLine.current.points.length > 2) {
        addElement(currentLine.current);
      }
    }

    isDrawing.current = false;
    currentLine.current = null;
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

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

  const handleExport = (format: "png" | "jpg") => {
    const stage = stageRef.current;
    if (!stage) return;

    const uri = stage.toDataURL({
      mimeType: format === "png" ? "image/png" : "image/jpeg",
      quality: 0.9,
      pixelRatio: 3,
    });
    
    const link = document.createElement("a");
    link.download = `${state.script.title}-${state.script.episode}.${format}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        addElement({
          type: "image",
          src,
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          originalWidth: 200,
          originalHeight: 200,
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedElement = state.elements.find((el) => el.id === state.selectedId);
  const activeScene = state.script.scenes.find((s) => s.id === state.activeSceneId);

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
          disabled={state.historyStep === 0}
        >
          <Undo size={20} />
        </button>
        <button
          onClick={redo}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Redo"
          disabled={state.historyStep === state.history.length - 1}
        >
          <Redo size={20} />
        </button>
        <button
          onClick={() => state.selectedId && deleteElement(state.selectedId)}
          className="p-3 rounded-lg hover:bg-red-600"
          title="Delete"
          disabled={!state.selectedId}
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-lg hover:bg-gray-700"
          title="Upload Image"
        >
          <Upload size={20} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-700 overflow-hidden relative">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 64 - 600}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          scaleX={state.zoom}
          scaleY={state.zoom}
          x={state.stagePos.x}
          y={state.stagePos.y}
          style={{ cursor: state.tool === "pan" ? "grab" : "default" }}
        >
          <Layer>
            {state.elements
              .filter((el) => {
                const layer = state.layers.find((l) => l.id === el.layerId);
                return layer?.visible && el.visible;
              })
              .map((element) => (
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
                  onTransform={(changes) => updateElement(element.id, changes)}
                />
              ))}
          </Layer>
        </Stage>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-gray-800 px-3 py-1 rounded">
          {Math.round(state.zoom * 100)}%
        </div>
      </div>

      {/* Properties & Script Panel */}
      <div className="w-96 bg-gray-800 p-4 overflow-y-auto flex flex-col space-y-6">
        {/* Script Panel */}
        {state.showScriptPanel && (
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen size={20} /> Script
              </h2>
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    script: {
                      ...prev.script,
                      scenes: [
                        ...prev.script.scenes,
                        {
                          id: `scene${prev.script.scenes.length + 1}`,
                          panelNumber: prev.script.scenes.length + 1,
                          description: "New scene description",
                          dialogues: [],
                          background: "",
                          cameraAngle: "",
                        },
                      ],
                    },
                  })
                }
                className="p-2 hover:bg-gray-700 rounded"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Scene Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-2">Current Scene</label>
              <select
                value={state.activeSceneId}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, activeSceneId: e.target.value }))
                }
                className="w-full p-2 bg-gray-700 rounded"
              >
                {state.script.scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    Panel {scene.panelNumber}: {scene.description.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            {activeScene && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Scene Description</label>
                  <textarea
                    value={activeScene.description}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        script: {
                          ...prev.script,
                          scenes: prev.script.scenes.map((s) =>
                            s.id === activeScene.id
                              ? { ...s, description: e.target.value }
                              : s
                          ),
                        },
                      }))
                    }
                    className="w-full p-2 bg-gray-700 rounded text-sm"
                    rows={3}
                  />
                </div>

                {/* Dialogues */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Dialogues</h3>
                    <button
                      onClick={() =>
                        addDialogue(activeScene.id, {
                          character: state.characters[0]?.name || "Character",
                          text: "New dialogue...",
                          emotion: "neutral",
                          position: { x: 100, y: 100 },
                        })
                      }
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {activeScene.dialogues.map((dialogue) => (
                    <div key={dialogue.id} className="p-3 bg-gray-800 rounded mb-2">
                      <div className="flex justify-between mb-2">
                        <select
                          value={dialogue.character}
                          onChange={(e) =>
                            updateDialogue(activeScene.id, dialogue.id, {
                              character: e.target.value,
                            })
                          }
                          className="bg-gray-700 rounded px-2 py-1 text-sm"
                        >
                          {state.characters.map((char) => (
                            <option key={char.id} value={char.name}>
                              {char.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dialogue.emotion}
                          onChange={(e) =>
                            updateDialogue(activeScene.id, dialogue.id, {
                              emotion: e.target.value,
                            })
                          }
                          className="bg-gray-700 rounded px-2 py-1 text-sm"
                        >
                          <option value="neutral">😐 Neutral</option>
                          <option value="happy">😊 Happy</option>
                          <option value="angry">😠 Angry</option>
                          <option value="sad">😢 Sad</option>
                          <option value="surprised">😲 Surprised</option>
                        </select>
                      </div>
                      <textarea
                        value={dialogue.text}
                        onChange={(e) =>
                          updateDialogue(activeScene.id, dialogue.id, {
                            text: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-gray-700 rounded text-sm"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Properties Panel */}
        <div>
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
              max="50"
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

              {["text", "bubble"].includes(selectedElement.type) && (
                <div className="mb-2">
                  <label className="block text-sm mb-1">Text</label>
                  <textarea
                    value={(selectedElement as any).text}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { text: e.target.value })
                    }
                    className="w-full p-2 bg-gray-600 rounded text-sm"
                    rows={3}
                  />
                </div>
              )}

              {selectedElement.type === "bubble" && (
                <div className="mb-2">
                  <label className="block text-sm mb-1">Tail Direction</label>
                  <select
                    value={(selectedElement as any).tailDirection || "left"}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        tailDirection: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-gray-600 rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              )}

              {selectedElement.type === "character" && (
                <div className="mb-2">
                  <label className="block text-sm mb-1">Character</label>
                  <select
                    value={(selectedElement as CharacterElement).characterId}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        characterId: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-gray-600 rounded text-sm"
                  >
                    {state.characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      visible: !selectedElement.visible,
                    })
                  }
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded flex items-center justify-center gap-2"
                >
                  {selectedElement.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  {selectedElement.visible ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      locked: !selectedElement.locked,
                    })
                  }
                  className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded flex items-center justify-center gap-2"
                >
                  {selectedElement.locked ? <Unlock size={16} /> : <Lock size={16} />}
                  {selectedElement.locked ? "Unlock" : "Lock"}
                </button>
              </div>

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
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    layers: [
                      ...prev.layers,
                      {
                        id: `layer${prev.layers.length + 1}`,
                        name: `Layer ${prev.layers.length + 1}`,
                        visible: true,
                        locked: false,
                        opacity: 1,
                      },
                    ],
                  }))
                }
                className="p-1 hover:bg-gray-700 rounded"
              >
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
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === layer.id ? { ...l, visible: !l.visible } : l
                        ),
                      }));
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === layer.id ? { ...l, locked: !l.locked } : l
                        ),
                      }));
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
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
                    stroke: "#000000",
                    strokeWidth: 4,
                  });
                  addElement({
                    type: "character",
                    x: 100,
                    y: 150,
                    characterId: state.characters[0]?.id || "char1",
                    pose: "standing",
                    expression: "neutral",
                    width: 80,
                    height: 180,
                  });
                }}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
              >
                Single Panel
              </button>
              <button
                onClick={() => {
                  // Create a 2-panel layout
                  addElement({
                    type: "panel",
                    x: 50,
                    y: 50,
                    width: 250,
                    height: 350,
                    stroke: "#000000",
                    strokeWidth: 4,
                  });
                  addElement({
                    type: "panel",
                    x: 320,
                    y: 50,
                    width: 250,
                    height: 350,
                    stroke: "#000000",
                    strokeWidth: 4,
                  });
                }}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded text-xs"
              >
                2-Panel Layout
              </button>
              <button
                onClick={() => {
                  addElement({
                    type: "speedlines",
                    x: 150,
                    y: 150,
                    width: 300,
                    height: 300,
                    intensity: 3,
                  });
                  addElement({
                    type: "character",
                    x: 250,
                    y: 200,
                    characterId: state.characters[0]?.id || "char1",
                    pose: "running",
                    expression: "determined",
                    width: 100,
                    height: 200,
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
                    text: "IMPACT!",
                    fontSize: 32,
                    fontFamily: "Impact, sans-serif",
                    fill: "#000",
                    stroke: "#000",
                    strokeWidth: 3,
                    tailDirection: "bottom",
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

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default MangaStudio;