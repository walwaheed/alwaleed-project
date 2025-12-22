import { useState, useEffect } from 'react';
import { authAPI } from '../api';

/**
 * Custom hook for managing authentication state
 * Uses Supabase auth to track user session
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check current session on mount
        const checkUser = async () => {
            try {
                const currentUser = await authAPI.getUser();
                setUser(currentUser);
            } catch (err) {
                console.error('Error fetching user:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Listen for auth state changes
        const { data: { subscription } } = authAPI.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, fullName) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authAPI.signUp(email, password, fullName);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authAPI.signIn(email, password);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            setError(null);
            await authAPI.signOut();
            setUser(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user
    };
};
