import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  Move,
  Pencil,
  Square,
  Circle,
  Minus,
  Type,
  Image,
  Eraser,
  PenTool,
  Triangle,
  Star,
  MessageSquare,
  Hexagon,
  Spline,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "select", icon: MousePointer2, label: "Select (V)", shortcut: "V" },
  { id: "move", icon: Move, label: "Move (M)", shortcut: "M" },
  { id: "pen", icon: Pencil, label: "Pen (P)", shortcut: "P" },
];

const shapes = [
  { id: "rectangle", icon: Square, label: "Rectangle (R)", shortcut: "R" },
  { id: "circle", icon: Circle, label: "Circle (C)", shortcut: "C" },
  { id: "triangle", icon: Triangle, label: "Triangle (T)", shortcut: "T" },
  { id: "line", icon: Minus, label: "Line (L)", shortcut: "L" },
  { id: "star", icon: Star, label: "Star", shortcut: null },
  { id: "polygon", icon: Hexagon, label: "Polygon", shortcut: null },
];

const extras = [
  { id: "text", icon: Type, label: "Text (X)", shortcut: "X" },
  {
    id: "speechBubble",
    icon: MessageSquare,
    label: "Speech Bubble (B)",
    shortcut: "B",
  },
  { id: "image", icon: Image, label: "Image (I)", shortcut: "I" },
  { id: "path", icon: Spline, label: "Path Tool", shortcut: null },
  { id: "eraser", icon: Eraser, label: "Eraser (E)", shortcut: "E" },
];

export default function ToolsPanel({ activeTool, setActiveTool }) {
  const ToolButton = ({ tool }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg transition-all",
              activeTool === tool.id
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "text-gray-400 hover:text-white hover:bg-[#2d2d2d]",
            )}
            onClick={() => setActiveTool(tool.id)}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[#252525] border-[#3d3d3d] text-white"
        >
          <p>{tool.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="w-14 bg-[#1a1a1a] border-r border-[#2d2d2d] flex flex-col items-center py-3 gap-1">
      <span className="text-[10px] text-gray-500 mb-2 font-medium">Tools</span>

      {/* Selection Tools */}
      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>

      <Separator className="my-2 w-8 bg-[#2d2d2d]" />

      {/* Shapes */}
      <div className="flex flex-col gap-1">
        {shapes.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>

      <Separator className="my-2 w-8 bg-[#2d2d2d]" />

      {/* Text & Extras */}
      <div className="flex flex-col gap-1">
        {extras.map((tool) => (
          <ToolButton key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
