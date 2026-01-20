import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CanvasElement, TextElement } from "@/types";

export interface PropsPanelProps {
  selected?: CanvasElement;
  onUpdate: (patch: Partial<CanvasElement>) => void;
}

export const PropertiesPanel: React.FC<PropsPanelProps> = ({
  selected,
  onUpdate,
}) => {
  if (!selected) return null;

  const isText = selected.type === "text";
  const hasFill = (selected as any).fill !== undefined;

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm">Properties</h3>

        {isText && (
          <>
            <Input
              value={(selected as TextElement).text}
              onChange={(e) => onUpdate({ text: e.target.value } as any)}
            />
            <Input
              type="number"
              value={(selected as TextElement).fontSize}
              onChange={(e) =>
                onUpdate({ fontSize: Number(e.target.value) } as any)
              }
            />
          </>
        )}

        {hasFill && (
          <Input
            type="color"
            value={(selected as any).fill}
            onChange={(e) => onUpdate({ fill: e.target.value } as any)}
          />
        )}
      </CardContent>
    </Card>
  );
};
