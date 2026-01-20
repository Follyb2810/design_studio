import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Square,
  Circle,
  Type,
  Image,
  Triangle,
  Minus,
  Star,
  Hexagon,
  MessageSquare,
  Trash2,
  Plus,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getElementIcon = (type) => {
  const icons = {
    rectangle: Square,
    circle: Circle,
    triangle: Triangle,
    line: Minus,
    star: Star,
    polygon: Hexagon,
    text: Type,
    image: Image,
    speechBubble: MessageSquare,
  };
  return icons[type] || Square;
};

export default function LayersPanel({
  elements,
  selectedId,
  onSelectElement,
  onToggleVisibility,
  onToggleLock,
  onDeleteElement,
  onReorderElements,
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="bg-[#1a1a1a] border-t border-[#2d2d2d]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#252525]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
          <Layers className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-300">Layers</span>
          <span className="text-[10px] text-gray-500">({elements.length})</span>
        </div>
      </div>

      {/* Layers List */}
      {!collapsed && (
        <ScrollArea className="h-40">
          <div className="px-2 pb-2 space-y-0.5">
            {elements.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                No elements yet
              </div>
            ) : (
              [...elements].reverse().map((element, index) => {
                const Icon = getElementIcon(element.type);
                return (
                  <div
                    key={element.id}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors",
                      selectedId === element.id
                        ? "bg-purple-600/20 border border-purple-500/50"
                        : "hover:bg-[#252525] border border-transparent",
                    )}
                    onClick={() => onSelectElement(element.id)}
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300 flex-1 truncate">
                      {element.name ||
                        `${element.type} ${elements.length - index}`}
                    </span>

                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(element.id);
                        }}
                      >
                        {element.visible === false ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(element.id);
                        }}
                      >
                        {element.locked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(element.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
