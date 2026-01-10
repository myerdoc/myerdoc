// utils/auth.js
import { supabase } from '@/lib/supabaseClient';

/**
 * Gets the current user's role(s)
 * @returns {Promise<string|null>} The primary role or null
 */
export async function getUserRole() {
    try {
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
export async function getUserWithRole() {
    try {
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
export async function handleLogin(email, password, router) {
    try {
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
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Middleware to require clinician authentication
 * Use in API routes or getServerSideProps
 */
export async function requireClinicianAuth(context) {
    const { req } = context;
    
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
export async function useClinicianAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
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
export async function getClinicianProfile() {
    try {
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
export async function isClinicianUser() {
    const role = await getUserRole();
    return role === 'clinician' || role === 'admin';
}

/**
 * Higher-order component to protect clinician routes
 */
export function withClinicianAuth(Component) {
    return function ProtectedComponent(props) {
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
export function useSession() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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