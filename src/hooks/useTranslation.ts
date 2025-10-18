// src/hooks/useTranslation.ts
import { useCallback, useMemo } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { translations, TranslationKey } from '../i18n/translations';
import { Language } from '../types';

export const useTranslation = () => {
  const { language } = useSessionContext();
  const isJapanese = useMemo(() => language === Language.JA, [language]);

  const t = useCallback(
    (
      key: TranslationKey,
      replacements?: Record<string, string | number>
    ): string => {
      const entry = translations[key];
      if (!entry) {
        console.warn(`Translation key "${key}" not found.`);
        return key; // Return the key itself as a fallback
      }
      let text: string = isJapanese ? (entry as any).ja : (entry as any).en;

      if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
          text = text.replace(`{${placeholder}}`, String(value));
        });
      }
      return text;
    },
    [isJapanese]
  );

  return { t, isJapanese, language };
};
