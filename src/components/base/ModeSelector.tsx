import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, LayoutGrid, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  { id: "script", label: "Script Builder", icon: FileText },
  { id: "draw", label: "Draw", icon: Pencil },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "dialogue", label: "Dialogue", icon: MessageCircle },
];

export default function ModeSelector({ activeMode, setActiveMode }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 bg-[#1a1a1a]/90 backdrop-blur-sm rounded-full px-2 py-1.5 border border-[#2d2d2d]">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full px-4 h-8 text-xs transition-all",
              activeMode === mode.id
                ? "bg-white text-black hover:bg-white hover:text-black"
                : "text-gray-400 hover:text-white hover:bg-[#2d2d2d]",
            )}
            onClick={() => setActiveMode(mode.id)}
          >
            <mode.icon className="h-3.5 w-3.5 mr-1.5" />
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
