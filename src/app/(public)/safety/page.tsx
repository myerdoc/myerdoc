export default function Safety() {
  return (
    <>
      {/* HERO — MATCHES HOME & HOW IT WORKS */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
        <div className="relative overflow-hidden">
          <div className="relative mx-auto max-w-4xl px-6 py-20 lg:py-28 text-center">
            <h1 className="text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              Safety and Limitations
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              Clear boundaries to help you understand when MyERDoc is helpful
              <br className="hidden sm:block" />
              and when emergency care is needed.
            </p>
          </div>
        </div>
      </section>

      {/* BODY — MATCHES HOME & HOW IT WORKS */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-10">
          <p>
            MyERDoc is designed to provide access to experienced emergency
            physicians for guidance, triage insight, and next-step decision
            support. It is not a replacement for emergency medical services or
            in-person medical care.
          </p>

          <div>
            <p className="font-medium">
              When to seek emergency care
            </p>
            <p className="mt-2 text-slate-600">
              If you believe you may be experiencing a medical emergency, call
              911 or seek emergency care immediately. This includes, but is not
              limited to, chest pain, difficulty breathing, signs of stroke,
              severe trauma, uncontrolled bleeding, or loss of consciousness.
            </p>
          </div>

          <div>
            <p className="font-medium">
              What MyERDoc does not do
            </p>
            <ul className="mt-2 space-y-2 text-slate-600">
              <li>MyERDoc does not replace 911, EMS, or emergency department care.</li>
              <li>MyERDoc does not provide ongoing or longitudinal medical care.</li>
              <li>MyERDoc does not manage chronic medical conditions.</li>
              <li>MyERDoc does not provide care for complex or unstable conditions.</li>
              <li>MyERDoc does not prescribe controlled substances.</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">
              Prescribing limitations
            </p>
            <p className="mt-2 text-slate-600">
              In limited situations, and only when clinically appropriate and
              legally permitted, MyERDoc physicians may recommend or prescribe
              non-controlled medications to support short-term symptom relief
              or care.
            </p>
            <p className="mt-2 text-slate-600">
              Prescribing is not guaranteed and depends on the specific clinical
              situation, patient history, and applicable state laws. Controlled
              substances are never prescribed through MyERDoc.
            </p>
          </div>

          <div>
            <p className="font-medium">
              Location and licensing
            </p>
            <p className="mt-2 text-slate-600">
              MyERDoc physicians provide services only to individuals located in
              states where the physician is licensed at the time of the
              interaction. You may be asked to confirm your location before or
              during a consultation.
            </p>
          </div>

          <div>
            <p className="font-medium">
              Shared decision-making
            </p>
            <p className="mt-2 text-slate-600">
              MyERDoc provides guidance and medical judgment to help you decide
              what to do next. Final decisions about your care are always yours,
              and you are encouraged to seek in-person evaluation whenever
              recommended or when you feel it is needed.
            </p>
          </div>

          <p className="pt-4 font-medium">
            If at any point you feel unsafe or uncertain, seek emergency care
            immediately.
          </p>
        </div>
      </section>
    </>
  );
}