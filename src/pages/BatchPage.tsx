import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Zap, ArrowRight, Crown, ArrowLeft } from 'lucide-react';
import { BatchUploader, type BatchFile } from '../components/BatchUploader';
import { BatchWorkspace } from '../components/BatchWorkspace';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { UpgradeModal } from '../components/UpgradeModal';

export const BatchPage: React.FC = () => {
    const [batchFiles, setBatchFiles] = useState<BatchFile[] | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { canBatchProcess } = useFeatureAccess();

    // Gate premium feature
    if (!canBatchProcess) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
                <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 text-center">
                    <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Batch Processing is a Premium Feature</h1>
                    <p className="text-muted-foreground mb-8">
                        Process multiple CSV files at once and download them as a single ZIP archive.
                        Upgrade to Premium for just $5/month.
                    </p>
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Zap className="w-5 h-5" />
                        Upgrade to Premium
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    reason="batch"
                />
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
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <Layers className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl font-bold">Batch Processing</h1>
                        <Crown className="w-6 h-6 text-yellow-500" />
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
