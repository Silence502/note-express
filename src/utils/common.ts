import type {Task} from "@/infrastructure/schemas";
import {DateTime, Interval} from "luxon";

export const getIntervalWithDuration = (value: any, locale: string) => {
    const createdAt = DateTime.fromJSDate(value.createdAt).setLocale(locale);
    const updatedAt = DateTime.fromJSDate(value.updatedAt).setLocale(locale);

    const interval = Interval.fromDateTimes(createdAt, updatedAt);
    const duration = interval.toDuration(['days', 'hours', 'minutes', 'seconds']);

    const days = Math.floor(duration.as('days'));
    const hours = Math.floor(duration.as('hours') % 24);
    const minutes = Math.floor(duration.as('minutes') % 60);
    const seconds = Math.floor(duration.as('seconds') % 60);

    const getLocalizedUnits = (unit: string) => {
        const unitsMap: Record<string, Record<string, string>> = {
            'fr': { days: 'j', hours: 'h', minutes: 'min', seconds: 's' },
            'de': { days: 'T', hours: 'Std', minutes: 'Min', seconds: 'Sek' },
            'es': { days: 'd', hours: 'h', minutes: 'min', seconds: 's' },
            'it': { days: 'g', hours: 'h', minutes: 'min', seconds: 's' },
            'en': { days: 'd', hours: 'h', minutes: 'min', seconds: 's' },
            'kr': { days: '일', hours: '시간', minutes: '분', seconds: '초' },
            'jp': { days: '日', hours: '時間', minutes: '分', seconds: '秒' }
        };

        const baseLocale = locale?.split('-')[0] || 'en';

        return unitsMap[baseLocale]?.[unit] || unitsMap['en']?.[unit] || unit;
    };

    const parts = [];

    if (days > 0) parts.push(`${days}${getLocalizedUnits('days')}`);
    if (hours > 0) parts.push(`${hours}${getLocalizedUnits('hours')}`);
    if (minutes > 0) parts.push(`${minutes}${getLocalizedUnits('minutes')}`);

    // Afficher les secondes seulement si tout est à zéro
    if (parts.length === 0 && seconds > 0) {
        parts.push(`${seconds}${getLocalizedUnits('seconds')}`);
    }

    return parts.join(' ');
}

export const idGeneration = (value: Date) => {
    return value.getTime().toString(36).padStart(10, Math.random().toString().slice(1, 10)).substring(1, 10).toUpperCase()
}
