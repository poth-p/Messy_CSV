import Papa from 'papaparse';

export type ExportFormat = 'csv' | 'json' | 'excel';

/**
 * Exports cleaned data to a file.
 */
export function exportCleanedData(
    data: any[],
    filename: string, // original filename
    format: ExportFormat
): void {
    const baseName = filename.replace(/\.(csv|txt)$/i, '');
    const timestamp = new Date().toISOString().split('T')[0];
    const newFilename = `${baseName}_cleaned_${timestamp}`;

    if (format === 'csv') {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `${newFilename}.csv`);
    } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        triggerDownload(blob, `${newFilename}.json`);
    } else if (format === 'excel') {
        // Premium feature stub
        alert("Excel export is a Premium feature. Upgrade for $5/month to unlock.");
        // In real app, we would show a modal or redirect to pricing.
    }
}

/**
 * Copies cleaned data to clipboard as CSV string.
 */
export async function copyToClipboard(data: any[]): Promise<boolean> {
    try {
        const csv = Papa.unparse(data);
        await navigator.clipboard.writeText(csv);
        return true;
    } catch (err) {
        console.error("Failed to copy", err);
        return false;
    }
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
