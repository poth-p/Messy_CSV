import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export type ExportFormat = 'csv' | 'json' | 'excel';

/**
 * Exports cleaned data to a file using FileSaver.js for reliable downloads.
 */
/**
 * Sanitizes data to prevent CSV Injection (Excel formulas).
 * Prepends a single quote to string values starting with =, +, -, or @.
 */
export function sanitizeDataForExcel(data: any[]): any[] {
    return data.map(row => {
        const newRow: any = {};
        for (const key in row) {
            const val = row[key];
            if (typeof val === 'string') {
                // Check for CSV injection triggers: =, +, -, @
                // Note: User specifically mentioned + leading to formula.
                // Standard practice is =, +, -, @, but treating - might break negative numbers if not careful.
                // However, Excel handles negative numbers fine usually, but a formula starting with - is possible.
                // User complaint is about phone numbers starting with +.
                // Let's stick to =, +, @ for now to be safe, or include - if it looks like a formula?
                // Simplest consistent fix is strictly =, +, @. 
                // User showed +1-555... becoming a formula.

                // If it starts with +, =, @, prepend '
                if (/^[+=@]/.test(val)) {
                    newRow[key] = `'${val}`;
                } else {
                    newRow[key] = val;
                }
            } else {
                newRow[key] = val;
            }
        }
        return newRow;
    });
}

/**
 * Exports cleaned data to a file using FileSaver.js for reliable downloads.
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
        // Sanitize for Excel compatibility
        const safeData = sanitizeDataForExcel(data);
        const csv = Papa.unparse(safeData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${newFilename}.csv`);
    } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        saveAs(blob, `${newFilename}.json`);
    } else if (format === 'excel') {
        throw new Error('PREMIUM_FEATURE_REQUIRED');
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
