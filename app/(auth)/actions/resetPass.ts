"use server";

import { createClient } from "@/utils/supabase/server";

export async function resetPass(data: { email: string }) {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${baseUrl}/reset`,
  });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
