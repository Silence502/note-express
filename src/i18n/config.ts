import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';
import kr from './locales/kr.json';
import de from './locales/de.json';
import jp from './locales/jp.json';
import es from './locales/es.json';

const supportedLanguages = ['en', 'fr', 'de', 'jp', 'es', 'kr'];

export function detectUserLanguage(): string {
    if (!localStorage.getItem('ne_language')) {
        const preferredLanguages = navigator.languages || [navigator.language];
        const detectedLang = preferredLanguages[0]!.split('-')[0];
        localStorage.setItem('ne_language', detectedLang??'en');
        return supportedLanguages.includes(detectedLang??'en') ? (detectedLang??'en') : 'en';
    } else {
        return localStorage.getItem('ne_language')?.toLowerCase() || 'en';
    }
}

const userLanguage = detectUserLanguage();

export const i18n = createI18n({
    legacy: false,
    locale: userLanguage,
    fallbackLocale: 'fr',
    messages: {
        en,
        fr,
        de,
        jp,
        es,
        kr
    },
});