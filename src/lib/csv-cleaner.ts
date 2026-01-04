/**
 * CSV Cleaning Logic
 * Handles client-side data cleaning operations.
 */

export interface CleaningOptions {
    removeDuplicates: boolean;
    trimWhitespace: boolean;
    dateColumns: string[];
    dateFormat?: string; // Target format: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD', or custom
    missingValues: {
        strategy: 'flag' | 'remove' | 'fill';
        fillValue?: string;
    };
}

export interface CleaningResult {
    data: any[];
    stats: CleaningStats;
}

export interface CleaningStats {
    originalRows: number;
    finalRows: number;
    duplicatesRemoved: number;
    datesFixed: number;
    cellsTrimmed: number;
    missingValuesHandled: number;
}

export class CSVCleaner {

    /**
     * Remove exact duplicate rows.
     * Keeps the first occurrence.
     */
    static removeDuplicateRows(data: any[]): { data: any[], removed: number } {
        const uniqueRows = new Map<string, any>();
        let removed = 0;

        for (const row of data) {
            // Create a reliable string representation of the row
            // Sorting keys ensures column order doesn't affect uniqueness check if parser was inconsistent (unlikely but safe)
            const rowString = JSON.stringify(row, Object.keys(row).sort());

            if (uniqueRows.has(rowString)) {
                removed++;
            } else {
                uniqueRows.set(rowString, row);
            }
        }

        return {
            data: Array.from(uniqueRows.values()),
            removed
        };
    }

    /**
     * Trim leading/trailing whitespace from all string values.
     */
    static trimWhitespace(data: any[]): { data: any[], trimmedCount: number } {
        let trimmedCount = 0;
        const cleanedData = data.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
                const value = newRow[key];
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    if (trimmed !== value) {
                        newRow[key] = trimmed;
                        trimmedCount++;
                    }
                }
            }
            return newRow;
        });

        return { data: cleanedData, trimmedCount };
    }

    /**
     * Standardize dates to target format (default: YYYY-MM-DD).
     * Supports DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD, or custom format
     */
    static standardizeDates(data: any[], dateColumns: string[], targetFormat: string = 'YYYY-MM-DD'): { data: any[], fixedCount: number } {
        let fixedCount = 0;

        const cleanedData = data.map(row => {
            const newRow = { ...row };
            for (const col of dateColumns) {
                if (row.hasOwnProperty(col)) {
                    const val = row[col];
                    if (!val) continue;

                    const dateStr = String(val).trim();
                    const cleanDate = this.parseDate(dateStr, targetFormat);

                    if (cleanDate) {
                        if (cleanDate !== val) {
                            newRow[col] = cleanDate;
                            fixedCount++;
                        }
                    } else {
                        // Mark invalid if it was not empty but failed to parse
                        if (dateStr.length > 0) {
                            newRow[col] = "[INVALID DATE] " + val;
                        }
                    }
                }
            }
            return newRow;
        });

        return { data: cleanedData, fixedCount };
    }

    /**
     * Helper to parse various date formats into target format
     */
    private static parseDate(dateStr: string, targetFormat: string = 'YYYY-MM-DD'): string | null {
        // Already ISO? YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        let year, month, day;

        // Try YYYY/MM/DD
        const ymdSlash = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
        if (ymdSlash) {
            year = parseInt(ymdSlash[1]);
            month = parseInt(ymdSlash[2]);
            day = parseInt(ymdSlash[3]);
            return this.formatDate(year, month, day, targetFormat);
        }

        // Try MM/DD/YYYY (US)
        const mdySlash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (mdySlash) {
            year = parseInt(mdySlash[3]);
            month = parseInt(mdySlash[1]);
            day = parseInt(mdySlash[2]);
            return this.formatDate(year, month, day, targetFormat);
        }

        // Try DD-MM-YYYY or DD/MM/YYYY (Euro)
        const dmySlash = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
        if (dmySlash) {
            year = parseInt(dmySlash[3]);
            month = parseInt(dmySlash[2]);
            day = parseInt(dmySlash[1]);
            return this.formatDate(year, month, day, targetFormat);
        }

        // Try other common weak parsers if strict regex fails
        const timestamp = Date.parse(dateStr);
        if (!isNaN(timestamp)) {
            const d = new Date(timestamp);
            year = d.getFullYear();
            month = d.getMonth() + 1;
            day = d.getDate();
            return this.formatDate(year, month, day, targetFormat);
        }

        return null;
    }

    private static formatDate(year: number, month: number, day: number, format: string = 'YYYY-MM-DD'): string | null {
        // Basic validation
        if (month < 1 || month > 12) return null;
        if (day < 1 || day > 31) return null;

        const y = year.toString().padStart(4, '0');
        const m = month.toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');

        // Support common formats
        switch (format) {
            case 'DD/MM/YYYY':
                return `${d}/${m}/${y}`;
            case 'MM/DD/YYYY':
                return `${m}/${d}/${y}`;
            case 'YYYY/MM/DD':
                return `${y}/${m}/${d}`;
            case 'YYYY-MM-DD':
            default:
                return `${y}-${m}-${d}`;
        }
    }

    /**
     * Handle missing values based on strategy.
     */
    static handleMissingValues(
        data: any[],
        strategy: 'flag' | 'remove' | 'fill',
        fillValue: string = ''
    ): { data: any[], affectedCount: number } {
        let affectedCount = 0;
        let cleanedData = [...data];

        if (strategy === 'remove') {
            const check = cleanedData.filter(row => {
                const hasMissing = Object.values(row).some(val => val === null || val === undefined || val === '');
                if (hasMissing) affectedCount++;
                return !hasMissing;
            });
            return { data: check, affectedCount }; // affectedCount here is rows removed
        }

        // For flag or fill, we iterate cells
        cleanedData = cleanedData.map(row => {
            const newRow = { ...row };
            for (const key in newRow) {
                const val = newRow[key];
                if (val === null || val === undefined || val === '') {
                    newRow[key] = strategy === 'flag' ? '[MISSING]' : fillValue;
                    affectedCount++; // cell affected
                }
            }
            return newRow;
        });

        return { data: cleanedData, affectedCount };
    }

    /**
     * Run all configured cleaning operations
     */
    static cleanAll(data: any[], options: CleaningOptions): CleaningResult {
        const stats: CleaningStats = {
            originalRows: data.length,
            finalRows: 0,
            duplicatesRemoved: 0,
            datesFixed: 0,
            cellsTrimmed: 0,
            missingValuesHandled: 0
        };

        let processedData = [...data];

        // 1. Remove Duplicates
        if (options.removeDuplicates) {
            const res = this.removeDuplicateRows(processedData);
            processedData = res.data;
            stats.duplicatesRemoved = res.removed;
        }

        // 2. Trim Whitespace
        if (options.trimWhitespace) {
            const res = this.trimWhitespace(processedData);
            processedData = res.data;
            stats.cellsTrimmed = res.trimmedCount;
        }

        // 3. Standardize Dates
        if (options.dateColumns.length > 0) {
            const res = this.standardizeDates(processedData, options.dateColumns, options.dateFormat || 'YYYY-MM-DD');
            processedData = res.data;
            stats.datesFixed = res.fixedCount;
        }

        // 4. Missing Values
        // "flag" | "remove" | "fill"
        // Note: 'remove' strategy deletes rows, so we count that differently maybe?
        // But prompt says "count of affected cells" for e). 
        // Logic above: remove returns 'affectedCount' as rows removed.
        const res = this.handleMissingValues(processedData, options.missingValues.strategy, options.missingValues.fillValue);
        processedData = res.data;
        if (options.missingValues.strategy === 'remove') {
            // For remove, affectedCount is rows.
            // But we typically track just "rows removed"
            // Let's add it to missingValuesHandled for now, or clearer stat?
            stats.missingValuesHandled = res.affectedCount;
        } else {
            stats.missingValuesHandled = res.affectedCount;
        }

        stats.finalRows = processedData.length;

        return {
            data: processedData,
            stats
        };
    }
}
