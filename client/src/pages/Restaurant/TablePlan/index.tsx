import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { DraggableTable, TableProps } from "./DraggableTable";
import { ItemTypes } from "./ItemTypes";
import { axiosConfig as api } from "@/config/axiosConfig";
import { useParams, useOutletContext } from "react-router-dom";
import { Loader2, Save, Plus, Minus, Trash2, Edit2, GripVertical, ForkKnife, Table, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { TableDragLayer } from "./TableDragLayer";

interface Zone {
  id: string;
  name: string;
  tables: TableProps[];
}

function SidebarItem({ type, label, seats, onAdd }: { type: "rect" | "circle"; label: string; seats: number; onAdd: () => void }) {
  return (
    <div className="p-3 border rounded-md bg-card flex items-center gap-3 shadow-sm">
      <GripVertical className="h-5 w-5 text-muted-foreground/50" />
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none">{label}</span>
        <span className="text-xs text-muted-foreground mt-1">{seats} personnes</span>
      </div>
      <div className="ml-auto">
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={onAdd}>
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

  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [customSeats, setCustomSeats] = useState(2);

  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [editTableSeats, setEditTableSeats] = useState(2);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTableId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        handleDeleteTable(selectedTableId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTableId, tables]);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/restaurants/${id}/details`);
      const data = response.data.restaurant;
      let fetchedZones: Zone[] = (data.zones || []).map((zone: any) => ({
        ...zone,
        tables: zone.tables.map((table: any) => ({ ...table, status: table.status || "available" })),
      }));

      if (fetchedZones.length === 0) {
        const legacyTables = (data.tablePlan || []).map((table: any) => ({ ...table, status: table.status || "available" }));
        fetchedZones = [{ id: "main-hall", name: "Salle Principale", tables: legacyTables }];
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
        tablePlan: zones.length > 0 ? zones[0].tables : [],
      });
      toast.success("Plan de salle sauvegardé !");
      refreshRestaurant();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Erreur lors de la sauvegarde";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const moveTable = (tableId: string, x: number, y: number) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, x, y } : t)));
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
      status: "available",
    };
    setTables([...tables, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleToggleTableStatus = (tableId: string) => {
    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === tableId ? { ...t, status: t.status === "available" ? "reserved" : "available" } : t,
      ),
    );
  };

  const handleSaveZone = () => {
    if (!newZoneName.trim()) return;
    if (editingZoneId) {
      setZones((prev) => prev.map((z) => (z.id === editingZoneId ? { ...z, name: newZoneName } : z)));
      toast.success("Zone renommée");
    } else {
      const newZone: Zone = { id: `zone-${Date.now()}`, name: newZoneName, tables: [] };
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

  const handleResizeTable = (id: string, width: number, height: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, width, height } : t)));
  };

  const initiateEditTable = (table: TableProps) => {
    setEditingTableId(table.id);
    setEditTableName(table.label);
    setEditTableSeats(table.seats);
    setIsEditTableDialogOpen(true);
  };

  const handleDuplicateTable = (id: string | null) => {
    const tableId = id || selectedTableId;
    if (!tableId) return;
    const tableToClone = tables.find((t) => t.id === tableId);
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

  const handleDeleteTable = (id: string | null = null) => {
    const targetId = id || selectedTableId;
    if (!targetId) return;
    setTables(tables.filter((t) => t.id !== targetId));
    if (selectedTableId === targetId) setSelectedTableId(null);
    toast.success("Table supprimée");
  };

  const handleSaveTable = () => {
    if (!editingTableId) return;
    setTables((prev) =>
      prev.map((t) => (t.id === editingTableId ? { ...t, label: editTableName, seats: editTableSeats } : t)),
    );
    setIsEditTableDialogOpen(false);
    setEditingTableId(null);
    toast.success("Table modifiée");
  };

  const handleDeleteZone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (zones.length <= 1) {
      toast.error("Impossible de supprimer la dernière zone");
      return;
    }
    setDeleteZoneId(id);
  };

  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  const fitViewToTables = () => {
    if (!canvasRef.current || tables.length === 0) {
      setView({ x: 0, y: 0, scale: 1 });
      return;
    }
    const PADDING = 100;
    const containerWidth = canvasRef.current.clientWidth;
    const containerHeight = canvasRef.current.clientHeight;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    tables.forEach((t) => {
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x + (t.width || 80));
      maxY = Math.max(maxY, t.y + (t.height || 60));
    });
    if (minX === Infinity) return;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = (containerWidth - PADDING * 2) / contentWidth;
    const scaleY = (containerHeight - PADDING * 2) / contentHeight;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 1.5);
    const contentCenterX = minX + contentWidth / 2;
    const contentCenterY = minY + contentHeight / 2;
    const x = containerWidth / 2 - contentCenterX * scale;
    const y = containerHeight / 2 - contentCenterY * scale;
    setView({ x, y, scale });
  };

  useEffect(() => {
    const timeout = setTimeout(fitViewToTables, 50);
    return () => clearTimeout(timeout);
  }, [activeZoneId, zones.length]);

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.TABLE],
      drop: (item: any, monitor) => {
        if (!canvasRef.current) return;
        const delta = monitor.getDifferenceFromInitialOffset() as {
          x: number;
          y: number;
        };
        if (!delta) return;

        let x = Math.round((item.x + delta.x) / 10) * 10;
        let y = Math.round((item.y + delta.y) / 10) * 10;

        moveTable(item.id, x, y);
      },
    }),
    [moveTable],
  );

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const totalSeats = tables.reduce((acc, t) => acc + t.seats, 0);
  const availableSeats = tables.filter((t) => t.status === "available").reduce((acc, t) => acc + t.seats, 0);

  return (
    <div className="space-y-6 min-h-[calc(100vh-140px)] flex flex-col pb-10">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plan de salle</h2>
          <p className="text-muted-foreground">Gérez vos zones et tables pour organiser votre salle.</p>
        </div>
        <Button onClick={savePlan} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      <div className="flex flex-col grow gap-4">
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
                      className="w-3 h-3 ml-2 opacity-50 hover:opacity-100"
                      onClick={(e) => initiateEditZone(zone.id, zone.name, e)}
                    />
                    <Trash2
                      className="w-3 h-3 ml-2 opacity-50 hover:opacity-100 hover:text-destructive"
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

        <div className="flex gap-6 grow items-stretch overflow-hidden h-[700px]">
          <div className="w-72 shrink-0 space-y-4 flex flex-col z-20">
            <Card className="p-4 bg-slate-50/50">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">TABLES</h3>
              <div className="space-y-2">
                <SidebarItem type="rect" label="Petite (2p)" seats={2} onAdd={() => handleAddTable("rect", 2)} />
                <SidebarItem type="rect" label="Moyenne (4p)" seats={4} onAdd={() => handleAddTable("rect", 4)} />
                <SidebarItem type="circle" label="Ronde (4p)" seats={4} onAdd={() => handleAddTable("circle", 4)} />
              </div>
              <div className="my-4 border-t" />
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">SUR MESURE</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Nombre de couverts</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={customSeats}
                    onChange={(e) => setCustomSeats(parseInt(e.target.value) || 1)}
                    className="bg-white"
                  />
                </div>
                <SidebarItem
                  type="rect"
                  label={`Table custom (${customSeats}p)`}
                  seats={customSeats}
                  onAdd={() => handleAddTable("rect", customSeats)}
                />
              </div>
            </Card>

            <Card className="p-5 bg-card border-slate-200/60 shadow-sm">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">CAPACITÉ DE LA ZONE</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800/80 mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase">Disponibles</span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-green-900">{availableSeats}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ForkKnife className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase">Total</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight">{totalSeats}</div>
                </div>
              </div>
            </Card>

          </div>

          <div
            ref={(node) => {
              drop(node);
              (canvasRef as any).current = node;
            }}
            className="grow h-full bg-slate-100 overflow-hidden relative cursor-grab border rounded-lg shadow-inner"
            onClick={() => setSelectedTableId(null)}
          >
            {tables.map((table) => (
              <DraggableTable
                key={table.id}
                {...table}
                isSelected={selectedTableId === table.id}
                onSelect={(e) => {
                  e.stopPropagation();
                  setSelectedTableId(table.id);
                }}
                onEdit={() => initiateEditTable(table)}
                onDuplicate={() => handleDuplicateTable(table.id)}
                onDelete={() => handleDeleteTable(table.id)}
                onResize={handleResizeTable}
                scale={view.scale}
              />
            ))}
            <TableDragLayer scale={view.scale} />
          </div>
        </div>
      </div>

      <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom / Numéro</Label>
              <Input value={editTableName} onChange={(e) => setEditTableName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nombre de couverts</Label>
              <Input type="number" min={1} value={editTableSeats} onChange={(e) => setEditTableSeats(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTableDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTable}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <AlertDialog open={!!deleteZoneId} onOpenChange={(open) => !open && setDeleteZoneId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la zone ?</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette zone ? Toutes les tables seront définitivement perdues.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteZone} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
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
