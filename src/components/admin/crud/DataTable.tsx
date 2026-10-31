'use client';

import React, { useState, useId } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  CheckSquare,
  Square,
  Bookmark,
  Eye,
  RefreshCw,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hideable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SavedView {
  id: string;
  label: string;
  filters: Record<string, string>;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'warning';
  onClick: (selectedIds: string[], selectedRows: T[]) => void;
}

interface DataTableProps<T extends { id: string }> {
  title: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onResetFilters?: () => void;
  savedViews?: SavedView[];
  activeSavedView?: string;
  onSelectSavedView?: (view: SavedView) => void;
  isTrashView?: boolean;
  onToggleTrashView?: () => void;
  activeCount?: number;
  trashCount?: number;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: BulkAction<T>[];
  onOpenCreate?: () => void;
  createLabel?: string;
  onOpenImport?: () => void;
  onExportCsv?: () => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyCtaLabel?: string;
}

export function DataTable<T extends { id: string }>({
  title,
  subtitle,
  columns,
  data,
  pagination,
  isLoading = false,
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  onSearchChange,
  sortField,
  sortOrder = 'desc',
  onSortChange,
  onPageChange,
  onLimitChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onResetFilters,
  savedViews = [],
  activeSavedView,
  onSelectSavedView,
  isTrashView = false,
  onToggleTrashView,
  activeCount = 0,
  trashCount = 0,
  selectedIds = [],
  onSelectionChange,
  bulkActions = [],
  onOpenCreate,
  createLabel = 'Nouveau',
  onOpenImport,
  onExportCsv,
  onRowClick,
  emptyMessage = 'Aucun élément trouvé',
  emptyCtaLabel,
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.key] = true;
    });
    return initial;
  });

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const searchInputId = useId();

  const handleToggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((d) => d.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    if (sortField === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const activeColumns = columns.filter((col) => visibleColumns[col.key] !== false);

  return (
    <div className="space-y-4">
      {/* Header bar: Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {isTrashView && (
              <span className="px-2 py-0.5 rounded-full bg-red-900/60 text-red-200 text-xs font-black border border-red-800">
                Corbeille
              </span>
            )}
          </h1>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Trash Toggle */}
          {onToggleTrashView && (
            <button
              type="button"
              onClick={onToggleTrashView}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                isTrashView
                  ? 'bg-red-950/70 text-red-200 border-red-800'
                  : 'bg-[#0E2038] text-neutral-300 border-white/10 hover:bg-[#142844]'
              }`}
              title={isTrashView ? 'Voir les éléments actifs' : 'Voir la corbeille'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isTrashView ? `Actifs (${activeCount})` : `Corbeille (${trashCount})`}</span>
            </button>
          )}

          {/* Export CSV */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2 rounded-xl bg-[#0E2038] hover:bg-[#142844] text-neutral-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors"
              title="Exporter les résultats filtrés en CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          {/* Import CSV */}
          {onOpenImport && !isTrashView && (
            <button
              type="button"
              onClick={onOpenImport}
              className="px-3 py-2 rounded-xl bg-[#0E2038] hover:bg-[#142844] text-neutral-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors"
              title="Importer des données depuis un fichier CSV"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
          )}

          {/* Create Button */}
          {onOpenCreate && !isTrashView && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved views chips if available */}
      {savedViews.length > 0 && !isTrashView && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 font-bold flex items-center gap-1 text-2xs uppercase tracking-wider shrink-0">
            <Bookmark className="w-3 h-3 text-amber-400" /> Vues :
          </span>
          {savedViews.map((view) => {
            const isActive = activeSavedView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onSelectSavedView?.(view)}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors border text-2xs ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                    : 'bg-[#0E2038] text-neutral-300 border-white/10 hover:bg-[#142844]'
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar: Search, Filters, Column Toggle */}
      <div className="p-3 bg-[#0A1A2E] border border-white/10 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor={searchInputId} className="sr-only">
              {searchPlaceholder}
            </label>
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id={searchInputId}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dynamic Filter Selects */}
            {filters.map((f) => (
              <select
                key={f.key}
                aria-label={`Filtrer par ${f.label}`}
                value={filterValues[f.key] || 'ALL'}
                onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                className="px-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-neutral-200 outline-none focus:border-amber-400"
              >
                <option value="ALL">{f.label}: Tous</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

            {/* Reset Filters button */}
            {onResetFilters && Object.values(filterValues).some((v) => v && v !== 'ALL') && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-bold border border-white/10 transition-colors"
                title="Réinitialiser les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Column Visibility Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                className="px-3 py-2 rounded-xl bg-[#081524] hover:bg-white/5 text-neutral-300 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-colors"
                title="Afficher/masquer des colonnes"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Colonnes</span>
              </button>

              {isColumnDropdownOpen && (
                <>
                  <div
                    role="presentation"
                    className="fixed inset-0 z-40"
                    onClick={() => setIsColumnDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-56 p-2 bg-[#0D213A] border border-white/20 rounded-xl shadow-2xl space-y-1">
                    <div className="text-2xs font-black uppercase text-neutral-400 px-2 py-1 tracking-wider border-b border-white/10">
                      Colonnes visibles
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-0.5 py-1">
                      {columns.map((col) => {
                        const isChecked = visibleColumns[col.key] !== false;
                        return (
                          <label
                            key={col.key}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-neutral-200 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleColumn(col.key)}
                              className="rounded border-white/20 text-amber-500 focus:ring-amber-400"
                            />
                            <span>{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedIds.length > 0 && bulkActions.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="text-xs font-bold text-amber-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-black text-2xs flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span>élément{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                const selectedRows = data.filter((d) => selectedIds.includes(d.id));
                const isDestructive = action.variant === 'destructive';
                return (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => action.onClick(selectedIds, selectedRows)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                      isDestructive
                        ? 'bg-red-900/80 hover:bg-red-800 text-red-100 border-red-700'
                        : 'bg-[#0E2038] hover:bg-[#152A48] text-neutral-100 border-white/20'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="bg-[#0A1A2E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-white/10 rounded-lg w-1/3" />
            <div className="h-10 bg-white/5 rounded-xl w-full" />
            <div className="h-10 bg-white/5 rounded-xl w-full" />
            <div className="h-10 bg-white/5 rounded-xl w-full" />
            <div className="h-10 bg-white/5 rounded-xl w-full" />
          </div>
        ) : data.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">{emptyMessage}</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {isTrashView
                ? 'Aucun enregistrement dans la corbeille pour le moment.'
                : 'Modifiez vos critères de recherche ou réinitialisez les filtres pour afficher des données.'}
            </p>
            {onOpenCreate && !isTrashView && emptyCtaLabel && (
              <button
                type="button"
                onClick={onOpenCreate}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{emptyCtaLabel}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#081524]/80 text-2xs font-black uppercase tracking-wider text-neutral-400">
                  {onSelectionChange && (
                    <th className="py-3 px-4 w-10">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="p-1 rounded text-neutral-400 hover:text-white"
                        aria-label="Sélectionner tous les éléments"
                      >
                        {selectedIds.length > 0 && selectedIds.length === data.length ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                  )}
                  {activeColumns.map((col) => {
                    const isSorted = sortField === col.key;
                    return (
                      <th
                        key={col.key}
                        className="py-3 px-4 select-none whitespace-nowrap"
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => handleSort(col.key)}
                            className="flex items-center gap-1.5 hover:text-white transition-colors"
                          >
                            <span>{col.label}</span>
                            {isSorted ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-neutral-500" />
                            )}
                          </button>
                        ) : (
                          <span>{col.label}</span>
                        )}
                      </th>
                    );
                  })}
                  <th className="py-3 px-4 text-right w-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-neutral-200">
                {data.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick?.(row)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {onSelectionChange && (
                        <td
                          className="py-3 px-4"
                          onClick={(e) => handleToggleSelectRow(row.id, e)}
                        >
                          <button
                            type="button"
                            className="p-1 rounded text-neutral-400 hover:text-white"
                            aria-label={`Sélectionner la ligne ${row.id}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {activeColumns.map((col) => {
                        const cellContent = col.render
                          ? col.render(row)
                          : String((row as any)[col.key] ?? '—');

                        return (
                          <td key={col.key} className="py-3 px-4 whitespace-nowrap">
                            {cellContent}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick?.(row);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="py-3 px-4 border-t border-white/10 bg-[#081524]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div>
              Affichage de{' '}
              <span className="font-bold text-white">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              à{' '}
              <span className="font-bold text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              sur <span className="font-bold text-white">{pagination.total}</span> enregistrements
            </div>

            <div className="flex items-center gap-2">
              {onLimitChange && (
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-2xs uppercase tracking-wider">Lignes par page :</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="px-2 py-1 bg-[#0A1A2E] border border-white/15 rounded-lg text-xs text-white outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-bold text-white">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

