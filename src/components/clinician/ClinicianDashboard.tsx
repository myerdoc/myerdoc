'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import ConsultationQueue from './ConsultationQueue';
import CompletedConsultations from './CompletedConsultations';
import { logAudit } from '@/lib/utils/auditLog';

export default function ClinicianDashboard() {
    const supabase = createClient();
    const router = useRouter();
    
    const [stats, setStats] = useState({
        completedThisWeek: 0,
        completedThisMonth: 0,
        completedThisYear: 0
    });
    const [clinician, setClinician] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchClinicianData();
    }, []);

    useEffect(() => {
        if (clinician?.id) {
            fetchStats();
        }
    }, [clinician?.id]);

    async function fetchClinicianData() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data, error } = await supabase
            .from('clinicians')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (data) {
            setClinician(data);
        }
    }

    async function fetchStats() {
        try {
            if (!clinician?.id) {
                return;
            }

            // Calculate date ranges
            const now = new Date();
            
            // Start of week (Monday) - current week from Monday to Sunday
            const startOfWeek = new Date(now);
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
            
            // Calculate days to subtract to get to Monday of THIS week
            // If Sunday (0), subtract 6 days to get to Monday of this week
            // If Monday (1), subtract 0 days (already Monday)
            // If Tuesday (2), subtract 1 day, etc.
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            
            startOfWeek.setDate(now.getDate() - daysToSubtract);
            startOfWeek.setHours(0, 0, 0, 0);
            
            // Start of month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            // Start of year
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            startOfYear.setHours(0, 0, 0, 0);

            // Fetch completed this week
            const { count: weekCount } = await supabase
                .from('consultation_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_physician_id', clinician.id)
                .eq('status', 'completed')
                .gte('completed_at', startOfWeek.toISOString());

            // Fetch completed this month
            const { count: monthCount } = await supabase
                .from('consultation_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_physician_id', clinician.id)
                .eq('status', 'completed')
                .gte('completed_at', startOfMonth.toISOString());

            // Fetch completed this year
            const { count: yearCount } = await supabase
                .from('consultation_requests')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_physician_id', clinician.id)
                .eq('status', 'completed')
                .gte('completed_at', startOfYear.toISOString());

            setStats({
                completedThisWeek: weekCount || 0,
                completedThisMonth: monthCount || 0,
                completedThisYear: yearCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setMobileMenuOpen(false);
        router.replace('/login');
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    {/* Left - Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/clinician/dashboard" className="flex items-center">
                            <Image
                                src="/myerdoc-logo.png"
                                alt="MyERDoc"
                                width={180}
                                height={50}
                                priority
                                className="h-9 w-auto"
                            />
                        </Link>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span className="hidden sm:inline text-sm font-medium text-slate-600">Clinician Portal</span>
                    </div>

                    {/* Right - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                            Dr. {clinician?.first_name} {clinician?.last_name}
                            {clinician?.credentials && `, ${clinician.credentials}`}
                        </span>
                        <Link
                            href="/clinician/schedule"
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            Schedule
                        </Link>
                        <Link
                            href="/clinician/settings"
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                            Log out
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6 text-slate-700"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {mobileMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white shadow-lg">
                        <div className="px-6 py-4 flex flex-col space-y-1">
                            {/* Clinician Info */}
                            <div className="pb-3 mb-3 border-b border-slate-200">
                                <span className="text-sm font-medium text-slate-900">
                                    Dr. {clinician?.first_name} {clinician?.last_name}
                                    {clinician?.credentials && `, ${clinician.credentials}`}
                                </span>
                            </div>

                            {/* Menu Items */}
                            <Link
                                href="/clinician/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md px-3 -mx-3"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/clinician/schedule"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md px-3 -mx-3"
                            >
                                Schedule
                            </Link>
                            <Link
                                href="/clinician/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 text-base font-medium text-slate-800 hover:bg-slate-50 rounded-md px-3 -mx-3"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left py-3 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-md px-3 -mx-3"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Top Grid - Consultation Queue (60%) + Completed Stats (40%) */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Consultation Queue - 60% width (2 columns) */}
                    <div className="lg:col-span-2">
                        <ConsultationQueue 
                            onStatsUpdate={fetchStats}
                            clinicianId={clinician?.id}
                        />
                    </div>
                    
                    {/* Completed Consultations Stats - 40% width (1 column) */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-slate-600">Completed Consultations</h3>
                                <span className="text-2xl">✓</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">This Week</span>
                                    <span className="text-2xl font-bold text-green-600">{stats.completedThisWeek}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">This Month</span>
                                    <span className="text-2xl font-bold text-blue-600">{stats.completedThisMonth}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">This Year</span>
                                    <span className="text-2xl font-bold text-purple-600">{stats.completedThisYear}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completed Consultations */}
                <div className="mt-8">
                    <CompletedConsultations />
                </div>
            </main>
        </div>
    );
}
