import { z } from 'zod';

export const CmsSectionSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'hero',
    'popular_routes',
    'banners',
    'featured_destinations',
    'how_it_works',
    'faq',
    'partner_logos',
    'trust_section',
  ]),
  title: z.string().min(2, 'Le titre de la section doit comporter au moins 2 caractères'),
  orderIndex: z.number().int().min(0),
  isActive: z.boolean().default(true),
  scheduledPublishAt: z.string().nullable().optional(),
  scheduledUnpublishAt: z.string().nullable().optional(),
  content: z.record(z.string(), z.any()),
  version: z.number().optional(),
});

export const ReorderSectionsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, 'Au moins un identifiant de section requis'),
});

export const CmsStaticPageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2, 'Le slug de la page doit comporter au moins 2 caractères'),
  title: z.object({
    fr: z.string().min(1, 'Le titre en français est obligatoire'),
    en: z.string().default(''),
    ln: z.string().default(''),
    sw: z.string().default(''),
  }),
  content: z.object({
    fr: z.string().min(1, 'Le contenu en français est obligatoire'),
    en: z.string().default(''),
    ln: z.string().default(''),
    sw: z.string().default(''),
  }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  version: z.number().optional(),
});

export const PublishPageSchema = z.object({
  pageId: z.string().min(1, 'Identifiant de la page requis'),
  publish: z.boolean(),
  password: z.string().min(1, 'Mot de passe administrateur requis pour la validation'),
  reason: z.string().min(4, 'Motif obligatoire d\'au moins 4 caractères'),
  version: z.number(),
});

export const RollbackPageSchema = z.object({
  pageId: z.string().min(1, 'Identifiant de la page requis'),
  targetVersion: z.number().int().min(1, 'Version cible valide requise'),
  password: z.string().min(1, 'Mot de passe administrateur requis pour la validation'),
  reason: z.string().min(4, 'Motif de restauration obligatoire'),
  version: z.number(),
});

export const CmsI18nStringSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(2, 'La clé de traduction doit comporter au moins 2 caractères'),
  category: z.enum(['common', 'home', 'bus', 'rides', 'auth', 'footer', 'payouts']),
  translations: z.object({
    fr: z.string().min(1, 'Le texte français de référence est obligatoire'),
    en: z.string().default(''),
    ln: z.string().default(''),
    sw: z.string().default(''),
  }),
  needsReview: z.boolean().default(false),
  version: z.number().optional(),
});

export const CmsMediaUploadSchema = z.object({
  filename: z.string().min(1, 'Nom de fichier requis'),
  url: z.string().min(1, 'URL de la ressource requise'),
  mimeType: z.string().min(1),
  originalSize: z.number().min(0),
  compressedSize: z.number().min(0),
  altText: z.string().default(''),
  width: z.number().default(800),
  height: z.number().default(600),
  tags: z.array(z.string()).default([]),
});

export const CmsReviewModerationSchema = z.object({
  reviewId: z.string().min(1, 'Identifiant de l\'avis requis'),
  action: z.enum(['APPROVE', 'HIDE', 'DELETE', 'RESTORE']),
  reason: z.string().min(4, 'Motif de modération obligatoire (au moins 4 caractères)'),
  password: z.string().optional(),
});

export type CmsSectionInput = z.infer<typeof CmsSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof ReorderSectionsSchema>;
export type CmsStaticPageInput = z.infer<typeof CmsStaticPageSchema>;
export type PublishPageInput = z.infer<typeof PublishPageSchema>;
export type RollbackPageInput = z.infer<typeof RollbackPageSchema>;
export type CmsI18nStringInput = z.infer<typeof CmsI18nStringSchema>;
export type CmsMediaUploadInput = z.infer<typeof CmsMediaUploadSchema>;
export type CmsReviewModerationInput = z.infer<typeof CmsReviewModerationSchema>;

