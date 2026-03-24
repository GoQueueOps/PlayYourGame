import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kesxppqpriqdcgldlaxw.supabase.co";

const supabaseAnonKey =
  "sb_publishable_afPP9gXqyxWCD2Q8NKbJkA_17SBHJ_g";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);