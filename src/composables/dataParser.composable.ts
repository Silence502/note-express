import Papa from 'papaparse';
import {type Task} from "@/infrastructure/schemas";
import {ref} from "vue";
import {db} from '@/infrastructure/db/database';

export function useDataParser() {
    const isLoading = ref(false);
    const error = ref<Error | null>(null);

    const importFromCSV = async (file: File) => {
        if (!file) throw new Error("Aucun fichier sélectionné");
        if (file.size === 0) throw new Error("Le fichier est vide");

        isLoading.value = true;
        error.value = null;

        return new Promise<void>((resolve, reject) => {
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
                            return {
                                title: item.title,
                                description: item.description,
                                isDone: item.isDone,
                                color: item.color,
                                priority: Boolean(item.priority),
                                position: Number(item.position),
                                createdAt: item.createdAt,
                                updatedAt: item.updatedAt,
                                tags: null
                            };
                        }).filter(Boolean) as Task[];

                        if (itemsToImport.length === 0) {
                            reject(new Error("Aucune donnée valide trouvée dans le fichier"));
                            return;
                        }

                        await db.tasks.bulkAdd(itemsToImport);
                        resolve();
                    } catch (err: any) {
                        reject(new Error(`Échec de l'import: ${err.message}`));
                    }
                },
                error: (err) => reject(new Error(`Erreur de lecture: ${err.message}`)),
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
                tags: task.tags?.map(tag => JSON.stringify(tag)) ?? ''
                // tags: (() => {
                //     if (!task.tags || !Array.isArray(task.tags)) return '';
                //
                //     return task.tags
                //         .map(tag => {
                //             if (typeof tag === 'object' && tag.name) {
                //                 return `{name: ${tag.name}, color: ${tag.color || 'null'}}`;
                //             }
                //             return '';
                //         })
                //         .filter(tagString => tagString) // Filtrer les chaînes vides
                //         .join(', ');
                // })()
            }));

            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'tasks.csv';
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            throw new Error('Échec de l\'export CSV');
        }
    };

    return {exportToCSV, importFromCSV}
}