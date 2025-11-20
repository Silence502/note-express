// repositories/taskRepository.ts
import {db, type TagRecord} from '@/infrastructure/db/database';
import {type Tag, type TagInput, TagSchema} from "@/infrastructure/schemas/tag.schema.ts";

export class TagRepository {

    /**
     * Creates a new tag with the provided data, validates it, and stores it in the database.
     *
     * @param {TagInput} tagData - The data for the tag to be created.
     * @return {Promise<Tag>} A promise that resolves to the newly created and validated tag.
     */
    async create(tagData: TagInput): Promise<Tag> {
        const now = new Date();
        const tagToCreate = {
            ...tagData,
            updatedAt: now
        };

        const validatedTag: TagRecord = TagSchema.parse(tagToCreate);

        await db.tags.add({
            ...validatedTag
        } as TagRecord);
        return validatedTag;
    }

    /**
     * Retrieves all tags from the database.
     * @return {Promise<Tag[]>} A promise that resolves to an array of Tag objects.
     */
    async findAll(): Promise<Tag[]> {
        return db.tags.toArray();
    }

    /**
     * Finds a tag by its unique identifier.
     *
     * @param {number} id - The unique identifier of the tag to retrieve.
     * @return {Promise<Tag | null>} A promise that resolves to the tag if found, or null if not found.
     */
    async findById(id: number): Promise<Tag | null> {
        const tag = await db.tags.get(id);
        return tag || null;
    }

    /**
     * Fetches tags from the database, applying the provided filter criteria.
     *
     * @param {Object} filters - The filters to apply when fetching tags.
     * @param {boolean} [filters.color] - Optional filter to match tags by their color value.
     * @param {string} [filters.search] - Optional search query to match tags by their name.
     * @return {Promise<Tag[]>} A promise that resolves to the sorted list of tags matching the filters.
     */
    async findByFilters(filters: {
        color?: boolean;
        search?: string;
    } = {}): Promise<Tag[]> {
        let collection = db.tags.toCollection();

        // if (filters.color !== undefined) {
        //     collection = collection.and(task => task.color === filters.color);
        // }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            collection = collection.and(tag =>
                tag.name != null &&
                (tag.name as string).toLowerCase().includes(searchLower)
            );
        }

        return collection.sortBy('name');
    }

    /**
     * Updates an existing tag in the database with new data.
     *
     * @param {number} id - The unique identifier of the tag to update.
     * @param {Partial<TagInput>} tagData - An object containing the data to update the tag with.
     * @return {Promise<Tag | null>} A promise that resolves to the updated tag if successful, or null if the tag does not exist.
     */
    async update(id: number, tagData: Partial<TagInput>): Promise<Tag | null> {
        const existingTag = await db.tags.get(id);
        if (!existingTag) {
            return null;
        }

        const updatedTag = {
            ...existingTag,
            ...tagData,
            updatedAt: new Date()
        };

        const validatedTag = TagSchema.parse(updatedTag);
        await db.tags.update(id, validatedTag);
        return validatedTag;
    }

    /**
     * Deletes a tag from the database by its ID.
     *
     * @param {number} id - The ID of the tag to be deleted.
     * @return {Promise<boolean
     */
    async delete(id: number): Promise<boolean> {
        if (!id) {
            console.error('Invalid ID provided for deletion:', id);
            return false;
        }
        const count = await db.tags.where('id').equals(id).delete();
        return count > 0;
    }

    /**
     * Deletes multiple entries from the database based on the provided array of IDs.
     *
     * @param {string[]} ids - An array of ID strings representing the entries to delete.
     * @return {Promise<number>} A promise that resolves to the number of entries successfully deleted. Returns 0 if the input is invalid.
     */
    async deleteMultiple(ids: number[]): Promise<number> {
        if (!Array.isArray(ids) || ids.length === 0 || !ids.every(id => true)) {
            console.error('Invalid IDs provided for deletion:', ids);
            return 0;
        }
        return db.tags.where('id').anyOf(ids).delete();
    }

}

export const tagRepository = new TagRepository();