import React from 'react';
import { X, Layers, FileSpreadsheet } from 'lucide-react';
import { useAppMode } from '../lib/UserTierContext';
import { SupportButton } from './SupportButton';

interface AdvancedModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature?: 'excel' | 'batch' | 'generic';
}

export const AdvancedModeModal: React.FC<AdvancedModeModalProps> = ({ isOpen, onClose, feature = 'generic' }) => {
    const { setMode } = useAppMode();

    if (!isOpen) return null;

    const featureMessages = {
        'excel': "Excel export is available in Advanced mode.",
        'batch': "Batch processing is available in Advanced mode.",
        'generic': "This feature is available in Advanced mode."
    };

    const handleSwitchMode = () => {
        setMode('advanced');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {feature === 'excel' ? (
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                    ) : (
                        <Layers className="w-8 h-8 text-primary" />
                    )}
                </div>

                <h2 className="text-xl font-bold mb-2">Advanced Mode Feature</h2>
                <p className="text-muted-foreground mb-6">
                    {featureMessages[feature]}
                </p>

                <button
                    onClick={handleSwitchMode}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                    <Layers className="w-5 h-5" />
                    Switch to Advanced Mode
                </button>

                <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Stay in Simple Mode
                </button>

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Enjoying this tool? Consider supporting development:</p>
                    <div className="flex justify-center">
                        <SupportButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
