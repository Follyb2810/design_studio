import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CanvasElement, Panel } from "@/types";
import { Label } from "../ui/label";

export interface PropsPanelProps {
  selected?: CanvasElement | Panel;
  onUpdate: (patch: Partial<CanvasElement | Panel>) => void;
}

export const PropertiesPanel: React.FC<PropsPanelProps> = ({
  selected,
  onUpdate,
}) => {
  if (!selected) return null;

  const isText =
    selected.type === "text" ||
    selected.type === "sfx" ||
    selected.type === "bubble";
  const isShape = ["rect", "ellipse", "line"].includes(selected.type);
  const isPanel = selected.type === "panel";
  const hasFill = "fill" in selected;
  const hasStroke = "stroke" in selected;
  const hasWidthHeight = "width" in selected && "height" in selected;

  return (
    <Card>
      <CardContent className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm">Properties</h3>

        {isText && (
          <>
            <Label>Text</Label>
            <Input
              value={(selected as any).text}
              onChange={(e) => onUpdate({ text: e.target.value } as any)}
            />
            <Label>Font Size</Label>
            <Input
              type="number"
              value={(selected as any).fontSize}
              onChange={(e) =>
                onUpdate({ fontSize: Number(e.target.value) } as any)
              }
            />
          </>
        )}

        {hasFill && (
          <>
            <Label>Fill Color</Label>
            <Input
              type="color"
              value={(selected as any).fill}
              onChange={(e) => onUpdate({ fill: e.target.value } as any)}
            />
          </>
        )}

        {hasStroke && (
          <>
            <Label>Stroke Color</Label>
            <Input
              type="color"
              value={(selected as any).stroke}
              onChange={(e) => onUpdate({ stroke: e.target.value } as any)}
            />
            <Label>Stroke Width</Label>
            <Input
              type="number"
              value={(selected as any).strokeWidth}
              onChange={(e) =>
                onUpdate({ strokeWidth: Number(e.target.value) } as any)
              }
            />
          </>
        )}

        {hasWidthHeight && (
          <>
            <Label>Width</Label>
            <Input
              type="number"
              value={(selected as any).width}
              onChange={(e) =>
                onUpdate({ width: Number(e.target.value) } as any)
              }
            />
            <Label>Height</Label>
            <Input
              type="number"
              value={(selected as any).height}
              onChange={(e) =>
                onUpdate({ height: Number(e.target.value) } as any)
              }
            />
          </>
        )}

        {isPanel && (
          <>
            <Label>Border Width</Label>
            <Input
              type="number"
              value={(selected as Panel).borderWidth}
              onChange={(e) =>
                onUpdate({ borderWidth: Number(e.target.value) })
              }
            />
            <Label>Border Color</Label>
            <Input
              type="color"
              value={(selected as Panel).borderColor}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
            />
            <Label>Background Color</Label>
            <Input
              type="color"
              value={(selected as Panel).backgroundColor}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            />
          </>
        )}

        {/* Add more properties as needed, e.g., rotation, opacity */}
        <Label>Opacity</Label>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={selected.opacity ?? 1}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
        />
      </CardContent>
    </Card>
  );
};
// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import type { CanvasElement, TextElement } from "@/types";

// export interface PropsPanelProps {
//   selected?: CanvasElement;
//   onUpdate: (patch: Partial<CanvasElement>) => void;
// }

// export const PropertiesPanel: React.FC<PropsPanelProps> = ({
//   selected,
//   onUpdate,
// }) => {
//   if (!selected) return null;

//   const isText = selected.type === "text";
//   const hasFill = (selected as any).fill !== undefined;

//   return (
//     <Card>
//       <CardContent className="p-3 flex flex-col gap-2">
//         <h3 className="font-semibold text-sm">Properties</h3>

//         {isText && (
//           <>
//             <Input
//               value={(selected as TextElement).text}
//               onChange={(e) => onUpdate({ text: e.target.value } as any)}
//             />
//             <Input
//               type="number"
//               value={(selected as TextElement).fontSize}
//               onChange={(e) =>
//                 onUpdate({ fontSize: Number(e.target.value) } as any)
//               }
//             />
//           </>
//         )}

//         {hasFill && (
//           <Input
//             type="color"
//             value={(selected as any).fill}
//             onChange={(e) => onUpdate({ fill: e.target.value } as any)}
//           />
//         )}
//       </CardContent>
//     </Card>
//   );
// };
