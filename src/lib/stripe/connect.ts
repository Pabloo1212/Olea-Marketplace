import { stripe } from './client';

// ─── Stripe Connect: Onboarding ──────────────────────────────
export async function createConnectedAccount(producerEmail: string, producerId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email: producerEmail,
    metadata: { producer_id: producerId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
  });

  return account;
}

export async function createAccountOnboardingLink(accountId: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?stripe=success`,
    type: 'account_onboarding',
  });

  return link;
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  };
}

// ─── Stripe Connect: Payments with Commission ──────────────────────────────
const PLATFORM_COMMISSION_RATE = 0.10; // 10% platform fee

export async function createPaymentIntentWithCommission({
  amount,
  connectedAccountId,
  orderId,
  customerEmail,
}: {
  amount: number; // in cents
  connectedAccountId: string;
  orderId: string;
  customerEmail: string;
}) {
  const applicationFee = Math.round(amount * PLATFORM_COMMISSION_RATE);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata: {
      order_id: orderId,
      customer_email: customerEmail,
      commission_rate: PLATFORM_COMMISSION_RATE.toString(),
    },
    receipt_email: customerEmail,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    applicationFee: applicationFee / 100,
    producerPayout: (amount - applicationFee) / 100,
  };
}

// ─── Stripe Connect: Multi-vendor Split Payments ──────────────────────────────
export async function createMultiVendorPayment({
  items,
  orderId,
  customerEmail,
}: {
  items: {
    amount: number; // in cents
    connectedAccountId: string;
    producerName: string;
  }[];
  orderId: string;
  customerEmail: string;
}) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // Create payment intent for the full amount
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'eur',
    metadata: { order_id: orderId },
    receipt_email: customerEmail,
  });

  // Create separate transfers to each producer after payment succeeds
  // This is handled in the webhook after payment confirmation
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    transfers: items.map((item) => ({
      amount: Math.round(item.amount * (1 - PLATFORM_COMMISSION_RATE)),
      destination: item.connectedAccountId,
      producer: item.producerName,
      commission: Math.round(item.amount * PLATFORM_COMMISSION_RATE) / 100,
    })),
  };
}

// ─── Stripe Connect: Transfers ──────────────────────────────
export async function createTransfer({
  amount,
  connectedAccountId,
  orderId,
}: {
  amount: number; // in cents
  connectedAccountId: string;
  orderId: string;
}) {
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'eur',
    destination: connectedAccountId,
    metadata: { order_id: orderId },
  });

  return transfer;
}

// ─── Stripe Connect: Dashboard Link ──────────────────────────────
export async function createDashboardLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

export { PLATFORM_COMMISSION_RATE };
