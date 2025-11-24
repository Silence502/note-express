import type {Task} from "@/infrastructure/schemas";
import {DateTime, Interval} from "luxon";

/**
 * Converts URLs found in the task's description into clickable anchor tags.
 *
 * @param {Task} task - The task object containing a description with possible URLs.
 * @return {string} The description string with embedded anchor tags for URLs, or an empty string if no description is found.
 */
export function linkMaker(task: Task): string {
    if (!task.description) return '';

    const urlRegex = /(https?:\/\/[^\s<>&]+|www\.[^\s<>&]+)/gi;

    return task.description.replace(urlRegex, (url: string) => {
        const fullUrl = url.startsWith('www.') ? `http://${url}` : url;
        const encodedUrl = encodeURI(fullUrl);
        return `<a href="${encodedUrl}" target="_blank" rel="noopener noreferrer" class="text-link">${url}</a>`;
    });
}

export const getIntervalWithDuration = (value: any, locale: string) => {
    const createdAt = DateTime.fromJSDate(value.createdAt).setLocale(locale);
    const updatedAt = DateTime.fromJSDate(value.updatedAt).setLocale(locale);

    const interval = Interval.fromDateTimes(createdAt, updatedAt);
    const duration = interval.toDuration(['hours', 'minutes', 'seconds']);

    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes') % 60);

    const parts = [];
    parts.push(`${hours}h`);
    parts.push(`${minutes}min`);

    return parts.join(' ');
}
