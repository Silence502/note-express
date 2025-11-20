import Dexie, { type Table } from 'dexie';
import type {Tag} from "@/infrastructure/schemas/tag.schema.ts";
import type {Task} from "@/infrastructure/schemas/task.schema.ts";

export type TaskRecord = Task;
export type TagRecord = Tag;

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
    itemTagRecord!: Table<ItemTagRecord>;
    filterRecord!: Table<filterRecord>;

    constructor() {
        super('noteExpressV2');
        this.version(2).stores({
            tasks: '++id, title, isDone, position, tags, priority, createdAt, updatedAt',
            tags: '++id, name, color, createdAt, updatedAt',
            itemTagRecord: '++id, itemId, tagId',
            filterRecord: '++id, items'
        });
    }
}

export const db = new TaskDatabase();