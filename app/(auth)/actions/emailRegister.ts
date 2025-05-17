"use server";

import { createClient } from "@/utils/supabase/server";

export async function emailRegister(data: {
  email: string;
  password: string;
  confirm: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
