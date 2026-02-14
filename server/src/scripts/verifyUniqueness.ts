import mongoose from "mongoose";
import { Restaurant } from "../models/restaurantModel.js";
import dotenv from "dotenv";

dotenv.config();

const verifyUniqueness = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // 1. Create a dummy restaurant to establish a baseline (if not exists)
    const testPhone = "0123456789";
    const testEmail = "unique_test@test.com";

    // Cleanup if exists
    await Restaurant.deleteMany({ email: testEmail });

    console.log("Creating first restaurant...");
    try {
      await Restaurant.create({
        name: "Resto Uniq 1",
        slug: "resto-uniq-1",
        adress: "123 Rue Unique",
        city: "Paris",
        phone: testPhone,
        email: testEmail,
        collaborators: [],
        zones: [], // required by schema defaults? no, default is []
      });
      console.log("✅ First restaurant created.");
    } catch (e: any) {
      console.error("❌ Failed to create first restaurant:", e.message);
      process.exit(1);
    }

    // 2. Try to create another restaurant with SAME PHONE
    console.log("Attempting to create duplicate PHONE...");
    try {
      await Restaurant.create({
        name: "Resto Uniq 2",
        slug: "resto-uniq-2",
        adress: "456 Rue Different", // Unique address
        city: "Paris",
        phone: testPhone, // DUPLICATE
        email: "other@test.com",
        collaborators: [],
      });
      console.error("❌ Error: Duplicate phone was ALLOWED! (Should verify `unique: true` in schema)");
    } catch (e: any) {
      if (e.code === 11000 && e.keyPattern?.phone) {
        console.log("✅ Duplicate phone correctly blocked (Mongo 11000).");
      } else {
        console.error("❌ Unexpected error for duplicate phone:", e);
      }
    }

    // 3. Try to create another restaurant with SAME EMAIL
    console.log("Attempting to create duplicate EMAIL...");
    try {
      await Restaurant.create({
        name: "Resto Uniq 3",
        slug: "resto-uniq-3",
        adress: "789 Rue Different",
        city: "Paris",
        phone: "0987654321",
        email: testEmail, // DUPLICATE
        collaborators: [],
      });
      console.error("❌ Error: Duplicate email was ALLOWED!");
    } catch (e: any) {
      if (e.code === 11000 && e.keyPattern?.email) {
        console.log("✅ Duplicate email correctly blocked (Mongo 11000).");
      } else {
        console.error("❌ Unexpected error for duplicate email:", e);
      }
    }

    // Cleanup
    await Restaurant.deleteMany({ email: testEmail });
    console.log("Cleanup done.");
  } catch (err) {
    console.error("Script error:", err);
  } finally {
    await mongoose.disconnect();
  }
};

verifyUniqueness();
