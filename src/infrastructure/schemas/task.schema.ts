import { z } from 'zod';
import {TagSchema} from "@/infrastructure/schemas/tag.schema.ts";

export const TaskSchema = z.object({
    id: z.number().optional(),
    title: z.string().max(100).nonempty(),
    description: z.string().max(500).nullish(),
    color: z.string().optional(),
    isDone: z.boolean().default(false),
    priority: z.boolean().default(false),
    position: z.number().int().min(-1).optional(),
    tags: z.array(TagSchema).nullable().default([]),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;