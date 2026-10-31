'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DataTable,
  ColumnDef,
  FilterConfig,
  SavedView,
} from '@/components/admin/crud/DataTable';
import { SchemaForm, FormFieldDef } from '@/components/admin/crud/SchemaForm';
import { DetailDrawer, DetailField, AuditRecord } from '@/components/admin/crud/DetailDrawer';
import { BulkActionConfirmModal } from '@/components/admin/crud/BulkActionConfirmModal';
import { CsvImportModal } from '@/components/admin/crud/CsvImportModal';
import { OptimisticConflictModal } from '@/components/admin/crud/OptimisticConflictModal';
import { CreateCorridorSchema } from '@/lib/validations/corridors';
import { TransportCorridor } from '@/types';
import {
  Route,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Coins,
  Building2,
  X,
  Plus,
} from 'lucide-react';

export default function AdminCorridorsPage() {
  const [corridors, setCorridors] = useState<TransportCorridor[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ totalActive: 0, totalInTrash: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Table state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isTrashView, setIsTrashView] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSavedView, setActiveSavedView] = useState('all');

  // Modals & Drawer state
  const [selectedCorridor, setSelectedCorridor] = useState<TransportCorridor | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictVersions, setConflictVersions] = useState<{ current?: number; expected?: number }>({});

  // Bulk confirmation modal
  const [bulkModalConfig, setBulkModalConfig] = useState<{
    isOpen: boolean;
    action: 'softDelete' | 'restore' | 'updateStatus';
    status?: 'ACTIVE' | 'SUSPENDED';
    title: string;
    description: string;
    isDestructive?: boolean;
    requireReason?: boolean;
  }>({
    isOpen: false,
    action: 'softDelete',
    title: '',
    description: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        sort: sortField,
        order: sortOrder,
        search,
        status: statusFilter,
        trash: String(isTrashView),
      });

      const res = await fetch(`/api/admin/corridors?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des corridors');
      }

      const result = await res.json();
      setCorridors(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sortField, sortOrder, search, statusFilter, isTrashView]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form Field Definitions for Create/Edit
  const formFields: FormFieldDef[] = [
    {
      name: 'code',
      label: 'Code de la ligne',
      type: 'text',
      placeholder: 'Ex: KIN-MAT-01',
      helperText: 'Identifiant unique de la liaison routière (majuscules, chiffres, tirets)',
      required: true,
    },
    {
      name: 'originCity',
      label: 'Ville de départ',
      type: 'text',
      placeholder: 'Ex: Kinshasa',
      required: true,
    },
    {
      name: 'destinationCity',
      label: 'Ville d’arrivée',
      type: 'text',
      placeholder: 'Ex: Matadi',
      required: true,
    },
    {
      name: 'distanceKm',
      label: 'Distance routière (km)',
      type: 'number',
      placeholder: 'Ex: 352',
      min: 1,
      required: true,
    },
    {
      name: 'averageDurationHours',
      label: 'Durée moyenne du trajet (heures)',
      type: 'number',
      placeholder: 'Ex: 5.5',
      step: 0.5,
      min: 0.5,
      required: true,
    },
    {
      name: 'basePriceCdf',
      label: 'Tarif voyageur standard (CDF)',
      type: 'number',
      placeholder: 'Ex: 45000',
      min: 1000,
      required: true,
    },
    {
      name: 'basePriceUsd',
      label: 'Tarif voyageur équivalent (USD)',
      type: 'number',
      placeholder: 'Ex: 16.5',
      step: 0.5,
      min: 1,
      required: true,
    },
    {
      name: 'status',
      label: 'Statut opérationnel',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Actif (Ligne ouverte aux réservations)' },
        { value: 'MAINTENANCE', label: 'Maintenance (Déviations / Travaux routiers)' },
        { value: 'SUSPENDED', label: 'Suspendu (Fermeture administrative / Sécurité)' },
      ],
    },
    {
      name: 'operatorCount',
      label: 'Nombre d’opérateurs autorisés',
      type: 'number',
      min: 0,
    },
    {
      name: 'notes',
      label: 'Observations et remarques régulation',
      type: 'textarea',
      placeholder: 'Préciser les particularités de l’axe routier...',
      rows: 2,
    },
  ];

  // Table Column Definitions
  const columns: ColumnDef<TransportCorridor>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
          {row.code}
        </span>
      ),
    },
    {
      key: 'trajectory',
      label: 'Axe / Itinéraire',
      render: (row) => (
        <div>
          <span className="font-bold text-white">
            {row.originCity} → {row.destinationCity}
          </span>
          {row.notes && (
            <p className="text-2xs text-neutral-400 truncate max-w-xs">{row.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'distanceKm',
      label: 'Distance & Durée',
      sortable: true,
      render: (row) => (
        <span className="text-neutral-300">
          {row.distanceKm} km • {row.averageDurationHours}h
        </span>
      ),
    },
    {
      key: 'basePriceCdf',
      label: 'Tarif de Référence',
      sortable: true,
      render: (row) => (
        <div className="font-mono">
          <span className="font-bold text-white">
            {row.basePriceCdf.toLocaleString('fr-FR')} CDF
          </span>
          <span className="text-neutral-400 text-2xs block">
            ({row.basePriceUsd.toFixed(2)} USD)
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (row) => {
        if (row.deletedAt) {
          return (
            <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-red-950 text-red-300 border border-red-800">
              Archivé
            </span>
          );
        }
        if (row.status === 'ACTIVE') {
          return (
            <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
              Actif
            </span>
          );
        }
        if (row.status === 'MAINTENANCE') {
          return (
            <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-amber-950 text-amber-300 border border-amber-800">
              Maintenance
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-2xs font-black bg-neutral-900 text-neutral-300 border border-neutral-700">
            Suspendu
          </span>
        );
      },
    },
    {
      key: 'operatorCount',
      label: 'Opérateurs',
      sortable: true,
      render: (row) => (
        <span className="text-neutral-300 font-bold flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-neutral-500" />
          <span>{row.operatorCount}</span>
        </span>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (row) => (
        <span className="font-mono text-2xs text-neutral-400">v{row.version}</span>
      ),
    },
  ];

  // Filters config
  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Statut',
      options: [
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'SUSPENDED', label: 'Suspendu' },
      ],
    },
  ];

  // Saved Views
  const savedViews: SavedView[] = [
    {
      id: 'all',
      label: 'Tous les corridors',
      filters: { status: 'ALL' },
    },
    {
      id: 'active',
      label: 'Lignes actives',
      filters: { status: 'ACTIVE' },
    },
    {
      id: 'maintenance',
      label: 'En maintenance',
      filters: { status: 'MAINTENANCE' },
    },
    {
      id: 'suspended',
      label: 'Lignes suspendues',
      filters: { status: 'SUSPENDED' },
    },
  ];

  // Handlers
  const handleSelectSavedView = (view: SavedView) => {
    setActiveSavedView(view.id);
    setStatusFilter(view.filters.status || 'ALL');
  };

  const handleCreateSubmit = async (data: any) => {
    const res = await fetch('/api/admin/corridors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erreur lors de la création');
    }

    setIsCreateModalOpen(false);
    showNotification('success', `Corridor ${result.item.code} créé avec succès.`);
    fetchData();
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedCorridor) return;

    // Send expectedVersion for optimistic locking verification
    const res = await fetch(`/api/admin/corridors/${selectedCorridor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        expectedVersion: selectedCorridor.version,
      }),
    });

    const result = await res.json();

    if (res.status === 409) {
      // Optimistic lock conflict!
      setIsEditModalOpen(false);
      setIsDetailDrawerOpen(false);
      setConflictVersions({
        current: result.currentVersion,
        expected: result.expectedVersion,
      });
      setIsConflictModalOpen(true);
      return;
    }

    if (!res.ok) {
      throw new Error(result.error || 'Erreur lors de la mise à jour');
    }

    setIsEditModalOpen(false);
    setIsDetailDrawerOpen(false);
    showNotification('success', `Corridor ${result.item.code} mis à jour (v${result.item.version}).`);
    fetchData();
  };

  const handleSoftDelete = async (id: string, reason: string) => {
    const res = await fetch(`/api/admin/corridors/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erreur lors de la suppression');
    }

    setIsDetailDrawerOpen(false);
    showNotification('success', 'Ligne archivée avec succès dans la corbeille.');
    fetchData();
  };

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/admin/corridors/${id}/restore`, {
      method: 'POST',
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erreur lors de la restauration');
    }

    setIsDetailDrawerOpen(false);
    showNotification('success', 'Ligne restaurée depuis la corbeille.');
    fetchData();
  };

  // Bulk actions executions
  const executeBulkAction = async (reason?: string) => {
    const { action, status } = bulkModalConfig;

    const res = await fetch('/api/admin/corridors/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        ids: selectedIds,
        reason,
        status,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erreur lors de l’action groupée');
    }

    setSelectedIds([]);
    showNotification(
      'success',
      `Action groupée exécutée : ${result.success} enregistrement(s) traité(s).`
    );
    fetchData();
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      format: 'csv',
      search,
      status: statusFilter,
      trash: String(isTrashView),
    });
    window.open(`/api/admin/corridors?${params.toString()}`, '_blank');
  };

  // Detail fields mapper
  const detailFields: DetailField[] = selectedCorridor
    ? [
        { label: 'Code Identifiant', value: selectedCorridor.code },
        { label: 'Statut', value: selectedCorridor.status },
        {
          label: 'Itinéraire',
          value: `${selectedCorridor.originCity} → ${selectedCorridor.destinationCity}`,
          span: 2,
        },
        { label: 'Distance', value: `${selectedCorridor.distanceKm} km` },
        { label: 'Durée Estimée', value: `${selectedCorridor.averageDurationHours} heures` },
        {
          label: 'Tarif Passager (CDF)',
          value: `${selectedCorridor.basePriceCdf.toLocaleString('fr-FR')} CDF`,
        },
        { label: 'Tarif Passager (USD)', value: `${selectedCorridor.basePriceUsd} USD` },
        { label: 'Opérateurs Autorisés', value: selectedCorridor.operatorCount },
        { label: 'Estampille Version', value: `v${selectedCorridor.version}` },
        { label: 'Date de Création', value: selectedCorridor.createdAt },
        { label: 'Dernière Mise à Jour', value: selectedCorridor.updatedAt },
        ...(selectedCorridor.deletedAt
          ? [
              { label: 'Archivé le', value: selectedCorridor.deletedAt },
              { label: 'Archivé par', value: selectedCorridor.deletedBy },
              { label: 'Motif d’archivage', value: selectedCorridor.deleteReason, span: 2 as const },
            ]
          : []),
        ...(selectedCorridor.notes
          ? [{ label: 'Notes régulation', value: selectedCorridor.notes, span: 2 as const }]
          : []),
      ]
    : [];

  const auditHistory: AuditRecord[] = selectedCorridor
    ? [
        {
          id: 'aud-cor-1',
          timestamp: selectedCorridor.updatedAt,
          adminName: 'Superviseur National',
          action: 'CORRIDOR_UPDATE',
          details: { version: selectedCorridor.version, status: selectedCorridor.status },
        },
        {
          id: 'aud-cor-2',
          timestamp: selectedCorridor.createdAt,
          adminName: 'Opérateur Régulation',
          action: 'CORRIDOR_CREATE',
          details: { code: selectedCorridor.code },
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in shadow-xl ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-red-950/90 text-red-200 border-red-500/50'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Generic Data Table Component */}
      <DataTable
        title="Lignes & Corridors Interurbains"
        subtitle="Gestion du réseau de transport interurbain, tarification de référence et autorisations de desserte."
        columns={columns}
        data={corridors}
        pagination={pagination}
        isLoading={isLoading}
        searchPlaceholder="Rechercher code, ville d’origine ou d’arrivée..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortField(field);
          setSortOrder(order);
        }}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
        filters={filters}
        filterValues={{ status: statusFilter }}
        onFilterChange={(_, val) => {
          setStatusFilter(val);
          setActiveSavedView('');
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        onResetFilters={() => {
          setStatusFilter('ALL');
          setSearch('');
          setActiveSavedView('all');
        }}
        savedViews={savedViews}
        activeSavedView={activeSavedView}
        onSelectSavedView={handleSelectSavedView}
        isTrashView={isTrashView}
        onToggleTrashView={() => {
          setIsTrashView(!isTrashView);
          setSelectedIds([]);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        activeCount={stats.totalActive}
        trashCount={stats.totalInTrash}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        createLabel="Créer un corridor"
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onRowClick={(row) => {
          setSelectedCorridor(row);
          setIsDetailDrawerOpen(true);
        }}
        bulkActions={
          isTrashView
            ? [
                {
                  key: 'restore',
                  label: 'Restaurer la sélection',
                  icon: RotateCcw,
                  onClick: () => {
                    setBulkModalConfig({
                      isOpen: true,
                      action: 'restore',
                      title: 'Restaurer les corridors sélectionnés',
                      description: 'Ces lignes seront rétablies dans le catalogue actif.',
                      isDestructive: false,
                    });
                  },
                },
              ]
            : [
                {
                  key: 'activate',
                  label: 'Activer la sélection',
                  icon: CheckCircle,
                  onClick: () => {
                    setBulkModalConfig({
                      isOpen: true,
                      action: 'updateStatus',
                      status: 'ACTIVE',
                      title: 'Activer les lignes sélectionnées',
                      description: 'Les réservations seront immédiatement autorisées sur ces axes.',
                      isDestructive: false,
                    });
                  },
                },
                {
                  key: 'suspend',
                  label: 'Suspendre la sélection',
                  icon: AlertTriangle,
                  onClick: () => {
                    setBulkModalConfig({
                      isOpen: true,
                      action: 'updateStatus',
                      status: 'SUSPENDED',
                      title: 'Suspendre les lignes sélectionnées',
                      description: 'Les réservations seront gelées temporairement.',
                      isDestructive: false,
                    });
                  },
                },
                {
                  key: 'delete',
                  label: 'Archiver dans la corbeille',
                  icon: Trash2,
                  variant: 'destructive',
                  onClick: () => {
                    setBulkModalConfig({
                      isOpen: true,
                      action: 'softDelete',
                      title: 'Archiver les corridors sélectionnés',
                      description: 'Les lignes seront déplacées dans la corbeille avec traçabilité d’audit.',
                      isDestructive: true,
                      requireReason: true,
                    });
                  },
                },
              ]
        }
      />

      {/* Detail Drawer */}
      {selectedCorridor && (
        <DetailDrawer
          isOpen={isDetailDrawerOpen}
          onClose={() => setIsDetailDrawerOpen(false)}
          title={`Corridor ${selectedCorridor.code}`}
          subtitle={`${selectedCorridor.originCity} → ${selectedCorridor.destinationCity}`}
          version={selectedCorridor.version}
          isDeleted={Boolean(selectedCorridor.deletedAt)}
          fields={detailFields}
          auditHistory={auditHistory}
          onEdit={() => {
            setIsDetailDrawerOpen(false);
            setIsEditModalOpen(true);
          }}
          onDelete={() => {
            setBulkModalConfig({
              isOpen: true,
              action: 'softDelete',
              title: `Archiver le corridor ${selectedCorridor.code}`,
              description: `Voulez-vous archiver l’axe ${selectedCorridor.originCity} - ${selectedCorridor.destinationCity} ?`,
              isDestructive: true,
              requireReason: true,
            });
          }}
          onRestore={() => handleRestore(selectedCorridor.id)}
        />
      )}

      {/* Create Modal with SchemaForm */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0A1A2E] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <SchemaForm
              title="Ajouter un corridor interurbain"
              subtitle="Renseignez les détails du corridor pour le réseau national RDC"
              fields={formFields}
              schema={CreateCorridorSchema}
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              submitLabel="Créer le corridor"
            />
          </div>
        </div>
      )}

      {/* Edit Modal with SchemaForm & Optimistic Lock */}
      {isEditModalOpen && selectedCorridor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0A1A2E] border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <SchemaForm
              title={`Modifier le corridor ${selectedCorridor.code}`}
              subtitle={`Édition de l'axe (Version actuelle v${selectedCorridor.version})`}
              fields={formFields}
              schema={CreateCorridorSchema}
              initialValues={selectedCorridor}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditModalOpen(false)}
              submitLabel="Enregistrer les modifications"
            />
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      <BulkActionConfirmModal
        isOpen={bulkModalConfig.isOpen}
        onClose={() => setBulkModalConfig((p) => ({ ...p, isOpen: false }))}
        title={bulkModalConfig.title}
        description={bulkModalConfig.description}
        count={selectedCorridor ? 1 : selectedIds.length}
        requireReason={bulkModalConfig.requireReason}
        isDestructive={bulkModalConfig.isDestructive}
        confirmLabel="Valider l’opération"
        onConfirm={async (reason) => {
          if (selectedCorridor && bulkModalConfig.action === 'softDelete') {
            await handleSoftDelete(selectedCorridor.id, reason || 'Archivage individuel');
          } else {
            await executeBulkAction(reason);
          }
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          fetchData();
        }}
        onImportCommit={async (rows) => {
          const res = await fetch('/api/admin/corridors/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows, dryRun: false }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Erreur lors de l’importation');
          }
          return { importedCount: data.importedCount };
        }}
      />

      {/* Optimistic Conflict Modal (409) */}
      <OptimisticConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        currentVersion={conflictVersions.current}
        expectedVersion={conflictVersions.expected}
        onReload={fetchData}
      />
    </div>
  );
}
