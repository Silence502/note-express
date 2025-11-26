import {z} from 'zod';
import {TagSchema} from "@/infrastructure/schemas/tag.schema.ts";

export const TaskSchema = z.object({
    id: z.number().optional(),
    title: z.string().max(100, 'schema.common.maxLength').nonempty('schema.common.nonEmptyTitle'),
    description: z.string().max(500, 'schema.common.maxLength').nullish(),
    color: z.string().optional(),
    isDone: z.boolean().default(false),
    priority: z.boolean().default(false),
    position: z.number().int().min(-1).optional(),
    tags: z.array(TagSchema).nullable().default([]),
    idGenerated: z.string().default(() => new Date().getTime().toString(36).padStart(10, Math.random().toString().slice(1, 10)).substring(1, 10).toUpperCase()),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskImport = Omit<Task, 'id' | 'tags'>;