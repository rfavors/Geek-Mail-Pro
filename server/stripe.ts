import Stripe from 'stripe';

// Allow app to run without Stripe in development
const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;

export const stripe = STRIPE_ENABLED ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
}) : null;

// Export stripe status for conditional usage
export { STRIPE_ENABLED };

// Pricing plans configuration
export const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    features: [
      'Up to 2,500 subscribers',
      '15,000 emails per month',
      'Custom domain sending',
      'Drag & drop editor',
      'Basic analytics',
      'Email support'
    ],
    limits: {
      subscribers: 2500,
      emailsPerMonth: 15000,
      domains: 1
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      'Up to 10,000 subscribers',
      '100,000 emails per month',
      'Custom domain sending',
      'Advanced automation',
      'A/B testing',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      subscribers: 10000,
      emailsPerMonth: 100000,
      domains: 3
    },
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: [
      'Unlimited subscribers',
      'Unlimited emails',
      'Dedicated IP',
      'Multi-user accounts',
      'API access',
      'White-label options',
      '24/7 phone support'
    ],
    limits: {
      subscribers: -1, // unlimited
      emailsPerMonth: -1, // unlimited
      domains: -1 // unlimited
    }
  }
};

export async function createStripeCustomer(email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.customers.create({
    email,
    name
  });
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      trial_period_days: 14,
    },
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function getCustomer(customerId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.customers.retrieve(customerId);
}