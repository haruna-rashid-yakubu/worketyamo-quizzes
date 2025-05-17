"use server";

import { createClient } from "@/utils/supabase/server";

export async function FetchUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
