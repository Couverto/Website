import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { DraggableTable, TableProps } from "./DraggableTable";
import { ItemTypes } from "./ItemTypes";
import { axiosConfig as api } from "@/config/axiosConfig";
import { useParams, useOutletContext } from "react-router-dom";
import { Loader2, Save, Armchair, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SidebarItem({ type, label, seats, onAdd }: { type: "rect" | "circle"; label: string; seats: number; onAdd: () => void }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SIDEBAR_ITEM,
    item: { type: ItemTypes.SIDEBAR_ITEM, shape: type, seats, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div className={`p-3 border rounded-md bg-card flex items-center justify-between shadow-sm ${isDragging ? "opacity-50" : ""}`}>
      <div ref={drag as any} className="flex items-center gap-2 cursor-grab grow hover:bg-accent/50 p-1 rounded -ml-1">
        <Armchair className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{seats} p.</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TablePlanContent() {
  const { id } = useParams();
  const { refreshRestaurant } = useOutletContext<any>();
  const [tables, setTables] = useState<TableProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.TABLE, ItemTypes.SIDEBAR_ITEM],
      drop: (item: any, monitor) => {
        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        const x = Math.round((clientOffset.x - canvasRect.left) / 10) * 10;
        const y = Math.round((clientOffset.y - canvasRect.top) / 10) * 10;

        // Ensure within bounds (simplistic check, can be improved)
        const safeX = Math.max(0, x);
        const safeY = Math.max(0, y);

        if (item.type === ItemTypes.TABLE) {
          moveTable(item.id, safeX, safeY);
        } else if (item.type === ItemTypes.SIDEBAR_ITEM) {
          createNewTableFromDrop(item, safeX, safeY);
        }
      },
    }),
    [tables],
  );

  // Connect drop to canvasRef
  drop(canvasRef);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/restaurants/${id}/details`);
      setTables(response.data.restaurant.tablePlan || []);
    } catch (error) {
      toast.error("Erreur lors du chargement du plan");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      await api.put(`/restaurants/${id}`, {
        tablePlan: tables,
      });
      toast.success("Plan de salle sauvegardé !");
      refreshRestaurant();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const moveTable = (tableId: string, x: number, y: number) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, x, y } : t)));
  };

  const createNewTableFromDrop = (item: any, x: number, y: number) => {
    const newTable: TableProps = {
      id: `table-${Date.now()}`,
      label: `T${tables.length + 1}`,
      seats: item.seats,
      x,
      y,
      width: item.shape === "rect" ? 80 : 60,
      height: item.shape === "rect" ? 60 : 60,
      shape: item.shape,
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleAddTable = (type: "rect" | "circle", seats: number) => {
    const newTable: TableProps = {
      id: `table-${Date.now()}`,
      label: `T${tables.length + 1}`,
      seats: seats,
      x: 20,
      y: 20,
      width: type === "rect" ? 80 : 60,
      height: type === "rect" ? 60 : 60,
      shape: type,
    };
    setTables([...tables, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleUpdateTable = (field: keyof TableProps, value: any) => {
    if (!selectedTableId) return;
    setTables(tables.map((t) => (t.id === selectedTableId ? { ...t, [field]: value } : t)));
  };

  const handleDeleteTable = () => {
    setTables(tables.filter((t) => t.id !== selectedTableId));
    setSelectedTableId(null);
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plan de salle</h2>
          <p className="text-muted-foreground">Modélisez votre salle pour gérer les réservations. Glissez les tables sur la grille.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePlan} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Sauvegarder et Activer
          </Button>
        </div>
      </div>

      <div className="flex gap-6 grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4 flex flex-col">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Modèles</h3>
            <div className="space-y-3">
              <SidebarItem type="rect" label="Table Carrée" seats={2} onAdd={() => handleAddTable("rect", 2)} />
              <SidebarItem type="rect" label="Table Rect." seats={4} onAdd={() => handleAddTable("rect", 4)} />
              <SidebarItem type="rect" label="Grande Table" seats={6} onAdd={() => handleAddTable("rect", 6)} />
              <SidebarItem type="circle" label="Table Ronde" seats={4} onAdd={() => handleAddTable("circle", 4)} />
            </div>
          </Card>

          {selectedTable && (
            <Card className="p-4 grow">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Propriétés</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Numéro / Nom</Label>
                  <Input value={selectedTable.label} onChange={(e) => handleUpdateTable("label", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Couverts</Label>
                  <Input type="number" value={selectedTable.seats} onChange={(e) => handleUpdateTable("seats", parseInt(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Largeur</Label>
                    <Input
                      type="number"
                      value={selectedTable.width}
                      onChange={(e) => handleUpdateTable("width", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hauteur</Label>
                    <Input
                      type="number"
                      value={selectedTable.height}
                      onChange={(e) => handleUpdateTable("height", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button variant="destructive" size="sm" className="w-full mt-4" onClick={handleDeleteTable}>
                  Supprimer la table
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Canvas */}
        <Card
          ref={canvasRef}
          className={`grow relative overflow-hidden shadow-inner border-2 min-h-[500px] transition-colors bg-slate-50`}
          id="canvas-area"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTableId(null);
            }
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="absolute inset-0 w-full h-full">
            {tables.map((table) => (
              <DraggableTable
                key={table.id}
                {...table}
                isOverlay={false}
                isSelected={selectedTableId === table.id}
                onSelect={() => setSelectedTableId(table.id)}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function TablePlan() {
  return (
    <DndProvider backend={HTML5Backend}>
      <TablePlanContent />
    </DndProvider>
  );
}
