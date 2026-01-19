import { ArrowUp, ArrowDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CanvasElement } from "@/types";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (dir: "up" | "down") => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedId,
  onSelect,
  onMove,
}) => (
  <div className="p-4 bg-white shadow flex flex-col gap-4">
    <h2 className="font-semibold flex items-center gap-2">
      <Layers size={16} /> Layers
    </h2>

    {elements.map((el) => (
      <div
        key={el.id}
        onClick={() => onSelect(el.id)}
        className={`p-2 rounded cursor-pointer ${el.id === selectedId ? "bg-indigo-100" : "hover:bg-gray-100"}`}
      >
        {el.type}
      </div>
    ))}

    <div className="flex gap-2">
      <Button size="sm" onClick={() => onMove("up")}>
        <ArrowUp size={14} />
      </Button>
      <Button size="sm" onClick={() => onMove("down")}>
        <ArrowDown size={14} />
      </Button>
    </div>
  </div>
);
