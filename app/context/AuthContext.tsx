'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAdmin: boolean;
    techcoinBalance: number;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    logout: async () => { },
    isLoading: true,
    isAdmin: false,
    techcoinBalance: 0,
    refreshProfile: async () => { }
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [techcoinBalance, setTechcoinBalance] = useState(0);

    const checkUserRoleAndProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role, techcoin_balance')
                .eq('id', userId)
                .single();
            setIsAdmin((data as any)?.role === 'admin');
            setTechcoinBalance((data as any)?.techcoin_balance || 0);
        } catch (error) {
            // console.error('Error checking admin role/profile:', error);
            setIsAdmin(false);
            setTechcoinBalance(0);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await checkUserRoleAndProfile(user.id);
        }
    };

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) await checkUserRoleAndProfile(session.user.id);
            setIsLoading(false);
        };
        initSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await checkUserRoleAndProfile(session.user.id);
            } else {
                setIsAdmin(false);
                setTechcoinBalance(0);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        setTechcoinBalance(0);
    };

    return (
        <AuthContext.Provider value={{ user, logout, isLoading, isAdmin, techcoinBalance, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
