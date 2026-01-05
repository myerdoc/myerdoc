export default function HowItWorks() {
  return (
    <>
      {/* HERO — MATCHES HOME */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
        <div className="relative overflow-hidden">
          <div className="relative mx-auto max-w-4xl px-6 py-20 lg:py-28 text-center">
            <h1 className="text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              How MyERDoc Works
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              Clear guidance from an experienced emergency physician
              <br className="hidden sm:block" />
              when something doesn’t feel right.
            </p>
          </div>
        </div>
      </section>

      {/* BODY — MATCHES HOME */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-8">
          <div>
            <p className="font-medium">
              You have a concerning situation.
            </p>
            <p className="mt-1 text-slate-600">
              Something does not feel right, but it is not clear whether emergency
              care is needed right now.
            </p>
          </div>

          <div>
            <p className="font-medium">
              You connect with an experienced ER physician.
            </p>
            <p className="mt-1 text-slate-600">
              You speak directly with a board-certified emergency physician who
              evaluates the situation based on your history and symptoms.
            </p>
          </div>

          <div>
            <p className="font-medium">
              You receive clear guidance.
            </p>
            <p className="mt-1 text-slate-600">
              We focus on urgency, risk, and next steps — not exhaustive testing or
              ongoing care.
            </p>
          </div>

          <div>
            <p className="font-medium">
              You decide what to do next.
            </p>
            <p className="mt-1 text-slate-600">
              That may include monitoring at home, urgent care, contacting your
              primary doctor, or going to the emergency department.
            </p>
          </div>

          <div>
            <p className="font-medium">
              In limited cases, treatment may be recommended.
            </p>
            <p className="mt-1 text-slate-600">
              When clinically appropriate and legally permitted, our physicians may
              recommend or prescribe non-controlled medications to support symptom
              relief or short-term care.
            </p>
          </div>

          <p className="pt-4 font-medium">
            If you believe you are experiencing a medical emergency, call 911 or seek
            emergency care immediately.
          </p>
        </div>
      </section>
    </>
  );
}