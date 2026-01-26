import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any, // Using a recent stable version
});

export const stripeService = {
  /**
   * Create a Stripe customer
   */
  createCustomer: async (email: string, name: string) => {
    return await stripe.customers.create({
      email,
      name,
    });
  },

  /**
   * Create a Stripe Checkout Session for subscription
   */
  createCheckoutSession: async (
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>,
  ) => {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
  },

  /**
   * Retrieve a checkout session
   */
  retrieveSession: async (sessionId: string) => {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  /**
   * Retrieve a subscription
   */
  retrieveSubscription: async (subscriptionId: string) => {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },

  /**
   * Cancel a subscription
   */
  cancelSubscription: async (subscriptionId: string) => {
    return await stripe.subscriptions.cancel(subscriptionId);
  },

  /**
   * Update a subscription (e.g., cancel at period end)
   */
  updateSubscription: async (subscriptionId: string, params: { cancel_at_period_end?: boolean }) => {
    return await stripe.subscriptions.update(subscriptionId, params);
  },

  /**
   * Update a subscription item (e.g., change price/plan)
   */
  updateSubscriptionItem: async (subscriptionItemId: string, newPriceId: string) => {
    return await stripe.subscriptionItems.update(subscriptionItemId, {
      price: newPriceId,
    });
  },

  /**
   * Construct webhook event
   */
  constructEvent: (payload: string | Buffer, sig: string, webhookSecret: string) => {
    return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  },
};
