import { defineStore } from 'pinia'
import type {UserSettings} from "@/infrastructure/schemas/settings.schema.ts";

export const settingsStore = defineStore('settingsStore', {
    state: () => {
        return {
            data: null as UserSettings | null,
        }
    },
    actions: {
        setData(data: UserSettings | null) {
            this.data = data;
        },
    },
})