import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

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
}

export function DraggableTable({ id, label, seats, x, y, width, height, shape, isOverlay, isSelected, onSelect }: TableProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.TABLE,
      item: { type: ItemTypes.TABLE, id, label, seats, width, height, shape, x, y },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id, x, y, width, height, shape],
  );

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
    cursor: "move",
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
        flex items-center justify-center border-2 bg-background shadow-sm hover:shadow-md transition-shadow
        ${shape === "circle" ? "rounded-full" : "rounded-md"}
        ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-primary"}
        select-none
      `}
    >
      <div className="text-center">
        <div className="font-bold text-xs">{label}</div>
        <div className="text-[10px] text-muted-foreground">{seats} pers.</div>
      </div>
    </div>
  );
}
