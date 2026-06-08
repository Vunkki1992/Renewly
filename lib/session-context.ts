import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export const SessionContext = createContext<Session | null>(null);
