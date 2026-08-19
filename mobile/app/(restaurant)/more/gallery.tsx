import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRestaurant } from "../../../src/contexts/RestaurantContext";
import { useGallery } from "../../../src/hooks/useGallery";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

const TILE = 96;

function ImageGrid({
  images,
  busy,
  onAdd,
  onRemove,
  limit,
}: Readonly<{ images: string[]; busy: boolean; onAdd: () => void; onRemove: (url: string) => void; limit: number }>) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {images.map((url) => (
        <View key={url} style={{ width: TILE, height: TILE }} className="rounded-xl overflow-hidden border border-border">
          <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <Pressable
            onPress={() => onRemove(url)}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
            disabled={busy}
          >
            <Feather name="x" size={12} color="#fff" />
          </Pressable>
        </View>
      ))}
      {images.length < limit ? (
        <Pressable
          onPress={onAdd}
          disabled={busy}
          style={{ width: TILE, height: TILE }}
          className="rounded-xl border border-dashed border-border items-center justify-center bg-surface"
        >
          {busy ? <ActivityIndicator color="#173B15" /> : <Feather name="plus" size={22} color="#173B15" />}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function GalleryScreen() {
  const { activeRestaurantId, restaurant } = useRestaurant();
  const { busyField, setCover, addGalleryImage, addMenuImage, removeGalleryImage, removeMenuImage } = useGallery(
    activeRestaurantId,
    restaurant,
  );

  if (!restaurant) return null;

  return (
    <ScreenContainer edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}>
        <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">Image de couverture</Text>
        <Pressable
          onPress={setCover}
          disabled={busyField === "cover"}
          className="w-full h-40 rounded-2xl border border-border overflow-hidden bg-surface items-center justify-center mb-6"
        >
          {restaurant.coverImage ? (
            <Image source={{ uri: restaurant.coverImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <Feather name="image" size={28} color="#9ca3af" />
          )}
          <View className="absolute bottom-2 right-2 bg-black/60 rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
            {busyField === "cover" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="camera" size={13} color="#fff" />
            )}
            <Text className="text-white text-xs font-bold">Changer</Text>
          </View>
        </Pressable>

        <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">
          Galerie photos ({restaurant.images.length}/8)
        </Text>
        <View className="mb-6">
          <ImageGrid
            images={restaurant.images}
            busy={busyField === "gallery"}
            onAdd={addGalleryImage}
            onRemove={removeGalleryImage}
            limit={8}
          />
        </View>

        <Text className="text-xs font-black uppercase tracking-widest text-muted mb-2">Menu ({restaurant.menu.length}/8)</Text>
        <ImageGrid images={restaurant.menu} busy={busyField === "menu"} onAdd={addMenuImage} onRemove={removeMenuImage} limit={8} />
      </ScrollView>
    </ScreenContainer>
  );
}
