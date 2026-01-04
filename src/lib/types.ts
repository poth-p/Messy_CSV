/** A single row of CSV data */
export type CSVRow = Record<string, string | number | null | undefined>;

/** Array of CSV rows */
export type CSVData = CSVRow[];
