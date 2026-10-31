import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetCmsStore,
  getCmsSections,
  saveCmsSection,
  reorderCmsSections,
  getCmsPages,
  getCmsPageById,
  saveCmsPage,
  togglePublishCmsPage,
  rollbackCmsPage,
  getCmsTranslations,
  saveCmsTranslation,
  uploadCmsMedia,
  moderateCmsReview,
  resolvePageContent,
  resolveI18nString,
  getPublicHomeSections,
  getCmsStats,
} from './cms-store';

describe('CMS & Content Management Store', () => {
  beforeEach(() => {
    resetCmsStore();
  });

  describe('Static Pages & Publishing Workflow', () => {
    it('resolves published page and provides language fallback to French when translation is missing', () => {
      // 'privacy' has FR and EN, but empty LN and SW
      const frResult = resolvePageContent('privacy', 'fr');
      expect(frResult).not.toBeNull();
      expect(frResult!.langUsed).toBe('fr');
      expect(frResult!.isFallback).toBe(false);
      expect(frResult!.title).toContain('Politique de Confidentialité');

      const enResult = resolvePageContent('privacy', 'en');
      expect(enResult).not.toBeNull();
      expect(enResult!.langUsed).toBe('en');
      expect(enResult!.isFallback).toBe(false);

      // Lingala (LN) fallback check
      const lnResult = resolvePageContent('privacy', 'ln');
      expect(lnResult).not.toBeNull();
      expect(lnResult!.langUsed).toBe('fr'); // fell back to French
      expect(lnResult!.isFallback).toBe(true);
      expect(lnResult!.title).toContain('Politique de Confidentialité');
    });

    it('manages draft vs published state without requiring a redeploy', async () => {
      // Create a new draft page
      const newPage = await saveCmsPage(
        {
          slug: 'partenaires-transport',
          title: {
            fr: 'Rejoindre le Réseau Transport Transnumerica',
            en: 'Join the Transnumerica Transport Network',
            ln: '',
            sw: '',
          },
          content: {
            fr: '<p>Conditions pour les transporteurs et coopératives...</p>',
            en: '<p>Requirements for bus operators and cooperatives...</p>',
            ln: '',
            sw: '',
          },
          status: 'DRAFT',
        },
        'editor@transnumerica.cd'
      );

      // Draft page should NOT be resolved publicly
      expect(resolvePageContent('partenaires-transport', 'fr')).toBeNull();

      // Publish the page
      const published = await togglePublishCmsPage({
        pageId: newPage.id,
        publish: true,
        authorEmail: 'superadmin@transnumerica.cd',
        reason: 'Validation de la politique d’adhésion des transporteurs',
        version: newPage.version,
      });

      expect(published.status).toBe('PUBLISHED');

      // Now publicly available immediately
      const publicResult = resolvePageContent('partenaires-transport', 'fr');
      expect(publicResult).not.toBeNull();
      expect(publicResult!.title).toBe('Rejoindre le Réseau Transport Transnumerica');
    });

    it('saves version history snapshot and rolls back to a previous version', async () => {
      const page = await getCmsPageById('about');
      expect(page).not.toBeNull();
      const initialVersion = page!.version;
      const originalFrTitle = page!.title.fr;

      // Update page to create version 2
      const updated = await saveCmsPage(
        {
          id: page!.id,
          slug: page!.slug,
          title: {
            ...page!.title,
            fr: 'À propos de Transnumerica RDC — Version Modifiée 2026',
          },
          content: page!.content,
          status: 'PUBLISHED',
          version: page!.version,
        },
        'editor@transnumerica.cd'
      );

      expect(updated.version).toBe(initialVersion + 1);
      expect(updated.title.fr).toContain('Version Modifiée 2026');
      expect(updated.versionHistory.length).toBeGreaterThan(0);

      // Rollback to version 1
      const rolledBack = await rollbackCmsPage({
        pageId: updated.id,
        targetVersion: 1,
        authorEmail: 'superadmin@transnumerica.cd',
        reason: 'Restauration de la version officielle approuvée',
        version: updated.version,
      });

      expect(rolledBack.title.fr).toBe(originalFrTitle);
      expect(rolledBack.version).toBe(updated.version + 1);
    });

    it('rejects update when optimistic lock version conflict occurs', async () => {
      const page = await getCmsPageById('terms');
      expect(page).not.toBeNull();

      await expect(
        saveCmsPage(
          {
            id: page!.id,
            slug: page!.slug,
            title: page!.title,
            content: page!.content,
            status: 'PUBLISHED',
            version: 999, // Stale version
          },
          'editor@transnumerica.cd'
        )
      ).rejects.toThrow('Conflit de version détecté');
    });
  });

  describe('Home Page Sections & Drag-and-Drop Ordering', () => {
    it('reorders sections and updates orderIndex', async () => {
      const initial = await getCmsSections();
      const reversedIds = initial.map((s) => s.id).reverse();

      const reordered = await reorderCmsSections(reversedIds, 'admin@transnumerica.cd');
      expect(reordered[0].id).toBe(reversedIds[0]);
      expect(reordered[0].orderIndex).toBe(0);
      expect(reordered[reordered.length - 1].id).toBe(reversedIds[reversedIds.length - 1]);
    });

    it('filters out inactive or scheduled sections from public view', async () => {
      const sections = await getCmsSections();
      const hero = sections.find((s) => s.type === 'hero');
      expect(hero).toBeDefined();

      // Deactivate hero section
      await saveCmsSection(
        {
          id: hero!.id,
          type: hero!.type,
          title: hero!.title,
          orderIndex: hero!.orderIndex,
          isActive: false,
          content: hero!.content,
          version: hero!.version,
        },
        'admin@transnumerica.cd'
      );

      const publicSections = getPublicHomeSections();
      expect(publicSections.some((s) => s.type === 'hero')).toBe(false);
    });
  });

  describe('Translation Manager (i18n)', () => {
    it('resolves translated string and falls back to French when target translation is empty', () => {
      // 'footer.offline_tickets' has FR and EN, but missing LN
      expect(resolveI18nString('footer.offline_tickets', 'fr')).toBe('Billets QR 100% hors-ligne');
      expect(resolveI18nString('footer.offline_tickets', 'en')).toBe('100% Offline QR Tickets');
      expect(resolveI18nString('footer.offline_tickets', 'ln')).toBe('Billets QR 100% hors-ligne'); // Fallback to FR
    });

    it('adds and updates translation with needsReview flag', async () => {
      const saved = await saveCmsTranslation(
        {
          key: 'common.currency_cdf',
          category: 'common',
          translations: {
            fr: 'Franc Congolais (CDF)',
            en: 'Congolese Franc (CDF)',
            ln: 'Falanga ya Congo (CDF)',
            sw: 'Faranga ya Kongo (CDF)',
          },
          needsReview: false,
        },
        'translator@transnumerica.cd'
      );

      expect(saved.id).toBeDefined();
      expect(resolveI18nString('common.currency_cdf', 'ln')).toBe('Falanga ya Congo (CDF)');
    });
  });

  describe('Media Library & WebP Compression', () => {
    it('uploads media and calculates compression ratio metrics', async () => {
      const media = await uploadCmsMedia(
        {
          filename: 'banner-kinshasa-nuit.jpg',
          url: '/images/cms/banner-kinshasa-nuit.webp',
          mimeType: 'image/webp',
          originalSize: 500000,
          compressedSize: 150000,
          altText: 'Vue nocturne du Boulevard du 30 Juin',
          width: 1200,
          height: 600,
          tags: ['banner', 'kinshasa'],
        },
        'editor@transnumerica.cd'
      );

      expect(media.filename).toBe('banner-kinshasa-nuit.webp');
      expect(media.mimeType).toBe('image/webp');
      expect(media.compressionRatio).toBe(70); // 70% savings
    });
  });

  describe('Reviews Moderation', () => {
    it('moderates passenger reviews with reason tracking', async () => {
      const updated = await moderateCmsReview({
        reviewId: 'rev-003',
        action: 'APPROVE',
        authorEmail: 'supervisor@transnumerica.cd',
        reason: 'Vérification effectuée avec la coopérative mototaxi, équipement régularisé.',
      });

      expect(updated.status).toBe('APPROVED');
      expect(updated.moderatedBy).toBe('supervisor@transnumerica.cd');
      expect(updated.moderationReason).toContain('Vérification effectuée');
    });
  });

  describe('CMS Statistics', () => {
    it('aggregates CMS metrics correctly', async () => {
      const stats = await getCmsStats();
      expect(stats.activeSectionsCount).toBeGreaterThan(0);
      expect(stats.publishedPagesCount).toBeGreaterThan(0);
      expect(stats.totalTranslationsCount).toBeGreaterThan(0);
      expect(stats.totalMediaCount).toBeGreaterThan(0);
    });
  });
});

