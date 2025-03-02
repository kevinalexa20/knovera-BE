import dotenv from "dotenv";

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: parseInt(process.env.PORT || ""),
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_URL:
    process.env.SUPABASE_URL || "https://nyrqxuqllmmwintrblml.supabase.co",
  SUPABASE_KEY:
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cnF4dXFsbG1td2ludHJibG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4Mzg5OTcsImV4cCI6MjA0NzQxNDk5N30.-RyFjphbqUoFkv8wO_IzBFGJP9EkhRn0VFyTY79LFTM",
} as const;
