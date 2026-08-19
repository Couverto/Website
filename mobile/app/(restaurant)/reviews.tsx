import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../src/contexts/RestaurantContext";
import { useReplyToReview, useRestaurantReviews } from "../../src/hooks/useReviewsQueries";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { EmptyState } from "../../src/components/EmptyState";
import { StarRating } from "../../src/components/StarRating";
import { Review } from "../../src/types";
import { formatShortDate } from "../../src/utils/dateFormatter";

export default function ReviewsScreen() {
  const { activeRestaurantId } = useRestaurant();
  const { data: reviews, isLoading, isRefetching, refetch } = useRestaurantReviews(activeRestaurantId);
  const replyMutation = useReplyToReview(activeRestaurantId);

  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const averageRating = useMemo(() => {
    if (!reviews?.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const openReply = (review: Review) => {
    setReplyTarget(review);
    setReplyText(review.reply?.text ?? "");
  };

  const submitReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    replyMutation.mutate(
      { reviewId: replyTarget._id, text: replyText.trim() },
      { onSuccess: () => setReplyTarget(null) },
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={reviews ?? []}
        keyExtractor={(item) => item._id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-primary">Avis clients</Text>
            {reviews?.length ? (
              <View className="flex-row items-center gap-2 mt-1.5">
                <StarRating rating={Math.round(averageRating)} />
                <Text className="text-sm font-bold text-gray-700">{averageRating.toFixed(1)} / 5</Text>
                <Text className="text-sm text-muted">({reviews.length} avis)</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" size="large" color="#173B15" />
          ) : (
            <EmptyState icon="star" title="Aucun avis" description="Les avis de vos clients apparaîtront ici." />
          )
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-border p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-sm text-gray-900">
                {item.user?.forename} {item.user?.name}
              </Text>
              <Text className="text-xs text-muted">{formatShortDate(item.createdAt)}</Text>
            </View>
            <View className="mt-1.5">
              <StarRating rating={item.rating} />
            </View>
            {item.comment ? <Text className="text-sm text-gray-700 mt-2">{item.comment}</Text> : null}

            {item.reply ? (
              <View className="bg-surface rounded-xl px-3 py-2.5 mt-3 border-l-2 border-accent">
                <Text className="text-[10px] font-black uppercase text-accent-dark mb-0.5">Votre réponse</Text>
                <Text className="text-sm text-gray-700">{item.reply.text}</Text>
              </View>
            ) : null}

            <Pressable onPress={() => openReply(item)} className="flex-row items-center gap-1.5 mt-3 self-start">
              <Feather name="corner-up-left" size={13} color="#173B15" />
              <Text className="text-primary text-xs font-bold">{item.reply ? "Modifier la réponse" : "Répondre"}</Text>
            </Pressable>
          </View>
        )}
      />

      <Modal visible={!!replyTarget} animationType="slide" transparent onRequestClose={() => setReplyTarget(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => setReplyTarget(null)} />
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">Répondre à l'avis</Text>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              multiline
              placeholder="Votre réponse publique..."
              placeholderTextColor="#9ca3af"
              className="border border-border rounded-xl px-4 py-3 text-sm text-gray-900 min-h-[100px]"
              textAlignVertical="top"
            />
            <Pressable
              onPress={submitReply}
              disabled={replyMutation.isPending || !replyText.trim()}
              className="bg-primary rounded-xl py-3.5 items-center mt-4"
              style={{ opacity: replyMutation.isPending || !replyText.trim() ? 0.6 : 1 }}
            >
              {replyMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-sm">Publier la réponse</Text>}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}
