"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  // ✅ THIS IS THE MISSING PIECE
  redirect("/membership/intake");
}