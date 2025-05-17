"use server";

import { createClient } from "@/utils/supabase/server";

export async function updatePass(data: { password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
