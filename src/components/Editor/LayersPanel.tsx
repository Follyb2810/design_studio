import { ArrowUp, ArrowDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Page } from "@/types";

interface LayersPanelProps {
  page: Page;
  selectedId: string | null;
  selectedPanelId: string | null;
  onSelect: (id: string, panelId?: string) => void;
  onMove: (dir: "up" | "down") => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  page,
  selectedId,
  selectedPanelId,
  onSelect,
  onMove,
}) => (
  <div className="p-4 bg-white shadow flex flex-col gap-4">
    <h2 className="font-semibold flex items-center gap-2">
      <Layers size={16} /> Layers
    </h2>

    {/* Loose elements */}
    {page.elements.map((el) => (
      <div
        key={el.id}
        onClick={() => onSelect(el.id)}
        className={`p-2 rounded cursor-pointer ${el.id === selectedId && !selectedPanelId ? "bg-indigo-100" : "hover:bg-gray-100"}`}
      >
        {el.type} (loose)
      </div>
    ))}

    {/* Panels and their elements */}
    {page.panels.map((panel) => (
      <div key={panel.id}>
        <div
          onClick={() => onSelect(panel.id)}
          className={`p-2 rounded cursor-pointer font-medium ${panel.id === selectedId ? "bg-indigo-100" : "hover:bg-gray-100"}`}
        >
          Panel {panel.id.slice(0, 4)}
        </div>
        {panel.elements.map((el) => (
          <div
            key={el.id}
            onClick={() => onSelect(el.id, panel.id)}
            className={`pl-4 p-1 rounded cursor-pointer ${el.id === selectedId && selectedPanelId === panel.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
          >
            {el.type}
          </div>
        ))}
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

// import { ArrowUp, ArrowDown, Layers } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import type { CanvasElement } from "@/types";

// interface LayersPanelProps {
//   elements: CanvasElement[];
//   selectedId: string | null;
//   onSelect: (id: string) => void;
//   onMove: (dir: "up" | "down") => void;
// }

// export const LayersPanel: React.FC<LayersPanelProps> = ({
//   elements,
//   selectedId,
//   onSelect,
//   onMove,
// }) => (
//   <div className="p-4 bg-white shadow flex flex-col gap-4">
//     <h2 className="font-semibold flex items-center gap-2">
//       <Layers size={16} /> Layers
//     </h2>

//     {elements.map((el) => (
//       <div
//         key={el.id}
//         onClick={() => onSelect(el.id)}
//         className={`p-2 rounded cursor-pointer ${el.id === selectedId ? "bg-indigo-100" : "hover:bg-gray-100"}`}
//       >
//         {el.type}
//       </div>
//     ))}

//     <div className="flex gap-2">
//       <Button size="sm" onClick={() => onMove("up")}>
//         <ArrowUp size={14} />
//       </Button>
//       <Button size="sm" onClick={() => onMove("down")}>
//         <ArrowDown size={14} />
//       </Button>
//     </div>
//   </div>
// );
