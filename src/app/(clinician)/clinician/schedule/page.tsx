"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Schedule {
  id: string;
  clinician_id?: string;
  schedule_date: string;
  shift_start: string;
  shift_end: string;
  is_active: boolean | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function SchedulePage() {
  const supabase = createClient();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [clinicianId, setClinicianId] = useState<string | null>(null);
  const [clinician, setClinician] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinicianAndSchedules();
  }, [currentDate]);

  async function loadClinicianAndSchedules() {
    try {
      setLoading(true);

      // Get current clinician
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clinicianData } = await supabase
        .from("clinicians")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!clinicianData) return;
      setClinicianId(clinicianData.id);
      setClinician(clinicianData);

      // Load schedules for current month
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data: scheduleData, error } = await supabase
        .from("physician_schedules")
        .select("*")
        .eq("clinician_id", clinicianData.id)
        .gte("schedule_date", format(start, "yyyy-MM-dd"))
        .lte("schedule_date", format(end, "yyyy-MM-dd"));

      if (error) throw error;
      setSchedules(scheduleData || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSchedule(date: Date) {
    if (!clinicianId) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const existingSchedule = schedules.find(s => s.schedule_date === dateStr);

    try {
      if (existingSchedule) {
        // Delete existing schedule
        const { error } = await supabase
          .from("physician_schedules")
          .delete()
          .eq("id", existingSchedule.id);

        if (error) throw error;
        setSchedules(schedules.filter(s => s.id !== existingSchedule.id));
      } else {
        // Create new schedule
        const { data, error } = await supabase
          .from("physician_schedules")
          .insert({
            clinician_id: clinicianId,
            schedule_date: dateStr,
            shift_start: "06:00:00",
            shift_end: "22:00:00",
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setSchedules([...schedules, data]);
      }
    } catch (error) {
      console.error("Error toggling schedule:", error);
      alert("Failed to update schedule");
    }
  }

  function isScheduled(date: Date): boolean {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.some(s => s.schedule_date === dateStr && s.is_active);
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDayOfWeek = monthStart.getDay();
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - startDayOfWeek);

  const calendarDays: Date[] = [];
  const currentDay = new Date(calendarStart);
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
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
            <span className="text-sm font-medium text-slate-600">My Schedule</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/clinician/dashboard"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <span className="text-sm text-slate-600">
              Dr. {clinician?.first_name} {clinician?.last_name}
              {clinician?.credentials && `, ${clinician.credentials}`}
            </span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/clinician/schedule/admin"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
            >
              Admin View →
            </Link>
            <div className="text-sm text-gray-600">
              Click dates to toggle availability (6 AM - 10 PM)
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Today
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const scheduled = isScheduled(day);
              const today = isToday(day);
              const currentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={index}
                  onClick={() => toggleSchedule(day)}
                  disabled={!currentMonth}
                  className={`
                    relative min-h-24 p-3 border-b border-r text-left
                    transition-colors
                    ${!currentMonth ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}
                    ${scheduled ? "bg-green-50 hover:bg-green-100" : ""}
                    ${today ? "ring-2 ring-blue-500 ring-inset" : ""}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`
                      text-sm font-medium
                      ${today ? "text-blue-600 font-bold" : ""}
                      ${!currentMonth ? "text-gray-400" : ""}
                    `}>
                      {format(day, "d")}
                    </span>
                    {scheduled && currentMonth && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        ON CALL
                      </span>
                    )}
                  </div>
                  
                  {scheduled && currentMonth && (
                    <div className="mt-2 text-xs text-gray-600">
                      6:00 AM - 10:00 PM
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-600"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
            <span>Available to schedule</span>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Schedule Summary</h3>
          <p className="text-sm text-blue-800">
            You have {schedules.filter(s => s.is_active).length} shifts scheduled this month.
            Standard shift time: 6:00 AM - 10:00 PM
          </p>
        </div>
      </main>
    </div>
  );
}