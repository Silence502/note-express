import {z} from 'zod';

export const TagSchema = z.object({
    id: z.number().optional(),
    name: z.string().max(15, "Le titre ne peut pas dépasser 100 caractères").nonempty('Le titre est obligatoire'),
    color: z.string().nullable(),
});

export type Tag = z.infer<typeof TagSchema>;
export type TagInput = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;