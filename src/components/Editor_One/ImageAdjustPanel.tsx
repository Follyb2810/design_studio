/*
  Image adjustments for selected image node: brightness & contrast sliders.
  Uses simple sliders applying Konva filter attributes on node.
*/

import { useEditor } from "@/store/useStore";

export default function ImageAdjustPanel() {
  const nodes = useEditor((s) => s.nodes);
  const selectedId = useEditor((s) => s.selectedId);
  const updateNode = useEditor((s) => s.actions.updateNode);
  const find = nodes.find((n) => n.id === selectedId && n.type === "image");

  if (!find)
    return (
      <div className="text-sm text-neutral-400">Select an image to adjust</div>
    );

  const node: any = find;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-neutral-400">Brightness</label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={node.brightness ?? 0}
          onChange={(e) =>
            updateNode(node.id, { brightness: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-400">Contrast</label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={node.contrast ?? 0}
          onChange={(e) =>
            updateNode(node.id, { contrast: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-400">Fit</label>
        <select
          value={node.fit || "cover"}
          onChange={(e) => updateNode(node.id, { fit: e.target.value as any })}
          className="w-full mt-1 bg-neutral-800 p-2 rounded"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
        </select>
      </div>
    </div>
  );
}
