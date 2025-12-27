"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1️⃣ Initial session check
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    });

    // 2️⃣ Listen for login events (THIS WAS MISSING)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace("/dashboard");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // ❗ NO redirect here — listener handles it
  };

  if (checkingSession) return null;

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
          Don’t have an active MyERDoc membership?
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