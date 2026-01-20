import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { TextEl } from "@/types";

interface Props {
  text: TextEl;
  onUpdate: (patch: Partial<TextEl>) => void;
}

export const TextToolbar: React.FC<Props> = ({ text, onUpdate }) => {
  return (
    <div className="flex items-center gap-2 bg-white shadow rounded-xl px-3 py-2">
      <select
        value={text.fontFamily || "Arial"}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        className="border rounded px-2 py-1 text-sm"
      >
        <option>Arial</option>
        <option>Archivo Black</option>
        <option>Poppins</option>
        <option>Inter</option>
        <option>Montserrat</option>
      </select>

      <Input
        type="number"
        className="w-20"
        value={text.fontSize}
        onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
      />

      <Button
        size="sm"
        variant={text.fontStyle === "bold" ? "default" : "outline"}
        onClick={() =>
          onUpdate({ fontStyle: text.fontStyle === "bold" ? "normal" : "bold" })
        }
      >
        <Bold size={16} />
      </Button>

      <Button
        size="sm"
        variant={text.fontStyle === "italic" ? "default" : "outline"}
        onClick={() =>
          onUpdate({
            fontStyle: text.fontStyle === "italic" ? "normal" : "italic",
          })
        }
      >
        <Italic size={16} />
      </Button>

      <Button
        size="sm"
        variant={text.textDecoration === "underline" ? "default" : "outline"}
        onClick={() =>
          onUpdate({
            textDecoration:
              text.textDecoration === "underline" ? "none" : "underline",
          })
        }
      >
        <Underline size={16} />
      </Button>

      <Button size="sm" onClick={() => onUpdate({ align: "left" })}>
        <AlignLeft size={16} />
      </Button>
      <Button size="sm" onClick={() => onUpdate({ align: "center" })}>
        <AlignCenter size={16} />
      </Button>
      <Button size="sm" onClick={() => onUpdate({ align: "right" })}>
        <AlignRight size={16} />
      </Button>

      <Input
        type="color"
        value={text.fill}
        onChange={(e) => onUpdate({ fill: e.target.value })}
        className="w-10 p-1"
      />
      <div className="flex gap-1">
        <input
          value={text.fontFamily || "Arial"}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        />
        <input
          type="number"
          value={text.fontSize}
          onChange={(e) => onUpdate({ fontSize: +e.target.value })}
        />
        <Button
          onClick={() =>
            onUpdate({
              fontStyle: text.fontStyle === "bold" ? "normal" : "bold",
            })
          }
        >
          <Bold size={14} />
        </Button>
        <Button
          onClick={() =>
            onUpdate({
              fontStyle: text.fontStyle === "italic" ? "normal" : "italic",
            })
          }
        >
          <Italic size={14} />
        </Button>
        <Button
          onClick={() =>
            onUpdate({
              textDecoration:
                text.textDecoration === "underline" ? "none" : "underline",
            })
          }
        >
          <Underline size={14} />
        </Button>
        <Button onClick={() => onUpdate({ align: "left" })}>
          <AlignLeft size={14} />
        </Button>
        <Button onClick={() => onUpdate({ align: "center" })}>
          <AlignCenter size={14} />
        </Button>
        <Button onClick={() => onUpdate({ align: "right" })}>
          <AlignRight size={14} />
        </Button>
        <input
          type="color"
          value={text.fill}
          onChange={(e) => onUpdate({ fill: e.target.value })}
        />
      </div>
    </div>
  );
};
