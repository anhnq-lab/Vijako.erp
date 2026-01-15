import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { User } from '../../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async (currentSession: Session | null) => {
        if (!currentSession) {
            setUser(null);
            return;
        }

        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
        }
    };

    const refreshUser = async () => {
        await fetchUser(session);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentSession = await authService.getSession();
                setSession(currentSession);
                await fetchUser(currentSession);
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        // Note: To make this robust, we'd add supabase.auth.onAuthStateChange listener here
        // But for now initial load is sufficient for basics, will add listener if needed for auto-logout
    }, []);

    const signOut = async () => {
        await authService.signOut();
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
