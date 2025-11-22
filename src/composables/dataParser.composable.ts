import Papa from 'papaparse';
import {type Tag, type Task} from "@/infrastructure/schemas";
import {ref} from "vue";
import {db} from '@/infrastructure/db/database';
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";

export function useDataParser() {
    const {t} = useI18n();
    const toast = useToast();

    const isLoading = ref(false);
    const error = ref<Error | null>(null);
    const importedList = ref<Task[]>([]);

    const importFromCSV = async (file: File) => {
        if (!file) throw new Error("No file selected. Please select a CSV file to import tasks from.");
        if (file.size === 0) throw new Error("Empty file. Please select a valid CSV file with at least one task to import.");

        isLoading.value = true;
        error.value = null;

        return new Promise<void>((resolve, reject) => {
            error.value = null;
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: async (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`Erreurs de parsing: ${JSON.stringify(results.errors)}`));
                        return;
                    }

                    try {
                        const rawData = results.data as Task[];

                        const itemsToImport = rawData.map((item: Task) => {
                            let tags: Tag[] = [];

                            try {
                                if (typeof item.tags === 'string') {
                                    tags = JSON.parse(item.tags)
                                } else if (Array.isArray(item.tags)) {
                                    tags = item.tags
                                }
                            } catch (e) {
                                console.warn('Parsing tags error:', e);
                            }

                            return {
                                title: item.title,
                                description: item.description,
                                isDone: item.isDone,
                                color: item.color,
                                priority: Boolean(item.priority),
                                position: Number(item.position),
                                createdAt: item.createdAt,
                                updatedAt: item.updatedAt,
                                tags: tags ?? []
                            };
                        }).filter(Boolean) as Task[];

                        if (itemsToImport.length === 0) {
                            reject(new Error("Aucune donnée valide trouvée dans le fichier"));
                            return;
                        }

                        const allTags = itemsToImport.flatMap(task => {
                            return task.tags ?? [];
                        });

                        const uniqueTags = Array.from(
                            new Map(
                                allTags
                                    .filter((tag): tag is Tag =>
                                        tag !== null &&
                                        typeof tag === 'object' &&
                                        'name' in tag
                                    )
                                    .map(tag => [tag.name, tag])
                            ).values()
                        );

                        await db.tags.bulkAdd(uniqueTags)
                        await db.tasks.bulkAdd(itemsToImport);
                        resolve();
                        toast.add({severity: 'success', summary: t('home.toast.import.success.title'), detail: t('home.toast.import.success.message'), life: 1500});
                    } catch (err: any) {
                        reject(new Error(`Échec de l'import: ${err.message}`));
                        toast.add({severity: 'error', summary: t('home.toast.import.error.title'), detail: t('home.toast.import.error.message'), life: 1500});
                    }
                },
                error: (err) => {
                    reject(new Error(`Erreur de lecture: ${err.message}`))
                    toast.add({severity: 'error', summary: t('home.toast.import.error.title'), detail: t('home.toast.import.error.message'), life: 1500});
                },
            });
        }).finally(() => {
            isLoading.value = false;
        });
    };


    const exportToCSV = (data: Task[] | null) => {
        if (!data) return;

        try {
            const dataToExport = data.map(task => ({
                ...task,
                priority: task.priority ?? false,
                tags: task.tags ? [JSON.stringify(task.tags)] : []
            }));

            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'tasks.csv';
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            toast.add({severity: 'error', summary: t('home.toast.export.error.title'), detail: t('home.toast.export.error.message'), life: 1500});
            throw new Error('Échec de l\'export CSV');
        }
    };

    return {
        exportToCSV,
        importFromCSV,
        importedList
    }
}