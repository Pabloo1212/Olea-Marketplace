import { stripe } from './client';
import type { CartItem } from '@/lib/types/database';

export async function createCheckoutSession({
  items,
  customerEmail,
  orderId,
  successUrl,
  cancelUrl,
}: {
  items: CartItem[];
  customerEmail: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.product.name,
        description: `${item.product.olive_variety} – ${item.product.volume_ml}ml`,
        metadata: {
          product_id: item.product_id,
          producer_id: item.product.producer_id,
        },
      },
      unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: lineItems,
    metadata: { order_id: orderId },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 850, currency: 'eur' },
          display_name: 'Standard Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },
          display_name: 'Free Shipping (€75+)',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_method_types: ['card'],
  });

  return session;
}

export async function createSubscriptionSession({
  planType,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  planType: 'monthly' | 'premium';
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const prices: Record<string, { amount: number; name: string }> = {
    monthly: { amount: 2990, name: 'Monthly Discovery – 1 Premium EVOO' },
    premium: { amount: 4990, name: 'Premium Collection – 2 Premium EVOOs' },
  };

  const plan = prices[planType];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: plan.name },
          unit_amount: plan.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: { plan_type: planType },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
