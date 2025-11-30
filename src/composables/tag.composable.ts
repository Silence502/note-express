import {computed, ref} from 'vue';
import {tagRepository} from '@/infrastructure/repositories/tag.repository';
import type {Tag, TagInput} from "@/infrastructure/schemas/tag.schema.ts";
import type {Task} from "@/infrastructure/schemas/task.schema.ts";
import {useTasks} from "@/composables/task.composable.ts";
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";

export function useTag() {
    const {t} = useI18n();
    const toast = useToast();
    const {
        tasks,
        updateTask,
        loadTasks
    } = useTasks()

    const tags = ref<Tag[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isListLoading = ref(false);
    const isCreateLoading = ref(false);
    const isEditLoading = ref(false);
    const isDeleteLoading = ref(false);

    // Computed
    const tagList = computed(() => tags.value);

    /**
     * Asynchronously loads tasks based on the provided filter criteria.
     *
     * @param {Object} [filters] - Optional filters to apply when loading tasks.
     * @param {boolean} [filters.isDone] - Filters tasks by their completion status. If true, only completed tasks are loaded. If false, only incomplete tasks are loaded.
     * @param {string[]} [filters.tags] - Filters tasks by their associated tags. Only tasks containing specified tags are loaded.
     * @param {string} [filters.search] - A search query to filter tasks by text. Tasks containing the query string will be loaded.
     * @returns {Promise<void>} Resolves when tasks are successfully loaded, or sets an error state if loading fails.
     */
    const loadTags = async (filters?: { isDone?: boolean; tasks?: Task[]; search?: string }): Promise<void> => {
        // isListLoading.value = true;
        error.value = null;
        try {
            // Valider et nettoyer les filtres avant de les envoyer
            const validatedFilters = filters ? {
                ...filters,
                // tasks: filters.tasks?.filter((task: Task) => task.title && task.title.trim() !== ''),
                search: filters.search?.trim() || undefined
            } : undefined;

            tags.value = await tagRepository.findByFilters(validatedFilters);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error while loading tasks.';
            console.error('Error details:', err);
            toast.add({severity: 'error', summary: t('tags.toast.loading.error.title'), detail: t('tags.toast.loading.error.message'), life: 1500});
        } finally {
            isListLoading.value = false;
        }
    };

    /**
     * Asynchronously creates a new task and updates the task list.
     *
     * This function is responsible for sending task creation data to the task repository,
     * handling the loading and error states, and refreshing the task list upon successful creation.
     *
     * @param {TaskInput} tagData - The data required to create a new task.
     * @returns {Promise<Tag | null>} A promise that resolves to the newly created task or null if an error occurs.
     */
    const createTag = async (tagData: TagInput): Promise<Tag | null> => {
        isCreateLoading.value = true;
        error.value = null;

        try {
            const newTag = await tagRepository.create(tagData);
            await loadTags();
            toast.add({severity: 'success', summary: t('tags.toast.create.success.title'), detail: t('tags.toast.create.success.message'), life: 1500});
            return newTag;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la création';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('tags.toast.create.error.title'), detail: t('tags.toast.create.success.message'), life: 1500});
            return null;
        } finally {
            isCreateLoading.value = false;
        }
    };

    /**
     * Updates an existing task in the repository with the provided data.
     *
     * @param {string} id - The unique identifier of the task to be updated.
     * @param {Partial<TaskInput>} tagData - An object containing the fields to update in the task.
     * @returns {Promise<Tag | null>} A promise that resolves with the updated task if the operation is successful,
     *                                 or null if an error occurs or the task is not found.
     */
    const updateTag = async (id: number, tagData: Partial<TagInput>): Promise<Tag | null> => {
        isEditLoading.value = true;
        error.value = null;
        try {
            const updatedTag = await tagRepository.update(id, tagData);
            if (updatedTag) {
                await loadTags();

                const tasksWithTag: Task[] = tasks.value.filter(task =>
                    task.tags !== null && (task.tags as Tag[]).some(tag => tag.id === id)
                );

                for (const task of tasksWithTag) {
                    if (task.tags) {
                        const tagIndex = (task.tags as Tag[]).findIndex(tag => tag.id === id);

                        if (tagIndex !== -1) {
                            (task.tags as Tag[]).splice(tagIndex, 1, updatedTag as Tag);

                            const taskToUpdate = {
                                tags: task.tags
                            };
                            await updateTask(task.id as number, taskToUpdate, true);
                        }
                    }
                }

            }
            toast.add({severity: 'success', summary: t('tags.toast.update.success.title'), detail: t('tags.toast.update.success.message'), life: 1500});
            return updatedTag;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('tags.toast.update.success.title'), detail: t('tags.toast.update.success.message'), life: 1500});
            return null;
        } finally {
            isEditLoading.value = false;
        }
    };

    /**
     * Deletes multiple tags from the repository and updates related data accordingly.
     *
     * This function handles the removal of multiple tags by performing the following steps:
     * - Validates the IDs of each tag to ensure they are valid.
     * - Deletes the tags from the repository.
     * - Reloads the tags and tasks data to reflect the changes.
     * - Updates any tasks associated with the deleted tags by removing references to those tags.
     *
     * @param {Tag[]} tagsToDelete - An array of tag objects to be deleted.
     * @returns {Promise<void>} A promise that resolves once the tags are deleted, related data is updated, and tasks are adjusted.
     *
     * @throws {Error} Throws an error if any of the tag IDs are invalid or if there's an issue during the deletion process.
     */
    const deleteMultipleTags = async (tagsToDelete: Tag[]): Promise<void> => {
        isDeleteLoading.value = true;
        error.value = null;

        try {
            const tagIds = tagsToDelete.map(tag => tag.id) as number[];

            for (const id of tagIds) {
                if (!isValidId(id)) {
                    console.error("ID invalide détecté")
                }
            }

            const deletedTags = await tagRepository.deleteMultiple(tagIds);
            if (deletedTags) {
                await loadTags();
                await loadTasks();

                const tasksWithDeletedTags: Task[] = tasks.value.filter(task =>
                        task.tags !== null && (task.tags as Tag[]).some(tag =>
                            tagIds.includes(<number>tag.id)
                        )
                );

                for (const task of tasksWithDeletedTags) {
                    const updatedTags = (task.tags as Tag[]).filter((tag: Tag) =>
                        !tagIds.includes(<number>tag.id)
                    );

                    const taskToUpdate = {
                        tags: updatedTags
                    };

                    if (task.id)
                        await updateTask(task.id, taskToUpdate, true);
                }
            }
            toast.add({severity: 'success', summary: t('tags.toast.deleteAll.success.title'), detail: t('tags.toast.deleteAll.success.message'), life: 1500});
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression multiple';
            console.error(error.value);
            toast.add({severity: 'error', summary: t('tags.toast.deleteAll.error.title'), detail: t('tags.toast.deleteAll.error.message'), life: 1500});
        } finally {
            isDeleteLoading.value = false;
        }
    };

    /**
     * Asynchronously deletes a task by its ID.
     *
     * This function interacts with the `taskRepository` to remove a task identified by the given ID.
     * If the deletion is successful, the task list is reloaded. If an error occurs during the deletion process,
     * it updates the `error` state with an appropriate message and returns `false`.
     *
     * @param {string} id - The unique identifier of the task to be deleted.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the task was successfully deleted,
     *                             or `false` if an error occurred.
     */
    const deleteTag = async (id: number): Promise<boolean> => {
        isDeleteLoading.value = true;
        error.value = null;

        if (!isValidId(id)) {
            throw new Error("ID invalide");
        }

        try {
            const success = await tagRepository.delete(id);
            if (success) {
                await loadTags();
                await loadTasks()

                const tasksWithTag: Task[] = tasks.value.filter(task =>
                    task.tags !== null && (task.tags as Tag[]).some(tag => tag.id === id)
                );

                for (const task of tasksWithTag) {
                    const taskToUpdate = {
                        tags: (task.tags as Tag[]).filter((tag: Tag) => tag.id !== id)
                    }
                    await updateTask(task.id as number, taskToUpdate, true)
                }

            }
            toast.add({severity: 'success', summary: t('tags.toast.delete.success.title'), detail: t('tags.toast.delete.success.message'), life: 1500});
            return success;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('tags.toast.delete.error.title'), detail: t('tags.toast.delete.error.message'), life: 1500});
            return false;
        } finally {
            isDeleteLoading.value = false;
        }
    };

    function isValidId(id: unknown): id is number {
        return typeof id === 'number' && id > 0;
    }

    // Initial load
    loadTags().catch(console.error);

    return {
        // State
        tags,
        loading,
        error,
        isListLoading,
        isCreateLoading,
        isEditLoading,
        isDeleteLoading,

        // Computed
        tasks,

        // Actions
        loadTags,
        createTag,
        updateTag,
        deleteTag,
        deleteMultipleTags,
    };
}