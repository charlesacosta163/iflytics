// lib/supabase/webhook-client.ts
import { createClient } from '@supabase/supabase-js';

// lib/supabase/webhook-client.ts (for server-side only)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);