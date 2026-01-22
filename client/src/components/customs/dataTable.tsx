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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EllipsisVertical, Plus, RefreshCw, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { DialogHeader, DialogFooter, Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dataCount: number;
  fetchData: (pageIndex: number, pageSize: number) => void;
  isLoading: boolean;
  callback: (action: string, data: any) => void;
  searchElement: string;
  actions?: string[];
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
}: DataTableProps<TData, TValue>) {
  const [openModal, setOpenModal] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { t } = useTranslation();

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

  return (
    <div className="space-y-6">
      {/* Premium Search & Controls Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-6 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-white dark:bg-zinc-900/50 shadow-sm backdrop-blur-sm">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm group">
            <Input
              placeholder={t(`components.dataTable.filters.${searchElement}`)}
              value={(table.getColumn(searchElement)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchElement)?.setFilterValue(event.target.value)}
              className="h-12 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold shadow-inner focus:ring-4 focus:ring-primary/10 transition-all cursor-text"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary opacity-50" />
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {t("components.dataTable.columns")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-2xl">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      className="rounded-xl text-xs font-bold uppercase tracking-tight p-3"
                    >
                      {t(`components.dataTable.columns_list.${column.id}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchData(pagination.pageIndex, pagination.pageSize)}
              disabled={isLoading}
              className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions.includes("create") && (
            <Button
              onClick={() => callback("create", null)}
              className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("components.dataTable.create_entity")}
            </Button>
          )}

          {actions.some((a) => a !== "create") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 cursor-pointer">
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                {actions.includes("deleteAll") && (
                  <DropdownMenuItem
                    className="flex gap-4 p-3 rounded-xl text-destructive font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                    onClick={() => setOpenModal(true)}
                  >
                    <Trash className="w-4 h-4" />
                    <span>{t("components.dataTable.delete_entity")}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-left"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: table.getState().pagination.pageSize }).map((_, idx) => (
                  <TableRow key={`loading-row-${idx}`} className="border-zinc-50 dark:border-zinc-900 border-b">
                    {table.getAllLeafColumns().map((column) => (
                      <TableCell key={column.id} className="p-5">
                        <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-5 text-sm font-bold tracking-tight text-zinc-600 dark:text-zinc-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <span className="text-4xl text-primary drop-shadow-lg">📂</span>
                    <div className="text-xs font-black uppercase tracking-[0.3em]">{t("components.dataTable.no_data")}</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Premium Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Statistiques</span>
          <p className="text-xs font-bold tracking-tight opacity-70">
            {t("components.dataTable.footer.page")} {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1} • {dataCount}{" "}
            {t("components.dataTable.footer.total")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={pagination.pageIndex === 0}
              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              {t("components.dataTable.footer.first")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
              className="h-9 w-9 rounded-xl transition-all cursor-pointer"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={(pagination.pageIndex + 1) * pagination.pageSize >= dataCount}
              className="h-9 w-9 rounded-xl transition-all cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.floor((dataCount - 1) / pagination.pageSize),
                }))
              }
              disabled={(pagination.pageIndex + 1) * pagination.pageSize >= dataCount}
              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              {t("components.dataTable.footer.last")}
            </Button>
          </div>

          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: value === "all" ? dataCount : Number(value),
                pageIndex: 0,
              }));
            }}
          >
            <SelectTrigger className="h-11 w-36 bg-zinc-100 dark:bg-zinc-950 border-none rounded-2xl font-bold text-xs focus:ring-4 focus:ring-primary/10 shadow-inner transition-all cursor-pointer">
              <SelectValue>
                {table.getState().pagination.pageSize === dataCount
                  ? t("components.dataTable.footer.all")
                  : `${table.getState().pagination.pageSize} / page`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl p-2 shadow-2xl">
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)} className="rounded-xl text-xs font-bold p-3">
                  {size} / page
                </SelectItem>
              ))}
              <SelectItem value="all" className="rounded-xl text-xs font-bold p-3">
                {t("components.dataTable.footer.all")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {openModal && (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <DialogHeader className="gap-2 relative z-10">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {t("components.dataTable.delete_title")}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                {t("components.dataTable.delete_description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 gap-3 sm:justify-center relative z-10">
              <Button
                variant="outline"
                onClick={() => setOpenModal(false)}
                className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer"
              >
                {t("global.buttons.cancel")}
              </Button>
              <Button
                variant="destructive"
                className="h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-destructive/20 transition-all cursor-pointer"
                onClick={() => {
                  callback("deleteAll", null);
                  setOpenModal(false);
                }}
              >
                {t("global.buttons.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
