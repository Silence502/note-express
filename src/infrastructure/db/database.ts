import Dexie, { type Table } from 'dexie';
import type {Tag} from "@/infrastructure/schemas/tag.schema.ts";
import type {Task} from "@/infrastructure/schemas/task.schema.ts";
import type {UserSettings} from "@/infrastructure/schemas/settings.schema.ts";

export type TaskRecord = Task;
export type TagRecord = Tag;
export type SettingsRecord = UserSettings;

export interface ItemTagRecord {
    id?: number;
    itemId: number;
    tagId: number;
}

export interface filterRecord {
    id?: number;
    items: number[];
}

export class TaskDatabase extends Dexie {
    tasks!: Table<TaskRecord>;
    tags!: Table<TagRecord>;
    filterRecord!: Table<filterRecord>;
    settings!: Table<SettingsRecord>;
    itemTagRecord!: Table<ItemTagRecord>;

    constructor() {
        super('noteExpressV2');
        this.version(3).stores({
            tasks: '++id, title, isDone, position, tags, priority, idGenerated, createdAt, updatedAt, timer, description, isTimerRunning, isTimerPaused, isTimerStopped',
            tags: '++id, name, color, createdAt, updatedAt',
            itemTagRecord: '++id, itemId, tagId',
            filterRecord: '++id, items',
            settings: '++id, userId, theme, locale, firstLaunch, version, displayTaskIds, idType, prefixId, createdAt, updatedAt'
        });
    }
}

export const db = new TaskDatabase();