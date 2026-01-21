import React, { useEffect, useRef, useState } from "react";
import { CanvasStage } from "@/components/Editor/CanvasStage";
import { LayersPanel } from "@/components/Editor/LayersPanel";
import { PagesTabs } from "@/components/Editor/PagesTabs";
import { PropertiesPanel } from "@/components/Editor/PropertiesPanel";
import { TextToolbar } from "@/components/Editor/TextToolbar";
import { Toolbar } from "@/components/Editor/Toolbar";

import type {
  CanvasElement,
  Page,
  Panel,
  PanelLayout,
  TextElement,
} from "@/types";
import { uid } from "@/utils/generateId";

export default function StudioPage() {
  const stageRef = useRef<any>(null);

  const [pages, setPages] = useState<Page[]>([
    { id: uid(), elements: [], panels: [] },
  ]);
  const [activePage, setActivePage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  const page = pages[activePage];

  // ---------------- PANELS ----------------
  const addPanel = (layout: PanelLayout) => {
    let newPanels: Panel[] = [];

    const canvasW = 900;
    const canvasH = 600;
    const margin = 20;
    const gutter = 16;

    if (layout === "single") {
      newPanels = [
        {
          id: uid(),
          type: "panel",
          x: margin,
          y: margin,
          width: canvasW - margin * 2,
          height: canvasH - margin * 2,
          borderWidth: 3,
          borderColor: "#000",
          backgroundColor: "#fff",
          elements: [],
        },
      ];
    }

    if (layout === "grid-2x1") {
      const w = (canvasW - margin * 2 - gutter) / 2;

      newPanels = [
        {
          id: uid(),
          type: "panel",
          x: margin,
          y: margin,
          width: w,
          height: canvasH - margin * 2,
          borderWidth: 3,
          borderColor: "#000",
          backgroundColor: "#fff",
          elements: [],
        },
        {
          id: uid(),
          type: "panel",
          x: margin + w + gutter,
          y: margin,
          width: w,
          height: canvasH - margin * 2,
          borderWidth: 3,
          borderColor: "#000",
          backgroundColor: "#fff",
          elements: [],
        },
      ];
    }

    // Add similar logic for other layouts (grid-1x2, grid-2x2, grid-3x1)...

    if (layout === "grid-1x2") {
      const h = (canvasH - margin * 2 - gutter) / 2;
      newPanels = [
        {
          id: uid(),
          type: "panel",
          x: margin,
          y: margin,
          width: canvasW - margin * 2,
          height: h,
          borderWidth: 3,
          borderColor: "#000",
          backgroundColor: "#fff",
          elements: [],
        },
        {
          id: uid(),
          type: "panel",
          x: margin,
          y: margin + h + gutter,
          width: canvasW - margin * 2,
          height: h,
          borderWidth: 3,
          borderColor: "#000",
          backgroundColor: "#fff",
          elements: [],
        },
      ];
    }

    // ... add for grid-2x2, grid-3x1

    setPages((prev) => {
      const copy = [...prev];
      copy[activePage] = {
        ...copy[activePage],
        panels: [...copy[activePage].panels, ...newPanels],
      };
      return copy;
    });
  };

  // ---------------- ELEMENTS ----------------
  const updatePage = (updater: (p: Page) => Page) => {
    const copy = [...pages];
    copy[activePage] = updater(page);
    setPages(copy);
  };

  const addElement = (newEl: CanvasElement, targetPanelId?: string) => {
    updatePage((p) => {
      // If a specific panel is targeted (e.g. drop), use that.
      // Otherwise fall back to selectedPanelId
      const pid = targetPanelId ?? selectedPanelId;

      if (pid) {
        return {
          ...p,
          panels: p.panels.map((panel) =>
            panel.id === pid
              ? { ...panel, elements: [...panel.elements, newEl] }
              : panel,
          ),
        };
      }
      return { ...p, elements: [...p.elements, newEl] };
    });
  };

  const addRect = () =>
    addElement({
      id: uid(),
      type: "rect",
      x: 100,
      y: 100,
      width: 160,
      height: 110,
      fill: "#4f46e5",
    });

  const addEllipse = () =>
    addElement({
      id: uid(),
      type: "ellipse",
      x: 100,
      y: 100,
      radiusX: 80,
      radiusY: 55,
      fill: "#4f46e5",
    });

  const addLine = () =>
    addElement({
      id: uid(),
      type: "line",
      x: 100,
      y: 100,
      points: [0, 0, 200, 0],
      stroke: "#000",
      strokeWidth: 2,
    });

  const addText = () =>
    addElement({
      id: uid(),
      type: "text",
      x: 120,
      y: 120,
      text: "Edit text",
      fontSize: 26,
      fill: "#111",
    });

  const processImageFile = (file: File, x?: number, y?: number) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () =>
        addElement(
          {
            id: uid(),
            type: "image",
            x: x ?? 150,
            y: y ?? 150,
            image: img,
            width: img.width / 3,
            height: img.height / 3,
          },
          // If we dropped it, we might want to detect if it was dropped on a panel
          // For now, we just add it to the active context or loose
          undefined,
        );
    };
    reader.readAsDataURL(file);
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const addSpeechBubble = (variant: "speech" | "thought") => {
    addElement({
      id: uid(),
      type: "bubble",
      x: 200,
      y: 200,
      width: 220,
      height: 120,
      text: variant === "speech" ? "..." : "•••",
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 12,
      tailDirection: "left",
      tailSize: 20,
    });
  };

  const addSFX = () =>
    addElement({
      id: uid(),
      type: "sfx",
      x: 150,
      y: 150,
      text: "BOOM!",
      fontSize: 48,
      fill: "#ff0000",
      stroke: "#000",
      strokeWidth: 2,
      fontFamily: "Impact",
    });

  const deleteSelected = () => {
    if (!selectedId) return;
    updatePage((p) => {
      const filterElements = (els: CanvasElement[]) =>
        els.filter((e) => e.id !== selectedId);

      if (selectedPanelId) {
        return {
          ...p,
          panels: p.panels.map((panel) =>
            panel.id === selectedPanelId
              ? { ...panel, elements: filterElements(panel.elements) }
              : panel,
          ),
        };
      }
      return {
        ...p,
        elements: filterElements(p.elements),
        panels: p.panels.filter((panel) => panel.id !== selectedId),
      };
    });
    setSelectedId(null);
    setSelectedPanelId(null);
  };

  const moveLayer = (dir: "up" | "down") => {
    if (!selectedId) return;

    const moveInArray = (
      arr: CanvasElement[],
      i: number,
      dir: "up" | "down",
    ) => {
      const t = dir === "up" ? i - 1 : i + 1;
      if (t < 0 || t >= arr.length) return arr;
      const newArr = [...arr];
      [newArr[i], newArr[t]] = [newArr[t], newArr[i]];
      return newArr;
    };

    updatePage((p) => {
      if (selectedPanelId) {
        return {
          ...p,
          panels: p.panels.map((panel) =>
            panel.id === selectedPanelId
              ? {
                  ...panel,
                  elements: (() => {
                    const i = panel.elements.findIndex(
                      (e) => e.id === selectedId,
                    );
                    return moveInArray(panel.elements, i, dir);
                  })(),
                }
              : panel,
          ),
        };
      }
      const i = p.elements.findIndex((e) => e.id === selectedId);
      return { ...p, elements: moveInArray(p.elements, i, dir) };
    });
  };

  const findSelected = (): {
    item: CanvasElement | Panel;
    isPanel: boolean;
  } | null => {
    if (!selectedId) return null;

    if (selectedPanelId) {
      const panel = page.panels.find((p) => p.id === selectedPanelId);
      if (!panel) return null;
      const el = panel.elements.find((e) => e.id === selectedId);
      if (el) return { item: el, isPanel: false };
      if (panel.id === selectedId) return { item: panel, isPanel: true };
      return null;
    }

    const el = page.elements.find((e) => e.id === selectedId);
    if (el) return { item: el, isPanel: false };

    const panel = page.panels.find((p) => p.id === selectedId);
    if (panel) return { item: panel, isPanel: true };

    return null;
  };

  const selectedInfo = findSelected();
  const selected = selectedInfo?.item ?? null;
  const isPanelSelected = selectedInfo?.isPanel ?? false;

  const updateSelected = (patch: Record<string, any>) => {
    if (!selectedId || !selectedInfo) return;

    updatePage((currentPage) => {
      if (isPanelSelected) {
        return {
          ...currentPage,
          panels: currentPage.panels.map((panel) =>
            panel.id === selectedId ? { ...panel, ...patch } : panel,
          ),
        };
      }

      if (selectedPanelId) {
        return {
          ...currentPage,
          panels: currentPage.panels.map((panel) =>
            panel.id === selectedPanelId
              ? {
                  ...panel,
                  elements: panel.elements.map((e) =>
                    e.id === selectedId ? { ...e, ...patch } : e,
                  ),
                }
              : panel,
          ),
        };
      }

      return {
        ...currentPage,
        elements: currentPage.elements.map((e) =>
          e.id === selectedId ? { ...e, ...patch } : e,
        ),
      };
    });
  };

  const exportPNG = () => {
    const uri = stageRef.current?.toDataURL?.({ pixelRatio: 2 });
    if (!uri) return;

    const a = document.createElement("a");
    a.download = `page-${activePage + 1}.png`;
    a.href = uri;
    a.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Adjust coordinates to be relative to the canvas if possible
      // For now using client coordinates with an offset for the sidebar
      processImageFile(file, e.clientX - 280, e.clientY - 60);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, page]);

  return (
    <div
      className="h-screen w-screen grid grid-cols-[260px_1fr_260px] bg-gray-100"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Toolbar
        onAddRect={addRect}
        onAddEllipse={addEllipse}
        onAddLine={addLine}
        onAddText={addText}
        onAddImage={addImage}
        onAddSpeechBubble={addSpeechBubble}
        onAddSFX={addSFX}
        onDelete={deleteSelected}
        onExport={exportPNG}
        onAddPanel={addPanel}
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <PagesTabs
          pages={pages}
          active={activePage}
          onChange={setActivePage}
          onAdd={() =>
            setPages([...pages, { id: uid(), elements: [], panels: [] }])
          }
        />

        {selected?.type === "text" && (
          <TextToolbar
            text={selected as TextElement}
            onUpdate={(patch: Partial<TextElement>) => updateSelected(patch)}
          />
        )}
        <CanvasStage
          stageRef={stageRef}
          page={page}
          selectedId={selectedId}
          onSelect={(id, panelId) => {
            setSelectedId(id);
            setSelectedPanelId(panelId || null);
          }}
          onElementChange={(id, patch, panelId) =>
            updatePage((p) => {
              if (panelId) {
                return {
                  ...p,
                  panels: p.panels.map((panel) =>
                    panel.id === panelId
                      ? {
                          ...panel,
                          elements: panel.elements.map((e) =>
                            e.id === id ? { ...e, ...patch } : e,
                          ),
                        }
                      : panel,
                  ),
                };
              }

              // Try element first, then panel
              const hasElement = p.elements.some((e) => e.id === id);
              if (hasElement) {
                return {
                  ...p,
                  elements: p.elements.map((e) =>
                    e.id === id ? { ...e, ...patch } : e,
                  ),
                };
              }

              return {
                ...p,
                panels: p.panels.map((panel) =>
                  panel.id === id ? { ...panel, ...patch } : panel,
                ),
              };
            })
          }
          clearSelection={() => {
            setSelectedId(null);
            setSelectedPanelId(null);
          }}
        />
      </div>

      <div className="p-4 bg-white shadow flex flex-col gap-4">
        <LayersPanel
          page={page}
          selectedId={selectedId}
          selectedPanelId={selectedPanelId}
          onSelect={(id, panelId) => {
            setSelectedId(id);
            setSelectedPanelId(panelId || null);
          }}
          onMove={moveLayer}
        />

        <PropertiesPanel selected={selected!} onUpdate={updateSelected} />
      </div>
    </div>
  );
}
