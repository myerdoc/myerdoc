"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BaselineIntakeForm from "@/components/intake/BaselineIntakeForm";

export default function IntakeFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) return null;

  return <BaselineIntakeForm />;
}