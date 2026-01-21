import { useEditor } from "@/store/useStore";

export default function LayersPanel() {
  const nodes = useEditor((s) => s.nodes);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.actions.selectNode);
  const remove = useEditor((s) => s.actions.removeNode);

  return (
    <div className="space-y-2">
      {nodes.length === 0 && (
        <div className="text-sm text-neutral-400">No layers</div>
      )}
      {nodes
        .slice()
        .reverse()
        .map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between p-2 rounded ${selectedId === n.id ? "bg-neutral-700" : "bg-neutral-800"}`}
          >
            <div className="text-sm">
              <div className="font-medium">{n.type.toUpperCase()}</div>
              <div className="text-xs text-neutral-400">{n.id}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => select(n.id)}
                className="px-2 py-1 bg-neutral-600 rounded"
              >
                Select
              </button>
              <button
                onClick={() => remove(n.id)}
                className="px-2 py-1 bg-rose-600 rounded"
              >
                Del
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
