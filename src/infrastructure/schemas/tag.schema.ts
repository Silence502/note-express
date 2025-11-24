import {z} from 'zod';

export const TagSchema = z.object({
    id: z.number().optional(),
    name: z.string().max(15, 'schema.common.maxLength').nonempty('schema.common.nonEmptyName'),
    color: z.string().nullable(),
});

export type Tag = z.infer<typeof TagSchema>;
export type TagInput = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;