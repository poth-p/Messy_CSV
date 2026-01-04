import React, { useState } from 'react';
import { X, Check, Zap, Shield, FileSpreadsheet, Layers, ArrowRight, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason?: 'file-size' | 'excel' | 'batch' | 'generic';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason = 'generic' }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setError(null);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            localStorage.setItem('userEmail', email);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const { url, error: apiError } = await response.json();
            if (apiError) throw new Error(apiError);

            if (url) {
                window.location.href = url;
            }
        } catch (err: any) {
            console.error('Upgrade failed:', err);
            setError("Upgrade failed. Please make sure the backend server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const reasons = {
        'file-size': "That's a big file! Upgrade to handle CSVs larger than 10MB.",
        'excel': "Excel export is a Premium feature. Get the data format you need.",
        'batch': "Tired of one-by-one? Premium users can process multiple files at once.",
        'generic': "Unlock the full power of Messy CSV Cleaner."
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left Side: Visual/Value Prop */}
                    <div className="w-full md:w-5/12 bg-primary/10 p-8 flex flex-col justify-center border-r border-border/50">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold leading-tight mb-4">Go Premium. <br />Clean Faster.</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Join thousands of data professionals using our advanced tools to save hours of manual work.
                        </p>
                    </div>

                    {/* Right Side: Features & CTA */}
                    <div className="w-full md:w-7/12 p-8 bg-card">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-4 animate-pulse">
                                PRO FEATURE REQUESTED
                            </span>
                            <p className="text-lg font-medium">
                                {reasons[reason]}
                            </p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            <FeatureItem icon={<Shield className="w-4 h-4" />} text="Unlimited File Size (Free: 10MB)" />
                            <FeatureItem icon={<FileSpreadsheet className="w-4 h-4" />} text="Direct Excel Export (.xlsx)" />
                            <FeatureItem icon={<Layers className="w-4 h-4" />} text="Batch Process Multiple Files" />
                            <FeatureItem icon={<Layers className="w-4 h-4" />} text="Advanced Cleaning Rules" />
                        </ul>

                        <div className="space-y-3">
                            {/* Email Input */}
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                placeholder="your@email.com"
                                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={isLoading}
                            />

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Upgrade Now - $5/mo
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            >
                                Maybe later
                            </button>
                        </div>

                        <p className="mt-4 text-[10px] text-center text-muted-foreground italic">
                            No commitment. Cancel anytime. Secure payments via Stripe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <li className="flex items-center gap-3 text-sm">
        <div className="w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
            {icon}
            {text}
        </div>
    </li>
);
