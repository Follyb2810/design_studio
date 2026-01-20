import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Maximize2, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CanvasArea({
  elements,
  selectedId,
  activeTool,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  canvasWidth = 680,
  canvasHeight = 960,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [tempElement, setTempElement] = useState(null);

  // Get mouse position relative to canvas
  const getCanvasPosition = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / (zoom / 100),
        y: (e.clientY - rect.top) / (zoom / 100),
      };
    },
    [zoom],
  );

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (e.target !== canvasRef.current) return;

    const pos = getCanvasPosition(e);

    if (
      activeTool === "move" ||
      e.button === 1 ||
      (e.button === 0 && e.altKey)
    ) {
      setIsPanning(true);
      return;
    }

    if (
      ["rectangle", "circle", "triangle", "line", "star", "polygon"].includes(
        activeTool,
      )
    ) {
      setIsDrawing(true);
      setDrawStart(pos);
      setTempElement({
        type: activeTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        opacity: 1,
      });
    }

    if (activeTool === "text") {
      const newElement = {
        id: `element-${Date.now()}`,
        type: "text",
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 40,
        text: "Double click to edit",
        fontSize: 16,
        fontFamily: "Inter",
        fill: "#ffffff",
        opacity: 1,
      };
      onAddElement(newElement);
    }

    if (activeTool === "speechBubble") {
      const newElement = {
        id: `element-${Date.now()}`,
        type: "speechBubble",
        x: pos.x,
        y: pos.y,
        width: 150,
        height: 80,
        text: "Speech bubble",
        fontSize: 14,
        fontFamily: "Comic Sans MS",
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2,
        opacity: 1,
        cornerRadius: 12,
      };
      onAddElement(newElement);
    }

    if (activeTool === "select") {
      onSelectElement(null);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      return;
    }

    if (isDrawing && drawStart) {
      const pos = getCanvasPosition(e);
      const width = pos.x - drawStart.x;
      const height = pos.y - drawStart.y;

      setTempElement((prev) => ({
        ...prev,
        width: Math.abs(width),
        height: activeTool === "line" ? 0 : Math.abs(height),
        x: width < 0 ? pos.x : drawStart.x,
        y: height < 0 ? pos.y : drawStart.y,
        endX: activeTool === "line" ? pos.x : undefined,
        endY: activeTool === "line" ? pos.y : undefined,
      }));
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsPanning(false);

    if (
      isDrawing &&
      tempElement &&
      (tempElement.width > 5 || tempElement.height > 5)
    ) {
      const newElement = {
        ...tempElement,
        id: `element-${Date.now()}`,
      };
      onAddElement(newElement);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setTempElement(null);
  };

  // Handle element click
  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    if (activeTool === "select") {
      onSelectElement(elementId);
    }
  };

  // Handle element drag
  const handleElementDrag = (e, element) => {
    if (element.locked || activeTool !== "select") return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = element.x;
    const startElY = element.y;

    const handleDragMove = (moveE) => {
      const dx = (moveE.clientX - startX) / (zoom / 100);
      const dy = (moveE.clientY - startY) / (zoom / 100);
      onUpdateElement(element.id, {
        x: startElX + dx,
        y: startElY + dy,
      });
    };

    const handleDragEnd = () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  // Render element
  const renderElement = (element) => {
    if (element.visible === false) return null;

    const isSelected = selectedId === element.id;
    const baseStyle = {
      position: "absolute",
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      opacity: element.opacity,
      transform: `rotate(${element.rotation || 0}deg) scaleX(${element.scaleX || 1}) scaleY(${element.scaleY || 1})`,
      cursor: activeTool === "select" ? "move" : "default",
      pointerEvents: element.locked ? "none" : "auto",
    };

    const selectionStyle = isSelected
      ? {
          outline: "2px solid #8b5cf6",
          outlineOffset: "2px",
        }
      : {};

    switch (element.type) {
      case "rectangle":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              backgroundColor: element.fill,
              border: `${element.strokeWidth}px solid ${element.stroke}`,
              borderRadius: element.cornerRadius || 0,
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          />
        );

      case "circle":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              backgroundColor: element.fill,
              border: `${element.strokeWidth}px solid ${element.stroke}`,
              borderRadius: "50%",
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          />
        );

      case "triangle":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              width: 0,
              height: 0,
              backgroundColor: "transparent",
              borderLeft: `${element.width / 2}px solid transparent`,
              borderRight: `${element.width / 2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.fill}`,
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          />
        );

      case "line":
        const lineLength = Math.sqrt(
          Math.pow((element.endX || element.x + element.width) - element.x, 2) +
            Math.pow((element.endY || element.y) - element.y, 2),
        );
        const lineAngle =
          (Math.atan2(
            (element.endY || element.y) - element.y,
            (element.endX || element.x + element.width) - element.x,
          ) *
            180) /
          Math.PI;

        return (
          <div
            key={element.id}
            style={{
              position: "absolute",
              left: element.x,
              top: element.y,
              width: lineLength,
              height: element.strokeWidth,
              backgroundColor: element.stroke,
              transformOrigin: "0 50%",
              transform: `rotate(${lineAngle}deg)`,
              cursor: activeTool === "select" ? "move" : "default",
              ...(isSelected && selectionStyle),
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          />
        );

      case "text":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              color: element.fill,
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textDecoration: element.textDecoration,
              textAlign: element.textAlign,
              display: "flex",
              alignItems: "center",
              justifyContent:
                element.textAlign === "center"
                  ? "center"
                  : element.textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          >
            {element.text}
          </div>
        );

      case "speechBubble":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              backgroundColor: element.fill,
              border: `${element.strokeWidth}px solid ${element.stroke}`,
              borderRadius: element.cornerRadius || 12,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: element.stroke,
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          >
            {element.text}
            {/* Tail */}
            <div
              style={{
                position: "absolute",
                bottom: -10,
                left: 20,
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: `10px solid ${element.fill}`,
              }}
            />
          </div>
        );

      case "star":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          >
            <svg
              viewBox="0 0 100 100"
              width={element.width}
              height={element.height}
            >
              <polygon
                points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                fill={element.fill}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            </svg>
          </div>
        );

      case "polygon":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleElementDrag(e, element)}
          >
            <svg
              viewBox="0 0 100 100"
              width={element.width}
              height={element.height}
            >
              <polygon
                points="50,5 95,35 80,90 20,90 5,35"
                fill={element.fill}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
              />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  // Render temporary element while drawing
  const renderTempElement = () => {
    if (!tempElement) return null;
    return renderElement({ ...tempElement, id: "temp" });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#0d0d0d] overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas Wrapper */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative bg-[#1a1a1a] shadow-2xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
            backgroundImage: showGrid
              ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
              : "none",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Elements */}
          {elements.map(renderElement)}
          {renderTempElement()}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#2d2d2d]">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-white"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 className={cn("h-4 w-4", showGrid && "text-purple-400")} />
        </Button>

        <div className="h-4 w-px bg-[#2d2d2d]" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-white"
          onClick={() => setZoom(Math.max(10, zoom - 10))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="w-24">
          <Slider
            value={[zoom]}
            onValueChange={([val]) => setZoom(val)}
            min={10}
            max={200}
            step={5}
            className="w-full"
          />
        </div>

        <span className="text-xs text-gray-400 w-10">{zoom}%</span>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-white"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-white"
          onClick={() => {
            setZoom(100);
            setPanOffset({ x: 0, y: 0 });
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
