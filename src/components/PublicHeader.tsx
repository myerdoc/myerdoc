"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PublicHeader() {
  const [open, setOpen] = useState(false);

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

        {/* RIGHT - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold">
            Log in
          </Link>

          <Link
            href="/request"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Request review
          </Link>
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-slate-700"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-3">
          <Link 
            href="/how-it-works" 
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-slate-600"
          >
            How it works
          </Link>
          <Link 
            href="/safety" 
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-slate-600"
          >
            Safety
          </Link>
          <Link 
            href="/pricing" 
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-slate-600"
          >
            Pricing
          </Link>

          <div className="pt-3 border-t border-slate-200">
            <Link 
              href="/login" 
              onClick={() => setOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-slate-600"
            >
              Log in
            </Link>
            <Link 
              href="/request" 
              onClick={() => setOpen(false)}
              className="block mt-2 py-3 px-4 text-center text-base font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
            >
              Request review
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}