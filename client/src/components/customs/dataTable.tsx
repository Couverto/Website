import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, RefreshCw, Search, Settings2, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dataCount: number;
  fetchData: (pageIndex: number, pageSize: number) => void;
  isLoading: boolean;
  callback: (action: string, data: any) => void;
  searchElement: string;
  actions?: string[];
  onSearch?: (query: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  dataCount,
  fetchData,
  isLoading,
  callback,
  searchElement,
  actions = [],
  onSearch,
}: DataTableProps<TData, TValue>) {
  const [openModal, setOpenModal] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData(pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(dataCount / pagination.pageSize),
  });

  // Handle search with debounce - must be after table is defined
  useEffect(() => {
    if (onSearch) {
      const query = (table.getColumn(searchElement)?.getFilterValue() as string) ?? "";
      // Show searching state immediately when typing
      if (query) setIsSearching(true);
      const timeoutId = setTimeout(() => {
        onSearch(query);
        setIsSearching(false);
        // Reset to page 0 when search changes
        if (pagination.pageIndex !== 0) {
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [columnFilters, searchElement, onSearch]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={"Filtrer..."}
              value={(table.getColumn(searchElement)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchElement)?.setFilterValue(event.target.value)}
              className="h-9 w-full pl-9 bg-background"
            />
          </div>
          {/* Create Button (Mobile/Compact) */}
          {actions.includes("create") && (
            <Button size="sm" className="sm:hidden h-9 w-9 p-0" onClick={() => callback("create", null)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {actions.includes("create") && (
            <Button size="sm" className="hidden sm:flex h-9 gap-1" onClick={() => callback("create", null)}>
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{"Créer une nouvelle entité"}</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 ml-auto sm:ml-0 bg-transparent">
                <Settings2 className="h-3.5 w-3.5 mr-2" />
                {"Colonnes"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Afficher/Masquer les colonnes"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {(column.columnDef.meta as any)?.label || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {actions.includes("deleteAll") && (
            <Button variant="destructive" size="sm" className="h-9 w-9 p-0" onClick={() => setOpenModal(true)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => fetchData(pagination.pageIndex, pagination.pageSize)}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading || isSearching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {"Aucune donnée disponible"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {"Page"} {pagination.pageIndex + 1} / {table.getPageCount() || 1} • {dataCount} {"total"}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Par page</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={`${pagination.pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem
                    key={size}
                    value={`${size}`}
                    disabled={size > dataCount} // grisé si plus grand que dataCount
                  >
                    {size}
                  </SelectItem>
                ))}

                {/* Affiche "Tout" uniquement si dataCount n'est pas déjà dans la liste */}
                {dataCount > 0 && ![10, 20, 30, 40, 50].includes(dataCount) && <SelectItem value={`${dataCount}`}>Tout</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: table.getPageCount() - 1 }))}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{"Supprimer toutes les entités"}</DialogTitle>
              <DialogDescription>
                {"Êtes-vous sûr de vouloir supprimer toutes les entités ? Cette action est irréversible."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                {"Annuler"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  callback("deleteAll", null);
                  setOpenModal(false);
                }}
              >
                {"Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
