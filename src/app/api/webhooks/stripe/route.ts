import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        // Update order status to paid
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_session_id: session.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }

      // Handle subscription
      if (session.mode === 'subscription') {
        const planType = session.metadata?.plan_type;
        if (planType && session.customer_email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.customer_email)
            .single();

          if (profile) {
            await supabase.from('subscriptions').insert({
              user_id: profile.id,
              plan_type: planType,
              status: 'active',
              stripe_subscription_id: session.subscription as string,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              renewal_date: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            });
          }
        }
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(
              (invoice.period_start ?? 0) * 1000
            ).toISOString(),
            current_period_end: new Date(
              (invoice.period_end ?? 0) * 1000
            ).toISOString(),
            renewal_date: new Date(
              (invoice.period_end ?? 0) * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
