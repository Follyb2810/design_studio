export type UID = string;

export interface BaseElement {
  id: UID;
  x: number;
  y: number;
  rotation?: number; // in degrees
  scaleX?: number; // optional uniform or non-uniform scaling
  scaleY?: number;
  opacity?: number; // 0–1
  visible?: boolean; // default true
  locked?: boolean; // prevent editing/dragging
}

// ────────────────────────────────────────────────
// Core shape / content types (used both standalone & inside panels)
// ────────────────────────────────────────────────

export interface RectElement extends BaseElement {
  type: "rect";
  width: number;
  height: number;
  fill: string; // e.g. "#ffffff", "transparent"
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number; // optional rounded corners
}

export type TextAlign = "left" | "center" | "right" | "justify";

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fill: string;
  fontFamily?: string; // e.g. "Comic Sans MS", "Inter"
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  textDecoration?: "none" | "underline" | "line-through";
  align?: TextAlign;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  image: HTMLImageElement; // or use string (url) + separate loading state
  width: number;
  height: number;
  // optional: crop, filters, etc. in future
}

// ────────────────────────────────────────────────
// Comic-specific elements
// ────────────────────────────────────────────────

export type BubbleTailDirection = "left" | "right" | "top" | "bottom" | "none";

export interface SpeechBubbleElement extends BaseElement {
  type: "bubble";
  width: number;
  height: number;
  text: string; // bubble content
  fill?: string; // default #fff
  stroke?: string; // default #000
  strokeWidth?: number; // default 2–3
  cornerRadius?: number; // default 12–20
  fontSize?: number; // overrides global if needed
  tailX?: number; // tail attachment point (relative)
  tailY?: number;
  tailDirection?: BubbleTailDirection;
  tailSize?: number; // length/width of tail
  // thought bubble variant → could use isThought?: boolean + dotted stroke
}

export interface SFXElement extends BaseElement {
  type: "sfx";
  text: string; // e.g. "BOOM!", "POW!"
  fontSize: number;
  fill: string;
  stroke?: string; // outline color
  strokeWidth?: number; // thick outline typical for SFX
  fontFamily?: string; // often something bold/impactful
  rotation?: number; // SFX are frequently rotated
}

// ────────────────────────────────────────────────
// Union of all content that can live inside a panel or directly on page
// ────────────────────────────────────────────────

export type CanvasElement =
  | RectElement
  | TextElement
  | ImageElement
  | SpeechBubbleElement
  | SFXElement;

// ────────────────────────────────────────────────
// Panel (comic frame)
// ────────────────────────────────────────────────

export type PanelLayout =
  | "single"
  | "grid-2x1" // two horizontal
  | "grid-1x2" // two vertical
  | "grid-2x2"
  | "grid-3x1"
  | "custom";

export interface Panel extends BaseElement {
  type: "panel"; // helps with type guards & rendering
  width: number;
  height: number;
  borderWidth?: number; // default 3–4
  borderColor?: string; // default #000
  backgroundColor?: string;
  backgroundImage?: HTMLImageElement | null;
  clipContent?: boolean; // default true for clean look
  elements: CanvasElement[]; // nested content (relative coordinates)
}

// ────────────────────────────────────────────────
// Page (full comic page)
// ────────────────────────────────────────────────

export interface Page {
  id: UID;
  panels: Panel[]; // most common: panels contain content
  // Optional: allow loose elements outside panels (background, overlays, etc.)
  looseElements?: CanvasElement[];
  // Future: page-level background, bleed/margin guides, title, etc.
}

// // export type BaseEl = {
// //   id: string;
// //   x: number;
// //   y: number;
// //   rotation?: number;
// //   opacity?: number;
// //   locked?: boolean;
// //   visible?: boolean;
// // };

// // export type RectEl = BaseEl & {
// //   type: "rect";
// //   width: number;
// //   height: number;
// //   fill: string;
// //   stroke?: string;
// //   strokeWidth?: number;
// // };
// // export type EllipseEl = BaseEl & {
// //   type: "ellipse";
// //   rx: number;
// //   ry: number;
// //   fill: string;
// // };
// // export type LineEl = BaseEl & {
// //   type: "line";
// //   points: number[];
// //   stroke: string;
// //   strokeWidth: number;
// // };
// // export type TextEl = BaseEl & {
// //   type: "text";
// //   text: string;
// //   fontSize: number;
// //   fill: string;
// //   fontFamily?: string;
// //   fontStyle?: string;
// //   textDecoration?: string;
// //   align?: string;
// // };
// // export type ImageEl = BaseEl & {
// //   type: "image";
// //   image: HTMLImageElement;
// //   width: number;
// //   height: number;
// // };

// // export type CanvasElement = RectEl | EllipseEl | LineEl | TextEl | ImageEl;
// // export type Page = { id: string; elements: CanvasElement[] };

// export type RectEl = {
//   id: string;
//   type: "rect";
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   fill: string;
// };
// export type TextAlign = "left" | "center" | "right";

// export type TextEl = {
//   id: string;
//   type: "text";
//   x: number;
//   y: number;
//   text: string;
//   fontSize: number;
//   fill: string;
//   fontFamily?: string;
//   fontStyle?: "normal" | "bold" | "italic";
//   textDecoration?: "none" | "underline";
//   align?: TextAlign;
// };

// export type ImageEl = {
//   id: string;
//   type: "image";
//   x: number;
//   y: number;
//   image: HTMLImageElement;
//   width: number;
//   height: number;
// };

// export type CanvasElement = RectEl | TextEl | ImageEl;

// export type Page = {
//   id: string;
//   elements: CanvasElement[];
// };
