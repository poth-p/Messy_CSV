import React, { useState } from 'react';
import { Settings, Trash2, Crown, User } from 'lucide-react';
import { useUserTier } from '../lib/UserTierContext';

export const DevToolsPanel: React.FC = () => {
    const { tier, setTier } = useUserTier();
    const [isOpen, setIsOpen] = useState(false);

    // Only show in development
    if (import.meta.env.PROD) return null;

    const handleClearStorage = () => {
        localStorage.clear();
        window.location.reload();
    };

    const toggleTier = () => {
        const newTier = tier === 'free' ? 'premium' : 'free';
        setTier(newTier);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-[200] w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
                title="Dev Tools"
            >
                <Settings className="w-5 h-5" />
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 z-[200] w-80 bg-card border-2 border-purple-500 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Settings className="w-5 h-5 text-purple-500" />
                            Dev Tools
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Current Tier Display */}
                        <div className="bg-secondary/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Current Tier</div>
                            <div className="flex items-center gap-2">
                                {tier === 'premium' ? (
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <User className="w-5 h-5 text-muted-foreground" />
                                )}
                                <span className="font-bold capitalize">{tier}</span>
                            </div>
                        </div>

                        {/* Toggle Tier */}
                        <button
                            onClick={toggleTier}
                            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {tier === 'free' ? (
                                <>
                                    <Crown className="w-4 h-4" />
                                    Set to Premium
                                </>
                            ) : (
                                <>
                                    <User className="w-4 h-4" />
                                    Set to Free
                                </>
                            )}
                        </button>

                        {/* Clear Storage */}
                        <button
                            onClick={handleClearStorage}
                            className="w-full py-2 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Storage & Reload
                        </button>

                        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
                            Dev mode only - hidden in production
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
