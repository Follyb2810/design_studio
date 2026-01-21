import React, { useEffect, useRef, useState } from "react";
import { Text as KonvaText } from "react-konva";
import Konva from "konva";

type Props = {
  node: any;
  isSelected: boolean;
  onChange: (patch: any) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
};

export default function EditableText({
  node,
  isSelected,
  onChange,
  stageRef,
}: Props) {
  const textRef = useRef<KonvaText | null>(null);

  function startEditing() {
    const stage = stageRef.current;
    if (!stage || !textRef.current) return;

    const textNode = textRef.current;
    const absPos = textNode.getAbsolutePosition();
    const containerRect = stage.container().getBoundingClientRect();

    const textarea = document.createElement("textarea");
    textarea.value = node.text;
    document.body.appendChild(textarea);

    textarea.style.position = "absolute";
    textarea.style.left = `${containerRect.left + absPos.x}px`;
    textarea.style.top = `${containerRect.top + absPos.y}px`;
    textarea.style.width = Math.max(100, textNode.width()) + "px";
    textarea.style.fontSize = `${node.fontSize}px`;
    textarea.style.border = "1px solid rgba(0,0,0,0.2)";
    textarea.style.padding = "4px";
    textarea.style.background = "white";
    textarea.style.color = "black";
    textarea.style.zIndex = "1000";
    textarea.focus();

    function done() {
      onChange({ text: textarea.value });
      document.body.removeChild(textarea);
    }

    textarea.addEventListener("blur", done);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.body.removeChild(textarea);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        done();
      }
    });
  }

  return (
    <KonvaText
      ref={textRef}
      id={node.id}
      x={node.x}
      y={node.y}
      text={node.text}
      fontSize={node.fontSize}
      fill={node.fill}
      draggable
      onDblClick={() => startEditing()}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const t = e.target;
        const scaleX = t.scaleX();
        onChange({
          x: t.x(),
          y: t.y(),
          rotation: t.rotation(),
          width: Math.max(10, (t.width() || 0) * scaleX),
        });
        t.scaleX(1);
        t.scaleY(1);
      }}
    />
  );
}
