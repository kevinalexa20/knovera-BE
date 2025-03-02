import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// const supabaseUrl = process.env.SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_KEY!;

const { SUPABASE_URL, SUPABASE_KEY } = env;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
