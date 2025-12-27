import Link from "next/link";

export default function RegisterCompletePage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-2xl px-6 py-24 text-center space-y-6">
        <h1 className="text-3xl font-medium text-slate-900">
          Account created
        </h1>

        <p className="text-lg text-slate-600">
          Your MyERDoc account has been created successfully.
        </p>

        <p className="text-slate-600">
          Next, we’ll complete your onboarding so on-call ER physician
          access can be activated.
        </p>

        <Link
          href="/membership/intake"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-800 transition"
        >
          Continue to intake
        </Link>
      </section>
    </main>
  );
}