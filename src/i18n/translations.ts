// src/i18n/translations.ts
import { Language } from '../types';
import { allTranslations } from './locales';

export const translations = allTranslations;

export type TranslationKey = keyof typeof translations;

// This is a standalone function for use outside of React components (e.g., in services).
export const translate = (key: TranslationKey, language: Language, replacements?: Record<string, string | number>): string => {
    const entry = translations[key];
    if (!entry) {
        console.warn(`Translation key "${key}" not found.`);
        return key; // Return the key itself as a fallback
    }
    const isJapanese = language === Language.JA;
    let text: string = isJapanese ? (entry as any).ja : (entry as any).en;

    if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
            text = text.replace(`{${placeholder}}`, String(value));
        });
    }
    return text;
};
