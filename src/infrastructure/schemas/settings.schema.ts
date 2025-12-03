import {z} from 'zod';

export enum TypeId {
    NATIVE = 'native',
    GENERATED = 'generated'
}

export const SettingsSchema = z.object({
    id: z.number().optional(),
    userId: z.number().optional(),
    firstLaunch: z.boolean().default(true).optional(),
    version: z.string().default(import.meta.env.VITE_APP_VERSION).optional(),
    displayTaskIds: z.boolean().default(false).optional(),
    displayTimer: z.boolean().default(false).optional(),
    idType: z.enum(TypeId).default(TypeId.NATIVE).optional(),
    prefixId: z.string().max(3, 'schema.common.maxLength').min(2, 'schema.common.minLength').default('NE').optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
});

export type UserSettings = z.infer<typeof SettingsSchema>;
export type UserSettingsInput = Omit<UserSettings, 'id'>;