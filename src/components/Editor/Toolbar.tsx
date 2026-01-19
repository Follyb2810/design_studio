import { Upload, Type, Square, Download, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface ToolbarProps {
  onAddRect: () => void;
  onAddText: () => void;
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddRect,
  onAddText,
  onAddImage,
  onDelete,
  onExport,
}) => (
  <div className="p-4 bg-white shadow flex flex-col gap-3">
    <h1 className="text-base font-semibold">Design Studio</h1>
    <Button onClick={onAddRect} className="tool-btn">
      <Square size={16} /> Rectangle
    </Button>
    <Button onClick={onAddText} className="tool-btn">
      <Type size={16} /> Text
    </Button>

    <label className="tool-btn cursor-pointer">
      <Upload size={16} /> Image
      <input type="file" hidden onChange={onAddImage} />
    </label>

    <Button onClick={onDelete} className="tool-btn">
      <Trash2 size={16} /> Delete
    </Button>
    <Button onClick={onExport} className="tool-btn">
      <Download size={16} /> Export PNG
    </Button>
  </div>
);
