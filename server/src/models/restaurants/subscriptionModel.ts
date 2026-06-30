import { Schema } from "mongoose";
import { IRestaurantSubscription } from "../../interfaces/IRestaurant.js";
import { subscriptionStatuses } from "../../utils/enums/restaurantEnums.js";

/**
 * Groups all subscription/billing-related fields together.
 * Keeping this as an embedded sub-document (rather than flat fields on
 * Restaurant) makes the main schema more readable and makes it trivial
 * to e.g. populate/select only billing info when needed.
 */
export const RestaurantSubscriptionSchema = new Schema<IRestaurantSubscription>(
  {
    plan: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    status: { type: String, enum: Object.values(subscriptionStatuses), default: subscriptionStatuses.NONE },
    autoRenew: { type: Boolean, default: true },
    endDate: { type: Date, default: null },
    startDelay: { type: Number, default: 0 }, // days of delay before subscription starts

    // Sensitive Stripe identifiers: never returned by default.
    stripeCustomerId: { type: String, default: null, select: false },
    stripeSubscriptionId: { type: String, default: null, select: false },
    stripeAccountId: { type: String, default: null, select: false },
    stripeConnectEnabled: { type: Boolean, default: false },
  },
  { _id: false },
);
