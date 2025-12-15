import { Ionicons } from "@expo/vector-icons"; // 1. Import Icons
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type PhotoItem = {
  id: string;
  photo_data: string;
  userId: string;
  uploadedAt: string;
};

export default function Index() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getPhotos = async () => {
      const userId = await AsyncStorage.getItem("userId");
      axios
        .get(
          `https://unsurviving-melania-shroudlike.ngrok-free.dev/photos/${userId}`
        )
        .then(function (response) {
          setPhotos(response.data);
        })
        .catch(function (error) {
          console.log(error.response.data);
        })
        .finally(function () {
          setLoading(false);
        });
    };

    getPhotos();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.setItem("userId", "");
    router.replace("/pages/loginPage");
  };

  const renderItem = ({ item }: { item: PhotoItem }) => {
    const imageUri = item.photo_data.startsWith("data:")
      ? item.photo_data
      : `data:image/jpeg;base64,${item.photo_data}`;

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/main/photoPage",
              params: {
                photoId: item.id,
                photo_data: item.photo_data,
                userId: item.userId,
                uploadedAt: item.uploadedAt,
              },
            });
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading Gallery...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subGreeting}>Here is your gallery.</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          {/* 2. Replace Emoji with Icon */}
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.uploadedAt}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 130 + insets.bottom },
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No photos found.</Text>
          }
        />
      </View>

      {/* Floating Camera Button */}
      <View
        style={[
          styles.fabContainer,
          {
            height: 100 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Link href="/main/cameraPage" asChild>
            <TouchableOpacity style={styles.fab}>
              {/* 3. Replace Emoji with Icon */}
              <Ionicons name="camera" size={32} color="white" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.fabLabel}>Open Camera</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const spacing = 10;
const itemSize = (width - spacing * 3) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },
  subGreeting: {
    fontSize: 16,
    color: "#6B7280",
  },
  menuButton: {
    padding: 8,
  },
  // Removed menuIcon style as we pass size/color props directly to Icon component
  dropdown: {
    position: "absolute",
    top: 80,
    right: 24,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#E5E7EB",
    borderTopWidth: 1,
    width: width,
    justifyContent: "center",
    zIndex: 20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  // Removed fabIcon style
  fabLabel: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    padding: spacing,
  },
  imageContainer: {
    margin: spacing / 2,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: itemSize,
    height: itemSize,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6B7280",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
