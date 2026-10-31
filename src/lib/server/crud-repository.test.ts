import { describe, it, expect, beforeEach } from 'vitest';
import {
  CrudRepository,
  BaseEntity,
  OptimisticLockError,
} from './crud-repository';
import { AdminSession } from '@/types';

interface TestItem extends BaseEntity {
  name: string;
  category: string;
  amount: number;
}

const mockAdminSession: AdminSession = {
  sessionId: 'test-session-1',
  adminId: 'usr-admin-01',
  role: 'SUPER_ADMIN',
  permissions: ['analytics.read'],
  name: 'Super Admin Test',
  email: 'test@transnumerica.cd',
  createdAt: Date.now(),
  lastActivityAt: Date.now(),
  expiresAt: Date.now() + 1800000,
};

describe('Generic Admin CrudRepository Framework', () => {
  let repo: CrudRepository<TestItem>;

  beforeEach(() => {
    const initialItems: TestItem[] = [
      {
        id: 'item-1',
        name: 'Kinshasa Express',
        category: 'BUS',
        amount: 45000,
        version: 1,
        deletedAt: null,
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'item-2',
        name: 'Matadi Navette',
        category: 'BUS',
        amount: 40000,
        version: 1,
        deletedAt: null,
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
      },
      {
        id: 'item-3',
        name: 'Gombe Taxi VIP',
        category: 'TAXI',
        amount: 25000,
        version: 1,
        deletedAt: null,
        createdAt: '2026-01-03T10:00:00Z',
        updatedAt: '2026-01-03T10:00:00Z',
      },
    ];

    repo = new CrudRepository<TestItem>('test_item', initialItems, ['name', 'category']);
  });

  it('1. findMany supports pagination, sorting, search and filters', async () => {
    // Basic list
    const res1 = await repo.findMany({ page: 1, limit: 2 });
    expect(res1.data.length).toBe(2);
    expect(res1.pagination.total).toBe(3);
    expect(res1.pagination.totalPages).toBe(2);

    // Sorting by amount desc
    const sorted = await repo.findMany({ sort: 'amount', order: 'desc' });
    expect(sorted.data[0].amount).toBe(45000);
    expect(sorted.data[2].amount).toBe(25000);

    // Search query
    const searchRes = await repo.findMany({ search: 'Matadi' });
    expect(searchRes.data.length).toBe(1);
    expect(searchRes.data[0].name).toBe('Matadi Navette');

    // Filter by category
    const filterRes = await repo.findMany({ filters: { category: 'TAXI' } });
    expect(filterRes.data.length).toBe(1);
    expect(filterRes.data[0].name).toBe('Gombe Taxi VIP');
  });

  it('2. create generates unique ID, version 1, and timestamps', async () => {
    const created = await repo.create(
      { name: 'Kikwit Direct', category: 'BUS', amount: 60000 },
      mockAdminSession
    );

    expect(created.id).toBeDefined();
    expect(created.version).toBe(1);
    expect(created.deletedAt).toBeNull();
    expect(created.name).toBe('Kikwit Direct');

    const fetched = await repo.findById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.amount).toBe(60000);
  });

  it('3. update implements optimistic locking and increments version', async () => {
    const item = (await repo.findById('item-1'))!;
    expect(item.version).toBe(1);

    // Successful update with matching expectedVersion = 1
    const updated = await repo.update(
      'item-1',
      { amount: 50000 },
      1,
      mockAdminSession
    );

    expect(updated.amount).toBe(50000);
    expect(updated.version).toBe(2);

    // Concurrent edit attempt with stale version 1 -> Must throw OptimisticLockError (HTTP 409)
    await expect(
      repo.update('item-1', { amount: 52000 }, 1, mockAdminSession)
    ).rejects.toThrow(OptimisticLockError);

    // Attempt with correct new version 2 -> Succeeds and increments to v3
    const updated2 = await repo.update(
      'item-1',
      { amount: 52000 },
      2,
      mockAdminSession
    );
    expect(updated2.version).toBe(3);
  });

  it('4. softDelete moves item to trash with mandatory reason and increments version', async () => {
    // Fails if reason is too short
    await expect(
      repo.softDelete('item-2', 'no', mockAdminSession)
    ).rejects.toThrow(/motif d'archivage/i);

    const deleted = await repo.softDelete(
      'item-2',
      'Ligne suspendue pour travaux routiers',
      mockAdminSession
    );

    expect(deleted.deletedAt).not.toBeNull();
    expect(deleted.deleteReason).toBe('Ligne suspendue pour travaux routiers');
    expect(deleted.deletedBy).toBe(mockAdminSession.email);
    expect(deleted.version).toBe(2);

    // Excluded from standard findMany active query
    const activeItems = await repo.findMany();
    expect(activeItems.data.some((i) => i.id === 'item-2')).toBe(false);
    expect(activeItems.stats.totalActive).toBe(2);
    expect(activeItems.stats.totalInTrash).toBe(1);

    // Visible when querying trash view
    const trashItems = await repo.findMany({ includeDeleted: 'only' });
    expect(trashItems.data.length).toBe(1);
    expect(trashItems.data[0].id).toBe('item-2');
  });

  it('5. restore clears deletedAt and brings item back to active dataset', async () => {
    await repo.softDelete('item-3', 'Archivage temporaire', mockAdminSession);

    const restored = await repo.restore('item-3', mockAdminSession);
    expect(restored.deletedAt).toBeNull();
    expect(restored.deleteReason).toBeNull();
    expect(restored.deletedBy).toBeNull();
    expect(restored.version).toBe(3);

    const activeItems = await repo.findMany();
    expect(activeItems.data.some((i) => i.id === 'item-3')).toBe(true);
    expect(activeItems.stats.totalInTrash).toBe(0);
  });

  it('6. bulkAction processes multiple records atomically with error reporting', async () => {
    const result = await repo.bulkAction(
      'softDelete',
      ['item-1', 'item-2', 'non-existent-id'],
      { reason: 'Archivage groupé de fin d’année' },
      mockAdminSession
    );

    expect(result.success).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('non-existent-id');

    const trash = await repo.findMany({ includeDeleted: 'only' });
    expect(trash.data.length).toBe(2);
  });

  it('7. exportCsv formats valid CSV data with escaped fields', () => {
    const csv = repo.exportCsv([
      { key: 'name', label: 'Nom de la ligne' },
      { key: 'category', label: 'Catégorie' },
      { key: 'amount', label: 'Montant' },
    ]);

    expect(csv).toContain('"Nom de la ligne";"Catégorie";"Montant"');
    expect(csv).toContain('"Kinshasa Express";"BUS";"45000"');
    expect(csv).toContain('"Matadi Navette";"BUS";"40000"');
  });
});

