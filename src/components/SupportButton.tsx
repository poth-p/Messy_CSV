import React from 'react';
import { Coffee } from 'lucide-react';

interface SupportButtonProps {
    variant?: 'icon' | 'full';
    className?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({ variant = 'full', className = '' }) => {
    // TODO: Replace with your actual Buy Me a Coffee / Ko-fi URL
    const supportUrl = 'https://buymeacoffee.com/your-username';

    if (variant === 'icon') {
        return (
            <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors ${className}`}
                title="Buy me a coffee"
            >
                <Coffee className="w-5 h-5" />
            </a>
        );
    }

    return (
        <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors ${className}`}
        >
            <Coffee className="w-4 h-4" />
            Buy me a coffee
        </a>
    );
};
