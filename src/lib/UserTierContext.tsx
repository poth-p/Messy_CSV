import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserTier = 'free' | 'premium';

interface UserTierContextType {
    tier: UserTier;
    setTier: (tier: UserTier) => void;
    isPremium: boolean;
    setUserEmail: (email: string | null) => void;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

export const UserTierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tier, setTierState] = useState<UserTier>(() => {
        const saved = localStorage.getItem('userTier');
        return (saved as UserTier) || 'free';
    });

    const [userEmail, setUserEmail] = useState<string | null>(() => {
        return localStorage.getItem('userEmail');
    });

    useEffect(() => {
        const checkStatus = async () => {
            if (!userEmail) return;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/user-status/${userEmail}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const { tier: serverTier } = await response.json();
                if (serverTier && serverTier !== tier) {
                    setTierState(serverTier);
                    localStorage.setItem('userTier', serverTier);
                }
            } catch (err) {
                console.error("Failed to check user status:", err);
            }
        };

        checkStatus();
    }, [userEmail]);

    const setTier = (newTier: UserTier) => {
        setTierState(newTier);
        localStorage.setItem('userTier', newTier);
    };

    return (
        <UserTierContext.Provider value={{ tier, setTier, isPremium: tier === 'premium', setUserEmail }}>
            {children}
        </UserTierContext.Provider>
    );
};

export const useUserTier = () => {
    const context = useContext(UserTierContext);
    if (context === undefined) {
        throw new Error('useUserTier must be used within a UserTierProvider');
    }
    return context;
};
