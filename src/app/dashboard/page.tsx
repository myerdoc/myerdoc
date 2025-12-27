"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("intake_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.intake_completed) {
        router.replace("/membership/intake");
        return;
      }

      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-medium text-slate-900">
        Dashboard
      </h1>

      <p className="mt-4 text-slate-600">
        Welcome back. Your MyERDoc membership is active.
      </p>

      {/* Dashboard content goes here */}
    </main>
  );
}