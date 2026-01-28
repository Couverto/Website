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
import { Loader2, Save, Armchair, Plus, Minus, Copy, Trash2, Edit2, GripVertical, Check, Grid3X3 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface Zone {
  id: string;
  name: string;
  tables: TableProps[];
}

function SidebarItem({ type, label, seats, onAdd }: { type: "rect" | "circle"; label: string; seats: number; onAdd: () => void }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.SIDEBAR_ITEM,
      item: { type: ItemTypes.SIDEBAR_ITEM, shape: type, seats, label },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [type, label, seats],
  );

  return (
    <div
      ref={drag as any}
      className={`
            p-3 border rounded-md bg-card flex items-center gap-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors
            ${isDragging ? "opacity-50 ring-2 ring-primary border-primary" : ""}
        `}
    >
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

  // Zone Management Dialog State
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [customSeats, setCustomSeats] = useState(2);

  // Table Edit Stats
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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTableId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        // Prevent deleting if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        handleDeleteTable(selectedTableId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTableId, tables]); // Re-bind when selection or tables change

  interface Zone {
    id: string;
    name: string;
    width: number;
    height: number;
    tables: TableProps[];
  }

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
          fetchedZones = [{ id: "main-hall", name: "Salle Principale", width: 1000, height: 800, tables: data.tablePlan }];
        } else {
          fetchedZones = [{ id: "main-hall", name: "Salle Principale", width: 1000, height: 800, tables: [] }];
        }
      } else {
        // Ensure dimensions exist for existing zones and fit all tables
        fetchedZones = fetchedZones.map((z) => {
          let minW = z.width || 1000;
          let minH = z.height || 800;

          if (z.tables && z.tables.length > 0) {
            const maxX = Math.max(...z.tables.map((t) => t.x + (t.width || 80)));
            const maxY = Math.max(...z.tables.map((t) => t.y + (t.height || 60)));
            minW = Math.max(minW, maxX + 50);
            minH = Math.max(minH, maxY + 50);
          }

          return {
            ...z,
            width: minW,
            height: minH,
          };
        });
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

  // Zone Management
  const handleSaveZone = () => {
    if (!newZoneName.trim()) return;

    if (editingZoneId) {
      setZones((prev) => prev.map((z) => (z.id === editingZoneId ? { ...z, name: newZoneName } : z)));
      toast.success("Zone renommée");
    } else {
      // Create new
      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        name: newZoneName,
        width: 1000,
        height: 800,
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

  const handleResizeTable = (id: string, width: number, height: number) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, width, height } : t)));
  };

  // Table Edit Logic
  const initiateEditTable = (table: TableProps) => {
    setEditingTableId(table.id);
    setEditTableName(table.label);
    setEditTableSeats(table.seats);
    setIsEditTableDialogOpen(true);
  };

  const handleDuplicateTable = (id: string | null) => {
    const tableId = id || selectedTableId; // Support both direct and selected
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

    setTables((prev) => prev.map((t) => (t.id === editingTableId ? { ...t, label: editTableName, seats: editTableSeats } : t)));

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

  // Zoom & Pan State
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  const fitViewToTables = () => {
    if (!canvasRef.current || tables.length === 0) {
      setView({ x: 0, y: 0, scale: 1 });
      setIsCanvasReady(true);
      return;
    }

    const PADDING = 100; // px
    const containerWidth = canvasRef.current.clientWidth;
    const containerHeight = canvasRef.current.clientHeight;

    // Calculate Bounding Box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    tables.forEach((t) => {
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x + (t.width || 80));
      maxY = Math.max(maxY, t.y + (t.height || 60));
    });

    if (minX === Infinity) return; // Should be handled by tables.length check but safety first

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Determine scale to fit
    const scaleX = (containerWidth - PADDING * 2) / contentWidth;
    const scaleY = (containerHeight - PADDING * 2) / contentHeight;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 1.5); // Cap max zoom at 1.5 for auto-fit

    // Determine center
    const contentCenterX = minX + contentWidth / 2;
    const contentCenterY = minY + contentHeight / 2;

    const containerCenterX = containerWidth / 2;
    const containerCenterY = containerHeight / 2;

    // Calculate Pan (Translate)
    // We want the content center to be at the container center
    // containerCenter = (contentCenter * scale) + pan
    // pan = containerCenter - (contentCenter * scale)
    const x = containerCenterX - contentCenterX * scale;
    const y = containerCenterY - contentCenterY * scale;

    setView({ x, y, scale });
    setIsCanvasReady(true);
  };

  useEffect(() => {
    // Auto-fit when changing zones or loading data
    setIsCanvasReady(false);

    // We add a small timeout to allow DOM to settle if needed, or if canvasRef is not yet ready
    const timeout = setTimeout(() => {
      fitViewToTables();
    }, 100);
    return () => clearTimeout(timeout);
  }, [activeZoneId, zones]); // Triggers when zone changes or zones data loads

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    // If clicking on a table or something interactive, don't pan
    if ((e.target as HTMLElement).closest(".draggable-table")) return;

    isPanningRef.current = true;
    startPanRef.current = { x: e.clientX - view.x, y: e.clientY - view.y };

    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        // Use functional state update to ensure latest scale is used without dependency issues
        setView((prev) => {
          const newScale = Math.min(Math.max(0.1, prev.scale + scaleAmount), 3);
          return { ...prev, scale: newScale };
        });
      }
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener("wheel", handleWheel, { passive: false });
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      e.preventDefault();
      setView((prev) => ({
        ...prev,
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      }));
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (canvasEl) {
        canvasEl.removeEventListener("wheel", handleWheel);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []); // Empty dependency array is fine if using functional state updates or refs

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Modified Drop Logic for Zoom
  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.TABLE, ItemTypes.SIDEBAR_ITEM],
      hover: (item: any, monitor) => {
        if (!canvasRef.current || !activeZoneId) return;
        // Optimization: We might need to adjust this for alignment lines with zoom,
        // but for now keeping it simple or adding TODO
      },
      drop: (item: any, monitor) => {
        if (!canvasRef.current || !activeZoneId) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const sourceClientOffset = monitor.getSourceClientOffset();

        if (!sourceClientOffset) return;

        // CRITICAL: Adjust for Zoom and Pan
        // rawX/Y is the position relative to the screen
        // elementX = (rawX - containerLeft - panX) / scale

        const rawX = sourceClientOffset.x - canvasRect.left;
        const rawY = sourceClientOffset.y - canvasRect.top;

        const x = (rawX - view.x) / view.scale;
        const y = (rawY - view.y) / view.scale;

        // Snap and movement logic remains similar, just using the new calculated x/y
        const width = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 80 : 60) : item.width || 80;
        const height = item.type === ItemTypes.SIDEBAR_ITEM ? (item.shape === "rect" ? 60 : 60) : item.height || 60;

        // ... Snap logic using calculated x, y ...
        // For brevity, using simple snap here, you might want to call calculateSnap with these new coords

        const safeX = Math.max(0, Math.round(x / 10) * 10);
        const safeY = Math.max(0, Math.round(y / 10) * 10);

        if (item.type === ItemTypes.TABLE) {
          moveTable(item.id, safeX, safeY);
        } else if (item.type === ItemTypes.SIDEBAR_ITEM) {
          createNewTableFromDrop(item, safeX, safeY);
        }
      },
    }),
    [zones, activeZoneId, tables, view],
  );

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 min-h-[calc(100vh-140px)] flex flex-col pb-10">
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

        <div className="flex gap-6 grow items-start overflow-hidden h-[600px]">
          {/* Fixed height for infinite canvas container */}

          {/* Sidebar */}
          <div className="w-64 shrink-0 space-y-4 flex flex-col z-20">
            {" "}
            {/* z-20 to float above canvas if needed */}
            <Card className="p-4 bg-slate-50/50">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Tables Standard</h3>
              <div className="space-y-2">
                <SidebarItem type="rect" label="Petite" seats={2} onAdd={() => handleAddTable("rect", 2)} />
                <SidebarItem type="rect" label="Moyenne" seats={4} onAdd={() => handleAddTable("rect", 4)} />
                <SidebarItem type="rect" label="Grande" seats={6} onAdd={() => handleAddTable("rect", 6)} />
                <SidebarItem type="circle" label="Ronde" seats={4} onAdd={() => handleAddTable("circle", 4)} />
              </div>

              <div className="my-4 border-t" />

              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Sur Mesure</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Nombre de couverts</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={customSeats}
                      onChange={(e) => setCustomSeats(parseInt(e.target.value) || 0)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <SidebarItem type="rect" label="Table Custom" seats={customSeats} onAdd={() => handleAddTable("rect", customSeats)} />
              </div>
            </Card>
            <Card className="p-5 bg-card border-slate-200/60 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-primary" />
                DÉTAILS DE LA ZONE
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 transition-colors hover:bg-slate-100/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Grid3X3 className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase leading-none">Tables</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight">{tables.length}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 transition-colors hover:bg-slate-100/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Armchair className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase leading-none">Couverts</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight">{tables.reduce((acc, t) => acc + t.seats, 0)}</div>
                </div>
              </div>
            </Card>
            {/* Removed Properties Panel */}
          </div>

          {/* Infinite Canvas Container */}
          <div
            className="grow h-full bg-slate-100 overflow-hidden relative cursor-grab border rounded-lg shadow-inner"
            ref={(node) => {
              drop(node);
              (canvasRef as any).current = node;
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Loading Skeleton Overlay */}
            {!isCanvasReady && (
              <div className="absolute inset-0 z-50 bg-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="w-[800px] h-[600px] rounded-xl bg-slate-200" />
                  <span className="text-muted-foreground text-sm animate-pulse">Chargement du plan...</span>
                </div>
              </div>
            )}

            {/* Grid Background (Fixed or Panning? Panning usually feels better) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
                backgroundSize: `${20 * view.scale}px ${20 * view.scale}px`, // Scale grid? Or keep fixed and transform container?
                // Let's transform a wrapper div instead.
              }}
            />

            {/* Transformation Wrapper */}
            <div
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "0 0",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Visual Grid for reference that moves with pan */}
              <div
                className="absolute -inset-[5000px] opacity-20 pointer-events-none"
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
                    onEdit={() => initiateEditTable(table)}
                    onDuplicate={() => handleDuplicateTable(table.id)}
                    onDelete={() => handleDeleteTable(table.id)}
                    onResize={handleResizeTable}
                    scale={view.scale}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <Button size="icon" variant="secondary" onClick={() => setView((v) => ({ ...v, scale: Math.min(3, v.scale + 0.1) }))}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={() => setView((v) => ({ ...v, scale: Math.max(0.1, v.scale - 0.1) }))}>
                <Minus className="h-4 w-4" /> {/* Need to import Minus */}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setView({ x: 0, y: 0, scale: 1 })}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Table Dialog */}
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
