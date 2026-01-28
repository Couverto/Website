import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

export interface TableProps {
  id: string;
  label: string;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle";
  isOverlay?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export function DraggableTable({ id, label, seats, x, y, width, height, shape, isOverlay, isSelected, onSelect, onResize }: TableProps) {
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.TABLE,
      item: { type: ItemTypes.TABLE, id, label, seats, width, height, shape, x, y },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      canDrag: !isResizing, // Disable drag while resizing
    }),
    [id, x, y, width, height, shape, isResizing],
  );

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent drag start
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.max(40, Math.round((startWidth + deltaX) / 10) * 10);
      const newHeight = Math.max(40, Math.round((startHeight + deltaY) / 10) * 10);

      onResize?.(id, newWidth, newHeight);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  if (isOverlay) {
    return (
      <div
        className={`
        flex items-center justify-center border-2 border-primary bg-background shadow-sm
        ${shape === "circle" ? "rounded-full" : "rounded-md"}
      `}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="font-bold text-xs">{label}</div>
          <div className="text-[10px] text-muted-foreground">{seats} pers.</div>
        </div>
      </div>
    );
  }

  const style: React.CSSProperties = {
    left: x,
    top: y,
    width: width,
    height: height,
    position: "absolute",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : isSelected ? 30 : 10,
    cursor: isDragging ? "grabbing" : "move",
  };

  return (
    <div
      ref={drag as any}
      style={style}
      onPointerDown={(e) => {
        // We only trigger selection, drag is handled by ref
        onSelect?.();
      }}
      className={`
        flex items-center justify-center border-2 bg-background shadow-sm hover:shadow-md transition-shadow relative group
        ${shape === "circle" ? "rounded-full" : "rounded-md"}
        ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-primary"}
        select-none
      `}
    >
      <div className="text-center pointer-events-none">
        <div className="font-bold text-xs">{label}</div>
        <div className="text-[10px] text-muted-foreground">{seats} pers.</div>
      </div>

      {/* Resize Handle (Bottom Right) */}
      {isSelected && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full cursor-nwse-resize flex items-center justify-center shadow z-50 hover:scale-110 transition-transform"
          onPointerDown={handleResizeStart}
        >
          <Maximize2 className="w-2.5 h-2.5 rotate-90" />
        </div>
      )}
    </div>
  );
}
