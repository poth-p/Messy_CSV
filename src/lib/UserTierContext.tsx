import React, { createContext, useContext, useState } from 'react';

export type AppMode = 'simple' | 'advanced';

interface AppModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    isAdvancedMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<AppMode>(() => {
        const saved = localStorage.getItem('appMode');
        return (saved as AppMode) || 'simple';
    });

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
        localStorage.setItem('appMode', newMode);
    };

    return (
        <AppModeContext.Provider value={{ mode, setMode, isAdvancedMode: mode === 'advanced' }}>
            {children}
        </AppModeContext.Provider>
    );
};

export const useAppMode = () => {
    const context = useContext(AppModeContext);
    if (context === undefined) {
        throw new Error('useAppMode must be used within an AppModeProvider');
    }
    return context;
};

// Legacy alias for backwards compatibility during refactoring
export const useUserTier = useAppMode;
export const UserTierProvider = AppModeProvider;
