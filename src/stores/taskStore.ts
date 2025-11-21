import { defineStore } from 'pinia'
import type {Task} from "@/infrastructure/schemas";

export const taskStore = defineStore('data', {
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
            console.log('test')
        }
    },
})