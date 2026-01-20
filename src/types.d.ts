// export type BaseEl = {
//   id: string;
//   x: number;
//   y: number;
//   rotation?: number;
//   opacity?: number;
//   locked?: boolean;
//   visible?: boolean;
// };

// export type RectEl = BaseEl & {
//   type: "rect";
//   width: number;
//   height: number;
//   fill: string;
//   stroke?: string;
//   strokeWidth?: number;
// };
// export type EllipseEl = BaseEl & {
//   type: "ellipse";
//   rx: number;
//   ry: number;
//   fill: string;
// };
// export type LineEl = BaseEl & {
//   type: "line";
//   points: number[];
//   stroke: string;
//   strokeWidth: number;
// };
// export type TextEl = BaseEl & {
//   type: "text";
//   text: string;
//   fontSize: number;
//   fill: string;
//   fontFamily?: string;
//   fontStyle?: string;
//   textDecoration?: string;
//   align?: string;
// };
// export type ImageEl = BaseEl & {
//   type: "image";
//   image: HTMLImageElement;
//   width: number;
//   height: number;
// };

// export type CanvasElement = RectEl | EllipseEl | LineEl | TextEl | ImageEl;
// export type Page = { id: string; elements: CanvasElement[] };

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
