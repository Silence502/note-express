import {db, type SettingsRecord} from '@/infrastructure/db/database';
import {type UserSettingsInput, SettingsSchema, type UserSettings} from "@/infrastructure/schemas/settings.schema.ts";

export class SettingsRepository {

    /**
     * Creates and saves a new user settings record using default settings provided.
     *
     * @param {Partial<UserSettingsInput>} defaultSettings - The default settings to create the user settings with. This includes partial configuration for user settings.
     * @return {Promise<UserSettings>} A promise that resolves to the validated user settings after creation.
     */
    async create(defaultSettings: Partial<UserSettingsInput>): Promise<UserSettings> {
        const now = new Date();
        const settingsToCreate = {
            ...defaultSettings,
            createdAt: now,
            updatedAt: now
        };

        const validatedSettings: SettingsRecord = SettingsSchema.parse(settingsToCreate);

        await db.settings.add({
            ...validatedSettings
        } as SettingsRecord);

        return validatedSettings;
    }

    /**
     * Retrieves user settings based on the provided ID.
     *
     * @param {number | undefined} id - The unique identifier of the user settings to retrieve. If undefined, no settings will be retrieved.
     * @return {Promise<UserSettings | null>} A promise that resolves to the user settings object if found, or null if no settings exist for the provided ID.
     */
    async findById(id: number | undefined): Promise<UserSettings | null> {
        const settings = await db.settings.get(id);
        return settings || null;
    }

    /**
     * Retrieves all user settings from the database.
     *
     * @return {Promise<UserSettings[]>} A promise that resolves to an array of user settings.
     */
    async findAll(): Promise<UserSettings[]> {
        return db.settings.toArray();
    }

    /**
     * Updates the user settings for a given ID with the provided data.
     *
     * @param {number | undefined} id - The ID of the settings to update. If undefined, the update will not proceed.
     * @param {Partial<UserSettingsInput>} settingsData - A partial object containing the settings data to update.
     * @return {Promise<UserSettings | null>} A promise that resolves to the updated settings object if successful, or null if the settings with the given ID do not exist.
     */
    async update(id: number | undefined, settingsData: Partial<UserSettingsInput>): Promise<UserSettings | null> {
        const existingSettings = await db.settings.get(id);
        if (!existingSettings) {
            return null;
        }

        const updatedSettings = {
            ...existingSettings,
            ...settingsData,
            updatedAt: new Date()
        };

        const validatedSettings = SettingsSchema.parse(updatedSettings);
        await db.settings.update(id, validatedSettings);
        return validatedSettings;
    }

    /**
     * Deletes a tag identified by the provided ID from the database.
     *
     * @param {number} id - The unique identifier of the tag to be deleted.
     * @return {Promise<boolean>} A promise that resolves to true if the deletion was successful, otherwise false.
     */
    async delete(id: number): Promise<boolean> {
        if (!id) {
            console.error('Invalid ID provided for deletion:', id);
            return false;
        }
        const count = await db.tags.where('id').equals(id).delete();
        return count > 0;
    }
}

export const settingsRepository = new SettingsRepository();