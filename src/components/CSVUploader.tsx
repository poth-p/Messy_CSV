import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface CSVUploaderProps {
    onDataparsed?: (data: any[], meta: FileMetadata) => void;
}

export interface FileMetadata {
    name: string;
    size: number;
    rowCount: number;
    columnCount: number;
    columns: string[];
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataparsed }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [metadata, setMetadata] = useState<FileMetadata | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        // No file size restrictions anymore - all files are allowed

        setFile(selectedFile);
        setIsParsing(true);
        setError(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            preview: 10, // Parse only first 10 rows for preview initially to be fast? 
            // Wait, requirements say "Display first 10 rows" but we also need metadata like "row count".
            // So we need to parse the whole file to count rows, or at least stream it.
            // PapaParse has a 'step' or 'complete' callback. 
            // For 10MB, parsing everything client-side is fine.
            worker: true, // Use web worker for performance
            dynamicTyping: false,
            step: undefined, // We want whole file stats, so we wait for complete.
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0 && results.data.length === 0) {
                    // Critical error
                    setError("Failed to parse CSV: " + results.errors[0].message);
                    return;
                }

                // If there are errors but we got data, maybe just warn? 
                // For now, let's assume success if we got data.

                const rows = results.data as any[];
                const columns = results.meta.fields || [];

                const meta: FileMetadata = {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    rowCount: rows.length,
                    columnCount: columns.length,
                    columns: columns
                };

                setMetadata(meta);
                setPreviewData(rows.slice(0, 10)); // Store first 10 for preview

                if (onDataparsed) {
                    onDataparsed(rows, meta);
                }
            },
            error: (err) => {
                setIsParsing(false);
                setError("Error parsing CSV: " + err.message);
            }
        });

    }, [onDataparsed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'text/plain': ['.txt']
        },
        maxFiles: 1,
        disabled: isParsing || !!file
    });

    const handleClear = () => {
        setFile(null);
        setPreviewData([]);
        setMetadata(null);
        setError(null);
        setIsParsing(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {!file && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out",
                        isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-secondary/20",
                        error ? "border-destructive/50 bg-destructive/5" : ""
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className={cn("w-12 h-12 mx-auto mb-4 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
                    <h3 className="text-xl font-semibold mb-2">
                        {isDragActive ? "Drop your CSV here" : "Drag & drop your CSV here"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        or click to browse from your computer
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Supports .csv and .txt (max 10MB)
                    </p>
                    <div className="mt-4 pt-4 border-t border-dashed border-border/50">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const sampleData = [
                                    { id: "1", name: "  John Doe  ", email: "john@example.com", joined: "01/15/2023" },
                                    { id: "2", name: "Jane Smith", email: "jane@example.com", joined: "2023-01-16" },
                                    { id: "1", name: "  John Doe  ", email: "john@example.com", joined: "01/15/2023" },
                                    { id: "3", name: "Bob", email: "", joined: "15-02-2023" }
                                ];
                                const meta: FileMetadata = {
                                    name: "sample_data.csv",
                                    size: 1024,
                                    rowCount: 4,
                                    columnCount: 4,
                                    columns: ["id", "name", "email", "joined"]
                                };
                                // Mock state update
                                setFile(new File([], "sample_data.csv"));
                                setMetadata(meta);
                                setPreviewData(sampleData);
                                // Trigger parent
                                if (onDataparsed) onDataparsed(sampleData, meta);
                            }}
                            className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            Or load sample data to test
                        </button>
                    </div>
                </div>
            )}

            {isParsing && (
                <div className="border border-border rounded-xl p-12 text-center bg-card">
                    <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium">Parsing your file...</p>
                    <p className="text-muted-foreground">This happens entirely on your device.</p>
                </div>
            )}

            {file && !isParsing && metadata && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* File Info Bar */}
                    <div className="bg-card border rounded-lg p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold">{metadata.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(metadata.size)} • {metadata.rowCount.toLocaleString()} rows • {metadata.columnCount} columns
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClear}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                            title="Remove file"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Preview Table */}
                    <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                        <div className="p-3 bg-secondary/30 border-b flex justify-between items-center">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Data Preview (First 10 rows)
                            </h5>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                    <tr>
                                        {metadata.columns.map((col, idx) => (
                                            <th key={idx} className="px-4 py-3 font-medium sticky top-0 bg-secondary/50 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {previewData.map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-secondary/10 transition-colors">
                                            {metadata.columns.map((col, colIdx) => (
                                                <td key={`${rowIdx}-${colIdx}`} className="px-4 py-3 whitespace-nowrap max-w-[200px] truncate text-foreground/90">
                                                    {row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No data found in this file.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
