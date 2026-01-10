import Link from "next/link";

export default function MobilePricingFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900">
                Membership required
            </div>
            <div className="text-xs text-slate-500">
                Plans starting at $75 / month
            </div>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Get Access
          </Link>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Licensed emergency physicians. Not for emergencies.
        </p>
      </div>
    </div>
  );
}