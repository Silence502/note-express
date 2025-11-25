import {computed, ref} from 'vue';
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import type {UserSettings, UserSettingsInput} from "@/infrastructure/schemas/settings.schema.ts";
import {settingsRepository} from "@/infrastructure/repositories/settings.repository.ts";
import {settingsStore} from "@/stores/settingsStore.ts";

export function useSettings() {
    const {t} = useI18n();
    const toast = useToast();
    const useSettingsStore = settingsStore()

    const settings = ref<UserSettings | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isSettingsLoading = ref(false);
    const isCreateLoading = ref(false);

    // Computed
    const settingsValue = computed(() => settings.value);

    /**
     * Checks if settings exist in the repository.
     * If no settings are found, creates default settings with the current timestamp.
     * Loads the first settings entry from the repository.
     *
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the check, potential creation, and loading are complete.
     */
    const isSettingsExist = async (): Promise<void> => {
        let allSettings = await settingsRepository.findAll()
        if (allSettings.length === 0) {
            const now = new Date();
            await createSettings(
                {
                    createdAt: now,
                    updatedAt: now
                })
            allSettings = await settingsRepository.findAll()
        }
        await loadSettings(allSettings[0]!.id as number)
    }

    /**
     * Asynchronously loads settings based on the provided identifier.
     *
     * This function sets a loading state while attempting to fetch settings data
     * using the `settingsRepository.findById` method. If an error occurs during
     * the process, appropriate error handling and user feedback are performed.
     *
     * @param {number | undefined} id - The identifier of the settings to load. If not provided, it may result in an error.
     * @returns {Promise<void>} A promise that resolves when the settings have been successfully loaded or an error has been handled.
     */
    const loadSettings = async (id: number | undefined): Promise<void> => {
        isSettingsLoading.value = true;
        error.value = null;
        try {
            settings.value = await settingsRepository.findById(id);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error while loading tasks.';
            console.error('Error details:', err);
            toast.add({severity: 'error', summary: t('settings.toast.loading.error.title'), detail: t('settings.toast.loading.error.message'), life: 1500});
        } finally {
            isSettingsLoading.value = false;
            useSettingsStore.setData(settings.value)
        }
    }

    /**
     * Asynchronously creates user settings by interacting with the settings repository.
     *
     * This function updates the loading state (`isCreateLoading`), captures and handles any errors
     * encountered during the creation process by setting `error` with an appropriate message,
     * and logs the error to the console if one occurs.
     *
     * @param {UserSettingsInput} settingsData - The input data required to create the user settings.
     * @returns {Promise<UserSettings | null>} A promise that resolves to the created user settings object
     * if successful, or null in case of an error during creation.
     */
    const createSettings = async (settingsData: UserSettingsInput): Promise<UserSettings | null> => {
        isCreateLoading.value = true;
        error.value = null;

        try {
            return await settingsRepository.create(settingsData);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la création';
            console.error(error.value)
            return null;
        } finally {
            isCreateLoading.value = false;
        }
    }

    /**
     * Updates the settings for a user with the specified ID.
     *
     * @param {number | undefined} id - The unique identifier of the user. If undefined, no update is performed.
     * @param {Partial<UserSettingsInput>} settingsData - An object containing the settings data to be updated. Only the provided fields will be updated.
     * @returns {Promise<UserSettings | null>} A promise that resolves to the updated UserSettings object if successful, or null if an error occurs.
     *
     * Throws an error message if the update fails.
     * Displays a toast notification upon failure, and logs the error message to the console.
     */
    const updateSettings = async (id: number | undefined, settingsData: Partial<UserSettingsInput>): Promise<UserSettings | null> => {
        isCreateLoading.value = true;
        error.value = null;

        try {
            const updatedSettings =  await settingsRepository.update(id, settingsData);
            await loadSettings(updatedSettings!.id as number)
            return updatedSettings;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('settings.toast.update.success.title'), detail: t('settings.toast.update.success.message'), life: 1500});
            return null;
        }
    }

    // Initial load
    isSettingsExist().catch(console.error);

    return {
        // State
        settings,
        settingsValue,
        loading,
        error,
        isSettingsLoading,
        updateSettings,
        loadSettings
    };
}