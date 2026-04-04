import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { ItemTypes } from "./ItemTypes";
import { useState, useEffect } from "react";
import { Maximize2, Edit2, Copy, Trash2 } from "lucide-react";

export interface TableProps {
  id: string;
  label: string;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle";
  status: "available" | "reserved";
  isOverlay?: boolean;
  isSelected?: boolean;
  onSelect?: (e: React.PointerEvent) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onResize?: (id: string, width: number, height: number) => void;
  scale?: number;
}

export function DraggableTable({
  id,
  label,
  seats,
  x,
  y,
  width,
  height,
  shape,
  status,
  isOverlay,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onResize,
  scale = 1,
}: TableProps) {
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.TABLE,
      item: { type: ItemTypes.TABLE, id, label, seats, width, height, shape, x, y, status },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      canDrag: !isResizing,
    }),
    [id, x, y, width, height, shape, isResizing, status],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
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
        className={`flex items-center justify-center border-2 border-primary bg-background shadow-sm ${
          shape === "circle" ? "rounded-full" : "rounded-md"
        }`}
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
      onPointerDown={(e) => onSelect?.(e)}
      className={`
        draggable-table flex items-center justify-center border-2 shadow-sm hover:shadow-md transition-shadow relative group select-none
        ${shape === "circle" ? "rounded-full" : "rounded-md"}
        ${status === "reserved" ? "bg-red-200/50 border-red-400 text-red-800" : "bg-background border-primary"}
        ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
    >
      <div className="text-center pointer-events-none">
        <div className="font-bold text-xs">{label}</div>
        <div className={`text-[10px] ${status === "reserved" ? "text-red-800/80" : "text-muted-foreground"}`}>{seats} pers.</div>
      </div>

      {!isOverlay && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
          <div
            className="w-7 h-7 bg-blue-500 text-white rounded-full shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
            title="Modifier"
            onPointerDown={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </div>
          <div
            className="w-7 h-7 bg-slate-500 text-white rounded-full shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
            title="Dupliquer"
            onPointerDown={(e) => {
              e.stopPropagation();
              onDuplicate?.();
            }}
          >
            <Copy className="w-3.5 h-3.5" />
          </div>
          <div
            className="w-7 h-7 bg-red-500 text-white rounded-full shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
            title="Supprimer"
            onPointerDown={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

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
