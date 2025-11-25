import { defineStore } from 'pinia'
import type {Task} from "@/infrastructure/schemas/task.schema.ts";

export const taskStore = defineStore('taskStore', {
    state: () => {
        return {
            data: null as Task[] | null,
            updateImportSuccess: false
        }
    },
    actions: {
        setData(data: Task[]) {
            this.data = data;
        },
        dispatchEvent(isImportSuccess: boolean) {
            this.updateImportSuccess = isImportSuccess;
        }
    },
})