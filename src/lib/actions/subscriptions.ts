'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSubscription(planType: 'monthly' | 'premium') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_type: planType,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      renewal_date: periodEnd.toISOString(),
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/subscriptions');
  return { data, error: null };
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) return { error: error.message };

  revalidatePath('/subscriptions');
  return { error: null };
}

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message };
  }

  return { data: data || null, error: null };
}
