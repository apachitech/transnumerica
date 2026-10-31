import { logAdminAction } from './admin-store';
import { AdminSession } from '@/types';

export interface BaseEntity {
  id: string;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class OptimisticLockError extends Error {
  public currentVersion: number;
  public expectedVersion: number;

  constructor(message: string, currentVersion: number, expectedVersion: number) {
    super(message);
    this.name = 'OptimisticLockError';
    this.currentVersion = currentVersion;
    this.expectedVersion = expectedVersion;
  }
}

export interface CrudFindManyOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, string | number | boolean | undefined>;
  includeDeleted?: boolean | 'only';
}

export interface CrudFindManyResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalActive: number;
    totalInTrash: number;
  };
}

export class CrudRepository<T extends BaseEntity> {
  protected entityName: string;
  protected store: Map<string, T>;
  protected searchableFields: (keyof T)[];

  constructor(entityName: string, initialItems: T[] = [], searchableFields: (keyof T)[] = []) {
    this.entityName = entityName;
    this.store = new Map();
    this.searchableFields = searchableFields;

    for (const item of initialItems) {
      this.store.set(item.id, { ...item });
    }
  }

  public async findMany(options: CrudFindManyOptions = {}): Promise<CrudFindManyResult<T>> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search = '',
      filters = {},
      includeDeleted = false,
    } = options;

    let allItems = Array.from(this.store.values());

    const totalActive = allItems.filter((item) => !item.deletedAt).length;
    const totalInTrash = allItems.filter((item) => !!item.deletedAt).length;

    // Filter by soft-delete state
    if (includeDeleted === 'only' || includeDeleted === true) {
      allItems = allItems.filter((item) => !!item.deletedAt);
    } else {
      allItems = allItems.filter((item) => !item.deletedAt);
    }

    // Filter by exact/custom field filters
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== '' && val !== 'ALL') {
        allItems = allItems.filter((item) => {
          const itemVal = (item as any)[key];
          if (itemVal === undefined || itemVal === null) return false;
          return String(itemVal).toLowerCase() === String(val).toLowerCase();
        });
      }
    }

    // Filter by search term across searchable fields
    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      allItems = allItems.filter((item) => {
        if (this.searchableFields.length > 0) {
          return this.searchableFields.some((field) => {
            const val = item[field];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Fallback: search all string/number fields
        return Object.values(item).some(
          (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(q)
        );
      });
    }

    // Sort items
    allItems.sort((a: any, b: any) => {
      const valA = a[sort];
      const valB = b[sort];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), 'fr');
      }

      return order === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const total = allItems.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems.map((item) => ({ ...item })),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
      stats: {
        totalActive,
        totalInTrash,
      },
    };
  }

  public async findById(id: string): Promise<T | null> {
    const item = this.store.get(id);
    return item ? { ...item } : null;
  }

  public async create(
    data: Omit<T, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    adminSession: AdminSession,
    ip?: string
  ): Promise<T> {
    const now = new Date().toISOString();
    const id = `cor-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    const newItem = {
      ...data,
      id,
      version: 1,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    this.store.set(id, newItem);

    // Append to audit log
    logAdminAction({
      adminUser: adminSession.email,
      action: `${this.entityName.toUpperCase()}_CREATE`,
      target: `${this.entityName}:${id}`,
      previousState: 'NONE',
      newState: JSON.stringify(newItem),
      reason: 'Création initiale',
      ipAddress: ip || '127.0.0.1',
    });

    return { ...newItem };
  }

  public async update(
    id: string,
    updates: Partial<T>,
    expectedVersion: number,
    adminSession: AdminSession,
    ip?: string
  ): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Enregistrement ${id} introuvable.`);
    }

    // Optimistic locking verification
    if (existing.version !== expectedVersion) {
      throw new OptimisticLockError(
        `Conflit d'édition détecté. L'enregistrement a été modifié par un autre administrateur (version serveur : ${existing.version}, votre version : ${expectedVersion}). Veuillez recharger avant de réessayer.`,
        existing.version,
        expectedVersion
      );
    }

    const beforeState = { ...existing };
    const now = new Date().toISOString();

    const updatedItem: T = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      version: existing.version + 1, // Increment lock version
      updatedAt: now,
    };

    this.store.set(id, updatedItem);

    // Append to audit log
    logAdminAction({
      adminUser: adminSession.email,
      action: `${this.entityName.toUpperCase()}_UPDATE`,
      target: `${this.entityName}:${id}`,
      previousState: JSON.stringify(beforeState),
      newState: JSON.stringify(updatedItem),
      reason: `Mise à jour v${updatedItem.version}`,
      ipAddress: ip || '127.0.0.1',
    });

    return { ...updatedItem };
  }

  public async softDelete(
    id: string,
    reason: string,
    adminSession: AdminSession,
    ip?: string
  ): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Enregistrement ${id} introuvable.`);
    }

    if (!reason || reason.trim().length < 3) {
      throw new Error("Un motif d'archivage d'au moins 3 caractères est obligatoire.");
    }

    const beforeState = { ...existing };
    const now = new Date().toISOString();

    const deletedItem: T = {
      ...existing,
      deletedAt: now,
      deletedBy: adminSession.email,
      deleteReason: reason.trim(),
      version: existing.version + 1,
      updatedAt: now,
    };

    this.store.set(id, deletedItem);

    logAdminAction({
      adminUser: adminSession.email,
      action: `${this.entityName.toUpperCase()}_SOFT_DELETE`,
      target: `${this.entityName}:${id}`,
      previousState: JSON.stringify(beforeState),
      newState: JSON.stringify(deletedItem),
      reason: reason.trim(),
      ipAddress: ip || '127.0.0.1',
    });

    return { ...deletedItem };
  }

  public async restore(
    id: string,
    adminSession: AdminSession,
    ip?: string
  ): Promise<T> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Enregistrement ${id} introuvable.`);
    }

    if (!existing.deletedAt) {
      return { ...existing };
    }

    const beforeState = { ...existing };
    const now = new Date().toISOString();

    const restoredItem: T = {
      ...existing,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      version: existing.version + 1,
      updatedAt: now,
    };

    this.store.set(id, restoredItem);

    logAdminAction({
      adminUser: adminSession.email,
      action: `${this.entityName.toUpperCase()}_RESTORE`,
      target: `${this.entityName}:${id}`,
      previousState: JSON.stringify(beforeState),
      newState: JSON.stringify(restoredItem),
      reason: 'Restauration depuis la corbeille',
      ipAddress: ip || '127.0.0.1',
    });

    return { ...restoredItem };
  }

  public async bulkAction(
    action: 'softDelete' | 'restore' | 'updateStatus',
    ids: string[],
    params: { reason?: string; status?: string } = {},
    adminSession: AdminSession,
    ip?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        if (action === 'softDelete') {
          await this.softDelete(id, params.reason || 'Action groupée d’archivage', adminSession, ip);
          success++;
        } else if (action === 'restore') {
          await this.restore(id, adminSession, ip);
          success++;
        } else if (action === 'updateStatus' && params.status) {
          const item = await this.findById(id);
          if (item) {
            await this.update(id, { status: params.status } as any, item.version, adminSession, ip);
            success++;
          }
        }
      } catch (err: any) {
        failed++;
        errors.push(`${id}: ${err.message || 'Erreur'}`);
      }
    }

    return { success, failed, errors };
  }

  public exportCsv(columns: { key: keyof T; label: string }[], items?: T[]): string {
    const dataToExport = items || Array.from(this.store.values()).filter((item) => !item.deletedAt);
    const header = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(';');

    const rows = dataToExport.map((item) => {
      return columns
        .map((col) => {
          const val = item[col.key];
          if (val === undefined || val === null) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(';');
    });

    return [header, ...rows].join('\r\n');
  }
}
