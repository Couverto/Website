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
   * Retrieve a Stripe customer
   */
  retrieveCustomer: async (customerId: string) => {
    return await stripe.customers.retrieve(customerId);
  },

  /**
   * Create a Stripe Checkout Session for subscription
   */
  /**
   * Create a Stripe Checkout Session for subscription
   */
  createCheckoutSession: async (
    customerData: { id?: string; email?: string },
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>,
    options?: { trialPeriodDays?: number; discounts?: { coupon: string }[] },
  ) => {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
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
    };

    if (customerData.id) {
      sessionConfig.customer = customerData.id;
    } else if (customerData.email) {
      sessionConfig.customer_email = customerData.email;
    }

    // Add discounts if provided
    if (options?.discounts) {
      sessionConfig.discounts = options.discounts;
    }

    // Add trial period if specified (for referred restaurants)
    if (options?.trialPeriodDays && options.trialPeriodDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: options.trialPeriodDays,
      };
    }

    return await stripe.checkout.sessions.create(sessionConfig);
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
   * Create a discount coupon for referrer (permanent cumulative discount)
   */
  createReferralCoupon: async (discountPercentage: number = 10, restaurantId: string) => {
    // Create a unique coupon for this restaurant's total discount
    return await stripe.coupons.create({
      percent_off: Math.min(discountPercentage, 100), // Cap at 100%
      duration: "forever", // Permanent discount
      name: `Parrainage - ${discountPercentage}% de réduction`,
      id: `referral_${restaurantId}_${Date.now()}`, // Unique ID
    });
  },

  /**
   * Apply a coupon to a customer's subscription using discounts
   */
  applyCouponToSubscription: async (subscriptionId: string, couponId: string) => {
    return await stripe.subscriptions.update(subscriptionId, {
      discounts: [{ coupon: couponId }],
    });
  },

  /**
   * Apply a discount to customer for their next invoice
   */
  applyDiscountToCustomer: async (customerId: string, couponId: string) => {
    // Create a promotion code from the coupon and apply it
    return await stripe.customers.update(customerId, {
      // Use invoice_settings for next invoice discount
    } as any);
  },

  /**
   * Apply/update cumulative discount for referrer
   * This calculates the total discount based on number of referrals and applies a permanent coupon
   */
  applyCumulativeReferralDiscount: async (customerId: string, totalDiscountPercentage: number, restaurantId: string) => {
    // Get the customer's active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      console.log(`[Stripe] No active subscription found for customer ${customerId}`);
      return null;
    }

    const subscription = subscriptions.data[0];

    // Cap at 100%
    const cappedDiscount = Math.min(totalDiscountPercentage, 100);

    // Create a new coupon with the cumulative discount (permanent)
    const coupon = await stripe.coupons.create({
      percent_off: cappedDiscount,
      duration: "forever",
      name: `Parrainage cumulé - ${cappedDiscount}% de réduction`,
    });

    // Apply the new coupon (replaces any existing discount)
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      discounts: [{ coupon: coupon.id }],
    });

    console.log(`[Stripe] Applied cumulative ${cappedDiscount}% discount to subscription ${subscription.id}`);

    return updatedSubscription;
  },

  /**
   * Apply discount directly to next upcoming invoice
   */
  applyDiscountToNextInvoice: async (customerId: string, couponId: string) => {
    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const subscriptionId = subscriptions.data[0].id;
      return await stripe.subscriptions.update(subscriptionId, {
        discounts: [{ coupon: couponId }],
      });
    }
    return null;
  },

  /**
   * Create a SetupIntent for securing a Bank Imprint.
   */
  createSetupIntent: async (customerId: string, metadata?: Record<string, string>) => {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata,
    });
  },

  /**
   * Create a PaymentIntent (to capture an imprint later)
   */
  createPaymentIntent: async (amount: number, customerId: string, paymentMethodId: string, metadata?: Record<string, string>) => {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency: "eur",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata,
    });
  },

  /**
   * Capture a SetupIntent by creating a PaymentIntent
   */
  captureSetupIntent: async (
    setupIntentId: string,
    amount: number,
    customerId: string,
    connectedAccountId: string,
    metadata?: Record<string, string>
  ) => {
    // First, retrieve the setupIntent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    if (!setupIntent.payment_method) {
      throw new Error("Aucun moyen de paiement lié à cette empreinte.");
    }
    const paymentMethodId = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method.id;

    // Create and confirm a PaymentIntent using the saved payment method
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "eur",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata,
    });
  },

  /**
   * Cancel a SetupIntent (release the imprint)
   */
  cancelSetupIntent: async (setupIntentId: string) => {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    if (setupIntent.status === "requires_payment_method" || setupIntent.status === "requires_confirmation") {
      return await stripe.setupIntents.cancel(setupIntentId);
    }
    return setupIntent; // Already succeeded or cancelled
  },

  /**
   * Construct webhook event
   */
  constructEvent: (payload: string | Buffer, sig: string, webhookSecret: string) => {
    return stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  },

  /**
   * Create a Stripe Connect Express account for a restaurant
   */
  createConnectAccount: async (email: string) => {
    return await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "company",
    });
  },

  /**
   * Retrieve a Connect Account
   */
  retrieveAccount: async (accountId: string) => {
    return await stripe.accounts.retrieve(accountId);
  },

  /**
   * Create an Account Link for onboarding a Connect account
   */
  createAccountLink: async (accountId: string, refreshUrl: string, returnUrl: string) => {
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
  },

  /**
   * Transfer funds to a Connected account
   */
  createTransfer: async (amount: number, destinationAccountId: string, metadata?: Record<string, string>) => {
    return await stripe.transfers.create({
      amount: Math.round(amount * 100), // in cents
      currency: "eur",
      destination: destinationAccountId,
      metadata,
    });
  },
};
