import { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    export interface Request {
      user?: User; // Extends Express.Request with user property
    }
  }
}

export {}; // Fix: Cannot redeclare block-scoped variable 'Request'.
