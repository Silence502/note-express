import {z} from 'zod';

export const SettingsSchema = z.object({
    id: z.number().optional(),
    userId: z.number().optional(),
    theme: z.string().default('light'),
    locale: z.string().default('en'),
    firstLaunch: z.boolean().default(true),
    version: z.string().default(import.meta.env.VITE_APP_VERSION),
    displayTaskIds: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type SettingsInput = Omit<Settings, 'id'>;