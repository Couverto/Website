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
import { Loader2, Save, Armchair, Plus, Copy, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Zone {
  id: string;
  name: string;
  tables: TableProps[];
}

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

  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZoneId, setActiveZoneId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Zone Management Dialog State
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const currentZone = zones.find((z) => z.id === activeZoneId);
  const tables = currentZone?.tables || [];

  const setTables = (newTables: TableProps[] | ((prev: TableProps[]) => TableProps[])) => {
    setZones((prevZones) =>
      prevZones.map((z) => {
        if (z.id === activeZoneId) {
          const updatedTables = typeof newTables === "function" ? newTables(z.tables) : newTables;
          return { ...z, tables: updatedTables };
        }
        return z;
      }),
    );
  };

  // Alignment State
  const [alignmentLines, setAlignmentLines] = useState<{ type: "vertical" | "horizontal"; x?: number; y?: number }[]>([]);

  const calculateSnap = (
    dragX: number,
    dragY: number,
    dragWidth: number,
    dragHeight: number,
    otherTables: TableProps[],
    threshold: number = 5,
  ) => {
    let snapX = dragX;
    let snapY = dragY;
    const lines: { type: "vertical" | "horizontal"; x?: number; y?: number }[] = [];

    const dragCenterX = dragX + dragWidth / 2;
    const dragCenterY = dragY + dragHeight / 2;
    const dragRight = dragX + dragWidth;
    const dragBottom = dragY + dragHeight;

    let snappedX = false;
    let snappedY = false;

    for (const table of otherTables) {
      if (table.id === selectedTableId) continue; // Skip self if selected (though dragging usually creates copy or moves active)

      const tLeft = table.x;
      const tCenterY = table.y + table.height / 2;
      const tCenterX = table.x + table.width / 2;
      const tRight = table.x + table.width;
      const tTop = table.y;
      const tBottom = table.y + table.height;

      // VERTICAL ALIGNMENT (X axis)
      if (!snappedX) {
        // Left to Left
        if (Math.abs(dragX - tLeft) < threshold) {
          snapX = tLeft;
          snappedX = true;
          lines.push({ type: "vertical", x: tLeft });
        }
        // Left to Right
        else if (Math.abs(dragX - tRight) < threshold) {
          snapX = tRight;
          snappedX = true;
          lines.push({ type: "vertical", x: tRight });
        }
        // Right to Left
        else if (Math.abs(dragRight - tLeft) < threshold) {
          snapX = tLeft - dragWidth;
          snappedX = true;
          lines.push({ type: "vertical", x: tLeft });
        }
        // Right to Right
        else if (Math.abs(dragRight - tRight) < threshold) {
          snapX = tRight - dragWidth;
          snappedX = true;
          lines.push({ type: "vertical", x: tRight });
        }
        // Center to Center
        else if (Math.abs(dragCenterX - tCenterX) < threshold) {
          snapX = tCenterX - dragWidth / 2;
          snappedX = true;
          lines.push({ type: "vertical", x: tCenterX });
        }
      }

      // HORIZONTAL ALIGNMENT (Y axis)
      if (!snappedY) {
        // Top to Top
        if (Math.abs(dragY - tTop) < threshold) {
          snapY = tTop;
          snappedY = true;
          lines.push({ type: "horizontal", y: tTop });
        }
        // Top to Bottom
        else if (Math.abs(dragY - tBottom) < threshold) {
          snapY = tBottom;
          snappedY = true;
          lines.push({ type: "horizontal", y: tBottom });
        }
        // Bottom to Top
        else if (Math.abs(dragBottom - tTop) < threshold) {
          snapY = tTop - dragHeight;
          snappedY = true;
          lines.push({ type: "horizontal", y: tTop });
        }
        // Bottom to Bottom
        else if (Math.abs(dragBottom - tBottom) < threshold) {
          snapY = tBottom - dragHeight;
          snappedY = true;
          lines.push({ type: "horizontal", y: tBottom });
        }
        // Center to Center
        else if (Math.abs(dragCenterY - tCenterY) < threshold) {
          snapY = tCenterY - dragHeight / 2;
          snappedY = true;
          lines.push({ type: "horizontal", y: tCenterY });
        }
      }
    }

    return { x: snappedX ? snapX : dragX, y: snappedY ? snapY : dragY, lines, isSnapped: snappedX || snappedY };
  };

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.TABLE, ItemTypes.SIDEBAR_ITEM],
      hover: (item: any, monitor) => {
        if (!canvasRef.current || !activeZoneId) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const sourceClientOffset = monitor.getSourceClientOffset();
        if (!sourceClientOffset) return;

        const rawX = sourceClientOffset.x - canvasRect.left;
        const rawY = sourceClientOffset.y - canvasRect.top;

        // Ideal dimensions
        const width = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 80 : 60) : item.width || 80;
        const height = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 60 : 60) : item.height || 60;

        // Calculate Snap (excluding the item itself if it's an existing table being moved)
        const otherTables = tables.filter((t) => t.id !== item.id);
        const { lines } = calculateSnap(rawX, rawY, width, height, otherTables, 10);

        setAlignmentLines(lines);
      },
      drop: (item: any, monitor) => {
        if (!canvasRef.current || !activeZoneId) return;

        setAlignmentLines([]); // Clear lines

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const sourceClientOffset = monitor.getSourceClientOffset();

        if (!sourceClientOffset) return;

        let x = sourceClientOffset.x - canvasRect.left;
        let y = sourceClientOffset.y - canvasRect.top;

        // Dimensions
        const width = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 80 : 60) : item.width || 80;
        const height = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 60 : 60) : item.height || 60;

        // Final Snap Calculation
        const otherTables = tables.filter((t) => t.id !== item.id);
        const snapped = calculateSnap(x, y, width, height, otherTables, 10);

        x = snapped.x;
        y = snapped.y;

        // Grid snap fallthrough if no alignment snap
        if (!snapped.isSnapped) {
          x = Math.round(x / 10) * 10;
          y = Math.round(y / 10) * 10;
        }

        const safeX = Math.max(0, x);
        const safeY = Math.max(0, y);

        if (item.type === ItemTypes.TABLE) {
          moveTable(item.id, safeX, safeY);
        } else if (item.type === ItemTypes.SIDEBAR_ITEM) {
          createNewTableFromDrop(item, safeX, safeY);
        }
      },
    }),
    [zones, activeZoneId, tables],
  );

  drop(canvasRef);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/restaurants/${id}/details`);
      const data = response.data.restaurant;

      let fetchedZones: Zone[] = data.zones || [];

      // Migration Logic: If no zones but tablePlan exists
      if (fetchedZones.length === 0) {
        if (data.tablePlan && data.tablePlan.length > 0) {
          fetchedZones = [{ id: "main-hall", name: "Salle Principale", tables: data.tablePlan }];
        } else {
          fetchedZones = [{ id: "main-hall", name: "Salle Principale", tables: [] }];
        }
      }

      setZones(fetchedZones);
      if (fetchedZones.length > 0) {
        setActiveZoneId(fetchedZones[0].id);
      }
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
        zones: zones,
        // Send legacy tablePlan just in case, using the first zone
        tablePlan: zones.length > 0 ? zones[0].tables : [],
      });
      toast.success("Plan de salle sauvegardé !");
      refreshRestaurant();
    } catch (error) {
      console.error(error);
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

  const handleResizeTable = (id: string, width: number, height: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, width, height } : t)));
  };

  const handleDuplicateTable = () => {
    if (!selectedTableId) return;
    const tableToClone = tables.find((t) => t.id === selectedTableId);
    if (!tableToClone) return;

    const newTable: TableProps = {
      ...tableToClone,
      id: `table-${Date.now()}`,
      label: `${tableToClone.label} (Copie)`,
      x: tableToClone.x + 20,
      y: tableToClone.y + 20,
    };

    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
    toast.success("Table dupliquée");
  };

  // Zone Management
  const handleSaveZone = () => {
    if (!newZoneName.trim()) return;

    if (editingZoneId) {
      // Edit existing
      setZones((prev) => prev.map((z) => (z.id === editingZoneId ? { ...z, name: newZoneName } : z)));
      toast.success("Zone renommée");
    } else {
      // Create new
      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        name: newZoneName,
        tables: [],
      };
      setZones((prev) => [...prev, newZone]);
      setActiveZoneId(newZone.id);
      toast.success("Zone créée");
    }
    setIsZoneDialogOpen(false);
    setNewZoneName("");
    setEditingZoneId(null);
  };

  const initiateEditZone = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingZoneId(id);
    setNewZoneName(name);
    setIsZoneDialogOpen(true);
  };

  const initiateAddZone = () => {
    setEditingZoneId(null);
    setNewZoneName("");
    setIsZoneDialogOpen(true);
  };

  const confirmDeleteZone = () => {
    if (!deleteZoneId) return;

    setZones((prev) => prev.filter((z) => z.id !== deleteZoneId));
    if (activeZoneId === deleteZoneId) {
      const remaining = zones.filter((z) => z.id !== deleteZoneId);
      if (remaining.length > 0) setActiveZoneId(remaining[0].id);
    }
    setDeleteZoneId(null);
    toast.success("Zone supprimée");
  };

  const handleDeleteZone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (zones.length <= 1) {
      toast.error("Impossible de supprimer la dernière zone");
      return;
    }
    setDeleteZoneId(id);
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
          <p className="text-muted-foreground">Gérez vos différentes zones (Salle, Terrasse...) et vos tables.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePlan} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Sauvegarder et Activer
          </Button>
        </div>
      </div>

      <div className="flex flex-col grow overflow-hidden gap-4">
        <div className="flex items-center justify-between">
          <Tabs value={activeZoneId} onValueChange={setActiveZoneId} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-transparent p-0 h-auto flex gap-2 flex-wrap">
                {zones.map((zone) => (
                  <TabsTrigger
                    key={zone.id}
                    value={zone.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card px-4 py-2 h-9"
                  >
                    {zone.name}
                    <Edit2
                      className="w-3 h-3 ml-2 opacity-50 hover:opacity-100 cursor-pointer"
                      onClick={(e) => initiateEditZone(zone.id, zone.name, e)}
                    />
                    <Trash2
                      className="w-3 h-3 ml-2 opacity-50 hover:opacity-100 hover:text-destructive cursor-pointer"
                      onClick={(e) => handleDeleteZone(zone.id, e)}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>

              <Button variant="outline" size="sm" onClick={initiateAddZone}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une zone
              </Button>
            </div>
          </Tabs>
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
                    <Input
                      type="number"
                      value={selectedTable.seats}
                      onChange={(e) => handleUpdateTable("seats", parseInt(e.target.value))}
                    />
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

                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="w-full" onClick={handleDuplicateTable}>
                      <Copy className="w-4 h-4 mr-2" />
                      Dupliquer
                    </Button>
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

            {/* Alignment Guides */}
            {alignmentLines.map((line, i) => (
              <div
                key={i}
                className="absolute bg-blue-500 z-50 pointer-events-none"
                style={{
                  left: line.type === "vertical" ? line.x : 0,
                  top: line.type === "horizontal" ? line.y : 0,
                  width: line.type === "vertical" ? "1px" : "100%",
                  height: line.type === "horizontal" ? "1px" : "100%",
                  borderTop: line.type === "horizontal" ? "1px dashed #3b82f6" : "none",
                  borderLeft: line.type === "vertical" ? "1px dashed #3b82f6" : "none",
                  backgroundColor: "transparent",
                }}
              />
            ))}

            <div className="absolute inset-0 w-full h-full">
              {tables.map((table) => (
                <DraggableTable
                  key={table.id}
                  {...table}
                  isOverlay={false}
                  isSelected={selectedTableId === table.id}
                  onSelect={() => setSelectedTableId(table.id)}
                  onResize={handleResizeTable}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZoneId ? "Renommer la zone" : "Nouvelle zone"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nom de la zone</Label>
            <Input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="Ex: Terrasse, 1er étage..." />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveZone}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteZoneId} onOpenChange={(open) => !open && setDeleteZoneId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la zone ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette zone ? Toutes les tables qu'elle contient seront définitivement perdues. Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteZone} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
