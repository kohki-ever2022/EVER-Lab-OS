// src/hooks/useTranslation.ts
import { useCallback } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { translations } from '../i18n/translations';
import { Language } from '../types';

type TranslationKey = keyof typeof translations;

export const useTranslation = () => {
    const { language } = useSessionContext();
    const isJapanese = language === Language.JA;

    const t = useCallback((key: TranslationKey): string => {
        const entry = translations[key];
        if (!entry) {
            console.warn(`Translation key "${key}" not found.`);
            return key; // Return the key itself as a fallback
        }
        return isJapanese ? entry.ja : entry.en;
    }, [isJapanese]);

    return { t, isJapanese, language };
};
