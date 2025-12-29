import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the banner
        const bannerDismissed = localStorage.getItem('cookieBannerDismissed');
        if (!bannerDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('cookieBannerDismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4">
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg mb-2">No Cookies. Zero Tracking.</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We don't use cookies or tracking technologies. All CSV processing happens
                                in your browser. We only use LocalStorage to save your preferences
                                (like this banner dismissal). Your data never leaves your device.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={handleDismiss}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Got it!
                    </button>
                    <a
                        href="/privacy"
                        className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};
