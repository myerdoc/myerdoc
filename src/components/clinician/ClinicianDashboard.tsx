'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import ConsultationQueue from './ConsultationQueue';
import CompletedConsultations from './CompletedConsultations';
import StatsWidget from './StatsWidget';
import { logAudit } from '@/lib/utils/auditLog';

export default function ClinicianDashboard() {
    const supabase = createClient();
    const router = useRouter();
    
    const [stats, setStats] = useState({
        pending: 0,
        inProgress: 0,
        completedToday: 0,
        total: 0
    });
    const [clinician, setClinician] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClinicianData();
        fetchStats();
    }, []);

    async function fetchClinicianData() {
        const { data: { user } } = await supabase.auth.getUser();
        
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
            const { data: { user } } = await supabase.auth.getUser();
            
            // Get clinician ID
            const { data: clinicianData } = await supabase
                .from('clinicians')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!clinicianData) return;

            // Fetch dashboard stats
            const { data, error } = await supabase
                .from('clinician_dashboard_stats')
                .select('*')
                .eq('clinician_id', clinicianData.id)
                .single();

            if (data) {
                setStats({
                    pending: data.pending_consultations || 0,
                    inProgress: data.in_progress_consultations || 0,
                    completedToday: data.completed_today || 0,
                    total: data.total_consultations || 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
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
                        <span className="text-slate-300">|</span>
                        <span className="text-sm font-medium text-slate-600">Clinician Portal</span>
                    </div>

                    {/* Right - User info & logout */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                            Dr. {clinician?.first_name} {clinician?.last_name}
                            {clinician?.credentials && `, ${clinician.credentials}`}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <StatsWidget
                        title="Pending"
                        value={stats.pending}
                        color="red"
                        icon="⏰"
                    />
                    <StatsWidget
                        title="In Progress"
                        value={stats.inProgress}
                        color="amber"
                        icon="🔄"
                    />
                    <StatsWidget
                        title="Completed Today"
                        value={stats.completedToday}
                        color="green"
                        icon="✓"
                    />
                    <StatsWidget
                        title="Total Consultations"
                        value={stats.total}
                        color="blue"
                        icon="📊"
                    />
                </div>

                {/* Consultation Queue */}
                <ConsultationQueue 
                    onStatsUpdate={fetchStats}
                    clinicianId={clinician?.id}
                />

                {/* Completed Consultations */}
                <div className="mt-8">
                    <CompletedConsultations />
                </div>
            </main>
        </div>
    );
}
