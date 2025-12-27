import Link from "next/link";
import MobilePricingFooter from "../components/MobilePricingFooter";

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            On-demand access to experienced emergency physicians
            <br className="hidden sm:block" />
            when you’re not sure what to do next.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              title="Individual"
              subtitle="For one adult."
              price="$75"
              features={[
                "On-demand access to board-certified ER physicians",
                "Real-time medical guidance and triage insight",
                "Help deciding if emergency care is needed",
                "Secure, private consultations",
                "Cancel anytime",
              ]}
            />

            <PricingCard
              title="Family"
              subtitle="Covers up to 4 people in the same household."
              price="$125"
              features={[
                "Everything in the Individual plan",
                "Coverage for adults and children",
                "Calm guidance for parents making urgent decisions",
                "One consistent medical voice for your family",
                "Add additional members as needed",
              ]}
              footnote="+$20 / month for each additional household member beyond 4"
            />

            <PricingCard
              title="Utah Visitor Pass"
              subtitle="Short-term concierge ER access while traveling in Utah."
              price="$250"
              features={[
                "Concierge ER physician access",
                "Ideal for ski trips, vacations, and seasonal stays",
                "Guidance for injuries, altitude illness, and urgent concerns",
                "No long-term commitment",
                "Avoid navigating an unfamiliar healthcare system",
              ]}
            />
          </div>
        </div>

        {/* REQUIRED CLINICAL ONBOARDING */}
        <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Required clinical onboarding
          </h3>

          <p className="mt-3 text-sm text-slate-700">
            Before on-call ER physician access begins, members complete a
            one-time clinical onboarding process to establish a baseline
            medical profile.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Physician-led intake call</li>
            <li>• Baseline medical history review</li>
            <li>• MyERDoc vitals kit with overnight shipping</li>
          </ul>

          <p className="mt-4 text-sm text-slate-700">
            <span className="font-medium">Pricing:</span> $200 (individuals) ·
            $250 (families and travelers)
          </p>

          <p className="mt-3 text-xs text-slate-600">
            Required for first-time members. Members with an existing MyERDoc
            medical profile do not need to repeat the intake process. A MyERDoc
            vitals kit is still required and may be replaced for $125 if needed.
          </p>
        </div>

        {/* DESKTOP CTA */}
        <div className="mt-16 hidden text-center sm:block">
          <Link
            href="/request"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-base font-medium text-white transition hover:bg-slate-800"
          >
            Request review
          </Link>

          <p className="mt-3 text-sm text-slate-500">
            Membership approval required · Not for emergencies
          </p>
        </div>
      </section>

      {/* MOBILE FOOTER */}
      <MobilePricingFooter />
    </>
  );
}

/* -------------------------------- */
/* Pricing Card Component */
/* -------------------------------- */

function PricingCard({
  title,
  subtitle,
  price,
  features,
  footnote,
}: {
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  footnote?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Header */}
        {/* Header */}
      <div className="min-h-[96px]">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>

        <div className="mt-6" />

        {/* Price */}
        <p className="text-4xl font-semibold text-slate-900">
          {price}
          <span className="text-base font-normal text-slate-600"> / month</span>
        </p>

        {/* Features */}
        <ul className="mt-8 space-y-3 text-sm text-slate-700">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Footnote */}
        {footnote && (
          <p className="mt-4 text-xs text-slate-500">{footnote}</p>
        )}
      </div>
    </div>
  );
}