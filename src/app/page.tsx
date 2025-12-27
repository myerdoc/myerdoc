import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
        <div className="relative overflow-hidden">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rotate-[30deg] rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 opacity-20 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative mx-auto max-w-4xl px-6 py-20 lg:py-28 text-center">
            <h1 className="text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              Stop guessing.
              <br />
              Ask an on-call ER doctor.           
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              MyERDoc is a membership-based service that provides on-demand
              access to experienced emergency physicians after a brief
              review and intake process.
            </p>

            <div className="mt-10 flex flex-col items-center">
              <Link
                href="/request"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                Request review
              </Link>

              <p className="mt-3 text-sm text-slate-500">
                Membership required · Not for emergencies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-slate-700">
        <p>
          MyERDoc provides approved members with real-time access to
          board-certified emergency physicians for guidance, triage insight,
          and decision support when urgent questions arise.
        </p>

        <p className="mt-4">
          The service is designed for situations where something feels
          concerning and timely input from an emergency physician would
          be helpful, but it may be unclear whether emergency department
          care is necessary.
        </p>

        <p className="mt-6 font-medium text-slate-900">
          MyERDoc does not replace 911, EMS, or emergency department care.
        </p>

        <p className="mt-2 text-sm text-slate-600">
          Access to MyERDoc is limited to approved members. In select cases
          and when clinically appropriate, physicians may recommend or
          prescribe non-controlled medications in accordance with state
          laws and medical standards.
        </p>
      </section>
    </>
  );
}