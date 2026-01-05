import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { BatchUploader, type BatchFile } from '../components/BatchUploader';
import { BatchWorkspace } from '../components/BatchWorkspace';
import { useAppMode } from '../lib/UserTierContext';
import { SupportButton } from '../components/SupportButton';

export const BatchPage: React.FC = () => {
    const [batchFiles, setBatchFiles] = useState<BatchFile[] | null>(null);
    const { setMode, isAdvancedMode } = useAppMode();

    // Show mode switcher if not in advanced mode
    if (!isAdvancedMode) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
                <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 text-center">
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Layers className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Advanced Mode Required</h1>
                    <p className="text-muted-foreground mb-8">
                        Batch processing and Excel export are available in Advanced mode.
                        Switch to Advanced mode to process multiple CSV files at once.
                    </p>
                    <button
                        onClick={() => setMode('advanced')}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Layers className="w-5 h-5" />
                        Switch to Advanced Mode
                    </button>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-4">Enjoying this tool? Consider supporting development:</p>
                        <div className="flex justify-center">
                            <SupportButton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (batchFiles) {
        return <BatchWorkspace files={batchFiles} onBack={() => setBatchFiles(null)} />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <button
                        onClick={() => setMode('simple')}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Switch to Simple Mode
                    </button>
                </div>

                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Layers className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl font-bold">Batch Processing</h1>
                        <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">Advanced</span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Upload multiple CSV files and process them all at once. Download the cleaned results as a single ZIP file.
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Up to 10 files', icon: '📁' },
                        { label: 'Parallel processing', icon: '⚡' },
                        { label: 'ZIP export', icon: '📦' }
                    ].map(feature => (
                        <div key={feature.label} className="bg-card border border-border rounded-lg p-4 text-center">
                            <div className="text-3xl mb-2">{feature.icon}</div>
                            <div className="text-sm font-medium">{feature.label}</div>
                        </div>
                    ))}
                </div>

                {/* Uploader */}
                <BatchUploader onFilesReady={setBatchFiles} />
            </div>
        </div>
    );
};
