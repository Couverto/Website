import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as collaboratorsApi from "../api/collaborators";
import { RestaurantRole } from "../types";

export function useCollaborators(restaurantId: string | null) {
  return useQuery({
    queryKey: ["collaborators", restaurantId],
    queryFn: () => collaboratorsApi.getCollaborators(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useInvitations(restaurantId: string | null) {
  return useQuery({
    queryKey: ["invitations", restaurantId],
    queryFn: () => collaboratorsApi.getInvitations(restaurantId as string),
    enabled: !!restaurantId,
  });
}

export function useCreateInvitation(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => collaboratorsApi.createInvitation(restaurantId as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations", restaurantId] }),
  });
}

export function useDeleteInvitation(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => collaboratorsApi.deleteInvitation(restaurantId as string, invitationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations", restaurantId] }),
  });
}

export function useUpdateCollaboratorRole(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collaboratorId, role }: { collaboratorId: string; role: RestaurantRole }) =>
      collaboratorsApi.updateCollaboratorRole(restaurantId as string, collaboratorId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collaborators", restaurantId] }),
  });
}

export function useRemoveCollaborator(restaurantId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collaboratorId: string) => collaboratorsApi.removeCollaborator(restaurantId as string, collaboratorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collaborators", restaurantId] }),
  });
}
