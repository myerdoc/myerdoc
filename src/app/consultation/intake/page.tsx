"use client";

import { useState } from "react";

const STATES = [
  "",
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
  "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
  "Maine","Maryland","Massachusetts","Michigan","Minnesota",
  "Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
  "Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming"
];

const RED_FLAGS = [
  "Chest pain or pressure",
  "Shortness of breath or difficulty breathing",
  "Signs of stroke (face droop, arm weakness, speech difficulty)",
  "Severe or uncontrolled bleeding",
  "Loss of consciousness or fainting",
  "Severe head injury or major trauma",
  "New confusion or inability to stay awake"
];

export default function ConsultationIntake() {
  const [state, setState] = useState("");
  const [ackLocation, setAckLocation] = useState(false);
  const [ackEmergency, setAckEmergency] = useState(false);
  const [ackEligibility, setAckEligibility] = useState(false);
  const [ackConsent, setAckConsent] = useState(false);
  const [redFlags, setRedFlags] = useState<string[]>([]);

  const hasRedFlags = redFlags.length > 0;

  const canContinue =
    state !== "" &&
    ackLocation &&
    ackEmergency &&
    ackEligibility &&
    ackConsent &&
    !hasRedFlags;

  const toggleRedFlag = (flag: string) => {
    setRedFlags((prev) =>
      prev.includes(flag)
        ? prev.filter((f) => f !== flag)
        : [...prev, flag]
    );
  };

  return (
    <main className="bg-white">
      {/* Header band */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">
            Consultation intake
          </h1>

          <p className="mt-4 text-slate-600">
            Before speaking with an emergency physician, we need to confirm
            a few details to ensure safety, eligibility, and appropriate care.
          </p>
        </div>
      </div>

      {/* Form content */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Reason */}
        <section>
          <h2 className="text-lg font-medium text-slate-900">
            What’s going on right now?
          </h2>

          <textarea
            rows={5}
            placeholder="Describe your symptoms or situation in your own words."
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </section>

        {/* Emergency Red Flags */}
        <section className="mt-12 rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-medium text-slate-900">
            Emergency symptoms
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            If any of the following apply, MyERDoc is not appropriate.
            Please seek emergency care immediately.
          </p>

          <div className="mt-4 space-y-3">
            {RED_FLAGS.map((flag) => (
              <label key={flag} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={redFlags.includes(flag)}
                  onChange={() => toggleRedFlag(flag)}
                  className="mt-1"
                />
                <span className="text-slate-700">{flag}</span>
              </label>
            ))}
          </div>

          {hasRedFlags && (
            <p className="mt-4 font-medium text-red-700">
              Based on your selections, please call 911 or seek emergency care immediately.
            </p>
          )}
        </section>

        {/* Location */}
        <section className="mt-12">
          <h2 className="text-lg font-medium text-slate-900">
            Location
          </h2>

          <label className="mt-3 block text-sm text-slate-700">
            What state are you currently located in?
          </label>

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "Select a state" : s}
              </option>
            ))}
          </select>

          <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={ackLocation}
              onChange={(e) => setAckLocation(e.target.checked)}
              className="mt-1"
            />
            <span>
              I confirm that I am physically located in the state selected above.
            </span>
          </label>
        </section>

        {/* Acknowledgments */}
        <section className="mt-12">
          <h2 className="text-lg font-medium text-slate-900">
            Acknowledgments
          </h2>

          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={ackEmergency}
                onChange={(e) => setAckEmergency(e.target.checked)}
                className="mt-1"
              />
              <span>
                I understand that if this is a medical emergency, I should call
                911 or seek emergency care immediately.
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={ackEligibility}
                onChange={(e) => setAckEligibility(e.target.checked)}
                className="mt-1"
              />
              <span>
                I understand that MyERDoc provides guidance and limited medical
                services and does not replace in-person medical care.
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={ackConsent}
                onChange={(e) => setAckConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                I consent to receive medical guidance from a licensed emergency
                physician and understand the limitations described above.
              </span>
            </label>
          </div>
        </section>

        {/* Action */}
        <div className="mt-14">
          <button
            disabled={!canContinue}
            onClick={() => (window.location.href = "/next-steps")}
            className={`w-full rounded-md px-6 py-3 font-medium ${
              canContinue
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            Proceed to next steps
          </button>

          {!canContinue && !hasRedFlags && (
            <p className="mt-3 text-sm text-slate-500">
              Please complete all required fields and acknowledgments to continue.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}