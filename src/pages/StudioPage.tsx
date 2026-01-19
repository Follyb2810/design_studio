import { CanvasStage } from "@/components/Editor/CanvasStage";
import { LayersPanel } from "@/components/Editor/LayersPanel";
import { PagesTabs } from "@/components/Editor/PagesTabs";
import { PropertiesPanel } from "@/components/Editor/PropertiesPanel";
import { TextToolbar } from "@/components/Editor/TextToolbar";
import { Toolbar } from "@/components/Editor/Toolbar";
import type { CanvasElement, Page } from "@/types";
import { uid } from "@/utils/generateId";
import { useEffect, useRef, useState } from "react";

export default function StudioPage() {
  const stageRef = useRef<any>(null);

  const [pages, setPages] = useState<Page[]>([{ id: uid(), elements: [] }]);
  const [activePage, setActivePage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const page = pages[activePage];

  const updatePage = (elements: CanvasElement[]) => {
    const copy = [...pages];
    copy[activePage] = { ...page, elements };
    setPages(copy);
  };

  const addRect = () =>
    updatePage([
      ...page.elements,
      {
        id: uid(),
        type: "rect",
        x: 100,
        y: 100,
        width: 160,
        height: 110,
        fill: "#4f46e5",
      },
    ]);
  const addText = () =>
    updatePage([
      ...page.elements,
      {
        id: uid(),
        type: "text",
        x: 120,
        y: 120,
        text: "Edit text",
        fontSize: 26,
        fill: "#111",
      },
    ]);

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () =>
        updatePage([
          ...page.elements,
          {
            id: uid(),
            type: "image",
            x: 150,
            y: 150,
            image: img,
            width: img.width / 3,
            height: img.height / 3,
          },
        ]);
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    updatePage(page.elements.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  };

  const moveLayer = (dir: "up" | "down") => {
    const i = page.elements.findIndex((e) => e.id === selectedId);
    if (i < 0) return;
    const arr = [...page.elements];
    const t = dir === "up" ? i - 1 : i + 1;
    if (!arr[t]) return;
    [arr[i], arr[t]] = [arr[t], arr[i]];
    updatePage(arr);
  };

  const selected = page.elements.find((e) => e.id === selectedId);

  const updateSelected = (patch: Partial<CanvasElement>) =>
    updatePage(
      page.elements.map((e) =>
        e.id === selectedId ? ({ ...e, ...patch } as CanvasElement) : e,
      ),
    );

  const exportPNG = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;
    const a = document.createElement("a");
    a.download = `page-${activePage + 1}.png`;
    a.href = uri;
    a.click();
  };
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, page.elements]);

  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr_260px] bg-gray-100">
      <Toolbar
        onAddRect={addRect}
        onAddText={addText}
        onAddImage={addImage}
        onDelete={deleteSelected}
        onExport={exportPNG}
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <PagesTabs
          pages={pages}
          active={activePage}
          onChange={setActivePage}
          onAdd={() => setPages([...pages, { id: uid(), elements: [] }])}
        />
        {selected?.type === "text" && (
          <TextToolbar text={selected} onUpdate={updateSelected} />
        )}

        <CanvasStage
          stageRef={stageRef}
          elements={page.elements}
          onSelect={setSelectedId}
          onUpdatePos={(id, x, y) =>
            updatePage(
              page.elements.map((e) => (e.id === id ? { ...e, x, y } : e)),
            )
          }
          clearSelection={() => setSelectedId(null)}
        />
      </div>

      <div className="p-4 bg-white shadow flex flex-col gap-4">
        <LayersPanel
          elements={page.elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={moveLayer}
        />
        <PropertiesPanel selected={selected} onUpdate={updateSelected} />
      </div>
    </div>
  );
}
