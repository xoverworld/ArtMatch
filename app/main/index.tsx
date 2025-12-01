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
import { SafeAreaView } from "react-native-safe-area-context";

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
  useEffect(() => {
    const getPhotos = async () => {
      const userId = await AsyncStorage.getItem("userId");
      axios
        .get(
          `https://unsurviving-melania-shroudlike.ngrok-free.dev/photos/${userId}`
        )
        .then(function (response) {
          // console.log(response.data.length);
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
    // Clear user session
    await AsyncStorage.setItem("userId", "");
    // Navigate back to login
    router.replace("/pages/loginPage");
  };

  const renderItem = ({ item }: { item: PhotoItem }) => {
    // Construct the URI.
    // IMPORTANT: Check if the string already has the prefix. If not, add it.
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
    <SafeAreaView style={styles.container}>
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subGreeting}>Here is your gallery.</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu (Conditionally Rendered) */}
      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.content}>
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.uploadedAt}
          numColumns={2} // Grid layout (2 images per row)
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No photos found.</Text>
          }
        />
      </View>

      {/* Floating Camera Button (Middle Bottom) */}
      <View style={styles.fabContainer}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Link href="/main/cameraPage" asChild>
            <TouchableOpacity style={styles.fab}>
              {/* Camera Icon (Emoji used for simplicity, can be an Icon) */}
              <Text style={styles.fabIcon}></Text>
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
const itemSize = (width - spacing * 3) / 2; // Calculate width for 2 columns

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    position: "relative", // Needed for absolute positioning context
  },
  header: {
    flexDirection: "row", // Layout horizontally
    justifyContent: "space-between", // Push items to edges
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 1, // Ensure header is below dropdown z-index
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
  // Menu Styles
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  dropdown: {
    position: "absolute",
    top: 80, // Position below header
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
    zIndex: 10, // Ensure it floats on top
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
  // Content Styles
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  // Floating Action Button (FAB) Styles
  fabContainer: {
    position: "absolute",
    bottom: 15, // Distance from bottom
    left: 0,
    right: 0,
    alignItems: "center", // Centers horizontally
    backgroundColor: "white",
    borderColor: "black",
    borderTopWidth: 1,
    width: width,
    height: 100,
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36, // Circular
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
    marginTop: 8,
  },
  fabIcon: {
    fontSize: 32,
  },
  fabLabel: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },

  listContent: {
    padding: spacing,
    paddingBottom: 150, // Add padding so photos can scroll above the FAB
  },
  imageContainer: {
    margin: spacing / 2,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: itemSize,
    height: itemSize, // Square images
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
