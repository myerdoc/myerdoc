"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RequestPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("intake_requests").insert({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || null,
      concern: formData.get("interest") as string,
    });

    if (error) {
      console.error("Error submitting request:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-2xl font-medium text-slate-900">
            Request received
          </h1>

          <p className="mt-4 text-slate-600">
            Thank you for your interest in MyERDoc. A physician will review
            your request to determine whether this service is an appropriate
            fit for you.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            MyERDoc does not provide emergency care. If you are experiencing
            a medical emergency, please call 911.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      {/* Header band */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">
            Considering MyERDoc?
          </h1>

          <p className="mt-4 text-slate-600">
            MyERDoc is a physician-led service designed to help people
            better understand when emergency-level medical care may or
            may not be necessary.
          </p>

          <p className="mt-3 text-slate-600">
            Use this form to request a review of whether MyERDoc is an
            appropriate service for you. This does not initiate medical
            care or a physician consultation.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            required
            placeholder="Your name"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />

          <input
            name="phone"
            placeholder="Phone number (optional)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />

          <div>
            <label className="block text-sm font-medium text-slate-900">
              What prompted your interest in MyERDoc?
            </label>

            <textarea
              name="interest"
              required
              rows={4}
              placeholder="For example: wanting clearer guidance around emergency care decisions, supporting a family member, or learning whether this service fits your needs."
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <p className="text-sm text-slate-500">
            This form is for service evaluation only and does not initiate
            medical care. If you believe you are experiencing a medical
            emergency, call 911 or seek emergency care immediately.
          </p>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Request review"}
          </button>
        </form>
      </div>
    </main>
  );
}