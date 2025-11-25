import {db, type TaskRecord} from '@/infrastructure/db/database';
import {type Task, type TaskInput, TaskSchema} from '@/infrastructure/schemas/task.schema';
import type {Tag} from "@/infrastructure/schemas/tag.schema.ts";

export class TaskRepository {
    /**
     * Creates a new task and adds it to the database after validation.
     *
     * @param {TaskInput} taskData - The input data for the task to be created, including required task properties.
     * @return {Promise<Task>} A promise that resolves with the created task object after it has been added to the database.
     */
    async create(taskData: TaskInput): Promise<Task> {
        const now = new Date();

        // Calculer la position si elle n'est pas fournie
        let position = taskData.position;
        if (position === undefined) {
            // Récupérer toutes les tâches pour trouver la position maximale
            const allTasks = await db.tasks.toArray();
            position = allTasks.length > 0
                ? Math.max(...allTasks.map(task => task.position || 0)) + 1
                : 0;
        }


        const taskToCreate = {
            ...taskData,
            position,
            createdAt: now,
            updatedAt: now
        };

        const validatedTask: TaskRecord = TaskSchema.parse(taskToCreate);

        await db.tasks.add({
            ...validatedTask
        } as TaskRecord);
        return validatedTask;
    }

    /**
     * Retrieves all tasks from the database.
     *
     * @return {Promise<Task[]>} A promise that resolves to an array of Task objects.
     */
    async findAll(): Promise<Task[]> {
        return db.tasks.toArray();
    }

    /**
     * Finds and retrieves tasks based on the provided filter criteria.
     *
     * @param {Object} filters An object containing filter options.
     * @param {boolean} [filters.isDone] If specified, filters tasks by their completion state.
     * @param {string[]} [filters.tags] If provided, filters tasks that include at least one of the specified tags.
     * @param {string} [filters.search] A search string to filter tasks by matching their title or description.
     * @return {Promise<Task[]>} A promise that resolves to an array of tasks that match the provided filters.
     */
    async findByFilters(filters: {
        isDone?: boolean;
        tags?: number[];
        search?: string;
    } = {}): Promise<Task[]> {
        let collection = db.tasks.toCollection();

        if (filters.isDone !== undefined) {
            collection = collection.and(task => task.isDone === filters.isDone);
        }

        if (filters.tags && filters.tags.length > 0) {
            collection = collection.and((task: Task) => {
                if (!Array.isArray(task.tags) || task.tags.length === 0) {
                    return false;
                }

                const filterTagIds = filters.tags!;
                const taskTagIds = (task.tags as Tag[])
                    .map(tag => tag.id)
                    .filter(id => id !== undefined && id !== null) as number[];

                return filterTagIds.some(filterTagId =>
                    taskTagIds.includes(filterTagId)
                );
            });

        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            collection = collection.and(task =>
                task.title != null &&
                (task.title as string).toLowerCase().includes(searchLower)
            );
        }

        return collection.sortBy('position');
    }

    /**
     * Updates an existing task with the provided partial task data.
     *
     * @param {string} id - The unique identifier of the task to update.
     * @param {Partial<TaskInput>} taskData - The partial task data used to update the existing task.
     * @return {Promise<Task | null>} A promise that resolves to the updated task if it exists, or null if the task does not exist.
     */
    async update(id: number, taskData: Partial<TaskInput>): Promise<Task | null> {
        const existingTask = await db.tasks.get(id);
        if (!existingTask) {
            return null;
        }

        const updatedTask = {
            ...existingTask,
            ...taskData,
            updatedAt: new Date()
        };

        const validatedTask = TaskSchema.parse(updatedTask);
        await db.tasks.update(id, validatedTask);
        return validatedTask;
    }

    /**
     * Toggles the `isDone` status of a task with the given ID.
     *
     * @param {string} id - The ID of the task to be updated.
     * @return {Promise<Task | null>} A promise that resolves to the updated task if successful, or null if the task does not exist.
     */
    async toggleDone(id: number): Promise<Task | null> {
        const task = await db.tasks.get(id);
        if (!task) {
            return null;
        }

        return await this.update(id, { isDone: !task.isDone, priority: false });
    }

    /**
     * Toggles the priority status of a task by its ID.
     *
     * @param {number} id - The unique identifier of the task whose priority needs to be toggled.
     * @return {Promise<Task | null>} A promise that resolves to the updated task object if the task exists,
     *                                or null if no task is found with the provided ID.
     */
    async togglePriority(id: number): Promise<Task | null> {
        const task = await db.tasks.get(id);
        if (!task) {
            return null;
        }

        return await this.update(id, { priority: !task.priority });
    }

    /**
     * Reorders tasks based on the provided list of task IDs.
     * Updates the position and timestamp of each task within a database transaction.
     *
     * @param {string[]} taskIds - An array of task IDs representing the desired order of tasks.
     *                              The first ID corresponds to the highest priority task.
     * @return {Promise<void>} A promise that resolves when the reordering operation is complete.
     */
    async reorderTasks(taskIds: number[]): Promise<void> {
        await db.transaction('rw', db.tasks, async () => {
            for (let i = 0; i < taskIds.length; i++) {
                await db.tasks.update(taskIds[i], {
                    position: i,
                    updatedAt: new Date()
                });
            }
        });
    }

    /**
     * Deletes a task with the specified id from the database.
     *
     * @param {string} id - The unique identifier of the task to be deleted.
     * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the deletion was successful.
     */
    async delete(id: number): Promise<boolean> {
        if (!id) {
            console.error('Invalid ID provided for deletion:', id);
            return false;
        }
        const count = await db.tasks.where('id').equals(id).delete();
        return count > 0;
    }


    /**
     * Deletes multiple records from the database based on the given IDs.
     *
     * @param {string[]} ids - An array of IDs of the records to be deleted.
     * @return {Promise<number>} A promise that resolves to the number of records deleted.
     */
    async deleteMultiple(ids: number[]): Promise<number> {
        if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => true)) {
            console.error('Invalid IDs provided for deletion:', ids);
            return 0;
        }
        return db.tasks.where('id').anyOf(ids).delete();
    }

}

export const taskRepository = new TaskRepository();