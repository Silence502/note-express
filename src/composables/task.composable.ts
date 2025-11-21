import {ref, computed} from 'vue';
import {taskRepository} from '@/infrastructure/repositories/task.repository';
import type {Task, TaskInput} from '@/infrastructure/schemas/task.schema';
import {useToast} from "primevue/usetoast";
import {useI18n} from "vue-i18n";
import {taskStore} from "@/stores/taskStore.ts";

export function useTasks() {
    const {t} = useI18n();
    const toast = useToast();
    const useTasks = taskStore()

    const currentFilter = ref<{ isDone?: boolean; tags?: number[]; search?: string }>({});
    const tasks = ref<Task[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isDoneLoading = ref(false);
    const isListLoading = ref(false);
    const isCreateLoading = ref(false);
    const isEditLoading = ref(false);
    const updatedFilter = ref()

    // Computed
    const doneTasks = computed(() =>
        tasks.value
            .filter(task => task.isDone)
    );

    const priorityTask = computed(() =>
        tasks.value
            .filter(task => task.priority)
    );

    const pendingTasks = computed(() =>
        tasks.value
            .filter(task => !task.isDone)
            .sort((a, b) => (b.position || 0) - (a.position || 0))
    );


    /**
     * Asynchronously loads tasks based on the provided filter criteria.
     *
     * @param {Object} [filters] - Optional filters to apply when loading tasks.
     * @param {boolean} [filters.isDone] - Filters tasks by their completion status. If true, only completed tasks are loaded. If false, only incomplete tasks are loaded.
     * @param {string[]} [filters.tags] - Filters tasks by their associated tags. Only tasks containing specified tags are loaded.
     * @param {string} [filters.search] - A search query to filter tasks by text. Tasks containing the query string will be loaded.
     * @returns {Promise<void>} Resolves when tasks are successfully loaded, or sets an error state if loading fails.
     */
    const loadTasks = async (filters?: { isDone?: boolean; tags?: number[]; search?: string }): Promise<void> => {
        // isListLoading.value = true;
        error.value = null;
        try {
            const validatedFilters = filters ? {
                ...filters,
                tags: filters.tags,
                search: filters.search?.trim() || undefined
            } : undefined;

            tasks.value = await taskRepository.findByFilters(validatedFilters);
            useTasks.setData(tasks.value)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
            console.error('Erreur détaillée:', err);
            toast.add({severity: 'error', summary: t('home.toast.loading.error.title'), detail: t('home.toast.loading.error.message'), life: 1500});
        } finally {
            isListLoading.value = false;
        }
    };

    /**
     * Asynchronously updates the filter applied in a task repository.
     *
     * This function takes an array of item identifiers and updates an associated filter in the repository.
     * The updated filter is then stored in the `updatedFilter` variable.
     *
     * @param {number[]} items - An array of item identifiers used to update the filter.
     * @returns {Promise<void>} A promise that resolves once the filter has been successfully updated.
     */
    const updateFilter = async (items: number[]): Promise<void> => {
        //TODO: Fonction à revoir.
        updatedFilter.value = await taskRepository.updateFilter(items)
    }

    /**
     * Asynchronously creates a new task and updates the task list.
     *
     * This function is responsible for sending task creation data to the task repository,
     * handling the loading and error states, and refreshing the task list upon successful creation.
     *
     * @param {TaskInput} taskData - The data required to create a new task.
     * @returns {Promise<Task | null>} A promise that resolves to the newly created task or null if an error occurs.
     */
    const createTask = async (taskData: TaskInput): Promise<Task | null> => {
        isCreateLoading.value = true;
        error.value = null;

        try {
            const newTask = await taskRepository.create(taskData);
            await loadTasks(currentFilter.value);
            toast.add({severity: 'success', summary: t('home.toast.create.success.title'), detail: t('home.toast.create.success.message'), life: 1500});
            return newTask;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la création';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('home.toast.create.error.title'), detail: t('home.toast.create.error.message'), life: 1500});
            return null;
        } finally {
            isCreateLoading.value = false;
        }
    };

    /**
     * Updates an existing task in the repository with the provided data.
     *
     * @param {string} id - The unique identifier of the task to be updated.
     * @param {Partial<TaskInput>} taskData - An object containing the fields to update in the task.
     * @param tagUpdate
     * @returns {Promise<Task | null>} A promise that resolves with the updated task if the operation is successful,
     *                                 or null if an error occurs or the task is not found.
     */
    const updateTask = async (id: number, taskData: Partial<TaskInput>, tagUpdate = false): Promise<Task | null> => {
        isEditLoading.value = true;
        error.value = null;

        try {
            const updatedTask = await taskRepository.update(id, taskData);
            if (updatedTask) {
                await loadTasks(currentFilter.value);
            }
            if (!tagUpdate) {
                toast.add({severity: 'success', summary: t('home.toast.update.success.title'), detail: t('home.toast.update.success.message'), life: 1500});
            }
            return updatedTask;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('home.toast.update.error.title'), detail: t('home.toast.update.error.message'), life: 1500});
            return null;
        } finally {
            isEditLoading.value = false;
        }
    };

    /**
     * Asynchronously toggles the completion status of a task by its identifier.
     * Updates the loading and error states during the operation.
     * Reloads the list of tasks upon successful completion or handles errors if they occur.
     *
     * @param {string} id - The unique identifier of the task whose status is to be toggled.
     * @returns {Promise<void>} A promise that resolves when the operation is completed.
     */
    const toggleTaskDone = async (id: number): Promise<void> => {
        isDoneLoading.value = true;
        error.value = null;
        try {
            await taskRepository.toggleDone(id);
            await loadTasks(currentFilter.value);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
            console.error(error.value)
        } finally {
            isDoneLoading.value = false;
        }
    };

    const toggleTaskPriority = async (id: number): Promise<void> => {
        error.value = null;
        try {
            await taskRepository.togglePriority(id);
            await loadTasks(currentFilter.value);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
            console.error(error.value)
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
    const deleteTask = async (id: number): Promise<boolean> => {
        error.value = null;

        if (!isValidId(id)) {
            throw new Error("ID invalide");
        }

        try {
            const success = await taskRepository.delete(id);
            if (success) {
                await loadTasks(currentFilter.value);
            }
            toast.add({severity: 'success', summary: t('home.toast.delete.success.title'), detail: t('home.toast.delete.success.message'), life: 1500});
            return success;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            console.error(error.value)
            toast.add({severity: 'error', summary: t('home.toast.delete.error.title'), detail: t('home.toast.delete.error.message'), life: 1500});
            return false;
        }
    };

    /**
     * Asynchronously deletes multiple tasks by their IDs and reloads the tasks list.
     *
     * This function takes an array of tasks, extracts their IDs, validates the IDs,
     * and attempts to delete the corresponding tasks using the task repository.
     * If the deletion is successful, it will reload the tasks list. Any errors
     * encountered during the operation are captured and logged appropriately.
     *
     * @param {Task[]} tasksToDelete - An array of tasks to be deleted.
     * @returns {Promise<void>} A promise that resolves when the tasks have been successfully deleted and the task list has been reloaded.
     * @throws Will handle validation errors or any issues encountered during the deletion process by assigning the error message to the `error` variable.
     */
    const deleteMultipleTasks = async (tasksToDelete: Task[]): Promise<void> => {
        error.value = null;

        try {
            const taskIds = tasksToDelete.map(task => task.id) as number[];

            for (const id of taskIds) {
                if (!isValidId(id)) {
                    console.error("ID invalide détecté")
                }
            }

            const deletedTags = await taskRepository.deleteMultiple(taskIds);
            if (deletedTags) {
                toast.add({severity: 'success', summary: t('home.toast.deleteAll.success.title'), detail: t('home.toast.deleteAll.success.message'), life: 1500});
                await loadTasks(currentFilter.value);
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la suppression multiple';
            console.error(error.value);
            toast.add({severity: 'error', summary: t('home.toast.deleteAll.error.title'), detail: t('home.toast.deleteAll.error.message'), life: 1500});
        }
    }

    /**
     * Reorders tasks based on the provided array of task IDs.
     *
     * The function accepts an array of task IDs and updates their order
     * by making an asynchronous call to the task repository. After successfully
     * reordering the tasks, it refreshes the task list. If an error occurs during
     * the process, it captures and sets the error message. The loading state is
     * managed throughout the operation.
     *
     * @param {string[]} taskIds - An array of task IDs representing the new order.
     * @returns {Promise<void>} A promise that resolves when the reordering and reloading are complete.
     */
    const reorderTasks = async (taskIds: number[]): Promise<void> => {
        error.value = null;
        try {
            await taskRepository.reorderTasks(taskIds);
            await loadTasks(currentFilter.value);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du réordonnancement';
            console.error(error.value)
        }
    };

    function isValidId(id: unknown): id is number {
        return typeof id === 'number' && id > 0;
    }

    // Initial load
    loadTasks().catch(console.error);

    return {
        // State
        tasks,
        loading,
        error,
        isDoneLoading,
        isListLoading,
        isCreateLoading,
        isEditLoading,
        currentFilter,
        updatedFilter,

        // Computed
        doneTasks,
        pendingTasks,
        priorityTask,

        // Actions
        loadTasks,
        createTask,
        updateTask,
        toggleTaskDone,
        deleteTask,
        reorderTasks,
        deleteMultipleTasks,
        toggleTaskPriority,
        updateFilter
    };
}