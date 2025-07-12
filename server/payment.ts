import { Request, Response } from "express";
import { stripe, STRIPE_ENABLED, PRICING_PLANS, createStripeCustomer, createCheckoutSession, createPortalSession } from "./stripe";
import { storage } from "./storage";

// Create checkout session
export async function createCheckout(req: Request, res: Response) {
  try {
    if (!STRIPE_ENABLED) {
      return res.status(503).json({ error: "Payment processing not configured" });
    }

    const { planId } = req.body;
    const user = (req as any).session?.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`.trim()
      );
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customer.id
      });
    }

    // Create checkout session
    const successUrl = `${req.protocol}://${req.get('host')}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.protocol}://${req.get('host')}/billing?canceled=true`;

    const session = await createCheckoutSession(
      stripeCustomerId,
      plan.stripePriceId,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        planId: plan.id
      }
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

// Create billing portal session
export async function createBillingPortal(req: Request, res: Response) {
  try {
    if (!STRIPE_ENABLED) {
      return res.status(503).json({ error: "Payment processing not configured" });
    }

    const user = (req as any).session?.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No billing information found" });
    }

    const returnUrl = `${req.protocol}://${req.get('host')}/billing`;
    const session = await createPortalSession(user.stripeCustomerId, returnUrl);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}

// Handle Stripe webhooks
export async function handleWebhook(req: Request, res: Response) {
  try {
    if (!STRIPE_ENABLED || !stripe) {
      return res.status(503).json({ error: "Payment processing not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    if (!stripe) return;
    
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    await storage.updateUserStripeInfo(userId, {
      stripeSubscriptionId: subscription.id,
      plan: planId,
      subscriptionStatus: subscription.status,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
    });

    console.log(`Subscription activated for user ${userId}, plan ${planId}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    if (!stripe) return;
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    // Find user by Stripe customer ID
    const user = await storage.getUserByStripeCustomerId(customer.id);
    if (!user) {
      console.error('User not found for customer:', customer.id);
      return;
    }

    await storage.updateUserStripeInfo(user.id, {
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
    });

    console.log(`Payment succeeded for user ${user.id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    if (!stripe) return;
    
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    const user = await storage.getUserByStripeCustomerId(customer.id);
    if (!user) {
      console.error('User not found for customer:', customer.id);
      return;
    }

    await storage.updateUserStripeInfo(user.id, {
      subscriptionStatus: 'past_due'
    });

    console.log(`Payment failed for user ${user.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    if (!stripe) return;
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    const user = await storage.getUserByStripeCustomerId(customer.id);
    if (!user) {
      console.error('User not found for customer:', customer.id);
      return;
    }

    await storage.updateUserStripeInfo(user.id, {
      subscriptionStatus: subscription.status,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
    });

    console.log(`Subscription updated for user ${user.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    if (!stripe) return;
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    const user = await storage.getUserByStripeCustomerId(customer.id);
    if (!user) {
      console.error('User not found for customer:', customer.id);
      return;
    }

    await storage.updateUserStripeInfo(user.id, {
      subscriptionStatus: 'canceled',
      subscriptionEndsAt: new Date(subscription.ended_at * 1000)
    });

    console.log(`Subscription canceled for user ${user.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}