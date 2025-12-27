"use client";

import { useState } from "react";

export default function BaselineIntakeForm() {
  const [conditions, setConditions] = useState<string[]>([]);
  const [noConditions, setNoConditions] = useState(false);
  const [noAllergies, setNoAllergies] = useState(false);

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Baseline medical intake
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            This form establishes a baseline medical profile and is reviewed
            during your intake call. It is not a medical consultation.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-14">
        {/* PERSONAL INFORMATION */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            Personal information
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="First name"
              className="rounded border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              placeholder="Last name"
              className="rounded border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              placeholder="Middle name (optional)"
              className="rounded border border-slate-300 px-3 py-2"
            />

            <input
              type="text"
              placeholder="Preferred name (optional)"
              className="rounded border border-slate-300 px-3 py-2"
            />

            <input
              type="date"
              className="rounded border border-slate-300 px-3 py-2 sm:col-span-2"
            />
          </div>
        </div>

        {/* MEDICAL HISTORY */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            Medical history
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Select any conditions that apply.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-slate-700">
            {[
              "Hypertension",
              "Diabetes",
              "Asthma",
              "Heart disease",
              "Seizure disorder",
              "Autoimmune condition",
              "Pregnancy (if applicable)",
            ].map((condition) => (
              <label key={condition} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  disabled={noConditions}
                  checked={conditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="mt-1"
                />
                <span>{condition}</span>
              </label>
            ))}
          </div>

          <label className="mt-4 flex items-start gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={noConditions}
              onChange={(e) => {
                setNoConditions(e.target.checked);
                if (e.target.checked) setConditions([]);
              }}
              className="mt-1"
            />
            <span>No known medical conditions</span>
          </label>
        </div>

        {/* MEDICATIONS */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            Current medications
          </h2>

          <textarea
            rows={4}
            placeholder="List current medications and doses, if known."
            className="mt-4 w-full rounded border border-slate-300 p-3"
          />
        </div>

        {/* ALLERGIES */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            Medication allergies
          </h2>

          <textarea
            rows={3}
            disabled={noAllergies}
            placeholder="List medication allergies and reactions, if known."
            className="mt-4 w-full rounded border border-slate-300 p-3 disabled:bg-slate-100"
          />

          <label className="mt-4 flex items-start gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={noAllergies}
              onChange={(e) => setNoAllergies(e.target.checked)}
              className="mt-1"
            />
            <span>No known medication allergies</span>
          </label>
        </div>

        {/* PRIMARY CARE */}
        <div>
          <h2 className="text-xl font-medium text-slate-900">
            Primary care provider (optional)
          </h2>

          <input
            type="text"
            placeholder="Primary care provider or clinic name"
            className="mt-4 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        {/* CONSENT */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" />
            <span>
              I confirm that the information provided is accurate to the
              best of my knowledge and consent to its use for MyERDoc
              clinical services.
            </span>
          </label>
        </div>

        {/* ACTION */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button
            disabled
            className="w-full max-w-sm rounded-xl bg-slate-300 px-6 py-3 text-base font-medium text-slate-600 cursor-not-allowed"
          >
            Save and continue
          </button>

          <p className="text-sm text-slate-500 text-center max-w-sm">
            Intake submission will be enabled once your account is fully
            activated.
          </p>
        </div>
      </section>
    </main>
  );
}