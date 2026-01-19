import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CanvasElement } from "@/types";

interface PropsPanelProps {
  selected?: CanvasElement;
  onUpdate: (patch: Partial<CanvasElement>) => void;
}

export const PropertiesPanel: React.FC<PropsPanelProps> = ({
  selected,
  onUpdate,
}) => {
  if (!selected) return null;

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm">Properties</h3>

        {selected.type === "text" && (
          <>
            <Input
              value={selected.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
            <Input
              type="number"
              value={selected.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            />
          </>
        )}

        {selected.type !== "image" && (
          <Input
            type="color"
            value={selected.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
          />
        )}
      </CardContent>
    </Card>
  );
};
