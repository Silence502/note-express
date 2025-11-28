import type {Task} from "@/infrastructure/schemas";
import {DateTime, Duration, Interval} from "luxon";
import type {Timer} from "@/infrastructure/schemas/task.schema.ts";

export const getIntervalWithDuration = (value: any, locale: string, isTimer: boolean = false) => {
    let startDate: DateTime;
    let endDate: DateTime;
    if (isTimer) {
        console.log(value.timer.end)
        startDate = DateTime.fromJSDate(value.timer.start).setLocale(locale);
        endDate = DateTime.fromJSDate(value.timer.end).setLocale(locale);
    } else {
        startDate = DateTime.fromJSDate(value.createdAt).setLocale(locale);
        endDate = DateTime.fromJSDate(value.updatedAt).setLocale(locale);
    }

    const interval = Interval.fromDateTimes(startDate, endDate);
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

export const parseDurationToMs = (durationString: string): number => {
    const regex = /(\d+)([a-zA-Zàâäéèêëïîôöùûüÿç]+)/g;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(durationString)) !== null) {
        const value = parseInt(match[1]!);
        const unit = match[2]!.toLowerCase();

        switch (unit) {
            case 'j':
            case 'd':
            case 'day':
            case 'days':
            case '日':
            case '일':
                totalMs += value * 24 * 60 * 60 * 1000;
                break;
            case 'h':
            case 'std':
            case 'hour':
            case 'hours':
            case '時間':
            case '시간':
                totalMs += value * 60 * 60 * 1000;
                break;
            case 'min':
            case 'minute':
            case 'minutes':
            case '分':
            case '분':
                totalMs += value * 60 * 1000;
                break;
            case 's':
            case 'sec':
            case 'sek':
            case 'second':
            case 'seconds':
            case '秒':
            case '초':
                totalMs += value * 1000;
                break;
        }
    }

    return totalMs;
}

// Fonction helper pour formater une durée Luxon
export const formatDuration = (duration: Duration, locale: string): string => {
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

/**
 * Updates the task's timer depending on whether the timer is running or stops it to calculate the duration.
 *
 * @param {Task} task - The task object containing timer and its related data.
 * @param {any} locale - The locale information used for formatting dates and durations.
 * @return {Task} - The updated task with modified timer data, including duration and session details.
 */
export function getTaskDuration(task: Task, locale: any): Task {
    const newTask = {
      ...task,
      isTimerRunning: !task.isTimerRunning,
    } as Task
    const timer = task.timer as Timer

    if (newTask.isTimerRunning) {
        newTask.timer = {
            ...timer,
            start: new Date,
        }

        console.log(newTask)
        return newTask
    } else {
        newTask.timer = {
            ...timer,
            end: new Date,
        }

        if (newTask.timer!.start && newTask.timer!.end) {
            // Calculer la durée de la session actuelle
            const currentInterval = Interval.fromDateTimes(
                DateTime.fromJSDate(newTask.timer!.start).setLocale(locale),
                DateTime.fromJSDate(newTask.timer!.end).setLocale(locale))

            const currentDurationMs = currentInterval.toDuration().as('milliseconds');

            // Récupérer la durée précédente (en millisecondes)
            let previousDurationMs = 0;
            if (newTask.timer!.duration) {
                // Parser la durée existante pour la convertir en millisecondes
                previousDurationMs = parseDurationToMs(newTask.timer!.duration);
            }

            // Additionner les durées
            const totalDurationMs = previousDurationMs + currentDurationMs;

            // Convertir le total en format lisible
            const totalDuration = Duration.fromMillis(totalDurationMs);
            newTask.timer!.duration = formatDuration(totalDuration, locale);
            newTask.timer!.lastSession = formatDuration(Duration.fromMillis(currentDurationMs), locale.value)

        }
        console.log(newTask)
        return newTask
    }
}


export const idGeneration = (value: Date) => {
    return value.getTime().toString(36).padStart(10, Math.random().toString().slice(1, 10)).substring(1, 10).toUpperCase()
}
