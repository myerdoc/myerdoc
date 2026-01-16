"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, addDays, isSameMonth, isToday } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Clinician {
  id: string;
  first_name: string;
  last_name: string;
  credentials?: string | null;
  full_name?: string;
}

interface Schedule {
  id: string;
  clinician_id: string;
  schedule_date: string;
  shift_start: string;
  shift_end: string;
  is_active: boolean | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSchedulePage() {
  const supabase = createClient();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClinician, setSelectedClinician] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  async function loadData() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clinicianData } = await supabase
        .from("clinicians")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!clinicianData) return;
      setCurrentUser(clinicianData);

      // Load all clinicians
      const { data: allClinicians, error: cliniciansError } = await supabase
        .from("clinicians")
        .select("id, first_name, last_name, credentials")
        .order("last_name", { ascending: true });

      if (cliniciansError) throw cliniciansError;
      
      // Compute full_name from first_name and last_name
      const cliniciansWithFullName = allClinicians ? allClinicians.map(c => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        credentials: c.credentials,
        full_name: `${c.first_name} ${c.last_name}`
      })) : [];
      
      setClinicians(cliniciansWithFullName);

      // Set first clinician as selected by default
      if (cliniciansWithFullName && cliniciansWithFullName.length > 0 && !selectedClinician) {
        setSelectedClinician(cliniciansWithFullName[0].id);
      }

      // Load schedules for current month
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("physician_schedules")
        .select("*")
        .gte("schedule_date", format(start, "yyyy-MM-dd"))
        .lte("schedule_date", format(end, "yyyy-MM-dd"));

      if (scheduleError) throw scheduleError;
      setSchedules(scheduleData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSchedule(date: Date, clinicianId: string) {
    const dateStr = format(date, "yyyy-MM-dd");
    const existingSchedule = schedules.find(
      s => s.schedule_date === dateStr && s.clinician_id === clinicianId
    );

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

  async function bulkSchedule(mode: 'weekdays' | 'weekends' | 'all-month' | 'clear-month') {
    if (!selectedClinician) return;

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days: Date[] = [];
    let current = start;

    while (current <= end) {
      const dayOfWeek = current.getDay();
      
      if (mode === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(new Date(current));
      } else if (mode === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        days.push(new Date(current));
      } else if (mode === 'all-month') {
        days.push(new Date(current));
      }
      
      current = addDays(current, 1);
    }

    try {
      if (mode === 'clear-month') {
        // Delete all schedules for selected clinician this month
        const { error } = await supabase
          .from("physician_schedules")
          .delete()
          .eq("clinician_id", selectedClinician)
          .gte("schedule_date", format(start, "yyyy-MM-dd"))
          .lte("schedule_date", format(end, "yyyy-MM-dd"));

        if (error) throw error;
        
        // Update local state
        setSchedules(schedules.filter(
          s => s.clinician_id !== selectedClinician || 
               s.schedule_date < format(start, "yyyy-MM-dd") || 
               s.schedule_date > format(end, "yyyy-MM-dd")
        ));
      } else {
        // Add schedules for selected days
        const newSchedules = days.map(day => ({
          clinician_id: selectedClinician,
          schedule_date: format(day, "yyyy-MM-dd"),
          shift_start: "06:00:00",
          shift_end: "22:00:00",
          is_active: true
        }));

        // Filter out dates that already have schedules
        const datesToAdd = newSchedules.filter(ns => 
          !schedules.some(s => 
            s.clinician_id === ns.clinician_id && 
            s.schedule_date === ns.schedule_date
          )
        );

        if (datesToAdd.length === 0) {
          alert("All selected dates are already scheduled");
          return;
        }

        const { data, error } = await supabase
          .from("physician_schedules")
          .insert(datesToAdd)
          .select();

        if (error) throw error;
        if (data) setSchedules([...schedules, ...data]);
      }
    } catch (error) {
      console.error("Error bulk scheduling:", error);
      alert("Failed to bulk schedule");
    }
  }

  function getScheduleForDate(date: Date, clinicianId: string): Schedule | undefined {
    const dateStr = format(date, "yyyy-MM-dd");
    return schedules.find(
      s => s.schedule_date === dateStr && s.clinician_id === clinicianId && s.is_active
    );
  }

  function getClinicianColor(index: number): string {
    const colors = [
      "bg-blue-100 border-blue-400",
      "bg-green-100 border-green-400",
      "bg-purple-100 border-purple-400",
      "bg-orange-100 border-orange-400",
      "bg-pink-100 border-pink-400",
      "bg-teal-100 border-teal-400",
    ];
    return colors[index % colors.length];
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

  const selectedClinicianData = clinicians.find(c => c.id === selectedClinician);

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
            <span className="text-sm font-medium text-slate-600">Admin Schedule Management</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/clinician/dashboard"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <span className="text-sm text-slate-600">
              Dr. {currentUser?.first_name} {currentUser?.last_name}
              {currentUser?.credentials && `, ${currentUser.credentials}`}
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
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Schedule Management</h1>
        </div>

        {/* Clinician Selection & Bulk Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Clinician Selector */}
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Clinician
              </label>
              <select
                value={selectedClinician || ""}
                onChange={(e) => setSelectedClinician(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    Dr. {clinician.first_name} {clinician.last_name}
                    {clinician.credentials && ` (${clinician.credentials})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulk Actions
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkSchedule('weekdays')}
                  disabled={!selectedClinician}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  All Weekdays
                </button>
                <button
                  onClick={() => bulkSchedule('weekends')}
                  disabled={!selectedClinician}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  All Weekends
                </button>
                <button
                  onClick={() => bulkSchedule('all-month')}
                  disabled={!selectedClinician}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Entire Month
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Clear all schedules for ${selectedClinicianData?.first_name} ${selectedClinicianData?.last_name} this month?`)) {
                      bulkSchedule('clear-month');
                    }
                  }}
                  disabled={!selectedClinician}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Clear Month
                </button>
              </div>
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
              const today = isToday(day);
              const currentMonth = isSameMonth(day, currentDate);
              const scheduledClinicians = clinicians.filter(c => 
                getScheduleForDate(day, c.id)
              );

              return (
                <div
                  key={index}
                  className={`
                    relative min-h-32 p-2 border-b border-r
                    ${!currentMonth ? "bg-gray-50" : "bg-white"}
                    ${today ? "ring-2 ring-blue-500 ring-inset" : ""}
                  `}
                >
                  {/* Date number */}
                  <div className="flex items-start justify-between mb-1">
                    <span className={`
                      text-sm font-medium
                      ${today ? "text-blue-600 font-bold" : ""}
                      ${!currentMonth ? "text-gray-400" : "text-gray-900"}
                    `}>
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Scheduled clinicians */}
                  {currentMonth && (
                    <div className="space-y-1">
                      {scheduledClinicians.map((clinician) => (
                        <button
                          key={clinician.id}
                          onClick={() => toggleSchedule(day, clinician.id)}
                          className={`
                            w-full text-xs px-2 py-1 rounded border-l-4
                            ${getClinicianColor(clinicians.indexOf(clinician))}
                            hover:opacity-75 transition-opacity text-left
                          `}
                        >
                          {clinician.first_name} {clinician.last_name.charAt(0)}.
                        </button>
                      ))}
                      
                      {/* Add button for selected clinician if not already scheduled */}
                      {selectedClinician && !scheduledClinicians.find(c => c.id === selectedClinician) && (
                        <button
                          onClick={() => toggleSchedule(day, selectedClinician)}
                          className="w-full text-xs px-2 py-1 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-600"
                        >
                          + Add {selectedClinicianData?.first_name}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Clinician Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {clinicians.map((clinician, index) => {
              const scheduleCount = schedules.filter(
                s => s.clinician_id === clinician.id && 
                     s.schedule_date >= format(monthStart, "yyyy-MM-dd") &&
                     s.schedule_date <= format(monthEnd, "yyyy-MM-dd")
              ).length;

              return (
                <div key={clinician.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-l-4 ${getClinicianColor(index)}`}></div>
                  <span className="text-sm">
                    Dr. {clinician.first_name} {clinician.last_name}
                    <span className="text-gray-500 ml-1">({scheduleCount} shifts)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Select a clinician from the dropdown</li>
            <li>• Use bulk actions to quickly schedule weekdays, weekends, or entire month</li>
            <li>• Click "+ Add [Name]" on any date to add a shift</li>
            <li>• Click on a colored bar to remove that clinician's shift</li>
            <li>• All shifts are 6:00 AM - 10:00 PM by default</li>
          </ul>
        </div>
      </main>
    </div>
  );
}