/*
  Right-panel component for bubble editing: presets, auto-size, tail editing.
  - Choose preset cloud/rounded
  - Auto-size (fit bubble to text)
  - Adjust font size, fill, text color
  - Move tail anchor by dragging in-canvas (canvas handles tail anchor drag)
*/

import { useEditor } from "@/store/useStore";

export default function BubbleEditor() {
  const nodes = useEditor((s) => s.nodes);
  const selectedId = useEditor((s) => s.selectedId);
  const updateNode = useEditor((s) => s.actions.updateNode);
  const find = nodes.find((n) => n.id === selectedId && n.type === "bubble");

  if (!find)
    return (
      <div className="text-sm text-neutral-400">Select a bubble to edit</div>
    );

  const node: any = find;

  function applyPreset(p: string) {
    if (p === "cloud")
      updateNode(node.id, {
        width: 300,
        height: 140,
        fontSize: 18,
        fill: "#fff",
      });
    if (p === "rounded")
      updateNode(node.id, {
        width: 220,
        height: 80,
        fontSize: 16,
        fill: "#fff",
      });
  }

  function autoSize() {
    // naive auto-size: increase width/height based on char count; for production measure Konva.Text
    const chars = node.text.length;
    const width = Math.min(600, Math.max(120, chars * (node.fontSize * 0.6)));
    const lines = Math.ceil(
      chars / Math.max(20, Math.floor(width / (node.fontSize * 0.6))),
    );
    const height = Math.max(40, lines * (node.fontSize + 6) + 20);
    updateNode(node.id, { width, height });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => applyPreset("rounded")}
          className="px-2 py-1 bg-neutral-700 rounded"
        >
          Rounded
        </button>
        <button
          onClick={() => applyPreset("cloud")}
          className="px-2 py-1 bg-neutral-700 rounded"
        >
          Cloud
        </button>
      </div>

      <div className="pt-2">
        <label className="text-xs text-neutral-400">Font size</label>
        <input
          value={node.fontSize}
          onChange={(e) =>
            updateNode(node.id, { fontSize: Number(e.target.value) })
          }
          type="number"
          className="w-full mt-1 p-2 rounded bg-neutral-800"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-400">Fill</label>
        <input
          type="color"
          value={node.fill}
          onChange={(e) => updateNode(node.id, { fill: e.target.value })}
          className="w-full h-8 mt-1"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-400">Text color</label>
        <input
          type="color"
          value={node.textColor}
          onChange={(e) => updateNode(node.id, { textColor: e.target.value })}
          className="w-full h-8 mt-1"
        />
      </div>

      <div>
        <button
          className="mt-2 bg-sky-600 px-3 py-2 rounded"
          onClick={autoSize}
        >
          Auto-size
        </button>
        <p className="text-xs text-neutral-500 mt-2">
          Drag the tail anchor on-canvas to reposition the tail.
        </p>
      </div>
    </div>
  );
}
