"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function MembershipIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 🔐 Client-side auth guard (stable, no loops)
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  // ⛔ Block render until auth is known
  if (loading) return null;

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Membership intake
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            Before on-call ER physician access begins, we complete a brief
            intake process to establish a baseline medical profile for each
            covered member.
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-14">
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            What intake involves
          </h2>

          <p className="mt-4 text-slate-700">
            Intake is a one-time onboarding step designed to ensure safe,
            effective use of MyERDoc. It is completed before access to
            on-call physician guidance begins.
          </p>

          <ul className="mt-6 space-y-3 text-slate-700">
            <li>
              <span className="font-medium">Baseline medical history</span>
              <br />
              Each covered individual completes a short intake form documenting
              medical history, medications, and allergies.
            </li>

            <li>
              <span className="font-medium">Physician intake call</span>
              <br />
              A brief call with a MyERDoc physician to review information,
              answer questions, and set expectations.
            </li>

            <li>
              <span className="font-medium">Vitals kit confirmation</span>
              <br />
              Verification that a MyERDoc vitals kit has been shipped or is
              already on file.
            </li>

            <li>
              <span className="font-medium">Vitals kit requirement</span>
              <br />
              Each membership includes a MyERDoc vitals kit for home use. If a kit is lost,
              damaged, or requires replacement, a replacement kit is available for
              $125.
            </li>
          </ul>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-700">
            <span className="font-medium">Important:</span> Intake does not
            replace emergency care. If you believe you are experiencing a
            medical emergency, call 911 immediately.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 pt-6">
          <Link
            href="/membership/intake/form"
            className="w-full max-w-sm rounded-xl bg-slate-900 px-6 py-3 text-center text-base font-medium text-white hover:bg-slate-800 transition"
          >
            Start intake
          </Link>

          <p className="text-sm text-slate-500 text-center max-w-sm">
            You can complete intake now or return later.
          </p>
        </div>
      </section>
    </main>
  );
}