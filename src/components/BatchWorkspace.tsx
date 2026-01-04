import React, { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Package, Play, Trash2, Scissors, Eye, Calendar } from 'lucide-react';
import type { BatchFile } from './BatchUploader';
import { CSVCleaner, type CleaningOptions } from '../lib/csv-cleaner';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { sanitizeDataForExcel } from '../lib/export-utils';
import JSZip from 'jszip';
import Papa from 'papaparse';

interface BatchWorkspaceProps {
    files: BatchFile[];
    onBack: () => void;
}

export const BatchWorkspace: React.FC<BatchWorkspaceProps> = ({ files, onBack }) => {
    const [processingFiles, setProcessingFiles] = useState<BatchFile[]>(files);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [previewFileId, setPreviewFileId] = useState<string | null>(null);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(files[0]?.id || null);
    const [customDateFormats, setCustomDateFormats] = useState<Record<string, string>>({});

    const { isPremium } = useFeatureAccess();

    const startBatchProcessing = async () => {
        setIsProcessing(true);

        for (let i = 0; i < processingFiles.length; i++) {
            const file = processingFiles[i];

            updateFileStatus(file.id, 'processing');

            try {
                await new Promise(resolve => setTimeout(resolve, 300));

                if (file.data && file.options) {
                    const result = CSVCleaner.cleanAll(file.data, file.options);

                    setProcessingFiles(prev => prev.map(f =>
                        f.id === file.id
                            ? { ...f, data: result.data, status: 'complete' }
                            : f
                    ));
                }
            } catch (error: any) {
                updateFileStatus(file.id, 'error', error.message);
            }
        }

        setIsProcessing(false);
        setIsComplete(true);
    };

    const updateFileStatus = (id: string, status: BatchFile['status'], error?: string) => {
        setProcessingFiles(prev => prev.map(f =>
            f.id === id ? { ...f, status, error } : f
        ));
    };

    const updateFileOptions = (id: string, options: CleaningOptions) => {
        setProcessingFiles(prev => prev.map(f =>
            f.id === id ? { ...f, options } : f
        ));
    };

    const completedCount = processingFiles.filter(f => f.status === 'complete').length;
    const errorCount = processingFiles.filter(f => f.status === 'error').length;
    const previewFile = previewFileId ? processingFiles.find(f => f.id === previewFileId) : null;
    const selectedFile = selectedFileId ? processingFiles.find(f => f.id === selectedFileId) : null;

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Left Sidebar - File Options */}
            <aside className="w-80 border-r border-border bg-card/50 flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-border">
                    <button
                        onClick={onBack}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <h2 className="text-xl font-bold">Batch Options</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {selectedFile ? `Configuring: ${selectedFile.file.name}` : 'Select a file to configure'}
                    </p>
                </div>

                {selectedFile && selectedFile.options && selectedFile.metadata ? (
                    <div className="flex-1 p-6 space-y-6">
                        {/* Remove Duplicates */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center font-medium gap-2 text-sm">
                                <Trash2 className="w-4 h-4 text-red-400" /> Remove Duplicates
                            </label>
                            <input
                                type="checkbox"
                                checked={selectedFile.options.removeDuplicates}
                                onChange={() => updateFileOptions(selectedFile.id, {
                                    ...selectedFile.options!,
                                    removeDuplicates: !selectedFile.options!.removeDuplicates
                                })}
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </div>

                        <hr className="border-border/50" />

                        {/* Trim Whitespace */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center font-medium gap-2 text-sm">
                                <Scissors className="w-4 h-4 text-orange-400" /> Trim Whitespace
                            </label>
                            <input
                                type="checkbox"
                                checked={selectedFile.options.trimWhitespace}
                                onChange={() => updateFileOptions(selectedFile.id, {
                                    ...selectedFile.options!,
                                    trimWhitespace: !selectedFile.options!.trimWhitespace
                                })}
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </div>

                        <hr className="border-border/50" />

                        {/* Date Columns */}
                        <div className="space-y-3">
                            <label className="flex items-center font-medium gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" /> Standardize Dates
                            </label>
                            <p className="text-xs text-muted-foreground">Select columns:</p>
                            <select
                                multiple
                                className="w-full bg-background border border-border rounded-md p-2 text-sm h-32"
                                value={selectedFile.options.dateColumns}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    updateFileOptions(selectedFile.id, {
                                        ...selectedFile.options!,
                                        dateColumns: selected
                                    });
                                }}
                            >
                                {selectedFile.metadata.columns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground italic">Hold Ctrl/Cmd to select multiple.</p>

                            {/* Date Format */}
                            {selectedFile.options.dateColumns.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    <label className="text-sm font-medium">Output Format:</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-md p-2 text-sm"
                                        value={selectedFile.options.dateFormat}
                                        onChange={(e) => {
                                            updateFileOptions(selectedFile.id, {
                                                ...selectedFile.options!,
                                                dateFormat: e.target.value
                                            });
                                        }}
                                    >
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (European)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                        <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                                        {isPremium && <option value="custom">Custom Format...</option>}
                                    </select>

                                    {/* Custom Format Input */}
                                    {isPremium && selectedFile.options.dateFormat === 'custom' && (
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">
                                                Custom format:
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-md p-2 text-sm"
                                                placeholder="e.g. DD-MM-YYYY"
                                                value={customDateFormats[selectedFile.id] || ''}
                                                onChange={(e) => {
                                                    setCustomDateFormats(prev => ({
                                                        ...prev,
                                                        [selectedFile.id]: e.target.value
                                                    }));
                                                    updateFileOptions(selectedFile.id, {
                                                        ...selectedFile.options!,
                                                        dateFormat: e.target.value || 'YYYY-MM-DD'
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <hr className="border-border/50" />

                        {/* Missing Values */}
                        <div className="space-y-3">
                            <label className="flex items-center font-medium gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-400" /> Missing Values
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`missing-${selectedFile.id}`}
                                        checked={selectedFile.options.missingValues.strategy === 'flag'}
                                        onChange={() => updateFileOptions(selectedFile.id, {
                                            ...selectedFile.options!,
                                            missingValues: { ...selectedFile.options!.missingValues, strategy: 'flag' }
                                        })}
                                        className="accent-primary"
                                    />
                                    Flag with [MISSING]
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`missing-${selectedFile.id}`}
                                        checked={selectedFile.options.missingValues.strategy === 'remove'}
                                        onChange={() => updateFileOptions(selectedFile.id, {
                                            ...selectedFile.options!,
                                            missingValues: { ...selectedFile.options!.missingValues, strategy: 'remove' }
                                        })}
                                        className="accent-primary"
                                    />
                                    Remove entire row
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`missing-${selectedFile.id}`}
                                        checked={selectedFile.options.missingValues.strategy === 'fill'}
                                        onChange={() => updateFileOptions(selectedFile.id, {
                                            ...selectedFile.options!,
                                            missingValues: { ...selectedFile.options!.missingValues, strategy: 'fill' }
                                        })}
                                        className="accent-primary"
                                    />
                                    Fill with value:
                                </label>
                                {selectedFile.options.missingValues.strategy === 'fill' && (
                                    <input
                                        type="text"
                                        placeholder="e.g. N/A"
                                        className="w-full bg-secondary/50 border border-border rounded-md p-2 text-sm"
                                        value={selectedFile.options.missingValues.fillValue || ''}
                                        onChange={(e) => updateFileOptions(selectedFile.id, {
                                            ...selectedFile.options!,
                                            missingValues: { ...selectedFile.options!.missingValues, fillValue: e.target.value }
                                        })}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground text-sm">
                        Select a file from the list to configure its cleaning options
                    </div>
                )}

                <div className="p-6 border-t border-border space-y-3">
                    <button
                        onClick={startBatchProcessing}
                        disabled={isProcessing || isComplete}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : isComplete ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Complete
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Process All Files
                            </>
                        )}
                    </button>

                    {isComplete && completedCount > 0 && (
                        <button
                            onClick={async () => {
                                const zip = new JSZip();

                                processingFiles
                                    .filter(f => f.status === 'complete' && f.data)
                                    .forEach(file => {
                                        const safeData = sanitizeDataForExcel(file.data!);
                                        const csv = Papa.unparse(safeData);
                                        zip.file(`${file.metadata?.name || 'cleaned'}.csv`, csv);
                                    });

                                const metadata = {
                                    processedAt: new Date().toISOString(),
                                    fileCount: processingFiles.filter(f => f.status === 'complete').length,
                                    tool: 'Messy CSV Cleaner - Batch Processing'
                                };
                                zip.file('_metadata.json', JSON.stringify(metadata, null, 2));

                                const blob = await zip.generateAsync({ type: 'blob' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `cleaned_batch_${Date.now()}.zip`;
                                document.body.appendChild(a);
                                a.click();
                                setTimeout(() => {
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }, 100);
                            }}
                            className="w-full py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            Download ZIP ({completedCount} files)
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content - File List */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Stats Bar */}
                <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Processing Queue</h2>
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="ml-2 font-bold">{processingFiles.length}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Complete:</span>
                            <span className="ml-2 font-bold text-green-500">{completedCount}</span>
                        </div>
                        {errorCount > 0 && (
                            <div>
                                <span className="text-muted-foreground">Errors:</span>
                                <span className="ml-2 font-bold text-red-500">{errorCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-3 max-w-4xl mx-auto">
                        {processingFiles.map(file => (
                            <div
                                key={file.id}
                                className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${selectedFileId === file.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                                onClick={() => setSelectedFileId(file.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{file.file.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {file.metadata?.rowCount.toLocaleString()} rows · {file.metadata?.columnCount} columns
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {file.status === 'processing' && (
                                            <span className="flex items-center gap-2 text-blue-500">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing
                                            </span>
                                        )}
                                        {file.status === 'complete' && (
                                            <>
                                                <span className="flex items-center gap-2 text-green-500">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Complete
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewFileId(file.id);
                                                    }}
                                                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Preview
                                                </button>
                                            </>
                                        )}
                                        {file.status === 'error' && (
                                            <span className="flex items-center gap-2 text-red-500">
                                                <AlertCircle className="w-4 h-4" />
                                                Error
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Modal */}
                {previewFile && (
                    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-card border border-border rounded-xl max-w-5xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h3 className="font-bold">{previewFile.file.name} - Preview</h3>
                                <button
                                    onClick={() => setPreviewFileId(null)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4 overflow-auto">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-secondary/20 sticky top-0">
                                        <tr>
                                            {previewFile.metadata?.columns.map(col => (
                                                <th key={col} className="px-3 py-2 text-left border border-border">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewFile.data?.slice(0, 10).map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-secondary/10">
                                                {previewFile.metadata?.columns.map(col => (
                                                    <td key={col} className="px-3 py-2 border border-border max-w-[200px] truncate">
                                                        {row[col]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Showing first 10 rows of {previewFile.data?.length.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
