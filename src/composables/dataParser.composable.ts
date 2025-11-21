import Papa from 'papaparse';
import type {Task} from "@/infrastructure/schemas";

export function useDataParser() {
    const exportToCSV = (data: Task[] | null) => {
        if (!data) return;
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'notes.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return {exportToCSV}
}