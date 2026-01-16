"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const redirectingRef = useRef(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const supabase = createClient();
    
    try {
      // Use getUser() instead of getSession() - it validates with the server
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // No valid session, show login form
        setCheckingSession(false);
        return;
      }

      // Valid session exists, redirect
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        const role = await getUserRole(user.id);
        redirectByRole(role);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setCheckingSession(false);
    }
  }

  async function getUserRole(userId: string): Promise<string> {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    return data?.role || "patient";
  }

  function redirectByRole(role: string) {
    const destination = (role === "clinician" || role === "admin") 
      ? "/clinician/dashboard" 
      : "/dashboard";
    
    window.location.href = destination;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session && !redirectingRef.current) {
      redirectingRef.current = true;
      const role = await getUserRole(data.session.user.id);
      redirectByRole(role);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Log in</h1>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an active MyERDoc membership?
          <br />
          <Link
            href="/request"
            className="font-medium text-slate-900 underline hover:text-slate-700"
          >
            Request review for services →
          </Link>
        </p>
      </form>
    </main>
  );
}
