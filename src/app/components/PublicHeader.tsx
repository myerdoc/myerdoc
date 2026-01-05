import Image from "next/image";
import Link from "next/link";

export default function PublicHeader() {
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
      </div>
    </header>
  );
}