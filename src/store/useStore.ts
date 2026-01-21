import produce from "immer";
import create from "zustand";

/*
  IMPORTANT: This file starts with the exact snippet you gave:
  import produce from "immer";
*/

export type NodeType = "image" | "text" | "path" | "bubble";

export type BaseNode = {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  locked?: boolean;
  z?: number;
};

export type ImageNode = BaseNode & {
  type: "image";
  src: string;
  crop?: { x: number; y: number; width: number; height: number };
  fit?: "cover" | "contain" | "fill";
  // image filters
  brightness?: number; // -1..1
  contrast?: number; // -1..1
};

export type TextNode = BaseNode & {
  type: "text";
  text: string;
  fontSize: number;
  fill: string;
  fontFamily?: string;
  align?: "left" | "center" | "right";
};

export type PathNode = BaseNode & {
  type: "path";
  points: number[]; // x,y pairs
  stroke: string;
  strokeWidth: number;
  closed?: boolean;
};

export type BubbleNode = BaseNode & {
  type: "bubble";
  text: string;
  fontSize: number;
  fill: string;
  textColor: string;
  tail: { x: number; y: number }; // relative anchor for tail (absolute coords relative to stage)
};

export type AnyNode = ImageNode | TextNode | PathNode | BubbleNode;

type EditorState = {
  nodes: AnyNode[];
  selectedId: string | null;
  mode: "select" | "pen" | "text" | "pan";
  past: AnyNode[][];
  future: AnyNode[][];
  actions: {
    addImage: (src: string) => void;
    addText: (x: number, y: number) => void;
    addBubble: (x: number, y: number, preset?: string) => void;
    addPath: (path: PathNode) => void;
    updateNode: (id: string, patch: Partial<AnyNode>) => void;
    removeNode: (id: string) => void;
    selectNode: (id: string | null) => void;
    setMode: (m: EditorState["mode"]) => void;
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
    toJSON: () => string;
    loadJSON: (data: string) => void;
    clear: () => void;
  };
};

export const useEditor = create<EditorState>((set, get) => ({
  nodes: [],
  selectedId: null,
  mode: "select",
  past: [],
  future: [],
  actions: {
    addImage: (src) => {
      const id = "img-" + Date.now();
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
          s.nodes.push({
            id,
            type: "image",
            src,
            x: 120,
            y: 120,
            width: 320,
            height: 220,
            rotation: 0,
            z: s.nodes.length,
            fit: "cover",
            brightness: 0,
            contrast: 0,
          } as ImageNode);
        }),
      );
    },

    addText: (x, y) => {
      const id = "txt-" + Date.now();
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
          s.nodes.push({
            id,
            type: "text",
            x,
            y,
            text: "Double-click to edit",
            fontSize: 22,
            fill: "#000",
            z: s.nodes.length,
          } as TextNode);
        }),
      );
    },

    addBubble: (x, y, preset) => {
      const id = "bub-" + Date.now();
      const text = "Your dialogue";
      const base: BubbleNode = {
        id,
        type: "bubble",
        x,
        y,
        width: 220,
        height: 80,
        rotation: 0,
        z: get().nodes.length,
        text,
        fontSize: 18,
        fill: "#ffffff",
        textColor: "#000000",
        tail: { x: x + 100, y: y + 140 }, // default tail below
      };
      // apply preset quick styles
      if (preset === "cloud") {
        base.width = 260;
        base.height = 120;
      }
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
          s.nodes.push(base);
        }),
      );
    },

    addPath: (path) => {
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
          s.nodes.push(path as AnyNode);
        }),
      );
    },

    updateNode: (id, patch) => {
      set(
        produce((s: EditorState) => {
          const i = s.nodes.findIndex((n) => n.id === id);
          if (i >= 0) {
            s.past.push(JSON.parse(JSON.stringify(s.nodes)));
            s.future = [];
            s.nodes[i] = { ...s.nodes[i], ...patch } as AnyNode;
          }
        }),
      );
    },

    removeNode: (id) => {
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
          s.nodes = s.nodes.filter((n) => n.id !== id);
          if (s.selectedId === id) s.selectedId = null;
        }),
      );
    },

    selectNode: (id) => set({ selectedId: id }),

    setMode: (m) => set({ mode: m }),

    undo: () => {
      set(
        produce((s: EditorState) => {
          if (s.past.length === 0) return;
          const prev = s.past.pop()!;
          s.future.push(JSON.parse(JSON.stringify(s.nodes)));
          s.nodes = prev;
          s.selectedId = null;
        }),
      );
    },

    redo: () => {
      set(
        produce((s: EditorState) => {
          if (s.future.length === 0) return;
          const next = s.future.pop()!;
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.nodes = next;
          s.selectedId = null;
        }),
      );
    },

    pushHistory: () => {
      set(
        produce((s: EditorState) => {
          s.past.push(JSON.parse(JSON.stringify(s.nodes)));
          s.future = [];
        }),
      );
    },

    toJSON: () => {
      const state = get();
      return JSON.stringify({ nodes: state.nodes });
    },

    loadJSON: (data) => {
      try {
        const parsed = JSON.parse(data);
        set(
          produce((s: EditorState) => {
            s.past.push(JSON.parse(JSON.stringify(s.nodes)));
            s.future = [];
            s.nodes = parsed.nodes || [];
            s.selectedId = null;
          }),
        );
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    },

    clear: () => {
      set({ nodes: [], selectedId: null, past: [], future: [] });
    },
  },
}));
