"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // 1️⃣ Initial user fetch
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setLoading(false);
    });

    // 2️⃣ Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
        // ❌ DO NOT router.refresh() here
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // explicit, stable
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/myerdoc-logo.png"
              alt="MyERDoc"
              width={180}
              height={50}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-800">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/safety">Safety</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-6">
          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-semibold">
                Log in
              </Link>
              <Link
                href="/request"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Request review
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link href="/dashboard" className="text-sm font-semibold">
                Dashboard
              </Link>

              <Link
                href="/membership/intake"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Membership intake
              </Link>

              <button
                onClick={logout}
                className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Log out
              </button>
            </>
          )}
        </div>

        {/* MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-slate-700"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-6 py-6 space-y-4 text-sm font-medium">
          <Link href="/how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/safety" onClick={() => setOpen(false)}>
            Safety
          </Link>
          <Link href="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </Link>

          {!user ? (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/request" onClick={() => setOpen(false)}>
                Request review
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link
                href="/membership/intake"
                onClick={() => setOpen(false)}
              >
                Membership intake
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}