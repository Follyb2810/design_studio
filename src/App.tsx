// import MangaStudio from "./pages/MangaStudio";
// import Studio_One from "./pages/Studio_One";
// import StudioPage from "./pages/StudioPage";

import CanvasEditor from "./components/Editor_One/CanvasEditor";
import LayersPanel from "./components/Editor_One/LayersPanel";
import Toolbar from "./components/Editor_One/Toolbar";

// import Studio_Two from "./pages/Studio_Two";

function App() {
  // return <Studio_Two />;
  // return <MangaStudio />;
  // return <StudioPage />;
  return (
    <div className="h-screen w-screen flex">
      <aside className="w-64 border-r border-neutral-800 p-4">
        <h2 className="text-lg font-semibold mb-4">Tools</h2>
        <Toolbar />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-neutral-800 rounded-lg p-6 flex justify-center">
          <CanvasEditor />
        </div>
      </main>

      <aside className="w-80 border-l border-neutral-800 p-4">
        <h3 className="text-lg font-semibold mb-2">Layers / Properties</h3>
        <LayersPanel />
      </aside>
    </div>
  );
}

export default App;
