// utils/auth.ts
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * Gets the current user's role(s)
 * @returns {Promise<string|null>} The primary role or null
 */
export async function getUserRole(): Promise<string | null> {
    try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return null;
        }

        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            // Default to patient if no role found
            return 'patient';
        }

        return data.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Gets the full user object with role information
 */
export async function getUserWithRole(): Promise<any> {
    try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return null;
        }

        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        return {
            ...user,
            role: roleData?.role || 'patient'
        };
    } catch (error) {
        console.error('Error getting user with role:', error);
        return null;
    }
}

/**
 * Handles login and redirects based on role
 * @param {string} email 
 * @param {string} password 
 * @param {object} router - Next.js router
 */
export async function handleLogin(email: string, password: string, router: any): Promise<{ success: boolean; role?: string; error?: string }> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        // Get user role
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

        const role = roleData?.role || 'patient';

        // Route based on role
        if (role === 'clinician') {
            router.push('/clinician/dashboard');
        } else if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }

        return { success: true, role };
    } catch (error: any) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Middleware to require clinician authentication
 * Use in API routes or getServerSideProps
 */
export async function requireClinicianAuth(context: any): Promise<any> {
    const supabase = createClient();
    
    // Get the session from the request
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        };
    }

    // Check role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

    const role = roleData?.role;

    if (role !== 'clinician' && role !== 'admin') {
        return {
            redirect: {
                destination: '/unauthorized',
                permanent: false
            }
        };
    }

    return {
        props: {
            user: session.user,
            role
        }
    };
}

/**
 * Client-side auth guard for clinician routes
 * Use in useEffect or as a wrapper component
 */
export function useClinicianAuth(): { loading: boolean; authorized: boolean } {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleData?.role !== 'clinician' && roleData?.role !== 'admin') {
            router.push('/unauthorized');
            return;
        }

        setAuthorized(true);
        setLoading(false);
    }

    return { loading, authorized };
}

/**
 * Gets clinician profile for current user
 */
export async function getClinicianProfile(): Promise<any> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return null;

        const { data, error } = await supabase
            .from('clinicians')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error getting clinician profile:', error);
        return null;
    }
}

/**
 * Checks if current user is a clinician
 */
export async function isClinicianUser(): Promise<boolean> {
    const role = await getUserRole();
    return role === 'clinician' || role === 'admin';
}

/**
 * Higher-order component to protect clinician routes
 */
export function withClinicianAuth(Component: any) {
    return function ProtectedComponent(props: any) {
        const { loading, authorized } = useClinicianAuth();

        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!authorized) {
            return null; // Will redirect
        }

        return <Component {...props} />;
    };
}

/**
 * Hook to get current user session
 */
export function useSession(): { session: any; loading: boolean } {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { session, loading };
}
