import React from "react";
import {
  Upload,
  Type,
  Square,
  Download,
  Trash2,
  Speech,
  Cloud,
  Minus,
  Ellipsis,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToolbarProps {
  onAddRect: () => void;
  onAddEllipse: () => void;
  onAddText: () => void;
  onAddLine: () => void;
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onExport: () => void;
  onAddPanel: (layout: "single" | "grid-2x1" | "grid-1x2" | "grid-2x2") => void;
  onAddSpeechBubble: (variant: "speech" | "thought") => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddRect,
  onAddEllipse,
  onAddText,
  onAddLine,
  onAddImage,
  onDelete,
  onExport,
  onAddPanel,
  onAddSpeechBubble,
}) => (
  <div className="p-4 bg-white shadow flex flex-col gap-3 overflow-y-auto max-h-screen">
    <div className="font-semibold text-lg mb-1">Design Studio</div>

    <Button variant="default" onClick={onAddRect}>
      <Square size={16} className="mr-2" /> Rectangle
    </Button>
    <Button variant="default" onClick={onAddEllipse}>
      <Ellipsis size={16} /> Ellipse
    </Button>
    <Button variant="default" onClick={onAddLine}>
      <Minus size={16} className="mr-2" /> Line
    </Button>

    <Button variant="default" onClick={onAddText}>
      <Type size={16} className="mr-2" /> Text
    </Button>
    <label className="flex justify-center">
      <Button variant="outline" asChild className="w-full justify-start">
        <span>
          <Upload size={16} className="mr-2" /> Image
        </span>
      </Button>
      <input hidden type="file" accept="image/*" onChange={onAddImage} />
    </label>

    <div className="border-t pt-3 mt-2">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Comic Panels
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddPanel("single")}
        >
          Single
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddPanel("grid-2x1")}
        >
          2 horiz
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddPanel("grid-1x2")}
        >
          2 vert
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onAddPanel("grid-2x2")}
        >
          2×2
        </Button>
      </div>
    </div>

    <div className="border-t pt-3 mt-2 flex flex-col gap-2 w-full">
      <div className="text-sm font-medium text-muted-foreground mb-2 border-2">
        Bubbles
      </div>
      <Button
        variant="default"
        size={"sm"}
        onClick={() => onAddSpeechBubble("speech")}
      >
        <Speech size={16} className="mr-1.5" /> Speech
      </Button>
      <Button
        variant="default"
        size={"sm"}
        onClick={() => onAddSpeechBubble("thought")}
      >
        <Cloud size={16} className="mr-1.5" /> Thought
      </Button>
    </div>

    <div className="border-t pt-3 mt-2 flex flex-col gap-2">
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 size={16} className="mr-2" /> Delete
      </Button>
      <Button variant="default" onClick={onExport}>
        <Download size={16} className="mr-2" /> Export PNG
      </Button>
    </div>
  </div>
);
