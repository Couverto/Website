import { apiClient } from "./client";
import { Collaborator, Invitation, RestaurantRole } from "../types";

export const getCollaborators = async (restaurantId: string): Promise<Collaborator[]> => {
  const { data } = await apiClient.get<{ collaborators: Collaborator[] }>(`/restaurants/${restaurantId}/collaborators`);
  return data.collaborators;
};

export const getInvitations = async (restaurantId: string): Promise<Invitation[]> => {
  const { data } = await apiClient.get<{ invitations: Invitation[] }>(`/restaurants/${restaurantId}/invitations`);
  return data.invitations;
};

export const createInvitation = async (restaurantId: string): Promise<{ invitation: Invitation; inviteLink: string }> => {
  const { data } = await apiClient.post<{ invitation: Invitation; inviteLink: string }>(`/restaurants/${restaurantId}/invitations`);
  return data;
};

export const deleteInvitation = async (restaurantId: string, invitationId: string): Promise<void> => {
  await apiClient.delete(`/restaurants/${restaurantId}/invitations/${invitationId}`);
};

export const updateCollaboratorRole = async (restaurantId: string, collaboratorId: string, role: RestaurantRole): Promise<void> => {
  await apiClient.patch(`/restaurants/${restaurantId}/collaborators/${collaboratorId}/role`, { role });
};

export const removeCollaborator = async (restaurantId: string, collaboratorId: string): Promise<void> => {
  await apiClient.delete(`/restaurants/${restaurantId}/collaborators/${collaboratorId}`);
};
