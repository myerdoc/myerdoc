// components/clinician/StatsWidget.jsx
'use client';

import { createClient } from '@/lib/supabase/client';

export default function StatsWidget({ title, value, color, icon }) {
    const colorClasses = {
        red: 'bg-red-50 text-red-700 border-red-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm font-medium">{title}</p>
        </div>
    );
}