// import React, { useState, useEffect, useCallback } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { base44 } from "@/api/base44Client";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import moment from "moment";

// import ToolsPanel from "@/components/base/ToolsPanel";
// import CanvasArea from "@/components/base/CanvasArea";
// import PropertiesPanel from "@/components/base/PropertiesPanel";
// import LayersPanel from "@/components/base/LayersPanel";
// import PageThumbnails from "@/components/base/PageThumbnails";
// import ModeSelector from "@/components/base/ModeSelector";
// import ScriptBuilder from "@/components/base/ScriptBuilder";
// import EditorTopBar from "@/components/base/EditorTopBar";

// interface EditorElement {
//   id: string;
//   type?: string;
//   x?: number;
//   y?: number;
//   visible?: boolean;
//   locked?: boolean;
//   [key: string]: any;
// }

// interface EditorPage {
//   id: string;
//   name: string;
//   elements: EditorElement[];
//   width: number;
//   height: number;
// }

// const createDefaultPage = (): EditorPage => ({
//   id: `page-${Date.now()}`,
//   name: "Page 1",
//   elements: [],
//   width: 680,
//   height: 960,
// });

// export default function Editor() {
//   const queryClient = useQueryClient();
//   const urlParams = new URLSearchParams(window.location.search);
//   const projectId = urlParams.get("id");

//   // Project State
//   const [projectTitle, setProjectTitle] = useState("Untitled");
//   const [pages, setPages] = useState<EditorPage[]>([createDefaultPage()]);
//   const [currentPageIndex, setCurrentPageIndex] = useState(0);
//   const [script, setScript] = useState<any[]>([]);
//   const [lastSaved, setLastSaved] = useState<string | null>(null);

//   // Editor State
//   const [activeTool, setActiveTool] = useState("select");
//   const [activeMode, setActiveMode] = useState("draw");
//   const [selectedElementId, setSelectedElementId] = useState<string | null>(
//     null,
//   );
//   const [zoom, setZoom] = useState(80);
//   const [showGrid, setShowGrid] = useState(false);

//   // History for Undo/Redo
//   const [history, setHistory] = useState<EditorElement[][]>([]);
//   const [historyIndex, setHistoryIndex] = useState(-1);

//   // Current page elements
//   const currentPage = pages[currentPageIndex];
//   const elements = currentPage?.elements || [];

//   // Load project
//   //   const { data: project, isLoading } = useQuery({
//   //     queryKey: ["project", projectId],
//   //     queryFn: () => (projectId ? base44.entities.Project.get(projectId) : null),
//   //     enabled: !!projectId,
//   //   });

//   //   useEffect(() => {
//   //     if (project) {
//   //       setProjectTitle(project.title || "Untitled");
//   //       if (project.pages && project.pages.length > 0) {
//   //         setPages(project.pages);
//   //       }
//   //       if (project.script) {
//   //         setScript(project.script);
//   //       }
//   //     }
//   //   }, [project]);

//   // Save mutation
//   //   const saveMutation = useMutation({
//   //     mutationFn: async (data) => {
//   //       if (projectId) {
//   //         return base44.entities.Project.update(projectId, data);
//   //       } else {
//   //         return base44.entities.Project.create(data);
//   //       }
//   //     },
//   //     onSuccess: (result) => {
//   //       setLastSaved(moment().format("h:mm A"));
//   //       toast.success("Project saved");
//   //       if (!projectId && result?.id) {
//   //         window.history.replaceState(null, "", `?id=${result.id}`);
//   //       }
//   //       queryClient.invalidateQueries(["project", projectId]);
//   //     },
//   //     onError: () => {
//   //       toast.error("Failed to save project");
//   //     },
//   //   });

//   // Save project
//   //   const handleSave = () => {
//   //     saveMutation.mutate({
//   //       title: projectTitle,
//   //       pages,
//   //       script,
//   //       settings: {
//   //         defaultWidth: 680,
//   //         defaultHeight: 960,
//   //         gridEnabled: showGrid,
//   //       },
//   //     });
//   //   };

//   // Auto-save
//   //   useEffect(() => {
//   //     const autoSaveTimer = setTimeout(() => {
//   //       if (pages.some((p) => p.elements.length > 0) || script.length > 0) {
//   //         handleSave();
//   //       }
//   //     }, 30000);

//   //     return () => clearTimeout(autoSaveTimer);
//   //   }, [pages, script, projectTitle]);

//   // Update elements with history
//   //   const updateElements = useCallback(
//   //     (newElements) => {
//   //       setPages((prev) =>
//   //         prev.map((page, idx) =>
//   //           idx === currentPageIndex ? { ...page, elements: newElements } : page,
//   //         ),
//   //       );

//   //       // Add to history
//   //       const newHistory = history.slice(0, historyIndex + 1);
//   //       newHistory.push(newElements);
//   //       setHistory(newHistory);
//   //       setHistoryIndex(newHistory.length - 1);
//   //     },
//   //     [currentPageIndex, history, historyIndex],
//   //   );

//   // Add element
//   const handleAddElement = (element: EditorElement) => {
//     const newElements = [...elements, element];
//     updateElements(newElements);
//     setSelectedElementId(element.id);
//     setActiveTool("select");
//   };

//   // Update element
//   const handleUpdateElement = (
//     elementId: string,
//     updates: Partial<EditorElement>,
//   ) => {
//     const newElements = elements.map((el) =>
//       el.id === elementId ? { ...el, ...updates } : el,
//     );
//     updateElements(newElements);
//   };

//   // Delete element
//   const handleDeleteElement = (elementId: string) => {
//     const newElements = elements.filter((el) => el.id !== elementId);
//     updateElements(newElements);
//     if (selectedElementId === elementId) {
//       setSelectedElementId(null);
//     }
//   };

//   // Duplicate element
//   const handleDuplicateElement = (elementId: string) => {
//     const element = elements.find((el) => el.id === elementId);
//     if (element) {
//       const newElement = {
//         ...element,
//         id: `element-${Date.now()}`,
//         x: element.x + 20,
//         y: element.y + 20,
//       };
//       const newElements = [...elements, newElement];
//       updateElements(newElements);
//       setSelectedElementId(newElement.id);
//     }
//   };

//   // Toggle visibility
//   const handleToggleVisibility = (elementId: string) => {
//     handleUpdateElement(elementId, {
//       visible:
//         elements.find((el) => el.id === elementId)?.visible === false
//           ? true
//           : false,
//     });
//   };

//   // Toggle lock
//   const handleToggleLock = (elementId: string) => {
//     handleUpdateElement(elementId, {
//       locked: !elements.find((el) => el.id === elementId)?.locked,
//     });
//   };

//   // Undo
//   const handleUndo = () => {
//     if (historyIndex > 0) {
//       setHistoryIndex(historyIndex - 1);
//       setPages((prev) =>
//         prev.map((page, idx) =>
//           idx === currentPageIndex
//             ? { ...page, elements: history[historyIndex - 1] }
//             : page,
//         ),
//       );
//     }
//   };

//   // Redo
//   const handleRedo = () => {
//     if (historyIndex < history.length - 1) {
//       setHistoryIndex(historyIndex + 1);
//       setPages((prev) =>
//         prev.map((page, idx) =>
//           idx === currentPageIndex
//             ? { ...page, elements: history[historyIndex + 1] }
//             : page,
//         ),
//       );
//     }
//   };

//   // Page operations
//   const handleAddPage = () => {
//     const newPage = {
//       id: `page-${Date.now()}`,
//       name: `Page ${pages.length + 1}`,
//       elements: [],
//       width: 680,
//       height: 960,
//     };
//     setPages([...pages, newPage]);
//     setCurrentPageIndex(pages.length);
//   };

//   const handleDeletePage = (index: number) => {
//     if (pages.length <= 1) return;
//     const newPages = pages.filter((_, i) => i !== index);
//     setPages(newPages);
//     if (currentPageIndex >= newPages.length) {
//       setCurrentPageIndex(newPages.length - 1);
//     }
//   };

//   const handleDuplicatePage = (index: number) => {
//     const page = pages[index];
//     const newPage = {
//       ...page,
//       id: `page-${Date.now()}`,
//       name: `${page.name} (copy)`,
//       elements: page.elements.map((el) => ({
//         ...el,
//         id: `element-${Date.now()}-${Math.random()}`,
//       })),
//     };
//     const newPages = [...pages];
//     newPages.splice(index + 1, 0, newPage);
//     setPages(newPages);
//   };

//   // Export
//   const handleExport = (format: string) => {
//     toast.info(`Exporting as ${format.toUpperCase()}...`);
//     // Export logic would go here
//   };

//   // Preview
//   const handlePreview = () => {
//     toast.info("Opening preview...");
//     // Preview logic would go here
//   };

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (
//         (e.target as HTMLElement).tagName === "INPUT" ||
//         (e.target as HTMLElement).tagName === "TEXTAREA"
//       )
//         return;

//       // Tool shortcuts
//       const shortcuts: Record<string, string> = {
//         v: "select",
//         m: "move",
//         p: "pen",
//         r: "rectangle",
//         c: "circle",
//         t: "triangle",
//         l: "line",
//         x: "text",
//         b: "speechBubble",
//         i: "image",
//         e: "eraser",
//       };

//       if (shortcuts[e.key.toLowerCase()] && !e.ctrlKey && !e.metaKey) {
//         setActiveTool(shortcuts[e.key.toLowerCase()]);
//       }

//       // Undo/Redo
//       if ((e.ctrlKey || e.metaKey) && e.key === "z") {
//         e.preventDefault();
//         if (e.shiftKey) {
//           handleRedo();
//         } else {
//           handleUndo();
//         }
//       }

//       // Save
//       if ((e.ctrlKey || e.metaKey) && e.key === "s") {
//         e.preventDefault();
//         handleSave();
//       }

//       // Delete
//       if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
//         handleDeleteElement(selectedElementId);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [selectedElementId, historyIndex, history]);

//   const selectedElement = elements.find((el) => el.id === selectedElementId);

//   return (
//     <div className="h-screen flex flex-col bg-[#0d0d0d] overflow-hidden">
//       {/* Top Bar */}
//       <EditorTopBar
//         projectTitle={projectTitle}
//         setProjectTitle={setProjectTitle}
//         onSave={handleSave}
//         saving={saveMutation.isPending}
//         lastSaved={lastSaved}
//         onUndo={handleUndo}
//         onRedo={handleRedo}
//         canUndo={historyIndex > 0}
//         canRedo={historyIndex < history.length - 1}
//         onPreview={handlePreview}
//         onExport={handleExport}
//       />

//       {/* Main Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Tools Panel */}
//         <ToolsPanel activeTool={activeTool} setActiveTool={setActiveTool} />

//         {/* Center Area */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Canvas or Script Builder */}
//           <div className="flex-1 flex overflow-hidden relative">
//             {activeMode === "script" ? (
//               <ScriptBuilder script={script} onUpdateScript={setScript} />
//             ) : (
//               <CanvasArea
//                 elements={elements}
//                 selectedId={selectedElementId}
//                 activeTool={activeTool}
//                 onSelectElement={setSelectedElementId}
//                 onUpdateElement={handleUpdateElement}
//                 onAddElement={handleAddElement}
//                 canvasWidth={currentPage?.width || 680}
//                 canvasHeight={currentPage?.height || 960}
//                 zoom={zoom}
//                 setZoom={setZoom}
//                 showGrid={showGrid}
//                 setShowGrid={setShowGrid}
//               />
//             )}

//             {/* Mode Selector */}
//             <ModeSelector
//               activeMode={activeMode}
//               setActiveMode={setActiveMode}
//             />
//           </div>

//           {/* Page Thumbnails */}
//           <PageThumbnails
//             pages={pages}
//             currentPageIndex={currentPageIndex}
//             onSelectPage={setCurrentPageIndex}
//             onAddPage={handleAddPage}
//             onDeletePage={handleDeletePage}
//             onDuplicatePage={handleDuplicatePage}
//           />
//         </div>

//         {/* Right Panel */}
//         <div className="flex flex-col w-64 border-l border-[#2d2d2d]">
//           {/* Properties Panel */}
//           <div className="flex-1 overflow-hidden">
//             <PropertiesPanel
//               selectedElement={selectedElement}
//               onUpdateElement={handleUpdateElement}
//               onDeleteElement={handleDeleteElement}
//               onDuplicateElement={handleDuplicateElement}
//             />
//           </div>

//           {/* Layers Panel */}
//           <LayersPanel
//             elements={elements}
//             selectedId={selectedElementId}
//             onSelectElement={setSelectedElementId}
//             onToggleVisibility={handleToggleVisibility}
//             onToggleLock={handleToggleLock}
//             onDeleteElement={handleDeleteElement}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
