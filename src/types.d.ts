export type RectEl = {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};
export type TextAlign = "left" | "center" | "right";

export type TextEl = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  fontFamily?: string;
  fontStyle?: "normal" | "bold" | "italic";
  textDecoration?: "none" | "underline";
  align?: TextAlign;
};

export type ImageEl = {
  id: string;
  type: "image";
  x: number;
  y: number;
  image: HTMLImageElement;
  width: number;
  height: number;
};

export type CanvasElement = RectEl | TextEl | ImageEl;

export type Page = {
  id: string;
  elements: CanvasElement[];
};
