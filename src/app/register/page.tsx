"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
  setLoading(true);
  setError(null);

  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    setError(error?.message || "Signup failed");
    setLoading(false);
    return;
  }

  // 2. Ensure session exists (CRITICAL for RLS)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    setError("Session not ready. Please try again.");
    setLoading(false);
    return;
  }

  // 3. Create membership row
  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      user_id: session.user.id,
      plan_type: "individual",
      status: "approved",
    });

  if (membershipError) {
    console.error("membershipError:", membershipError);
    setError("Account created, but membership setup failed.");
    setLoading(false);
    return;
  }

  // 4. Continue onboarding
    router.push("/register/complete");};

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Activate your MyERDoc membership
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            You’ve been approved to proceed. Before on-call ER physician
            access begins, we’ll complete a brief onboarding process to
            ensure safe and effective use of the service.
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-12">
        {/* CONTENT KEPT */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            What MyERDoc provides
          </h2>

          <p className="mt-4 text-slate-700">
            MyERDoc is a membership-based service that gives approved
            members on-call access to experienced emergency physicians
            for real-time guidance when urgent medical questions arise.
          </p>

          <p className="mt-4 text-slate-700">
            The service does not replace emergency medical care.
          </p>
        </div>

        {/* REGISTER */}
        <div className="flex flex-col items-center gap-4 pt-8">
          <p className="text-sm text-slate-600 text-center max-w-sm">
            To continue, create your secure MyERDoc account. This account will be
            used to complete intake and manage your membership.
          </p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-sm rounded border border-slate-300 px-3 py-2"
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full max-w-sm rounded border border-slate-300 px-3 py-2"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full max-w-sm rounded-xl bg-slate-900 px-6 py-3 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account & continue"}
          </button>

          <p className="text-xs text-slate-500 text-center max-w-sm">
            Intake and on-call access are activated after required onboarding
            steps are completed.
          </p>

          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 transition"
          >
            Return to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}