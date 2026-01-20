export type UID = string;

export interface BaseElement {
  id: UID;
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
}

// Shapes / content
export interface RectElement extends BaseElement {
  type: "rect";
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export type TextAlign = "left" | "center" | "right" | "justify";

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fill: string;
  fontFamily?: string;
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  textDecoration?: "none" | "underline" | "line-through";
  align?: TextAlign;
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  image: HTMLImageElement;
  width: number;
  height: number;
}

export type BubbleTailDirection = "left" | "right" | "top" | "bottom" | "none";

export interface SpeechBubbleElement extends BaseElement {
  type: "bubble";
  width: number;
  height: number;
  text: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  fontSize?: number;
  tailX?: number;
  tailY?: number;
  tailDirection?: BubbleTailDirection;
  tailSize?: number;
}

export interface SFXElement extends BaseElement {
  type: "sfx";
  text: string;
  fontSize: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  fontFamily?: string;
}

export type CanvasElement =
  | RectElement
  | TextElement
  | ImageElement
  | SpeechBubbleElement
  | SFXElement;

// Panels & pages
export type PanelLayout =
  | "single"
  | "grid-2x1"
  | "grid-1x2"
  | "grid-2x2"
  | "grid-3x1"
  | "custom";

export interface Panel extends BaseElement {
  type: "panel";
  width: number;
  height: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  backgroundImage?: HTMLImageElement | null;
  clipContent?: boolean;
  elements: CanvasElement[];
}

export interface Page {
  id: UID;
  elements: CanvasElement[]; // loose elements on the page
  panels?: Panel[]; // comic panels (frames)
}

