"use server";

import { createClient } from "@/utils/supabase/server";

export async function emailLogin(data: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
