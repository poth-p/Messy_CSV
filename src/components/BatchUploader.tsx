import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { FileMetadata } from './CSVUploader';
import type { CleaningOptions } from '../lib/csv-cleaner';
import Papa from 'papaparse';

export interface BatchFile {
    id: string;
    file: File;
    metadata?: FileMetadata;
    status: 'pending' | 'parsing' | 'ready' | 'processing' | 'complete' | 'error';
    error?: string;
    data?: any[];
    options?: CleaningOptions; // Per-file cleaning options
}

interface BatchUploaderProps {
    onFilesReady: (files: BatchFile[]) => void;
}

export const BatchUploader: React.FC<BatchUploaderProps> = ({ onFilesReady }) => {
    const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
    const MAX_BATCH_SIZE = 10;

    const onDrop = async (acceptedFiles: File[]) => {
        if (batchFiles.length + acceptedFiles.length > MAX_BATCH_SIZE) {
            toast.error(`Maximum ${MAX_BATCH_SIZE} files allowed in a batch.`);
            return;
        }

        // Check for duplicate filenames
        const existingNames = new Set(batchFiles.map(f => f.file.name));
        const duplicates = acceptedFiles.filter(f => existingNames.has(f.name));

        if (duplicates.length > 0) {
            toast.error(`Duplicate files skipped: ${duplicates.map(f => f.name).join(', ')}`);
            acceptedFiles = acceptedFiles.filter(f => !existingNames.has(f.name));
            if (acceptedFiles.length === 0) return;
        }

        const newFiles: BatchFile[] = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            status: 'pending'
        }));

        setBatchFiles(prev => [...prev, ...newFiles]);

        // Parse each file
        for (const batchFile of newFiles) {
            parseFile(batchFile);
        }
    };

    const parseFile = (batchFile: BatchFile) => {
        updateFileStatus(batchFile.id, 'parsing');

        Papa.parse(batchFile.file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.data.length === 0) {
                    updateFileStatus(batchFile.id, 'error', 'File is empty or invalid');
                    return;
                }

                const metadata: FileMetadata = {
                    name: batchFile.file.name.replace('.csv', ''),
                    size: batchFile.file.size,
                    rowCount: result.data.length,
                    columnCount: Object.keys(result.data[0] || {}).length,
                    columns: Object.keys(result.data[0] || {})
                };

                // Suggest date columns
                const suggestedDates = metadata.columns.filter(col => {
                    const lower = col.toLowerCase();
                    return lower.includes('date') || lower.includes('time') || lower.includes('created') || lower.includes('dob');
                });

                // Initialize default options for this file
                const defaultOptions: CleaningOptions = {
                    removeDuplicates: true,
                    trimWhitespace: true,
                    dateColumns: suggestedDates,
                    dateFormat: 'YYYY-MM-DD',
                    missingValues: {
                        strategy: 'flag',
                        fillValue: ''
                    }
                };

                setBatchFiles(prev => prev.map(f =>
                    f.id === batchFile.id
                        ? { ...f, metadata, data: result.data as any[], status: 'ready', options: defaultOptions }
                        : f
                ));
            },
            error: (error) => {
                updateFileStatus(batchFile.id, 'error', error.message);
            }
        });
    };

    const updateFileStatus = (id: string, status: BatchFile['status'], error?: string) => {
        setBatchFiles(prev => prev.map(f =>
            f.id === id ? { ...f, status, error } : f
        ));
    };

    const removeFile = (id: string) => {
        setBatchFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleProceed = () => {
        const readyFiles = batchFiles.filter(f => f.status === 'ready');
        if (readyFiles.length === 0) {
            toast.error('No files ready to process');
            return;
        }
        onFilesReady(readyFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        multiple: true
    });

    const readyCount = batchFiles.filter(f => f.status === 'ready').length;

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/20'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Upload Multiple CSV Files</h3>
                <p className="text-muted-foreground mb-2">
                    Drag & drop or click to select up to {MAX_BATCH_SIZE} files
                </p>
                <p className="text-xs text-muted-foreground">
                    Batch processing is an Advanced Mode feature
                </p>
            </div>

            {/* File List */}
            {batchFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold">Uploaded Files ({batchFiles.length})</h4>
                        <span className="text-sm text-muted-foreground">
                            {readyCount} ready
                        </span>
                    </div>

                    <div className="space-y-2">
                        {batchFiles.map(batchFile => (
                            <div
                                key={batchFile.id}
                                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                            >
                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{batchFile.file.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {batchFile.metadata
                                            ? `${batchFile.metadata.rowCount.toLocaleString()} rows`
                                            : (batchFile.file.size / 1024).toFixed(1) + ' KB'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {batchFile.status === 'parsing' && (
                                        <span className="text-xs text-blue-500">Parsing...</span>
                                    )}
                                    {batchFile.status === 'ready' && (
                                        <span className="text-xs text-green-500">✓ Ready</span>
                                    )}
                                    {batchFile.status === 'error' && (
                                        <div className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="w-3 h-3" />
                                            Error
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFile(batchFile.id)}
                                        className="p-1 hover:bg-secondary rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={readyCount === 0}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        Process {readyCount} File{readyCount !== 1 ? 's' : ''}
                    </button>
                </div>
            )}
        </div>
    );
};
