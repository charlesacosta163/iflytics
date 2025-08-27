'use server'

import { supabaseAdmin } from '@/lib/supabase/webhook-client';

// lib/hooks/useSubscription.ts
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('ifc_user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false }); // Get newest first

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // If multiple subscriptions, prioritize lifetime over premium
  const lifetimeSub = data.find(sub => sub.plan === 'lifetime');
  if (lifetimeSub) {
    return lifetimeSub;
  }

  // Otherwise return the most recent premium subscription
  return data[0];
}
