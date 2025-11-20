import type {Task} from "@/infrastructure/schemas";

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
