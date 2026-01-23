import { Request, Response } from "express";
import crypto from "crypto";
import { Invitation } from "../models/invitationModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import { createLog } from "./logController.js";
import { logLevels } from "../utils/enums/logLevels.js";

/**
 * @function createInvitation
 * @description Creates an invitation link for a restaurant.
 */
export const createInvitation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const token = crypto.randomBytes(32).toString("hex");

    const invitation = await Invitation.create({
      token,
      restaurant: id,
      createdBy: req.userId,
    });

    createLog({
      message: `Invitation created for restaurant ${id}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(201).json({
      invitation,
      inviteLink: `/join/${token}`,
      message: "server.invitations.messages.created",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getInvitations
 * @description Retrieves all active invitations for a restaurant.
 */
export const getInvitations = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const invitations = await Invitation.find({
      restaurant: id,
      used: false,
      expiresAt: { $gt: new Date() },
    })
      .populate("createdBy", "name forename")
      .sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function deleteInvitation
 * @description Deletes/revokes an invitation.
 */
export const deleteInvitation = async (req: Request, res: Response): Promise<void> => {
  const { id, invitationId } = req.params;

  try {
    const invitation = await Invitation.findOneAndDelete({
      _id: invitationId,
      restaurant: id,
    });

    if (!invitation) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    createLog({
      message: `Invitation ${invitationId} revoked for restaurant ${id}`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({ message: "server.invitations.messages.deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function getInvitationInfo
 * @description Public endpoint to get invitation details.
 */
export const getInvitationInfo = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const invitation = await Invitation.findOne({ token })
      .populate("restaurant", "name coverImage city")
      .populate("createdBy", "name forename");

    if (!invitation) {
      res.status(404).json({ error: "server.invitations.errors.not_found" });
      return;
    }

    if (invitation.used) {
      res.status(400).json({ error: "server.invitations.errors.already_used" });
      return;
    }

    if (invitation.expiresAt < new Date()) {
      res.status(400).json({ error: "server.invitations.errors.expired" });
      return;
    }

    res.status(200).json({ invitation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function acceptInvitation
 * @description Accepts an invitation and adds user as collaborator.
 */
export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      res.status(404).json({ error: "server.invitations.errors.not_found" });
      return;
    }

    if (invitation.used) {
      res.status(400).json({ error: "server.invitations.errors.already_used" });
      return;
    }

    if (invitation.expiresAt < new Date()) {
      res.status(400).json({ error: "server.invitations.errors.expired" });
      return;
    }

    const restaurant = await Restaurant.findById(invitation.restaurant);
    if (!restaurant) {
      res.status(404).json({ error: "server.global.errors.not_found" });
      return;
    }

    // Check if already a collaborator
    const isAlreadyCollaborator = restaurant.collaborators.some((collab) => collab.toString() === req.userId?.toString());

    if (isAlreadyCollaborator) {
      res.status(400).json({ error: "server.invitations.errors.already_collaborator" });
      return;
    }

    // Add user as collaborator
    restaurant.collaborators.push(req.userId!);
    await restaurant.save();

    // Mark invitation as used
    invitation.used = true;
    invitation.usedBy = req.userId;
    invitation.usedAt = new Date();
    await invitation.save();

    createLog({
      message: `User joined restaurant ${restaurant.name} via invitation`,
      userId: req.userId,
      level: logLevels.INFO,
    });

    res.status(200).json({
      message: "server.invitations.messages.accepted",
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
