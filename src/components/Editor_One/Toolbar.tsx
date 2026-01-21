import { useEditor } from "@/store/useStore";
import React, { useRef } from "react";

export default function Toolbar() {
  const addImage = useEditor((s) => s.actions.addImage);
  const addText = useEditor((s) => s.actions.addText);
  const addBubble = useEditor((s) => s.actions.addBubble);
  const setMode = useEditor((s) => s.actions.setMode);
  const undo = useEditor((s) => s.actions.undo);
  const redo = useEditor((s) => s.actions.redo);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onAddImageClick() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        className="bg-yellow-500 text-black px-3 py-2 rounded"
        onClick={onAddImageClick}
      >
        Add Image
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <button
        className="bg-neutral-700 px-3 py-2 rounded"
        onClick={() => setMode("select")}
      >
        Select
      </button>
      <button
        className="bg-neutral-700 px-3 py-2 rounded"
        onClick={() => setMode("pen")}
      >
        Pen
      </button>
      <button
        className="bg-neutral-700 px-3 py-2 rounded"
        onClick={() => setMode("text")}
      >
        Text
      </button>

      <button
        className="bg-indigo-600 px-3 py-2 rounded"
        onClick={() => addBubble(160, 160)}
      >
        Add Bubble
      </button>
      <div className="pt-4 flex gap-2">
        <button className="bg-sky-600 py-2 px-3 rounded" onClick={undo}>
          Undo
        </button>
        <button className="bg-sky-500 py-2 px-3 rounded" onClick={redo}>
          Redo
        </button>
      </div>

      <div className="pt-4 text-xs text-neutral-400">
        Mode: select / pen / text. Double-click text to edit inline. Click
        bubble then use right panel to adjust.
      </div>
    </div>
  );
}
