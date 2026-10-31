import { Language } from '@/types';
import { fr } from './fr';
import { en } from './en';
import { ln } from './ln';
import { sw } from './sw';

export const translations = {
  fr,
  en,
  ln,
  sw,
} as const;

export type TranslationKey = typeof fr;

export function getTranslations(lang: Language = 'fr'): TranslationKey {
  return (translations[lang] || translations.fr) as unknown as TranslationKey;
}

export { fr, en, ln, sw };
