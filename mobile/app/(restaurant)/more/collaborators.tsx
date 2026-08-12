import { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import {
  useCollaborators,
  useCreateInvitation,
  useDeleteInvitation,
  useInvitations,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from "../../../src/hooks/useCollaboratorsQueries";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { EmptyState } from "../../../src/components/EmptyState";
import { Collaborator, RestaurantRole } from "../../../src/types";
import { formatShortDate } from "../../../src/utils/dateFormatter";
import { getApiErrorMessage } from "../../../src/api/client";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "";

const ROLE_LABELS: Record<RestaurantRole, string> = {
  [RestaurantRole.ADMIN]: "Administrateur",
  [RestaurantRole.MANAGER]: "Manager",
  [RestaurantRole.EMPLOYEE]: "Employé",
};

export default function CollaboratorsScreen() {
  const { activeRestaurantId: restaurantId, userRole } = useRestaurant();
  const isAdmin = userRole === RestaurantRole.ADMIN;

  const { data: collaborators, isLoading } = useCollaborators(restaurantId);
  const { data: invitations } = useInvitations(restaurantId);
  const createInvitation = useCreateInvitation(restaurantId);
  const deleteInvitation = useDeleteInvitation(restaurantId);
  const updateRole = useUpdateCollaboratorRole(restaurantId);
  const removeCollaborator = useRemoveCollaborator(restaurantId);

  const [selected, setSelected] = useState<Collaborator | null>(null);

  const handleInvite = async () => {
    try {
      const { inviteLink } = await createInvitation.mutateAsync();
      await Share.share({ message: `Rejoignez notre équipe sur Couverto : ${WEB_URL}${inviteLink}` });
    } catch (err) {
      Alert.alert("Erreur", getApiErrorMessage(err, "Impossible de créer l'invitation."));
    }
  };

  const shareInvitation = (token: string) => {
    Share.share({ message: `Rejoignez notre équipe sur Couverto : ${WEB_URL}/join/${token}` });
  };

  const handleChangeRole = (role: RestaurantRole) => {
    if (!selected) return;
    updateRole.mutate(
      { collaboratorId: selected._id, role },
      { onSuccess: () => setSelected(null), onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)) },
    );
  };

  const confirmRemove = () => {
    if (!selected) return;
    Alert.alert("Retirer ce collaborateur ?", `${selected.forename} ${selected.name} perdra l'accès à ce restaurant.`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: () =>
          removeCollaborator.mutate(selected._id, {
            onSuccess: () => setSelected(null),
            onError: (err) => Alert.alert("Erreur", getApiErrorMessage(err)),
          }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={["left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#173B15" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        {isAdmin ? (
          <Pressable
            onPress={handleInvite}
            disabled={createInvitation.isPending}
            className="flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3 mb-4 active:opacity-80"
          >
            {createInvitation.isPending ? <ActivityIndicator color="#fff" /> : <Feather name="user-plus" size={16} color="#fff" />}
            <Text className="text-white font-bold text-sm">Inviter un collaborateur</Text>
          </Pressable>
        ) : null}

        <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">Équipe</Text>
        {(collaborators ?? []).length === 0 ? (
          <EmptyState icon="users" title="Aucun collaborateur" />
        ) : (
          <View className="bg-white rounded-2xl border border-border overflow-hidden mb-4">
            {(collaborators ?? []).map((collab, index) => (
              <Pressable
                key={collab._id}
                onPress={() => isAdmin && setSelected(collab)}
                className={`flex-row items-center gap-3 p-4 ${index < (collaborators?.length ?? 0) - 1 ? "border-b border-border/60" : ""}`}
              >
                {collab.avatar ? (
                  <Image source={{ uri: collab.avatar }} className="w-10 h-10 rounded-full" />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="text-primary font-bold">{collab.forename?.[0]?.toUpperCase()}</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="font-bold text-sm text-gray-900">
                    {collab.forename} {collab.name}
                  </Text>
                  <Text className="text-xs text-muted mt-0.5">{collab.email}</Text>
                </View>
                <View className="bg-primary/5 rounded-full px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-primary">{ROLE_LABELS[collab.restaurantRole]}</Text>
                </View>
                {isAdmin ? <Feather name="chevron-right" size={16} color="#9ca3af" /> : null}
              </Pressable>
            ))}
          </View>
        )}

        {isAdmin && (invitations ?? []).length > 0 ? (
          <>
            <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">Invitations en attente</Text>
            <View className="bg-white rounded-2xl border border-border overflow-hidden">
              {(invitations ?? []).map((invitation, index) => (
                <View
                  key={invitation._id}
                  className={`flex-row items-center gap-3 p-4 ${index < (invitations?.length ?? 0) - 1 ? "border-b border-border/60" : ""}`}
                >
                  <View className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center">
                    <Feather name="mail" size={15} color="#9ca3af" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">Lien d'invitation</Text>
                    <Text className="text-xs text-muted mt-0.5">Expire le {formatShortDate(invitation.expiresAt)}</Text>
                  </View>
                  <Pressable onPress={() => shareInvitation(invitation.token)} hitSlop={8} className="p-1.5">
                    <Feather name="share-2" size={16} color="#173B15" />
                  </Pressable>
                  <Pressable onPress={() => deleteInvitation.mutate(invitation._id)} hitSlop={8} className="p-1.5">
                    <Feather name="x" size={16} color="#d32f2f" />
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setSelected(null)}>
          <Pressable className="bg-white rounded-t-3xl p-5" onPress={(e) => e.stopPropagation()}>
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {selected?.forename} {selected?.name}
            </Text>
            <Text className="text-xs text-muted mb-4">{selected?.email}</Text>

            {Object.values(RestaurantRole).map((role) => (
              <Pressable
                key={role}
                onPress={() => handleChangeRole(role)}
                disabled={updateRole.isPending}
                className={`flex-row items-center justify-between rounded-xl border px-4 py-3 mb-2 ${
                  selected?.restaurantRole === role ? "bg-primary border-primary" : "bg-white border-border"
                }`}
              >
                <Text className={`font-bold text-sm ${selected?.restaurantRole === role ? "text-white" : "text-gray-900"}`}>
                  {ROLE_LABELS[role]}
                </Text>
                {selected?.restaurantRole === role ? <Feather name="check" size={16} color="#fff" /> : null}
              </Pressable>
            ))}

            <Pressable
              onPress={confirmRemove}
              disabled={removeCollaborator.isPending}
              className="flex-row items-center justify-center gap-2 bg-red-50 rounded-xl py-3 mt-2"
            >
              <Feather name="user-x" size={15} color="#d32f2f" />
              <Text className="text-danger font-bold text-sm">Retirer du restaurant</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
