import { Schema, model } from "mongoose";

const PendingTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["RESTAURANT_CREATION"], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    stripeSessionId: { type: String },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours TTL
  },
  { timestamps: true },
);

// Add TTL index
PendingTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingTransaction = model("PendingTransaction", PendingTransactionSchema);
