/*
 Simple crop panel for the selected image node:
 - Reset crop
 - Apply preset (center-crop / full)
 - Note: interactive crop rectangle appears on the canvas when image is selected
*/

import { useEditor } from "@/store/useStore";

export default function CropEditor() {
  const nodes = useEditor((s) => s.nodes);
  const selectedId = useEditor((s) => s.selectedId);
  const updateNode = useEditor((s) => s.actions.updateNode);
  const find = nodes.find((n) => n.id === selectedId && n.type === "image");

  if (!find)
    return (
      <div className="text-sm text-neutral-400">Select an image to crop</div>
    );

  const node: any = find;

  function resetCrop() {
    updateNode(node.id, { crop: undefined });
  }

  function centerCrop() {
    if (!node.width || !node.height) return;
    const cw = Math.min(200, node.width);
    const ch = Math.min(200, node.height);
    updateNode(node.id, {
      crop: {
        x: (node.width - cw) / 2,
        y: (node.height - ch) / 2,
        width: cw,
        height: ch,
      },
    });
  }

  return (
    <div className="space-y-2">
      <button onClick={centerCrop} className="px-3 py-2 bg-neutral-700 rounded">
        Center Crop
      </button>
      <button onClick={resetCrop} className="px-3 py-2 bg-rose-600 rounded">
        Reset Crop
      </button>
      <p className="text-xs text-neutral-500 mt-2">
        Drag the crop rectangle on the canvas to adjust crop manually.
      </p>
    </div>
  );
}
