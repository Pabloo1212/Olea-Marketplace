'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createConnectedAccount,
  createAccountOnboardingLink,
  getAccountStatus,
  createDashboardLink,
} from '@/lib/stripe/connect';

export async function onboardProducer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: producer } = await supabase
    .from('producers')
    .select('id, stripe_account_id')
    .eq('user_id', user.id)
    .single();

  if (!producer) return { error: 'Producer profile not found' };

  let accountId = producer.stripe_account_id;

  // Create connected account if doesn't exist
  if (!accountId) {
    const account = await createConnectedAccount(user.email!, producer.id);
    accountId = account.id;

    await supabase
      .from('producers')
      .update({ stripe_account_id: accountId })
      .eq('id', producer.id);
  }

  // Create onboarding link
  const link = await createAccountOnboardingLink(accountId);
  return { url: link.url, error: null };
}

export async function getProducerPaymentStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data: producer } = await supabase
    .from('producers')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .single();

  if (!producer?.stripe_account_id) {
    return { data: { connected: false, chargesEnabled: false, payoutsEnabled: false }, error: null };
  }

  const status = await getAccountStatus(producer.stripe_account_id);
  return {
    data: {
      connected: true,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
    },
    error: null,
  };
}

export async function getProducerDashboardLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: producer } = await supabase
    .from('producers')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .single();

  if (!producer?.stripe_account_id) return { error: 'No Stripe account found' };

  const url = await createDashboardLink(producer.stripe_account_id);
  return { url, error: null };
}
