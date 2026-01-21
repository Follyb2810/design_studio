import React, { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Transformer,
  Group,
  Rect,
  Line,
  Tag,
  Text,
  Circle,
} from "react-konva";
import Konva from "konva";

import EditableText from "./EditableText";
import ImageAdjustPanel from "./ImageAdjustPanel";
import CropEditor from "./CropEditor";
import BubbleEditor from "./BubbleEditor";
import { useEditor } from "@/store/useStore";
import { useImage } from "@/hooks/useImage";

/*
  Canvas editor:
  - renders nodes from store
  - supports: image crop overlay (draggable Rect), image filters, bubble rendering with tail anchor draggable
  - bubble auto resizing happens in BubbleNode render when text changes (naive approach)
*/

export default function CanvasEditor() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const nodes = useEditor((s) => s.nodes);
  const selectedId = useEditor((s) => s.selectedId);
  const selectNode = useEditor((s) => s.actions.selectNode);
  const updateNode = useEditor((s) => s.actions.updateNode);
  const addText = useEditor((s) => s.actions.addText);
  const addPath = useEditor((s) => s.actions.addPath);
  const mode = useEditor((s) => s.mode);

  // pen drawing
  const [drawingPoints, setDrawingPoints] = useState<number[] | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const tr = trRef.current;
    if (!layer || !tr) return;
    tr.nodes([]);
    if (selectedId) {
      const sel = layer.findOne(`#${selectedId}`);
      if (sel) {
        tr.nodes([sel]);
        tr.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, nodes]);

  function handleStageMouseDown(e: any) {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    if (mode === "text") {
      addText(pos.x - 50, pos.y - 20);
      return;
    }

    if (mode === "pen") {
      setDrawingPoints([pos.x, pos.y]);
      return;
    }

    // deselect if click on empty background
    if (e.target === e.target.getStage()) {
      selectNode(null);
    }
  }

  function handleStageMouseMove(e: any) {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    if (mode === "pen" && drawingPoints) {
      setDrawingPoints((p) => (p ? [...p, pos.x, pos.y] : p));
    }
  }

  function handleStageMouseUp(e: any) {
    if (mode === "pen" && drawingPoints) {
      const id = "path-" + Date.now();
      addPath({
        id,
        type: "path",
        points: drawingPoints,
        stroke: "#000",
        strokeWidth: 2,
        x: 0,
        y: 0,
        z: nodes.length,
      });
      setDrawingPoints(null);
    }
  }

  async function exportImage(type: "png" | "jpeg", pixelRatio = 2) {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({
      mimeType: type === "png" ? "image/png" : "image/jpeg",
      pixelRatio,
    });
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = `manga_${Date.now()}.${type === "png" ? "png" : "jpg"}`;
    a.click();
  }

  return (
    <div className="flex gap-4">
      <div>
        <div className="mb-3 flex gap-2">
          <button
            className="bg-emerald-600 px-3 py-1 rounded"
            onClick={() => exportImage("png", 2)}
          >
            Export PNG (2x)
          </button>
          <button
            className="bg-emerald-500 px-3 py-1 rounded"
            onClick={() => exportImage("jpeg", 2)}
          >
            Export JPG (2x)
          </button>
        </div>

        <Stage
          width={1024}
          height={768}
          ref={(r) => (stageRef.current = r)}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          style={{ background: "#0b0b0b", borderRadius: 6 }}
        >
          <Layer ref={(l) => (layerRef.current = l)}>
            <Group x={32} y={32}>
              <Rect
                width={960}
                height={704}
                fill="#111"
                stroke="#222"
                strokeWidth={2}
                cornerRadius={4}
              />
            </Group>

            {nodes.map((n) => {
              if (n.type === "image") {
                return (
                  <ImageNode
                    key={n.id}
                    node={n}
                    isSelected={selectedId === n.id}
                    onSelect={() => selectNode(n.id)}
                    onChange={(p: any) => updateNode(n.id, p)}
                  />
                );
              }
              if (n.type === "text") {
                return (
                  <EditableText
                    key={n.id}
                    node={n}
                    isSelected={selectedId === n.id}
                    onChange={(p: any) => updateNode(n.id, p)}
                    stageRef={stageRef}
                  />
                );
              }
              if (n.type === "path") {
                return (
                  <Line
                    key={n.id}
                    id={n.id}
                    points={n.points}
                    stroke={n.stroke}
                    strokeWidth={n.strokeWidth}
                    tension={0.2}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => selectNode(n.id)}
                    onTap={() => selectNode(n.id)}
                    draggable
                    onDragEnd={(e) =>
                      updateNode(n.id, { x: e.target.x(), y: e.target.y() })
                    }
                  />
                );
              }
              if (n.type === "bubble") {
                return (
                  <BubbleNode
                    key={n.id}
                    node={n}
                    isSelected={selectedId === n.id}
                    onSelect={() => selectNode(n.id)}
                    onChange={(p: any) => updateNode(n.id, p)}
                    stageRef={stageRef}
                  />
                );
              }
              return null;
            })}

            {drawingPoints && (
              <Line
                points={drawingPoints}
                stroke="#000"
                strokeWidth={2}
                tension={0.2}
                lineCap="round"
                lineJoin="round"
              />
            )}

            <Transformer
              ref={trRef}
              rotateEnabled
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
            />
          </Layer>
        </Stage>
      </div>

      {/* Right panels */}
      <div className="w-80 space-y-4">
        <div className="bg-neutral-800 p-3 rounded">
          <h4 className="font-medium">Image Adjust</h4>
          <ImageAdjustPanel />
        </div>

        <div className="bg-neutral-800 p-3 rounded">
          <h4 className="font-medium">Crop</h4>
          <CropEditor />
        </div>

        <div className="bg-neutral-800 p-3 rounded">
          <h4 className="font-medium">Bubble</h4>
          <BubbleEditor />
        </div>
      </div>
    </div>
  );
}

/* Image node with crop overlay and filters */
function ImageNode({ node, isSelected, onSelect, onChange }: any) {
  const img = useImage(node.src);
  const imgRef = useRef<Konva.Image | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);
  const cropRectRef = useRef<Konva.Rect | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const k = imgRef.current;
    // set filters if adjustments present
    const filters: any[] = [];
    if (node.brightness !== undefined && node.brightness !== 0)
      filters.push(Konva.Filters.Brighten);
    if (node.contrast !== undefined && node.contrast !== 0)
      filters.push(Konva.Filters.Contrast);
    k.filters(filters);
    (k as any).brightness(node.brightness ?? 0);
    (k as any).contrast(node.contrast ?? 0);
    k.getLayer()?.batchDraw();
  }, [node.brightness, node.contrast, imgRef.current, img]);

  // Interactive crop handle: only show when selected
  function onCropDragEnd(e: any) {
    const r = e.target;
    const crop = {
      x: Math.max(0, r.x()),
      y: Math.max(0, r.y()),
      width: r.width() * r.scaleX(),
      height: r.height() * r.scaleY(),
    };
    onChange({ crop });
    r.scaleX(1);
    r.scaleY(1);
  }

  return (
    <Group
      id={node.id}
      x={node.x}
      y={node.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      ref={groupRef}
    >
      <Group>
        <KonvaImage
          image={img ?? undefined}
          x={-(node.crop?.x || 0)}
          y={-(node.crop?.y || 0)}
          width={node.width}
          height={node.height}
          ref={imgRef}
          listening
        />
      </Group>

      {/* crop rect overlay when selected */}
      {isSelected && (
        <Rect
          x={node.crop?.x || 0}
          y={node.crop?.y || 0}
          width={(node.crop?.width ?? node.width) || 100}
          height={(node.crop?.height ?? node.height) || 100}
          stroke="#60a5fa"
          strokeWidth={2}
          dash={[6, 6]}
          draggable
          onDragEnd={onCropDragEnd}
          onTransformEnd={(e) => {
            const r = e.target;
            const crop = {
              x: Math.max(0, r.x()),
              y: Math.max(0, r.y()),
              width: Math.max(10, r.width() * r.scaleX()),
              height: Math.max(10, r.height() * r.scaleY()),
            };
            onChange({ crop });
            r.scaleX(1);
            r.scaleY(1);
          }}
          ref={cropRectRef}
        />
      )}

      <Rect
        x={0}
        y={0}
        width={node.width}
        height={node.height}
        stroke={isSelected ? "#3b82f6" : "transparent"}
        strokeWidth={2}
        dash={[6, 4]}
      />
    </Group>
  );
}

/* Bubble node: Tag + Text + tail anchor (draggable) */
function BubbleNode({ node, isSelected, onSelect, onChange, stageRef }: any) {
  const groupRef = useRef<Konva.Group | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const tailAnchorRef = useRef<Konva.Circle | null>(null);

  // When text changes, auto-size bubble (naive measurement)
  useEffect(() => {
    if (!textRef.current) return;
    const t = textRef.current;
    // measure using Konva.Text's width/height
    const w = t.width() + 24;
    const h = t.height() + 24;
    if (Math.abs(w - node.width) > 2 || Math.abs(h - node.height) > 2) {
      onChange({ width: w, height: h });
    }
  }, [node.text, node.fontSize]);

  function onTailDragEnd(e: any) {
    const abs = e.target.getAbsolutePosition();
    onChange({ tail: { x: abs.x, y: abs.y } });
  }

  return (
    <Group
      id={node.id}
      x={node.x}
      y={node.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e: any) => onChange({ x: e.target.x(), y: e.target.y() })}
      ref={groupRef}
      rotation={node.rotation || 0}
    >
      {/* tail as a line from bubble center bottom to anchor */}
      <Line
        points={[
          node.width / 2,
          node.height,
          (node.tail?.x ?? node.x + node.width / 2) - node.x,
          (node.tail?.y ?? node.y + node.height + 30) - node.y,
        ]}
        stroke="#fff"
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
      />

      <Tag
        x={0}
        y={0}
        width={node.width}
        height={node.height}
        fill={node.fill}
        stroke="#222"
        strokeWidth={2}
        cornerRadius={8}
        shadowBlur={6}
      />

      <Text
        x={12}
        y={12}
        width={node.width - 24}
        text={node.text}
        fontSize={node.fontSize}
        fill={node.textColor || "#000"}
        ref={textRef}
        listening
      />

      {/* show tail anchor (draggable) when selected */}
      {isSelected && (
        <Circle
          x={(node.tail?.x ?? node.x + node.width / 2) - node.x}
          y={(node.tail?.y ?? node.y + node.height + 30) - node.y}
          radius={8}
          fill="#f97316"
          draggable
          onDragEnd={onTailDragEnd}
          ref={tailAnchorRef}
        />
      )}

      {/* selection outline when selected */}
      <Rect
        x={0}
        y={0}
        width={node.width}
        height={node.height}
        stroke={isSelected ? "#3b82f6" : "transparent"}
        strokeWidth={2}
        dash={[6, 4]}
      />
    </Group>
  );
}
