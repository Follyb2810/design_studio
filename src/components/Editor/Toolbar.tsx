import {
  Upload,
  Type,
  Square,
  Download,
  Trash2,
  Speech,
  Cloud,
  Minus,
} from "lucide-react";
import { Button } from "../ui/button";
import { Circle } from "react-konva";

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

export const Toolbar = ({
  onAddRect,
  onAddEllipse,
  onAddText,
  onAddLine,
  onAddImage,
  onDelete,
  onExport,
  onAddPanel,
  onAddSpeechBubble,
}: ToolbarProps) => (
  <div className="p-4 bg-white shadow flex flex-col gap-3 overflow-y-auto max-h-screen">
    <div className="font-semibold text-lg mb-1">Design Studio</div>

    <Button variant="outline" onClick={onAddRect}>
      <Square size={16} className="mr-2" /> Rectangle
    </Button>
    <Button variant="outline" onClick={onAddEllipse}>
      <Circle size={16} className="mr-2" /> Ellipse
    </Button>
    <Button variant="outline" onClick={onAddLine}>
      <Minus size={16} className="mr-2" /> Line
    </Button>

    {/* Text & Media */}
    <Button variant="outline" onClick={onAddText}>
      <Type size={16} className="mr-2" /> Text
    </Button>
    <label>
      <Button variant="outline" asChild className="w-full justify-start">
        <span>
          <Upload size={16} className="mr-2" /> Image
        </span>
      </Button>
      <input hidden type="file" accept="image/*" onChange={onAddImage} />
    </label>

    {/* Comic-specific tools */}
    <div className="border-t pt-3 mt-2">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Comic Panels
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddPanel("single")}
          className="h-9"
        >
          Single
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddPanel("grid-2x1")}
          className="h-9"
        >
          2 horiz
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddPanel("grid-1x2")}
          className="h-9"
        >
          2 vert
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddPanel("grid-2x2")}
          className="h-9"
        >
          2×2
        </Button>
      </div>
    </div>

    <div className="border-t pt-3 mt-1">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Bubbles
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddSpeechBubble("speech")}
          className="flex-1"
        >
          <Speech size={16} className="mr-1.5" /> Speech
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddSpeechBubble("thought")}
          className="flex-1"
        >
          <Cloud size={16} className="mr-1.5" /> Thought
        </Button>
      </div>
    </div>

    {/* Actions */}
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
