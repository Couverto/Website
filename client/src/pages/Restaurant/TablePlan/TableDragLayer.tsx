import { useDragLayer } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { DraggableTable } from "./DraggableTable";
import { GripVertical } from "lucide-react";

export const TableDragLayer = ({ scale }: { scale: number }) => {
  const { isDragging, item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) return null;

  const renderItem = () => {
    switch (itemType) {
      case ItemTypes.TABLE:
        return <DraggableTable {...item} isOverlay={true} width={item.width} height={item.height} scale={scale} />;
      case ItemTypes.SIDEBAR_ITEM:
        return (
          <div className="p-3 border rounded-md bg-white flex items-center gap-3 shadow-lg w-56 border-primary/50 opacity-90">
            <GripVertical className="h-5 w-5 text-primary/50" />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{item.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{item.seats} personnes</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      <div style={{ transform: `translate(${currentOffset.x}px, ${currentOffset.y}px) scale(${scale})`, transformOrigin: "0 0" }}>
        {renderItem()}
      </div>
    </div>
  );
};
