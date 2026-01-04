import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CSVCleaner } from '../lib/csv-cleaner';
import type { CleaningOptions, CleaningResult } from '../lib/csv-cleaner';
import type { FileMetadata } from './CSVUploader';
import { exportCleanedData, copyToClipboard } from '../lib/export-utils';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { UpgradeModal } from './UpgradeModal';
import { ArrowLeft, Play, Download, Trash2, Calendar, Scissors, AlertCircle, RefreshCw, Copy, FileJson, FileSpreadsheet } from 'lucide-react';

interface CleanerWorkspaceProps {
    data: any[];
    metadata: FileMetadata;
    onReset: () => void;
}

export const CleanerWorkspace: React.FC<CleanerWorkspaceProps> = ({ data, metadata, onReset }) => {
    // State for Cleaning Options
    const [options, setOptions] = useState<CleaningOptions>({
        removeDuplicates: false,
        trimWhitespace: false,
        dateColumns: [],
        dateFormat: 'YYYY-MM-DD',
        missingValues: {
            strategy: 'flag', // default
            fillValue: ''
        }
    });

    const [customDateFormat, setCustomDateFormat] = useState('');

    const [previewResult, setPreviewResult] = useState<CleaningResult | null>(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { canExportExcel, isPremium } = useFeatureAccess();

    // Suggest date columns on mount
    useEffect(() => {
        const suggestedDates = metadata.columns.filter(col => {
            const lower = col.toLowerCase();
            return lower.includes('date') || lower.includes('time') || lower.includes('created') || lower.includes('dob');
        });

        if (suggestedDates.length > 0) {
            setOptions(prev => ({ ...prev, dateColumns: suggestedDates }));
        }
    }, [metadata.columns]);

    // Handle Option Changes
    const toggleOption = (key: keyof CleaningOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleMissingStrategyChange = (strategy: 'flag' | 'remove' | 'fill') => {
        setOptions(prev => ({
            ...prev,
            missingValues: { ...prev.missingValues, strategy }
        }));
    };

    // Run Cleaning
    const runPreview = () => {
        setIsCleaning(true);
        setError(null);
        // Use setTimeout to allow UI to render spinner if dataset is large
        setTimeout(() => {
            try {
                const result = CSVCleaner.cleanAll(data, options);
                setPreviewResult(result);
            } catch (err: any) {
                console.error("Cleaning failed:", err);
                setError(err.message || "An error occurred during cleaning");
                setPreviewResult(null);
            } finally {
                setIsCleaning(false);
            }
        }, 100);
    };

    // Initial run on mount or just wait for user? 
    // Prompt says "Add a Preview Changes button". So we wait.
    // But maybe run once initially with defaults if we want? No, let user choose.

    const handleDownload = (format: 'csv' | 'json' | 'excel') => {
        if (!previewResult) return;

        if (format === 'excel' && !canExportExcel) {
            // Fallback helper if validation fails early, though export-utils throws too
            setIsUpgradeModalOpen(true);
            return;
        }

        try {
            exportCleanedData(previewResult.data, metadata.name, format);
        } catch (err: any) {
            if (err.message === 'PREMIUM_FEATURE_REQUIRED') {
                setIsUpgradeModalOpen(true);
            } else {
                toast.error(`Export failed: ${err.message}`);
            }
        }
    };

    const handleCopy = async () => {
        if (!previewResult) return;
        await copyToClipboard(previewResult.data);
        toast.success("Copied cleaned CSV to clipboard!");
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar Controls */}
            <aside className="w-80 border-r border-border bg-card/50 flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-border">
                    <button
                        onClick={onReset}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
                    </button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        Cleaning Options
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metadata.name} ({metadata.rowCount.toLocaleString()} rows)
                    </p>
                </div>

                <div className="flex-1 p-6 space-y-8">
                    {/* Duplicates */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center font-medium gap-2">
                                <Trash2 className="w-4 h-4 text-red-400" /> Remove Duplicates
                            </label>
                            <input
                                type="checkbox"
                                checked={options.removeDuplicates}
                                onChange={() => toggleOption('removeDuplicates')}
                                className="toggle-checkbox w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Remove exact duplicate rows, keeping the first one found.
                        </p>
                    </div>

                    <hr className="border-border/50" />

                    {/* Whitespace */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center font-medium gap-2">
                                <Scissors className="w-4 h-4 text-orange-400" /> Trim Whitespace
                            </label>
                            <input
                                type="checkbox"
                                checked={options.trimWhitespace}
                                onChange={() => toggleOption('trimWhitespace')}
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Remove leading and trailing spaces from all text cells.
                        </p>
                    </div>

                    <hr className="border-border/50" />

                    {/* Date Standardization */}
                    <div className="space-y-3">
                        <label className="flex items-center font-medium gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" /> Standardize Dates
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                            Select columns to clean:
                        </p>
                        <select
                            multiple
                            className="w-full bg-background border border-border rounded-md p-2 text-sm h-32"
                            value={options.dateColumns}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setOptions(prev => ({ ...prev, dateColumns: selected }));
                            }}
                        >
                            {metadata.columns.map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground italic mb-3">
                            Hold Ctrl/Cmd to select multiple.
                        </p>

                        {/* Date Format Selection */}
                        <label className="text-sm font-medium">Output Format:</label>
                        <select
                            className="w-full bg-background border border-border rounded-md p-2 text-sm"
                            value={options.dateFormat === 'custom' || (!['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].includes(options.dateFormat || '')) ? 'custom' : options.dateFormat}
                            onChange={(e) => {
                                if (e.target.value === 'custom') {
                                    setOptions(prev => ({ ...prev, dateFormat: customDateFormat || 'YYYY-MM-DD' }));
                                } else {
                                    setOptions(prev => ({ ...prev, dateFormat: e.target.value }));
                                    setCustomDateFormat('');
                                }
                            }}
                        >
                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (European)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                            <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                            {isPremium && <option value="custom">Custom Format...</option>}
                        </select>

                        {/* Custom Format Input (Premium) */}
                        {isPremium && (options.dateFormat === 'custom' || !['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].includes(options.dateFormat || '')) && (
                            <div className="mt-2">
                                <label className="text-xs text-muted-foreground mb-1 block">
                                    Custom format (e.g. DD-MM-YYYY):
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-background border border-border rounded-md p-2 text-sm"
                                    placeholder="DD-MM-YYYY"
                                    value={customDateFormat || options.dateFormat}
                                    onChange={(e) => {
                                        setCustomDateFormat(e.target.value);
                                        setOptions(prev => ({ ...prev, dateFormat: e.target.value }));
                                    }}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Use YYYY, MM, DD with any separator
                                </p>
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
                                    name="missing"
                                    checked={options.missingValues.strategy === 'flag'}
                                    onChange={() => handleMissingStrategyChange('flag')}
                                    className="accent-primary"
                                />
                                Flag with [MISSING]
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="missing"
                                    checked={options.missingValues.strategy === 'remove'}
                                    onChange={() => handleMissingStrategyChange('remove')}
                                    className="accent-primary"
                                />
                                Remove entire row
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="missing"
                                    checked={options.missingValues.strategy === 'fill'}
                                    onChange={() => handleMissingStrategyChange('fill')}
                                    className="accent-primary"
                                />
                                Fill with value:
                            </label>
                            {options.missingValues.strategy === 'fill' && (
                                <input
                                    type="text"
                                    placeholder="e.g. N/A"
                                    className="w-full bg-secondary border border-border rounded-md px-3 py-1 text-sm mt-1"
                                    value={options.missingValues.fillValue || ''}
                                    onChange={(e) => setOptions(prev => ({
                                        ...prev,
                                        missingValues: { ...prev.missingValues, fillValue: e.target.value }
                                    }))}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-card">
                    <button
                        onClick={runPreview}
                        disabled={isCleaning}
                        className="w-full py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors mb-3 flex items-center justify-center gap-2"
                    >
                        {isCleaning ? "Processing..." : <><Play className="w-4 h-4" /> Preview Changes</>}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                if (!previewResult) return;
                                try {
                                    exportCleanedData(previewResult.data, metadata.name, 'csv');
                                } catch (err: any) {
                                    alert(`Export failed: ${err.message}`);
                                }
                            }}
                            disabled={!previewResult}
                            className="py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                            <Download className="w-4 h-4" /> Download CSV
                        </button>
                        <button
                            onClick={() => {
                                if (!previewResult) return;

                                // Generate JSON inline
                                const json = JSON.stringify(previewResult.data, null, 2);
                                const blob = new Blob([json], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                const baseName = metadata.name.replace(/\.(csv|txt)$/i, '');
                                const timestamp = new Date().toISOString().split('T')[0];
                                a.href = url;
                                a.download = `${baseName}_cleaned_${timestamp}.json`;
                                document.body.appendChild(a);
                                a.click();
                                setTimeout(() => {
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }, 100);
                            }}
                            disabled={!previewResult}
                            className="py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                            <FileJson className="w-4 h-4" /> Export JSON
                        </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            onClick={handleCopy}
                            disabled={!previewResult}
                            className="py-2 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                        >
                            <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button
                            onClick={() => handleDownload('excel')}
                            disabled={!previewResult}
                            className="py-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 text-emerald-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs border border-emerald-500/20"
                        >
                            <FileSpreadsheet className="w-3 h-3" /> Excel (Pro)
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-background/50 relative">
                {/* Stats Bar */}
                {previewResult && (
                    <div className="bg-card border-b border-border p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex gap-8 text-sm">
                            <div>
                                <span className="text-muted-foreground">Original Rows:</span>
                                <span className="ml-2 font-mono font-bold">{previewResult.stats.originalRows.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Cleaned Rows:</span>
                                <span className="ml-2 font-mono font-bold text-primary">{previewResult.stats.finalRows.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs font-medium">
                            {previewResult.stats.duplicatesRemoved > 0 && (
                                <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded flex gap-1 items-center">
                                    <Trash2 className="w-3 h-3" /> -{previewResult.stats.duplicatesRemoved} dups
                                </span>
                            )}
                            {previewResult.stats.datesFixed > 0 && (
                                <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded flex gap-1 items-center">
                                    <Calendar className="w-3 h-3" /> {previewResult.stats.datesFixed} dates
                                </span>
                            )}
                            {previewResult.stats.cellsTrimmed > 0 && (
                                <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded flex gap-1 items-center">
                                    <Scissors className="w-3 h-3" /> {previewResult.stats.cellsTrimmed} trimmed
                                </span>
                            )}
                            {previewResult.stats.missingValuesHandled > 0 && (
                                <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded flex gap-1 items-center">
                                    <AlertCircle className="w-3 h-3" /> {previewResult.stats.missingValuesHandled} missing
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-b border-red-200 p-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Cleaning Failed</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-sm text-red-600 underline mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-8">
                    {!previewResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <FileMetadataDisplay meta={metadata} />
                            <p className="mt-4">Adjust options on the left and click "Preview Changes"</p>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {/* Comparison View (First 5 Rows) */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-primary" /> Before vs After (First 5 Rows)
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Before */}
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="bg-secondary/30 px-4 py-2 text-xs font-bold uppercase text-muted-foreground border-b border-border">Before</div>
                                        <div className="overflow-x-auto">
                                            <SimpleTable
                                                data={data.slice(0, 5)}
                                                columns={metadata.columns}
                                            />
                                        </div>
                                    </div>

                                    {/* After */}
                                    <div className="border border-primary/30 rounded-lg overflow-hidden ring-1 ring-primary/20">
                                        <div className="bg-primary/10 px-4 py-2 text-xs font-bold uppercase text-primary border-b border-primary/20">After</div>
                                        <div className="overflow-x-auto">
                                            <SimpleTable
                                                data={previewResult.data.slice(0, 5)}
                                                columns={metadata.columns}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <UpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setIsUpgradeModalOpen(false)}
                    reason="excel"
                />
            </main>
        </div>
    );
};

const FileMetadataDisplay: React.FC<{ meta: FileMetadata }> = ({ meta }) => (
    <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mb-6">
            <RefreshCw className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{meta.name}</h3>
        <p className="text-muted-foreground">{meta.rowCount.toLocaleString()} rows found</p>
    </div>
);

const SimpleTable: React.FC<{ data: any[], columns: string[] }> = ({ data, columns }) => (
    <table className="w-full text-xs text-left">
        <thead className="bg-secondary/20 font-medium text-muted-foreground">
            <tr>
                {columns.map(col => (
                    <th key={col} className="px-3 py-2 whitespace-nowrap">{col}</th>
                ))}
            </tr>
        </thead>
        <tbody className="divide-y divide-border">
            {data.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/10">
                    {columns.map(col => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[150px] truncate">{row[col]}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);
