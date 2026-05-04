import { Request, Response } from "express";
import crypto from "crypto";
import { Restaurant } from "../models/restaurantModel.js";
import { Booking } from "../models/bookingModel.js";
import { User } from "../models/userModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { restaurantRoles } from "../utils/enums/restaurantRoles.js";
import { bookingStatus } from "../utils/enums/bookingStatus.js";
import { getPaginationParams } from "../utils/pagination.js";
import { sendEmail } from "../utils/sendEmail.js";
import { collaboratorEmailTemplate } from "../templates/collaboratorEmail.js";
import { deleteFile } from "../utils/fileUploadUtils.js";
import { Plan } from "../models/planModel.js";
import { stripeService } from "../services/stripeService.js";
import { PendingTransaction } from "../models/pendingTransactionModel.js";
import { ReferralCode } from "../models/referralCodeModel.js";
import { Feature } from "../models/featureModel.js";
import { VerificationCode } from "../models/verificationCodeModel.js";
import { isRestaurantOpen, convertOpeningHoursToObject, getServicePeriod } from "../utils/restaurantUtils.js";
import { formatBookingTime } from "../utils/dateFormatter.js";
import { Review } from "../models/reviewModel.js";

/**
 * @function getRestaurants
 * @description Retrieves all restaurants with pagination and search.
 */
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  const { page, size } = getPaginationParams(req);
  const search = (req.query.search as string) || "";

  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const restaurants = await Restaurant.find(query)
      .populate("collaborators", "name forename email avatar")
      .populate("plan", "name price")
      .populate("referralCodeUsed", "code type discountPercentage")
      .select("-menu -zones -exceptionalClosures -exceptionalOpenings -apiKey -stripeAccountId -stripeConnectEnabled -collaboratorRoles")
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const count = await Restaurant.countDocuments(query);

    res.status(200).json({ restaurants, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function createRestaurant
 * @description Creates a new restaurant.
 */
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, address, city, phone, website, planId, referralCode: referralCodeInput, ...otherFields } = req.body;
    const collaborators = [];

    console.log(`[createRestaurant] Starting creation for: ${name}, slug: ${slug}, planId: ${planId}`);

    const creator = await User.findById(req.userId);
    if (!creator) {
      console.log(`[createRestaurant] User not found: ${req.userId}`);
      res.status(400).json({ error: "Utilisateur introuvable" });
      return;
    }

    collaborators.push(creator._id);

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      console.log(`[createRestaurant] Slug already exists: ${slug}`);
      res.status(409).json({ error: "Ce slug est déjà utilisé" });
      return;
    }

    // Check for existing phone
    const existingPhoneConflict = await Restaurant.findOne({
      phone: phone,
      collaborators: { $ne: creator._id },
    });

    if (existingPhoneConflict) {
      console.log(`[createRestaurant] Phone conflict: ${phone} used by restaurant ${existingPhoneConflict._id}`);
      res.status(409).json({ error: "Ce numéro de téléphone est déjà associé à un autre restaurant dont vous n'êtes pas propriétaire" });
      return;
    }

    // Check for existing address
    const existingAddressConflict = await Restaurant.findOne({
      adress: address,
      collaborators: { $ne: creator._id },
    });

    if (existingAddressConflict) {
      console.log(`[createRestaurant] Address conflict: ${address} used by restaurant ${existingAddressConflict._id}`);
      res.status(409).json({ error: "Cette adresse est déjà associée à un autre restaurant dont vous n'êtes pas propriétaire" });
      return;
    }

    const emailToCheck = otherFields.email || creator.email;

    // Check email uniqueness
    const existingConflict = await Restaurant.findOne({
      email: emailToCheck,
      collaborators: { $ne: creator._id },
    });

    if (existingConflict) {
      console.log(
        `[createRestaurant] Email conflict: ${emailToCheck} used by restaurant ${existingConflict._id} where user ${creator._id} is not collaborator`,
      );
      res.status(409).json({ error: "Cette adresse email est déjà associée à un autre restaurant dont vous n'êtes pas propriétaire" });
      return;
    }

    console.log(`[createRestaurant] Validation passed. Checking referral code: ${referralCodeInput}`);

    // Email Verification Logic
    const restaurantEmail = otherFields.email || creator.email;
    let isVerified = false;
    let verificationToken = undefined;
    let verificationTokenExpire = undefined;

    if (restaurantEmail === creator.email) {
      isVerified = true;
    } else {
      // Generate verification token
      const rawToken = crypto.randomBytes(20).toString("hex");
      verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Send verification email
      try {
        const clientUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
        const verifyUrl = `${clientUrl}/verify-restaurant-email/${rawToken}`;
        // Import dynamically to avoid issues
        const { verifyRestaurantEmailTemplate } = await import("../templates/verifyRestaurantEmailTemplate.js");
        const htmlContent = verifyRestaurantEmailTemplate({ url: verifyUrl, restaurantName: name });

        await sendEmail({
          email: restaurantEmail,
          subject: "Vérification de l'email de votre restaurant - Couverto",
          message: htmlContent,
        });
        console.log(`[createRestaurant] Verification email sent to ${restaurantEmail}`);
      } catch (emailErr) {
        console.error("Failed to send restaurant verification email", emailErr);
      }
    }

    // Create collaboratorRoles Map with creator as admin
    const collaboratorRoles = new Map<string, string>();
    collaboratorRoles.set(creator._id.toString(), restaurantRoles.ADMIN);

    // Set subscription end date if plan is provided (initial set to none/pending_payment)
    const subscriptionEndDate = null;

    // Validate referral code if provided
    let referrerRestaurant: any = null;
    let validReferralCode: any = null;
    let subscriptionStartDelay = 0;

    if (referralCodeInput) {
      validReferralCode = await ReferralCode.findOne({
        code: referralCodeInput.toUpperCase().trim(),
        isActive: true,
      }).populate("restaurantId");

      if (!validReferralCode) {
        console.log(`[createRestaurant] Invalid referral code: ${referralCodeInput}`);
        res.status(400).json({ error: "Code de parrainage invalide ou inactif" });
        return;
      }

      if (validReferralCode.type === "sponsor") {
        console.log(`[createRestaurant] Sponsor code validated: ${validReferralCode.code}`);
      } else {
        // restaurantId is already populated, so it's the full restaurant object
        referrerRestaurant = validReferralCode.restaurantId as any;
        if (!referrerRestaurant || !referrerRestaurant._id) {
          console.log(`[createRestaurant] Referrer restaurant not found for code: ${validReferralCode.code}`);
          res.status(400).json({ error: "Le restaurant parrain n'existe plus" });
          return;
        }

        console.log(`[createRestaurant] Referral validated - referrer: ${referrerRestaurant.name} (${referrerRestaurant._id})`);

        // Set 30 days delay for referred restaurants
        subscriptionStartDelay = 30;
      }
    }

    // SPONSOR CODE: Grant full access immediately OR Apply Discount
    if (validReferralCode?.type === "sponsor") {
      // Check limits
      if (validReferralCode.maxUsages > 0 && validReferralCode.usageCount >= validReferralCode.maxUsages) {
        console.log(`[createRestaurant] Sponsor code limit reached: ${validReferralCode.code}`);
        res.status(400).json({ error: "Ce code sponsor a atteint sa limite d'utilisation" });
        return;
      }

      // 100% Discount logic (Free Forever)
      if (validReferralCode.discountPercentage === 100) {
        console.log(`[createRestaurant] Applying 100% sponsor discount`);
        const allFeatures = await Feature.find({}, "_id");
        const featureIds = allFeatures.map((f) => f._id); // Grant all features

        const restaurant = new Restaurant({
          name,
          slug,
          adress: address,
          city,
          phone,
          email: otherFields.email || creator.email,
          website,
          collaborators,
          collaboratorRoles,
          plan: planId || null, // Save the selected plan (sponsor overrides the price, but keeps the plan)
          subscriptionStatus: "active", // Active immediately
          autoRenew: true,
          subscriptionEndDate: null, // Forever
          isClosed: true,
          features: featureIds,
          referredBy: null,
          referralCodeUsed: validReferralCode._id,
          subscriptionStartDelay: 0,
          isVerified,
          verificationToken,
          verificationTokenExpire,
          ...otherFields,
        });

        await restaurant.save();
        console.log(`[createRestaurant] 100% Sponsor Restaurant saved: ${restaurant._id}`);

        // Increment usage count
        await ReferralCode.findByIdAndUpdate(validReferralCode._id, { $inc: { usageCount: 1 } });

        // Generate referral code for the new restaurant
        const newReferralCode = await (ReferralCode as any).generateUniqueCode();
        const referralCodeDoc = new ReferralCode({
          code: newReferralCode,
          restaurantId: restaurant._id,
          isActive: true,
          discountPercentage: 10,
        });
        await referralCodeDoc.save();
        restaurant.referralCode = referralCodeDoc._id;
        await restaurant.save();

        createLog({
          message: `Restaurant '${name}' created via Sponsor Code '${validReferralCode.code}' (100% Free)`,
          userId: req.userId,
          level: logLevels.INFO,
        });

        res.status(201).json({ restaurant, message: "Restaurant créé avec succès (Offre Sponsor 100%)" });
        return;
      }

      // We need a planId for partial discounts to know the base price
      if (!planId) {
        res.status(400).json({ error: "Un plan est requis pour ce code sponsor (réduction partielle)." });
        return;
      }

      // Fallthrough to standard Stripe flow below, but inject the discount
      console.log(`[createRestaurant] Partial sponsor discount - Proceeding to Stripe flow`);
    }

    // Check if plan exists and handle Stripe/Free flow
    if (planId) {
      console.log(`[createRestaurant] Checking plan: ${planId}`);
      const plan = await Plan.findById(planId);
      if (!plan) {
        console.log(`[createRestaurant] Plan not found: ${planId}`);
        res.status(404).json({ error: "Plan introuvable" });
        return;
      }

      // If PAID plan: Handle Deferral flow
      if (plan.price > 0) {
        console.log(`[createRestaurant] Paid plan (${plan.price}€) - Initiating Stripe flow`);
        if (!plan.stripePriceId) {
          console.log(`[createRestaurant] Plan ${plan.name} missing stripePriceId`);
          res.status(400).json({
            error: "Ce plan n'est pas encore configuré pour le paiement Stripe. Veuillez contacter un administrateur.",
          });
          return;
        }

        // Check for duplicates in main collection before redirecting
        const slugExists = await Restaurant.findOne({ slug });
        if (slugExists) {
          res.status(409).json({ error: "Ce slug est déjà utilisé" });
          return;
        }

        // 1. DO NOT Create Stripe Customer yet (avoid ghosts if cancelled)
        // const customer = await stripeService.createCustomer(creator.email, creator.name || creator.forename || creator.username);

        // Store the payload in a PendingTransaction instead of creating the Restaurant
        console.log(`[createRestaurant] Creating PendingTransaction`);
        const pendingTransaction = new PendingTransaction({
          userId: req.userId,
          type: "RESTAURANT_CREATION",
          payload: {
            name,
            slug,
            adress: address,
            city,
            phone,
            email: otherFields.email || creator.email,
            isClosed: true,
            website,
            collaborators,
            collaboratorRoles: Object.fromEntries(collaboratorRoles), // Maps need to be objects in Mixed fields
            plan: planId,
            // stripeCustomerId: customer.id, // Removed: will be created by Session
            referredBy: referrerRestaurant?._id || null,
            subscriptionStartDelay,
            referralCodeUsed: validReferralCode?._id || null,
            isVerified,
            verificationToken,
            verificationTokenExpire,
            ...otherFields,
          },
        });

        await pendingTransaction.save();
        console.log(`[createRestaurant] PendingTransaction created: ${pendingTransaction._id}`);

        await pendingTransaction.save();

        // Prepare Checkout Options
        const checkoutOptions: any = {
          transactionId: pendingTransaction._id.toString(),
          planId: planId.toString(),
          referrerId: referrerRestaurant?._id?.toString() || "",
        };

        // Handle Trial (Referral Standard)
        if (subscriptionStartDelay > 0) {
          checkoutOptions.trialPeriodDays = subscriptionStartDelay;
        }

        // Handle Coupon (Sponsor Partial Discount)
        if (
          validReferralCode?.type === "sponsor" &&
          validReferralCode.discountPercentage > 0 &&
          validReferralCode.discountPercentage < 100
        ) {
          // Create a unique coupon for this transaction (or reuse if we had a robust system, but creates are cheap)
          // We use the createReferralCoupon utility but repurposed for sponsor
          const coupon = await stripeService.createReferralCoupon(
            validReferralCode.discountPercentage,
            "SPONSOR_" + validReferralCode.code,
          );
          checkoutOptions.discounts = [{ coupon: coupon.id }];
        }

        // Create Checkout Session
        // Metadata: Stripe only accepts strings. We pass minimal info since we have the transaction ID.
        const stripeMetadata = {
          transactionId: pendingTransaction._id.toString(),
          restaurantName: name,
          email: creator.email,
          planId: planId.toString(),
          referrerId: referrerRestaurant?._id?.toString() || "",
        };

        console.log(`[createRestaurant] Creating Stripe checkout session with metadata:`, stripeMetadata);

        // Create Stripe Customer first to avoid "Accounts V2" error (requires customer ID in test mode)
        const stripeCustomer = await stripeService.createCustomer(creator.email, creator.fullname);

        const stripeSession = await stripeService.createCheckoutSession(
          { id: stripeCustomer.id },
          plan.stripePriceId,
          `${process.env.CORS_ORIGIN}/account/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          `${process.env.CORS_ORIGIN}/account/payment-cancel`,
          stripeMetadata,
          checkoutOptions,
        );

        console.log(`[createRestaurant] Stripe session created: ${stripeSession.id}`);

        // Apply cumulative discount to referrer if applicable
        if (referrerRestaurant && validReferralCode) {
          try {
            if (referrerRestaurant.stripeCustomerId) {
              // Count current referrals + 1 for the new one being created
              const currentReferrals = await Restaurant.countDocuments({ referredBy: referrerRestaurant._id });
              const totalReferrals = currentReferrals + 1;
              const discountPerReferral = validReferralCode.discountPercentage || 10;
              const totalDiscount = Math.min(totalReferrals * discountPerReferral, 100);

              // Apply cumulative permanent discount
              await stripeService.applyCumulativeReferralDiscount(
                referrerRestaurant.stripeCustomerId,
                totalDiscount,
                referrerRestaurant._id.toString(),
              );

              createLog({
                message: `Cumulative referral discount updated for '${referrerRestaurant.name}' (${totalDiscount}% off - ${totalReferrals} referrals)`,
                userId: req.userId,
                level: logLevels.INFO,
              });
            }
          } catch (discountError) {
            console.error("Failed to apply referrer discount:", discountError);
            // Don't fail the restaurant creation if discount fails
          }
        }

        // Update transaction with session ID for tracking
        pendingTransaction.stripeSessionId = stripeSession.id;
        await pendingTransaction.save();

        createLog({
          message: `Restaurant creation initiated (pending payment) for '${name}'${subscriptionStartDelay > 0 ? ` with ${subscriptionStartDelay} days trial` : ""}`,
          userId: req.userId,
          level: logLevels.INFO,
        });

        res.status(201).json({ url: stripeSession.url, message: "Redirection vers le paiement Stripe" });
        return;
      }

      // If FREE plan: Activate immediately
      console.log(`[createRestaurant] Free plan selected - Creating restaurant immediately`);
      const restaurant = new Restaurant({
        name,
        slug,
        adress: address,
        city,
        phone,
        email: otherFields.email || creator.email,
        website,
        collaborators,
        collaboratorRoles,
        plan: planId,
        subscriptionStatus: "active",
        autoRenew: true,
        subscriptionEndDate: null, // No end date for free plans usually, or set a trial period
        isClosed: true,
        referredBy: referrerRestaurant?._id || null,
        subscriptionStartDelay,
        isVerified,
        verificationToken,
        verificationTokenExpire,
        ...otherFields,
      });

      await restaurant.save();
      console.log(`[createRestaurant] Restaurant saved: ${restaurant._id}`);

      // Handle referral linking after successful creation
      if (referrerRestaurant && validReferralCode) {
        // Add new restaurant to referrer's referrals list
        await Restaurant.findByIdAndUpdate(referrerRestaurant._id, {
          $push: { referrals: restaurant._id },
        });
      }

      // Generate referral code for the new restaurant
      const newReferralCode = await (ReferralCode as any).generateUniqueCode();
      const referralCodeDoc = new ReferralCode({
        code: newReferralCode,
        restaurantId: restaurant._id,
        isActive: true,
        discountPercentage: 10,
      });
      await referralCodeDoc.save();
      restaurant.referralCode = referralCodeDoc._id;
      await restaurant.save();

      createLog({
        message: `Restaurant '${name}' created (Free plan activated)${referrerRestaurant ? ` - Referred by ${referrerRestaurant.name}` : ""}`,
        userId: req.userId,
        level: logLevels.INFO,
      });

      res.status(201).json({ restaurant, message: "Restaurant créé avec succès (Offre Gratuite)" });
      return;
    }

    // Default Fallback (No planId provided)
    console.log(`[createRestaurant] No plan selected - Creating restaurant (inactive subscription)`);
    const restaurant = new Restaurant({
      name,
      slug,
      adress: address,
      city,
      phone,
      website,
      collaborators,
      collaboratorRoles,
      plan: null,
      subscriptionStatus: "none",
      autoRenew: true,
      subscriptionEndDate,
      isClosed: true,
      referredBy: referrerRestaurant?._id || null,
      subscriptionStartDelay,
      isVerified,
      verificationToken,
      verificationTokenExpire,
      ...otherFields,
    });

    await restaurant.save();
    console.log(`[createRestaurant] Restaurant saved: ${restaurant._id}`);

    // Handle referral linking after successful creation
    if (referrerRestaurant && validReferralCode) {
      await Restaurant.findByIdAndUpdate(referrerRestaurant._id, {
        $push: { referrals: restaurant._id },
      });
    }

    // Generate referral code for the new restaurant
    const newRefCode = await (ReferralCode as any).generateUniqueCode();
    const refCodeDoc = new ReferralCode({
      code: newRefCode,
      restaurantId: restaurant._id,
      isActive: true,
      discountPercentage: 10,
    });
    await refCodeDoc.save();
    restaurant.referralCode = refCodeDoc._id;
    await restaurant.save();

    createLog({
      message: `Restaurant '${name}' created successfully (without plan)${referrerRestaurant ? ` - Referred by ${referrerRestaurant.name}` : ""}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({ restaurant, message: "Restaurant créé avec succès" });
  } catch (err: any) {
    // Handle duplicate key errors with user-friendly messages
    if (err.code === 11000) {
      if (err.keyPattern?.adress) {
        res.status(409).json({ error: "Cette adresse est déjà utilisée par un autre restaurant" });
        return;
      }
      if (err.keyPattern?.slug) {
        res.status(409).json({ error: "Ce slug est déjà utilisé" });
        return;
      }
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateRestaurant
 * @description Updates a restaurant by ID.
 */
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const currentRestaurant = await Restaurant.findById(id);

    if (!currentRestaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Compute available pages to check features globally
    const availablePages = new Set<string>();

    const planPopulated = await Restaurant.findById(id).populate({
      path: "plan",
      populate: { path: "features" },
    });

    if (planPopulated?.plan && (planPopulated.plan as any).features) {
      (planPopulated.plan as any).features.forEach((f: any) => {
        if (f.active && f.associatedPages && Array.isArray(f.associatedPages)) {
          f.associatedPages.forEach((p: string) => availablePages.add(p));
        }
      });
    }
    if (planPopulated?.features && planPopulated.features.length > 0) {
      const { Feature } = await import("../models/featureModel.js");
      const extraFeatures = await Feature.find({ name: { $in: planPopulated.features }, active: true });
      extraFeatures.forEach((f) => {
        if (f.associatedPages && Array.isArray(f.associatedPages)) {
          f.associatedPages.forEach((p: string) => availablePages.add(p));
        }
      });
    }

    const hasTablePlanFeature = availablePages.has("tablePlan");
    const hasBankImprintFeature = availablePages.has("bankImprint");

    // Security Gate: Check if user attempts to enable Bank Imprint without the feature or stripe verification
    if (req.body.isBankImprintEnabled !== undefined && req.body.isBankImprintEnabled !== currentRestaurant.isBankImprintEnabled) {
      if (req.body.isBankImprintEnabled === true) {
        if (!hasBankImprintFeature) {
          res.status(403).json({ error: "Votre plan actuel ne permet pas d'activer l'empreinte bancaire." });
          return;
        }
        if (!currentRestaurant.stripeConnectEnabled) {
          res
            .status(403)
            .json({ error: "Vous devez finaliser la vérification de votre compte Stripe avant d'activer l'empreinte bancaire." });
          return;
        }
      }
    }

    // Prevent removing required fields if the restaurant is currently OPEN
    if (!currentRestaurant.isClosed) {
      const missingFields = [];
      const newName = req.body.name !== undefined ? req.body.name : currentRestaurant.name;
      const newAdress = req.body.adress !== undefined ? req.body.adress : currentRestaurant.adress;
      const newPhone = req.body.phone !== undefined ? req.body.phone : currentRestaurant.phone;
      const newCoverImage = req.body.coverImage !== undefined ? req.body.coverImage : currentRestaurant.coverImage;
      const newImages = req.body.images !== undefined ? req.body.images : currentRestaurant.images;
      const newMenu = req.body.menu !== undefined ? req.body.menu : currentRestaurant.menu;

      if (!newName) missingFields.push("Nom");
      if (!newAdress) missingFields.push("Adresse");
      if (!newPhone) missingFields.push("Téléphone");
      if (!newCoverImage) missingFields.push("Image de couverture");
      if (!newImages || (Array.isArray(newImages) && newImages.length === 0)) missingFields.push("Galerie photos");
      if (!newMenu || (Array.isArray(newMenu) && newMenu.length === 0)) missingFields.push("Menu");

      if (missingFields.length > 0) {
        // If they uploaded a NEW cover image but the overall update is rejected (e.g. because they also deleted the name),
        // we should ideally clean up the newly uploaded files. The frontend might re-upload them or abandon them.
        // But the main issue here is preventing DELETION of the CURRENT files.
        res.status(400).json({
          error: `Impossible de retirer ces informations car le restaurant est ouvert. Fermez-le d'abord. (Manquant : ${missingFields.join(", ")})`,
        });
        return;
      }

      if (hasTablePlanFeature) {
        // If they are specifically updating zones or tablePlan
        if (req.body.zones !== undefined || req.body.tablePlan !== undefined) {
          const newZones = req.body.zones !== undefined ? req.body.zones : currentRestaurant.zones;
          const newLegacyTablePlan = req.body.tablePlan !== undefined ? req.body.tablePlan : currentRestaurant.tablePlan;

          const hasTablesInZones = newZones && newZones.some((z: any) => z.tables && z.tables.length > 0);
          const hasLegacyTables = newLegacyTablePlan && newLegacyTablePlan.length > 0;

          if (!hasTablesInZones && !hasLegacyTables) {
            res.status(400).json({
              error: "Impossible de supprimer toutes les tables car le restaurant est ouvert. Fermez-le d'abord.",
            });
            return;
          }
        }
      } else {
        // Feature disabled, relies on capacity
        if (req.body.capacity !== undefined) {
          const newCapacity = req.body.capacity;
          if (!newCapacity || newCapacity <= 0) {
            res.status(400).json({
              error: "Impossible de définir une capacité nulle car le restaurant est ouvert. Fermez-le d'abord.",
            });
            return;
          }
        }
      }
    }

    // Handle Cover Image: Delete old if changed
    if (req.body.coverImage !== undefined && req.body.coverImage !== currentRestaurant.coverImage) {
      if (currentRestaurant.coverImage) {
        await deleteFile(currentRestaurant.coverImage);
      }
    }

    // Handle Arrays (Images, Menu)
    const processImageArray = async (field: "images" | "menu") => {
      if (req.body[field]) {
        const newImages: string[] = req.body[field];
        const oldImages: string[] = (currentRestaurant[field] as string[]) || [];

        if (field === "images" && newImages.length > 8) {
          // CLEANUP ON ERROR: Delete the newly added images since we reject them
          const newlyAdded = newImages.filter((img) => !oldImages.includes(img));
          await Promise.all(newlyAdded.map((img) => deleteFile(img)));

          throw new Error("La galerie ne peut contenir que 8 images maximum");
        }

        if (field === "menu" && newImages.length > 8) {
          // CLEANUP ON ERROR
          const newlyAdded = newImages.filter((img) => !oldImages.includes(img));
          await Promise.all(newlyAdded.map((img) => deleteFile(img)));

          throw new Error("Le menu ne peut contenir que 8 pages maximum");
        }

        // Identify deleted images (in old but not in new list)
        const deletedImages = oldImages.filter((img) => !newImages.includes(img));

        console.log(`[processImageArray] Field: ${field}`, {
          newCount: newImages.length,
          oldCount: oldImages.length,
          deletedCount: deletedImages.length,
          deletedImages,
        });

        await Promise.all(deletedImages.map((img) => deleteFile(img)));
      }
    };

    await processImageArray("images");
    await processImageArray("menu");

    // Recalculate capacity if zones are provided
    if (req.body.zones && Array.isArray(req.body.zones)) {
      const totalCapacity = req.body.zones.reduce((acc: number, zone: any) => {
        const zoneTables = zone.tables || [];
        return acc + zoneTables.reduce((tAcc: number, table: any) => {
          if (table.status === "reserved") return tAcc;
          return tAcc + (table.seats || 0);
        }, 0);
      }, 0);
      req.body.capacity = totalCapacity;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Check availability of new phone if changed
    if (req.body.phone && req.body.phone !== restaurant.phone) {
      const existingPhoneConflict = await Restaurant.findOne({
        phone: req.body.phone,
        collaborators: { $ne: req.userId },
      });
      if (existingPhoneConflict) {
        res.status(409).json({ error: "Ce numéro de téléphone est déjà associé à un autre restaurant dont vous n'êtes pas propriétaire" });
        return;
      }
    }

    // Check availability of new address if changed
    if (req.body.adress && req.body.adress !== restaurant.adress) {
      const existingAddressConflict = await Restaurant.findOne({
        adress: req.body.adress,
        collaborators: { $ne: req.userId },
      });
      if (existingAddressConflict) {
        res.status(409).json({ error: "Cette adresse est déjà associée à un autre restaurant dont vous n'êtes pas propriétaire" });
        return;
      }
    }

    // Handle Email Update with Verification
    if (req.body.email && req.body.email !== restaurant.email) {
      const newEmail = req.body.email;

      const existingConflict = await Restaurant.findOne({
        email: newEmail,
        collaborators: { $ne: req.userId },
      });

      if (existingConflict) {
        res.status(409).json({ error: "Cette adresse email est déjà utilisée par un autre restaurant dont vous n'êtes pas propriétaire" });
        return;
      }

      // Generate verification token
      const rawToken = crypto.randomBytes(20).toString("hex");
      const verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update with tempEmail and token
      restaurant.tempEmail = newEmail;
      restaurant.verificationToken = verificationToken;
      restaurant.verificationTokenExpire = verificationTokenExpire;

      // Send verification email
      try {
        const clientUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
        const verifyUrl = `${clientUrl}/verify-restaurant-email/${rawToken}`;
        // Import dynamically
        const { verifyRestaurantEmailTemplate } = await import("../templates/verifyRestaurantEmailTemplate.js");
        const htmlContent = verifyRestaurantEmailTemplate({ url: verifyUrl, restaurantName: restaurant.name });

        await sendEmail({
          email: newEmail,
          subject: "Vérification de votre nouvelle adresse email - Couverto",
          message: htmlContent,
        });
      } catch (emailErr) {
        console.error("Failed to send update verification email", emailErr);
      }

      // Remove email from body to prevent immediate update
      delete req.body.email;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...req.body,
        // Explicitly start persisting the tempEmail/token changes if we made them above
        ...(restaurant.tempEmail && {
          tempEmail: restaurant.tempEmail,
          verificationToken: restaurant.verificationToken,
          verificationTokenExpire: restaurant.verificationTokenExpire,
        }),
        ...(req.body.address && { adress: req.body.address }), // Handle address mapping
      },
      { new: true },
    );

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' updated successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "Restaurant mis à jour avec succès" });
  } catch (err: any) {
    if (err.message === "La galerie ne peut contenir que 8 images maximum") {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err.message === "Le menu ne peut contenir que 8 pages maximum") {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteRestaurant
 * @description Deletes a restaurant by ID.
 */
export const deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // PROTECTION BYPASS for Global Admins
    const user = await User.findById(req.userId);
    const isGlobalAdmin = user?.role === userRoles.ADMIN;

    if (!isGlobalAdmin) {
      // Protection: If last admin but others still exist, block deletion
      // Count admins from collaboratorRoles Map
      let adminCount = 0;
      restaurant.collaboratorRoles.forEach((role) => {
        if (role === restaurantRoles.ADMIN) adminCount++;
      });

      if (adminCount <= 1 && restaurant.collaborators.length > 1) {
        res.status(400).json({
          error: "Vous ne pouvez pas supprimer le restaurant alors qu'il reste d'autres collaborateurs. Retirez-les d'abord.",
        });
        return;
      }
    }

    // Cancel Stripe subscription before deleting
    if (restaurant.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(restaurant.stripeSubscriptionId);
        console.log(`[Stripe] Subscription ${restaurant.stripeSubscriptionId} cancelled during restaurant deletion`);
      } catch (stripeError: any) {
        console.error(`[Stripe] Failed to cancel sub ${restaurant.stripeSubscriptionId}:`, stripeError.message);
      }
    }

    await Restaurant.findByIdAndDelete(id);

    // cleanup all files for this restaurant
    // Since we use shared folders, we must delete files individually
    if (restaurant.coverImage) {
      await deleteFile(restaurant.coverImage);
    }
    if (restaurant.images && restaurant.images.length > 0) {
      await Promise.all(restaurant.images.map((img) => deleteFile(img)));
    }
    if (restaurant.menu && restaurant.menu.length > 0) {
      await Promise.all(restaurant.menu.map((img) => deleteFile(img)));
    }

    // Cleanup referral data
    try {
      // 1. Delete the restaurant's own referral code
      if (restaurant.referralCode) {
        await ReferralCode.findByIdAndDelete(restaurant.referralCode);
        console.log(`[Delete] Deleted referral code for restaurant ${restaurant.name}`);
      }

      // 2. Clear referredBy reference is handled by step 3 below
      // (No usageCount to update anymore)

      // 3. Clear referredBy references in any restaurants that might reference this one
      // (this is a safety measure in case data is inconsistent)
      await Restaurant.updateMany({ referredBy: restaurant._id }, { $unset: { referredBy: 1 } });
    } catch (refError) {
      console.error("[Delete] Error cleaning up referral data:", refError);
    }

    createLog({
      message: `Restaurant '${restaurant.name}' deleted successfully`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Restaurant supprimé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function toggleRestaurantClosed
 * @description Toggles the closed status of a restaurant.
 */
export const toggleRestaurantClosed = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findById(id).populate({
      path: "plan",
      populate: {
        path: "features",
      },
    });
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Verify user is a collaborator
    if (!restaurant.collaborators.some((c) => c.toString() === req.userId?.toString())) {
      res.status(403).json({ error: "server.global.errors.forbidden" });
      return;
    }

    // Check if Stripe is configured
    const stripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET;

    // Prevent reopening if no active plan (only when Stripe is configured)
    // Sponsor restaurants (100% discount) have plan: null but subscriptionStatus: "active"
    if (stripeConfigured && restaurant.isClosed && !restaurant.plan && restaurant.subscriptionStatus !== "active") {
      res.status(400).json({
        error: "Vous devez souscrire à un abonnement pour ouvrir votre restaurant.",
        requiresPlan: true,
      });
      return;
    }

    // If we are trying to OPEN the restaurant, check for required fields
    if (restaurant.isClosed) {
      const missingFields = [];
      if (!restaurant.name) missingFields.push("Nom");
      if (!restaurant.adress) missingFields.push("Adresse");
      if (!restaurant.phone) missingFields.push("Téléphone");
      if (!restaurant.coverImage) missingFields.push("Image de couverture");
      if (!restaurant.images || restaurant.images.length === 0) missingFields.push("Galerie photos (au moins 1)");

      // Check menu (either text or file based, assuming array)
      if (!restaurant.menu || restaurant.menu.length === 0) missingFields.push("Menu (au moins 1 page)");

      if (missingFields.length > 0) {
        res.status(400).json({
          error: `Impossible d'ouvrir le restaurant. Informations manquantes : ${missingFields.join(", ")}`,
        });
        return;
      }

      // Compute available pages
      const availablePages = new Set<string>();

      if (restaurant.plan && (restaurant.plan as any).features) {
        (restaurant.plan as any).features.forEach((f: any) => {
          if (f.active && f.associatedPages && Array.isArray(f.associatedPages)) {
            f.associatedPages.forEach((p: string) => availablePages.add(p));
          }
        });
      }

      if (restaurant.features && restaurant.features.length > 0) {
        const { Feature } = await import("../models/featureModel.js");
        const extraFeatures = await Feature.find({ name: { $in: restaurant.features }, active: true });
        extraFeatures.forEach((f) => {
          if (f.associatedPages && Array.isArray(f.associatedPages)) {
            f.associatedPages.forEach((p: string) => availablePages.add(p));
          }
        });
      }

      const hasTablePlanFeature = availablePages.has("tablePlan");

      if (hasTablePlanFeature) {
        // Check for table plan in zones (preferred) or legacy tablePlan
        const hasTablesInZones = restaurant.zones && restaurant.zones.some((z) => z.tables && z.tables.length > 0);
        const hasLegacyTables = restaurant.tablePlan && restaurant.tablePlan.length > 0;

        if (!hasTablesInZones && !hasLegacyTables) {
          res.status(400).json({
            error: "Impossible d'ouvrir le restaurant. Vous devez d'abord configurer votre plan de salle avec au moins une table.",
          });
          return;
        }
      } else {
        if (!restaurant.capacity || restaurant.capacity <= 0) {
          res.status(400).json({
            error: "Impossible d'ouvrir le restaurant. Vous devez d'abord définir la capacité de votre restaurant dans les Paramètres.",
          });
          return;
        }
      }
    }

    restaurant.isClosed = !restaurant.isClosed;
    // Note: Closing the restaurant does NOT cancel the subscription
    // The subscription remains active and the user can reopen at any time

    await restaurant.save();

    createLog({
      message: `Restaurant '${restaurant.name}' ${restaurant.isClosed ? "closed" : "reopened"}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      restaurant,
      message: restaurant.isClosed ? "server.restaurants.messages.closed" : "server.restaurants.messages.reopened",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Helper functions removed and moved to restaurantUtils.ts

/**
 * @function verifyRestaurantEmail
 * @description Verifies a restaurant's email address using a token.
 */
export const verifyRestaurantEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const verificationTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const restaurant = await Restaurant.findOne({
      verificationToken: verificationTokenHash,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!restaurant) {
      res.status(400).json({ error: "Jeton de vérification invalide ou expiré" });
      return;
    }

    if (restaurant.tempEmail) {
      restaurant.email = restaurant.tempEmail;
      restaurant.tempEmail = undefined;
    }

    restaurant.isVerified = true;
    restaurant.verificationToken = undefined;
    restaurant.verificationTokenExpire = undefined;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Email du restaurant vérifié avec succès !",
      data: { restaurantId: restaurant._id, name: restaurant.name },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getPublicRestaurants
 * @description Retrieves public restaurants with search and filters.
 */
export const getPublicRestaurants = async (req: Request, res: Response): Promise<void> => {
  const { page, size } = getPaginationParams(req, 12);
  const search = (req.query.search as string) || "";
  const city = (req.query.city as string) || "";
  const adress = (req.query.adress as string) || "";
  const priceRange = (req.query.priceRange as string) || "";
  const cuisineType = (req.query.cuisineType as string) || "";
  const date = (req.query.date as string) || "";
  const guests = parseInt(req.query.guests as string) || 0;

  try {
    const conditions: any[] = [{ isClosed: false }];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { adress: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (city) {
      conditions.push({
        $or: [{ city: { $regex: city, $options: "i" } }, { adress: { $regex: city, $options: "i" } }],
      });
    }

    if (adress) {
      conditions.push({
        $or: [{ city: { $regex: adress, $options: "i" } }, { adress: { $regex: adress, $options: "i" } }],
      });
    }

    if (priceRange) {
      conditions.push({ priceRange });
    }
    if (cuisineType) {
      conditions.push({ cuisineType: { $regex: cuisineType, $options: "i" } });
    }
    if (guests > 0) {
      conditions.push({ capacity: { $gte: guests } });
    }
    if (date) {
      const queryDate = new Date(date);
      if (!isNaN(queryDate.getTime())) {
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = dayNames[queryDate.getDay()];

        // Ensure the restaurant is open on this specific day
        const dayCondition: any = {};
        dayCondition[`openingHours.${dayName}.isClosed`] = { $ne: true };
        dayCondition[`openingHours.${dayName}.periods.0`] = { $exists: true };
        conditions.push(dayCondition);
      }
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const restaurants = await Restaurant.find(query)
      .select("-collaborators -createdAt -updatedAt") // Exclude internal/private fields
      .sort({ rating: -1, name: 1 }) // Sort by rating desc
      .skip(page * size)
      .limit(size);

    const count = await Restaurant.countDocuments(query);

    // Compute average ratings from reviews for all restaurants
    const restaurantIds = restaurants.map((r) => r._id);
    const ratingsAgg = await Review.aggregate([
      { $match: { restaurant: { $in: restaurantIds } } },
      { $group: { _id: "$restaurant", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
    ]);

    // Create a map for quick lookup
    const ratingsMap = new Map(ratingsAgg.map((r) => [r._id.toString(), { avgRating: r.avgRating, reviewCount: r.reviewCount }]));

    // Calculate isOpenNow and rating for each restaurant
    const restaurantsWithStatus = restaurants.map((r) => {
      const restaurantObj = r.toObject();
      const ratingData = ratingsMap.get(r._id.toString());
      const openingHoursObj = convertOpeningHoursToObject(r.openingHours);
      const openNow = isRestaurantOpen(r.openingHours);

      // Determine if it opens later today
      let opensLaterToday = false;
      if (!openNow) {
        const now = new Date();
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const todayName = dayNames[now.getDay()];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todaySchedule = openingHoursObj[todayName];

        if (todaySchedule && !todaySchedule.isClosed && todaySchedule.periods?.length > 0) {
          opensLaterToday = todaySchedule.periods.some((p: { open: string; close: string }) => {
            const [h, m] = p.open.split(":").map(Number);
            return h * 60 + m > currentMinutes;
          });
        }
      }

      return {
        ...restaurantObj,
        openingHours: openingHoursObj,
        isOpenNow: openNow,
        rating: ratingData ? parseFloat(ratingData.avgRating.toFixed(1)) : 0,
        reviewCount: ratingData?.reviewCount || 0,
        _openPriority: openNow ? 0 : opensLaterToday ? 1 : 2,
      };
    });

    // Sort: open → opens later today → closed today, then by rating desc
    restaurantsWithStatus.sort((a, b) => {
      if (a._openPriority !== b._openPriority) return a._openPriority - b._openPriority;
      return (b.rating || 0) - (a.rating || 0);
    });

    // Remove internal sort field before sending
    const result = restaurantsWithStatus.map(({ _openPriority, ...rest }) => rest);

    res.status(200).json({ restaurants: result, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantSlots = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { date, guests } = req.query;
  const guestsNum = parseInt(guests as string) || 0;
  
  console.log(`Checking slots for restaurant ${id}, date ${date}, guests ${guestsNum}`);

  if (!date) {
    res.status(400).json({ error: "Date parameter is required" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const queryDate = new Date(date as string);

    // Helper to get YYYY-MM-DD in a specific timezone (defaults to Europe/Paris)
    const toDateString = (d: Date) => {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    };

    const qStr = toDateString(queryDate);
    // console.log(`[getRestaurantSlots] Query date: ${date} -> qStr: ${qStr}`);

    // 1. Check for exceptional openings FIRST (they override everything)
    let exceptionalOpeningSchedule: any = null;
    if (restaurant.exceptionalOpenings && restaurant.exceptionalOpenings.length > 0) {
      const matchingOpening = restaurant.exceptionalOpenings.find((opening: any) => {
        const sStr = toDateString(new Date(opening.startDate));
        const eStr = toDateString(new Date(opening.endDate));
        return qStr >= sStr && qStr <= eStr;
      });
      if (matchingOpening && matchingOpening.periods && matchingOpening.periods.length > 0) {
        // console.log(`[getRestaurantSlots] Found matching exceptional opening for ${qStr}`);
        exceptionalOpeningSchedule = { isClosed: false, periods: matchingOpening.periods };
      }
    }

    // 2. Check for exceptional closures (if full day is closed)
    let isFullDayClosed = false;
    if (restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0) {
      isFullDayClosed = restaurant.exceptionalClosures.some((closure: any) => {
        const start = new Date(closure.startDate);
        const end = new Date(closure.endDate);
        const sStr = toDateString(start);
        const eStr = toDateString(end);
        
        // Check if closure covers the WHOLE day (at least from 00:00 to 23:59)
        const isFullDay = sStr === qStr && eStr === qStr && 
                         start.getUTCHours() === 0 && start.getUTCMinutes() === 0 &&
                         end.getUTCHours() >= 23 && end.getUTCMinutes() >= 59;
        return isFullDay;
      });
    }

    // A full day closure only blocks slots IF there is no exceptional opening overriding it
    if (isFullDayClosed && !exceptionalOpeningSchedule) {
      // console.log(`[getRestaurantSlots] Day ${qStr} is fully closed and has no exceptional opening override.`);
      res.status(200).json({ slots: [] });
      return;
    }

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[queryDate.getDay()];

    // Check if openingHours exists and is not empty
    if (
      !restaurant.openingHours ||
      (restaurant.openingHours instanceof Map ? restaurant.openingHours.size === 0 : Object.keys(restaurant.openingHours).length === 0)
    ) {
      // Even without openingHours, an exceptional opening can provide slots
      if (!exceptionalOpeningSchedule) {
        res.status(200).json({ slots: [] });
        return;
      }
    }

    // Access the day schedule (handle Mongoose Map)
    let daySchedule: any =
      restaurant.openingHours instanceof Map ? restaurant.openingHours.get(dayName) : (restaurant.openingHours as any)?.[dayName];

    // Combine normal periods with exceptional opening periods
    let combinedPeriods = [...(daySchedule?.periods || [])];
    if (exceptionalOpeningSchedule) {
      combinedPeriods = [...combinedPeriods, ...exceptionalOpeningSchedule.periods];
    }

    if (combinedPeriods.length === 0) {
      res.status(200).json({ slots: [] });
      return;
    }

    // Update daySchedule to use the combined periods
    daySchedule = { 
      isClosed: false, 
      periods: combinedPeriods.sort((a: any, b: any) => a.open.localeCompare(b.open)) 
    };

    // Prepare for capacity check
    const capacity = restaurant.capacity || 0;
    const baseDateStr = toDateString(queryDate); // YYYY-MM-DD in local time

    // Fetch all confirmed/pending bookings for this day (full day range to cover overlaps)
    // We cover from 00:00 to 23:59 of the requested date, plus potential overlaps from previous day?
    // For simplicity, let's look at the day matching the query date.
    const startOfDay = new Date(baseDateStr + "T00:00:00.000Z");
    const endOfDay = new Date(baseDateStr + "T23:59:59.999Z");
    
    // Expand range by 2 hours each side to capture cross-day overlaps
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const queryStart = new Date(startOfDay.getTime() - twoHoursMs);
    const queryEnd = new Date(endOfDay.getTime() + twoHoursMs);

    const existingBookings = await Booking.find({
      restaurant: id,
      bookingDate: { $gte: queryStart, $lte: queryEnd },
      status: { $ne: bookingStatus.CANCELLED },
    });

    const allSlots = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    });

    const validSlots = allSlots.filter((slot) => {
      const [slotHour, slotMinute] = slot.split(":").map(Number);
      const slotTime = slotHour * 60 + slotMinute;

      // 1. Check opening hours
      const isOpenInOpeningHours = daySchedule.periods.some((period: any) => {
        const [openHour, openMinute] = period.open.split(":").map(Number);
        const [closeHour, closeMinute] = period.close.split(":").map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        if (closeTime > openTime) {
          return slotTime >= openTime && slotTime <= closeTime;
        } else {
          // Crossing midnight: e.g. 19:00 - 02:00
          return slotTime >= openTime || slotTime <= closeTime;
        }
      });

      if (!isOpenInOpeningHours) return false;

      // 2. Check exceptional closures for this specific slot
      if (restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0) {
        // Construct slot date to compare with closure ranges
        // baseDateStr is YYYY-MM-DD
        const slotDate = new Date(baseDateStr + "T00:00:00.000Z");
        slotDate.setUTCHours(slotHour, slotMinute, 0, 0);
        const slotTimeMs = slotDate.getTime();

        const isExceptionallyClosedSlot = restaurant.exceptionalClosures.some((closure: any) => {
          const start = new Date(closure.startDate).getTime();
          const end = new Date(closure.endDate).getTime();
          return slotTimeMs >= start && slotTimeMs <= end;
        });

        if (isExceptionallyClosedSlot) return false;
      }

      return true;
    });

    // Check availability for each valid slot
    const slotsWithAvailability = validSlots.map((slot) => {
      // If capacity is 0 or less (no tables/manual set to 0), no availability
      if (capacity <= 0) return { time: slot, available: 0 };
      
      // 1. Identify which service period this slot belongs to
      const currentService = getServicePeriod(slot, daySchedule.periods);
      if (!currentService) return { time: slot, available: 0 };

      // Construct service window timestamps (for closure checks)
      const serviceStart = new Date(baseDateStr + "T00:00:00.000Z");
      const [sh, sm] = currentService.open.split(":").map(Number);
      serviceStart.setUTCHours(sh, sm, 0, 0);
      
      const serviceEnd = new Date(baseDateStr + "T23:59:59.999Z");
      const [eh, em] = currentService.close.split(":").map(Number);
      serviceEnd.setUTCHours(eh, em, 59, 999);
      
      // Handle midnight crossing
      if (currentService.close < currentService.open) {
        serviceEnd.setUTCDate(serviceEnd.getUTCDate() + 1);
      }

      const sStartMs = serviceStart.getTime();
      const sEndMs = serviceEnd.getTime();

      // 2. Identify occupied tables for THIS specific service
      const occupiedTableIds = new Set<string>();
      const unassignedGuestsInService = existingBookings.reduce((acc, b) => {
        const bTime = formatBookingTime(b.bookingDate);
        
        // Does this booking belong to the SAME service as the current slot?
        const bService = getServicePeriod(bTime, daySchedule.periods);
        if (bService && bService.open === currentService.open && bService.close === currentService.close) {
          if (b.tableId) {
            occupiedTableIds.add(String(b.tableId));
          } else {
            return acc + (b.guests || 0);
          }
        }
        return acc;
      }, 0);

      if (restaurant.zones && restaurant.zones.length > 0) {
        // Collect all tables
        const allTables: any[] = [];
        restaurant.zones.forEach((zone: any) => {
          zone.tables?.forEach((table: any) => {
            allTables.push({
              id: table.id,
              seats: table.seats,
              status: table.status,
            });
          });
        });

        // 3. Identify blocked tables for THIS specific service (legacy or closures)
        const blockedTableIds = new Set<string>();
        restaurant.zones.forEach((zone: any) => {
          zone.tables?.forEach((table: any) => {
            if (table.status === "reserved") blockedTableIds.add(String(table.id));
          });
        });

        restaurant.tableClosures?.forEach((closure: any) => {
          const cStart = new Date(closure.startDate).getTime();
          const cEnd = new Date(closure.endDate).getTime();
          // Closure overlaps with THIS service window
          if (sStartMs < cEnd && sEndMs > cStart) {
            blockedTableIds.add(String(closure.tableId));
          }
        });

        const usableTables = allTables.filter((t) => !blockedTableIds.has(String(t.id)));
        const totalUsableCapacity = usableTables.reduce((acc, t) => acc + (t.seats || 0), 0);

        const availableTables = usableTables.filter(
          (t) => !occupiedTableIds.has(String(t.id)),
        );

        if (availableTables.length === 0) {
          return { time: slot, available: 0 };
        }

        // If guests parameter provided, check if at least one table fits
        if (guestsNum > 0) {
          const hasFittingTable = availableTables.some((t) => t.seats >= guestsNum);
          if (!hasFittingTable) {
            return { time: slot, available: 0 };
          }
        }

        const maxFittingGuests = availableTables.reduce((max, t) => Math.max(max, t.seats), 0);
        const totalAvailableSeatsPerService = availableTables.reduce((acc, t) => acc + (t.seats || 0), 0);
        const remainingCapacity = Math.max(0, totalAvailableSeatsPerService - unassignedGuestsInService);

        return {
          time: slot,
          available: Math.min(remainingCapacity, maxFittingGuests),
        };
      }

      return {
        time: slot,
        available: Math.max(0, capacity - unassignedGuestsInService),
      };
    });

    // Filter out full slots if desired, or let frontend handle it
    // User wants "max guests" to be dynamic. We keep slots even if low availability?
    // Usually if available <= 0, we shouldn't offer it.
    const finalSlots = slotsWithAvailability.filter((s) => s.available > 0).map((s) => s.time);

    // Also return the map of availability so frontend can use it
    res.status(200).json({
      slots: finalSlots,
      availability: slotsWithAvailability.reduce((acc: any, curr) => {
        acc[curr.time] = curr.available;
        return acc;
      }, {}),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getPublicRestaurantById
 * @description Retrieves a single public restaurant by ID.
 */
export const getPublicRestaurantById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).select("-collaborators -createdAt -updatedAt"); // Exclude internal/private fields

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const restaurantWithStatus = {
      ...restaurant.toObject(),
      openingHours: convertOpeningHoursToObject(restaurant.openingHours),
      isOpenNow: isRestaurantOpen(restaurant.openingHours),
    };

    res.status(200).json({ restaurant: restaurantWithStatus });
  } catch (err: any) {
    console.error(`[getPublicRestaurantById] Error:`, err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getMyRestaurants
 * @description Retrieves restaurants where the user is a collaborator.
 */
export const getMyRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurants = await Restaurant.find({ collaborators: req.userId })
      .select("-collaborators -createdAt -updatedAt")
      .sort({ name: 1 });

    const restaurantsWithStatus = restaurants.map((r) => {
      return {
        ...r.toObject(),
        isOpenNow: isRestaurantOpen(r.openingHours),
      };
    });

    res.status(200).json({ restaurants: restaurantsWithStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantById
 * @description Retrieves a restaurant by ID for collaborators.
 */
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Restaurant is already attached by verifyCollaborator middleware
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("collaborators", "name forename email avatar")
      .populate({
        path: "plan",
        populate: {
          path: "features",
        },
      });

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // NON-BLOCKING CLEANUP: Sync Stripe Connect Status if it's marked as incomplete
    if (restaurant.stripeAccountId && !restaurant.stripeConnectEnabled) {
      stripeService.retrieveAccount(restaurant.stripeAccountId).then((stripeAccount) => {
        if (stripeAccount.charges_enabled && stripeAccount.details_submitted) {
          Restaurant.findById(restaurant._id).then(freshResto => {
            if (freshResto) {
              freshResto.stripeConnectEnabled = true;
              freshResto.save().then(() => {
                console.log(`[getRestaurantById] Synced Connect Account for ${restaurant.name} - now fully onboarded`);
              }).catch(console.error);
            }
          });
        }
      }).catch(err => {
        console.error("[getRestaurantById] Error fetching stripe connect account for sync", err);
      });
    }

    // NON-BLOCKING CLEANUP: Remove expired exceptional closures & openings
    if ((restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0) || (restaurant.exceptionalOpenings && restaurant.exceptionalOpenings.length > 0)) {
      Promise.resolve().then(async () => {
        const todayStr = new Date().toISOString().split("T")[0];
        let needsSave = false;

        // Cleanup closures
        if (restaurant.exceptionalClosures && restaurant.exceptionalClosures.length > 0) {
          const initialCount = restaurant.exceptionalClosures.length;
          const activeClosures = restaurant.exceptionalClosures.filter((closure: any) => {
            const endStr = new Date(closure.endDate).toISOString().split("T")[0];
            return endStr >= todayStr;
          });
          if (activeClosures.length !== initialCount) {
            needsSave = true;
          }
        }

        // Cleanup openings
        if (restaurant.exceptionalOpenings && restaurant.exceptionalOpenings.length > 0) {
          const initialOpeningsCount = restaurant.exceptionalOpenings.length;
          const activeOpenings = restaurant.exceptionalOpenings.filter((opening: any) => {
            const endStr = new Date(opening.endDate).toISOString().split("T")[0];
            return endStr >= todayStr;
          });
          if (activeOpenings.length !== initialOpeningsCount) {
            needsSave = true;
          }
        }

        if (needsSave) {
          const freshResto = await Restaurant.findById(restaurant._id);
          if (freshResto) {
            const activeClosures = freshResto.exceptionalClosures.filter((closure: any) => {
              const endStr = new Date(closure.endDate).toISOString().split("T")[0];
              return endStr >= todayStr;
            });
            const activeOpenings = freshResto.exceptionalOpenings.filter((opening: any) => {
              const endStr = new Date(opening.endDate).toISOString().split("T")[0];
              return endStr >= todayStr;
            });
            freshResto.exceptionalClosures = activeClosures;
            freshResto.exceptionalOpenings = activeOpenings;
            await freshResto.save();
            console.log(`[Cleanup] Cleaned expired closures/openings for ${restaurant.name}`);
          }
        }
      }).catch(console.error);
    }

    // Get the requesting user's role for this restaurant
    const userRole = (req as any).restaurantRole || restaurant?.collaboratorRoles.get(req.userId!.toString()) || restaurantRoles.EMPLOYEE;

    // Compute available pages based on active features
    const availablePages = new Set<string>();

    if (restaurant.plan && (restaurant.plan as any).features) {
      (restaurant.plan as any).features.forEach((f: any) => {
        if (f.active && f.associatedPages && Array.isArray(f.associatedPages)) {
          f.associatedPages.forEach((p: string) => availablePages.add(p));
        }
      });
    }

    if (restaurant.features && restaurant.features.length > 0) {
      const { Feature } = await import("../models/featureModel.js");
      // restaurant.features contains strings like "Terrasse", "Wifi"
      const extraFeatures = await Feature.find({ name: { $in: restaurant.features }, active: true });
      extraFeatures.forEach((f) => {
        if (f.associatedPages && Array.isArray(f.associatedPages)) {
          f.associatedPages.forEach((p: string) => availablePages.add(p));
        }
      });
    }

    res.status(200).json({ restaurant, userRole, availablePages: Array.from(availablePages) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getRestaurantStats
 * @description Retrieves statistics for a restaurant dashboard.
 */
export const getRestaurantStats = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { date } = req.query; // Optional date for the dashboard agenda
  const { Booking } = await import("../models/bookingModel.js");
  const { bookingStatus } = await import("../utils/enums/bookingStatus.js");
  const { Restaurant } = await import("../models/restaurantModel.js");

  try {
    const referenceDate = date ? new Date(date as string) : new Date();
    
    // YYYY-MM-DD normalization
    const refStr = referenceDate.toISOString().split("T")[0];
    const startOfToday = new Date(refStr + "T00:00:00.000Z");
    const endOfToday = new Date(refStr + "T23:59:59.999Z");

    const isToday = refStr === new Date().toISOString().split("T")[0];
    const now = isToday ? new Date() : startOfToday;

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setUTCDate(startOfToday.getUTCDate() - startOfToday.getUTCDay());
    const startOfMonth = new Date(startOfToday.getUTCFullYear(), startOfToday.getUTCMonth(), 1);

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setUTCDate(startOfToday.getUTCDate() - 7);

    // Execute all independent database queries concurrently
    const [
      todayBookings,
      todayGuestsAgg,
      weekBookings,
      monthBookings,
      rawUpcomingBookings,
      restaurantDoc,
      rawRecentBookings,
      rawActiveBookings,
      dailyStats,
      hourlyStats,
      statusBreakdown,
      uniqueClients,
      guestDistributionAgg,
      totalBookingsAllTime,
      cancelledBookingsAllTime,
      averageGuestsResult,
      leadTimeResult,
      busyDays,
      rawDayBookings
    ] = await Promise.all([
      Booking.countDocuments({ restaurant: id, bookingDate: { $gte: startOfToday, $lt: endOfToday }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] } }),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), bookingDate: { $gte: startOfToday, $lt: endOfToday }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] } } }, { $group: { _id: null, total: { $sum: "$guests" } } }]),
      Booking.countDocuments({ restaurant: id, bookingDate: { $gte: startOfWeek }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] } }),
      Booking.countDocuments({ restaurant: id, bookingDate: { $gte: startOfMonth }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] } }),
      Booking.find({ restaurant: id, bookingDate: { $gte: now }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] }, isDismissedByRestaurant: { $ne: true } }).sort({ bookingDate: 1 }).populate("user", "name forename avatar"),
      Restaurant.findById(id).select("zones"),
      Booking.find({ restaurant: id, isDismissedByRestaurant: { $ne: true } }).sort({ createdAt: -1 }).limit(10).populate("user", "name forename avatar"),
      Booking.find({ restaurant: id, bookingDate: { $gte: twoHoursAgo, $lte: twoHoursFromNow }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] }, isDismissedByRestaurant: { $ne: true } }).populate("user", "name forename avatar"),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), bookingDate: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), bookingDate: { $gte: startOfToday, $lt: endOfToday } } }, { $group: { _id: { $hour: "$bookingDate" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id) } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.distinct("customer.phone", { restaurant: id }),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id) } }, { $project: { range: { $switch: { branches: [{ case: { $lte: ["$guests", 2] }, then: "1-2" }, { case: { $lte: ["$guests", 4] }, then: "3-4" }, { case: { $lte: ["$guests", 6] }, then: "5-6" }], default: "7+" } } } }, { $group: { _id: "$range", count: { $sum: 1 } } }]),
      Booking.countDocuments({ restaurant: id, status: { $ne: bookingStatus.DRAFT } }),
      Booking.countDocuments({ restaurant: id, status: bookingStatus.CANCELLED }),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } }, { $group: { _id: null, avg: { $avg: "$guests" } } }]),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } }, { $project: { leadTime: { $subtract: ["$bookingDate", "$createdAt"] } } }, { $group: { _id: null, avgLeadTime: { $avg: "$leadTime" } } }]),
      Booking.aggregate([{ $match: { restaurant: new (await import("mongoose")).Types.ObjectId(id), status: bookingStatus.CONFIRMED } }, { $group: { _id: { $dayOfWeek: "$bookingDate" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Booking.find({ restaurant: id, bookingDate: { $gte: startOfToday, $lt: endOfToday }, status: { $in: [bookingStatus.PENDING, bookingStatus.CONFIRMED] } }).sort({ bookingDate: 1 }).populate("user", "name forename avatar")
    ]);

    const resolveTableInfo = (b: any) => {
      const bObj = b.toObject();
      if (bObj.tableId && restaurantDoc?.zones) {
        for (const zone of restaurantDoc.zones) {
          const table = zone.tables.find((t: any) => t.id === bObj.tableId);
          if (table) {
            (bObj as any).tableLabel = table.label;
            (bObj as any).zoneName = zone.name;
            break;
          }
        }
      }
      return bObj;
    };

    const dayBookings = rawDayBookings.map(resolveTableInfo);
    const recentBookings = rawRecentBookings.map(resolveTableInfo);
    const upcomingBookings = rawUpcomingBookings.map(resolveTableInfo);
    const activeBookings = rawActiveBookings.map(resolveTableInfo);
    
    const todayGuests = todayGuestsAgg;
    const guestDistribution = guestDistributionAgg.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {});
    const cancellationRate = totalBookingsAllTime > 0 ? (cancelledBookingsAllTime / totalBookingsAllTime) * 100 : 0;
    const averageGuests = averageGuestsResult[0]?.avg || 0;
    const averageLeadTime = leadTimeResult[0]?.avgLeadTime ? leadTimeResult[0].avgLeadTime / (1000 * 60 * 60 * 24) : 0;

    res.status(200).json({
      stats: {
        today: {
          bookings: todayBookings,
          guests: todayGuests[0]?.total || 0,
        },
        week: { bookings: weekBookings },
        month: { bookings: monthBookings },
        totalClients: uniqueClients.length,
        dailyStats: dailyStats.map((d) => ({ date: d._id, count: d.count })),
        hourlyStats: hourlyStats.map((h) => ({ hour: h._id, count: h.count })),
        statusBreakdown: statusBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        guestDistribution,
        cancellationRate: parseFloat(cancellationRate.toFixed(1)),
        averageGuests: parseFloat(averageGuests.toFixed(1)),
        averageLeadTime: parseFloat(averageLeadTime.toFixed(1)),
        busyDays: busyDays.map((d) => ({ day: d._id, count: d.count })),
        activeBookings,
        upcomingBookings,
      },
      upcomingBookings,
      recentBookings,
      activeBookings,
      dayBookings,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getCollaborators
 * @description Retrieves all collaborators of a restaurant.
 */
export const getCollaborators = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate("collaborators", "name forename email avatar username createdAt");

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Map collaborators to include their role from collaboratorRoles
    const collaboratorsWithRoles = restaurant.collaborators.map((collab: any) => {
      const role = restaurant.collaboratorRoles.get(collab._id.toString()) || restaurantRoles.EMPLOYEE;
      return {
        ...collab.toObject(),
        restaurantRole: role,
      };
    });

    res.status(200).json({ collaborators: collaboratorsWithRoles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function addCollaborator
 * @description Adds a user as collaborator to a restaurant.
 */
export const addCollaborator = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }


    const isAlreadyCollaborator = restaurant.collaborators.some((collab) => collab.toString() === userId);

    if (isAlreadyCollaborator) {
      res.status(400).json({ error: "server.restaurants.errors.already_collaborator" });
      return;
    }

    restaurant.collaborators.push(userId);
    restaurant.collaboratorRoles.set(userId, restaurantRoles.EMPLOYEE);
    await restaurant.save();

    // Send email notification
    try {
      if (user.email) {
        const htmlContent = collaboratorEmailTemplate({
          name: user.forename,
          restaurantName: restaurant.name,
          role: restaurantRoles.EMPLOYEE,
          action: "added",
        });
        await sendEmail({
          email: user.email,
          subject: `Invitation à collaborer - ${restaurant.name}`,
          message: htmlContent,
        });
      }
    } catch (emailErr) {
      console.error("Collaborator added email failed", emailErr);
    }

    createLog({
      message: `User ${user.username} added as collaborator to ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Collaborateur ajouté" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function removeCollaborator
 * @description Removes a collaborator from a restaurant.
 */
export const removeCollaborator = async (req: Request, res: Response): Promise<void> => {
  const { id, collaboratorId } = req.params;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }


    // Cannot remove the last collaborator
    if (restaurant.collaborators.length <= 1) {
      res.status(400).json({ error: "server.restaurants.errors.cannot_remove_last" });
      return;
    }

    const collaboratorIndex = restaurant.collaborators.findIndex((collab) => collab.toString() === collaboratorId);
    if (collaboratorIndex === -1) {
      res.status(404).json({ error: "L'utilisateur n'est pas un collaborateur de ce restaurant" });
      return;
    }

    const user = await User.findById(collaboratorId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    // Get collaborator's role from restaurant
    const collaboratorRole = restaurant.collaboratorRoles.get(collaboratorId) || restaurantRoles.EMPLOYEE;

    // Protection: Only Administrators (Restaurant or Global) can remove other Administrators
    if (collaboratorRole === restaurantRoles.ADMIN && req.restaurantRole !== restaurantRoles.ADMIN) {
      res.status(403).json({ error: "Vous ne pouvez pas retirer un administrateur" });
      return;
    }

    // Admin Persistence: Cannot remove the last Administrator
    if (collaboratorRole === restaurantRoles.ADMIN) {
      let adminCount = 0;
      restaurant.collaboratorRoles.forEach((role) => {
        if (role === restaurantRoles.ADMIN) adminCount++;
      });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Un restaurant doit avoir au moins un administrateur" });
        return;
      }
    }

    restaurant.collaborators.splice(collaboratorIndex, 1);
    restaurant.collaboratorRoles.delete(collaboratorId);
    await restaurant.save();

    // Send email notification
    try {
      if (user.email) {
        const htmlContent = collaboratorEmailTemplate({
          name: user.forename,
          restaurantName: restaurant.name,
          action: "removed",
        });
        await sendEmail({
          email: user.email,
          subject: `Fin de collaboration - ${restaurant.name}`,
          message: htmlContent,
        });
      }
    } catch (emailErr) {
      console.error("Collaborator removed email failed", emailErr);
    }

    createLog({
      message: `Collaborator removed from ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Collaborateur retiré" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateRestaurantSettings
 * @description Updates restaurant settings (for collaborators).
 */
export const updateRestaurantSettings = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  // Note: We use req.body directly for array processing to ensure we catch field presence
  const { name, description, phone, email, adress, city, website, coverImage, openingHours, cuisineType, priceRange, sendBookingEmail } =
    req.body;

  try {
    const currentRestaurant = await Restaurant.findById(id);
    if (!currentRestaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    // Prevent removing required fields if the restaurant is currently OPEN
    if (!currentRestaurant.isClosed) {
      const missingFields = [];
      const newName = req.body.name !== undefined ? req.body.name : currentRestaurant.name;
      const newAdress = req.body.adress !== undefined ? req.body.adress : currentRestaurant.adress;
      const newPhone = req.body.phone !== undefined ? req.body.phone : currentRestaurant.phone;
      const newCoverImage = req.body.coverImage !== undefined ? req.body.coverImage : currentRestaurant.coverImage;
      const newImages = req.body.images !== undefined ? req.body.images : currentRestaurant.images;
      const newMenu = req.body.menu !== undefined ? req.body.menu : currentRestaurant.menu;

      if (!newName) missingFields.push("Nom");
      if (!newAdress) missingFields.push("Adresse");
      if (!newPhone) missingFields.push("Téléphone");
      if (!newCoverImage) missingFields.push("Image de couverture");
      if (!newImages || (Array.isArray(newImages) && newImages.length === 0)) missingFields.push("Galerie photos");
      if (!newMenu || (Array.isArray(newMenu) && newMenu.length === 0)) missingFields.push("Menu");

      if (missingFields.length > 0) {
        res.status(400).json({
          error: `Impossible de retirer ces informations car le restaurant est ouvert. Fermez-le d'abord. (Manquant : ${missingFields.join(", ")})`,
        });
        return;
      }
    }

    // Handle Cover Image: Delete old if changed
    if (coverImage !== undefined && coverImage !== currentRestaurant.coverImage) {
      if (currentRestaurant.coverImage) {
        await deleteFile(currentRestaurant.coverImage);
      }
    }

    // Handle Arrays (Images, Menu)
    const processImageArray = async (field: "images" | "menu") => {
      if (req.body[field]) {
        const newImages: string[] = req.body[field];
        const oldImages: string[] = (currentRestaurant[field] as string[]) || [];

        // Validation: Gallery Limit
        if (field === "images" && newImages.length > 8) {
          // CLEANUP ON ERROR: Delete the newly added images since we reject them
          const newlyAdded = newImages.filter((img) => !oldImages.includes(img));
          await Promise.all(newlyAdded.map((img) => deleteFile(img)));

          throw new Error("La galerie ne peut contenir que 8 images maximum");
        }

        // Validation: Menu Limit
        if (field === "menu" && newImages.length > 8) {
          // CLEANUP ON ERROR
          const newlyAdded = newImages.filter((img) => !oldImages.includes(img));
          await Promise.all(newlyAdded.map((img) => deleteFile(img)));

          throw new Error("Le menu ne peut contenir que 8 pages maximum");
        }

        // Identify deleted images (in old but not in new list)
        const deletedImages = oldImages.filter((img) => !newImages.includes(img));

        console.log(`[updateRestaurantSettings] Field: ${field}`, {
          newCount: newImages.length,
          oldCount: oldImages.length,
          deletedCount: deletedImages.length,
        });

        await Promise.all(deletedImages.map((img) => deleteFile(img)));
      }
    };

    await processImageArray("images");
    await processImageArray("menu");

    // Recalculate capacity if zones are provided
    if (req.body.zones && Array.isArray(req.body.zones)) {
      const totalCapacity = req.body.zones.reduce((acc: number, zone: any) => {
        const zoneTables = zone.tables || [];
        return acc + zoneTables.reduce((tAcc: number, table: any) => {
          if (table.status === "reserved") return tAcc;
          return tAcc + (table.seats || 0);
        }, 0);
      }, 0);
      req.body.capacity = totalCapacity;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(adress && { adress }),
        ...(city && { city }),
        ...(website !== undefined && { website }),
        ...(coverImage !== undefined && { coverImage }),
        ...(req.body.images && { images: req.body.images }), // Use req.body for arrays
        ...(req.body.menu && { menu: req.body.menu }), // Use req.body for arrays
        ...(openingHours && { openingHours }),
        ...(cuisineType && { cuisineType }),
        ...(priceRange && { priceRange }),
        ...(sendBookingEmail !== undefined && { sendBookingEmail }),
        ...(req.body.shortDescription !== undefined && { shortDescription: req.body.shortDescription }),
        ...(req.body.features && { features: req.body.features }),
        ...(req.body.paymentMethods && { paymentMethods: req.body.paymentMethods }),
        ...(req.body.socials && { socials: req.body.socials }),
        ...(req.body.capacity !== undefined && { capacity: req.body.capacity }),
        ...(req.body.exceptionalClosures && { exceptionalClosures: req.body.exceptionalClosures }),
        ...(req.body.exceptionalOpenings && { exceptionalOpenings: req.body.exceptionalOpenings }),
        ...(req.body.isBankImprintEnabled !== undefined && { isBankImprintEnabled: req.body.isBankImprintEnabled }),
        ...(req.body.bankImprintAmount !== undefined && { bankImprintAmount: req.body.bankImprintAmount }),
      },
      { new: true },
    );

    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    createLog({
      message: `Restaurant '${restaurant.name}' settings updated`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ restaurant, message: "Paramètres mis à jour" });
  } catch (err: any) {
    if (err.message === "La galerie ne peut contenir que 8 images maximum") {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err.message === "Le menu ne peut contenir que 8 pages maximum") {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function updateCollaboratorRole
 * @description Updates the role of a collaborator in a restaurant.
 */
export const updateCollaboratorRole = async (req: Request, res: Response): Promise<void> => {
  const { id, collaboratorId } = req.params;
  const { role } = req.body;

  if (!Object.values(restaurantRoles).includes(role)) {
    res.status(400).json({ error: "Rôle invalide" });
    return;
  }

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }


    const isCollaborator = restaurant.collaborators.some((collab) => collab.toString() === collaboratorId);
    if (!isCollaborator) {
      res.status(404).json({ error: "Utilisateur n'est pas collaborateur de ce restaurant" });
      return;
    }

    const user = await User.findById(collaboratorId);
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }

    // Get current role from restaurant's collaboratorRoles
    const currentRole = restaurant.collaboratorRoles.get(collaboratorId) || restaurantRoles.EMPLOYEE;

    // Protection: Managers cannot change the role of an Administrator
    if (currentRole === restaurantRoles.ADMIN && req.restaurantRole !== restaurantRoles.ADMIN) {
      res.status(403).json({ error: "Vous ne pouvez pas modifier le rôle d'un administrateur" });
      return;
    }

    // Admin Persistence: Cannot downgrade the last Administrator
    if (currentRole === restaurantRoles.ADMIN && role !== restaurantRoles.ADMIN) {
      let adminCount = 0;
      restaurant.collaboratorRoles.forEach((r) => {
        if (r === restaurantRoles.ADMIN) adminCount++;
      });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Un restaurant doit avoir au moins un administrateur" });
        return;
      }
    }

    restaurant.collaboratorRoles.set(collaboratorId, role);
    await restaurant.save();

    createLog({
      message: `Role of collaborator ${user.username} updated to ${role} in ${restaurant.name}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "Rôle mis à jour" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
/**
 * @function checkRestaurantUniqueness
 * @description Checks if restaurant fields (name/slug, address, phone, email) are unique.
 */
export const checkRestaurantUniqueness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address } = req.query;
    const errors: Record<string, string> = {};

    if (name) {
      const slug = (name as string).toLowerCase().replace(/ /g, "-");
      // Use regex to check if slug starts with the generated slug (since we append timestamp in wizard submit,
      // but here we just want to warn if the exact name exists or a very similar one)
      // Actually, since we append timestamp, name uniqueness isn't STRICTLY required for slug,
      // but it's good practice to avoid confusion.
      // However, the wizard appends Date.now(), so let's just check exact name match or minimal slug match if we want strictness.
      // For now, let's just check if a restaurant with this exact name exists, might be less confusing.
      const nameExists = await Restaurant.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (nameExists) {
        errors.name = "Ce nom de restaurant est déjà utilisé";
      }
    }

    if (phone) {
      const phoneExists = await Restaurant.findOne({ phone: phone as string });
      if (phoneExists) {
        errors.phone = "Ce numéro de téléphone est déjà associé à un autre restaurant";
      }
    }

    if (email) {
      const emailExists = await Restaurant.findOne({ email: email as string });
      if (emailExists) {
        errors.email = "Cette adresse email est déjà associée à un autre restaurant";
      }
    }

    if (address) {
      const addressExists = await Restaurant.findOne({ adress: address as string });
      if (addressExists) {
        errors.adress = "Cette adresse est déjà utilisée par un autre restaurant";
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(409).json({ unique: false, errors });
      return;
    }

    // ... checkRestaurantUniqueness checks ...
    res.status(200).json({ unique: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function sendRestaurantVerificationCode
 * @description Sends a 6-digit verification code to the provided email.
 */
export const sendRestaurantVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, context = "restaurant" } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email requis" });
      return;
    }

    if (context === "account") {
      const userExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.userId },
      });
      if (userExists) {
        res.status(409).json({ error: "Cet email est déjà utilisé par un autre compte" });
        return;
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (expires in 5m)
    await VerificationCode.create({ email, code });

    // Send email
    try {
      const { verificationCodeTemplate } = await import("../templates/verificationCodeTemplate.js");
      const htmlContent = verificationCodeTemplate({ code, context });
      await sendEmail({
        email,
        subject: "Votre code de vérification - Couverto",
        message: htmlContent,
      });
    } catch (emailErr) {
      console.error("Failed to send verification code email", emailErr);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
      return;
    }

    res.status(200).json({ message: "Code envoyé" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function verifyRestaurantVerificationCode
 * @description Verifies the provided code for the email.
 */
export const verifyRestaurantVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    // Find the latest code for this email
    const record = await VerificationCode.findOne({ email, code }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400).json({ error: "Code invalide ou expiré" });
      return;
    }

    // Optionally delete the code after use to prevent reuse (though TTL handles expiration)
    await VerificationCode.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Code vérifié", verified: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function generateApiKey
 * @description Generates a new API key for the restaurant (external booking integration).
 * Returns the plain key ONCE — only the HMAC-SHA256 hash is stored.
 */
export const generateApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    // Generate a random 32-byte key
    const plainKey = crypto.randomBytes(32).toString("hex");

    // Hash it with HMAC-SHA256 for storage
    const hashedKey = crypto
      .createHmac("sha256", process.env.API_KEY_SECRET || "couverto-api-key-secret")
      .update(plainKey)
      .digest("hex");

    restaurant.apiKey = hashedKey;
    restaurant.apiKeyCreatedAt = new Date();
    await restaurant.save();

    createLog({
      message: `API key generated for restaurant ${id}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    // Return the plain key — it will never be retrievable again
    res.status(200).json({
      apiKey: plainKey,
      createdAt: restaurant.apiKeyCreatedAt,
      message: "Clé API générée. Conservez-la précieusement, elle ne sera plus affichée.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function revokeApiKey
 * @description Revokes the restaurant's API key, disabling external API access.
 */
export const revokeApiKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant introuvable" });
      return;
    }

    restaurant.apiKey = undefined as any;
    restaurant.apiKeyCreatedAt = undefined as any;
    await restaurant.save();

    // Use $unset to properly remove the fields from MongoDB
    await Restaurant.updateOne({ _id: id }, { $unset: { apiKey: 1, apiKeyCreatedAt: 1 } });

    createLog({
      message: `API key revoked for restaurant ${id}`,
      userId: req.userId,
      level: logLevels.WARN,
    });

    res.status(200).json({ message: "Clé API révoquée" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function toggleTodayClosure
 * @description Toggles an exceptional closure for a specific period or the full day.
 */
export const toggleTodayClosure = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { date } = req.body;
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }

    const todayStr = date || new Date().toISOString().split("T")[0];

    // Always target the full day
    const targetStart = new Date(todayStr + "T00:00:00.000Z");
    const targetEnd = new Date(todayStr + "T23:59:59.999Z");
    const targetStartMs = targetStart.getTime();
    const targetEndMs = targetEnd.getTime();

    // Check if there's any closure overlapping with today
    // We want to "reopen" if we find a full-day closure OR any closure for today
    const existingIndex = restaurant.exceptionalClosures.findIndex((closure: any) => {
      const s = new Date(closure.startDate).getTime();
      const e = new Date(closure.endDate).getTime();
      // If it's a full day closure or any closure starting today
      return (Math.abs(s - targetStartMs) < 2000 && Math.abs(e - targetEndMs) < 2000) || 
             (s >= targetStartMs && s <= targetEndMs);
    });

    if (existingIndex > -1) {
      // Reopen: Remove ALL closures that start/end today to be thorough
      restaurant.exceptionalClosures = restaurant.exceptionalClosures.filter((closure: any) => {
        const s = new Date(closure.startDate).getTime();
        return !(s >= targetStartMs && s <= targetEndMs);
      });
      await restaurant.save();
      res.status(200).json({ 
        message: `Restaurant réouvert pour le ${todayStr}`, 
        exceptionalClosures: restaurant.exceptionalClosures 
      });
    } else {
      // Close: Add a new full-day closure
      restaurant.exceptionalClosures.push({
        startDate: targetStart,
        endDate: targetEnd,
        reason: "Fermeture rapide",
      });
      await restaurant.save();
      res.status(200).json({ 
        message: `Restaurant fermé pour le ${todayStr}`, 
        exceptionalClosures: restaurant.exceptionalClosures 
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function toggleTableClosure
 * @description Toggles a table's closure for a specific time range.
 */
export const toggleTableClosure = async (req: Request, res: Response): Promise<void> => {
  const { id, tableId } = req.params;
  const { startTime, endTime, date } = req.body;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant non trouvé" });
      return;
    }

    const todayStr = date || new Date().toISOString().split("T")[0];

    // Target range (defaults to full day if not specified)
    const targetStart = startTime ? new Date(`${todayStr}T${startTime}:00.000Z`) : new Date(`${todayStr}T00:00:00.000Z`);
    const targetEnd = endTime ? new Date(`${todayStr}T${endTime}:00.999Z`) : new Date(`${todayStr}T23:59:59.999Z`);

    // Handle midnight crossing
    if (startTime && endTime && endTime < startTime) {
      targetEnd.setUTCDate(targetEnd.getUTCDate() + 1);
    }

    const targetStartMs = targetStart.getTime();
    const targetEndMs = targetEnd.getTime();

    // Check if this exact closure already exists
    const existingIndex = restaurant.tableClosures?.findIndex((closure: any) => {
      if (closure.tableId !== tableId) return false;
      const s = new Date(closure.startDate).getTime();
      const e = new Date(closure.endDate).getTime();
      return Math.abs(s - targetStartMs) < 2000 && Math.abs(e - targetEndMs) < 2000;
    });

    if (existingIndex !== undefined && existingIndex > -1) {
      // Re-open: Remove the closure
      restaurant.tableClosures.splice(existingIndex, 1);
      await restaurant.save();
      res.status(200).json({ 
        message: "Table réouverte pour ce service", 
        tableClosures: restaurant.tableClosures 
      });
    } else {
      // Block: Add new closure
      if (!restaurant.tableClosures) restaurant.tableClosures = [];
      restaurant.tableClosures.push({
        tableId,
        startDate: targetStart,
        endDate: targetEnd,
        reason: "Bloquée (téléphone)",
      });
      await restaurant.save();
      res.status(200).json({ 
        message: "Table bloquée pour ce service", 
        tableClosures: restaurant.tableClosures 
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
