'use server'

import { supabaseAdmin } from '@/lib/supabase/webhook-client';

// lib/hooks/useSubscription.ts
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('ifc_user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    // console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}
