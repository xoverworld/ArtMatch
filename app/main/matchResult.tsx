import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the expected structure of the match result
// Assuming the server returns a single object with match details
type MatchResult = {
  matched_photo: string; // Base64 string of the matched artwork
  author: string; // Name of the artist/author
  matchID: string; // Date of creation (example field)
  name: string;
  category: string;
  similarityDistance: string;
};

export default function MatchResults() {
  const router = useRouter();
  const params = useLocalSearchParams<Partial<MatchResult>>();

  if (!params) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>
          No matching artwork found. Try again!
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/main")}
        >
          <Text style={styles.backText}>← Back to Gallery</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Convert the matched photo Base64 to a displayable URI
  const matchedImageUri = `data:image/jpeg;base64,${params.matched_photo}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/main")}
            style={styles.closeButton}
          >
            <Ionicons name="close-circle-outline" size={32} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Match Found!</Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: params.matched_photo }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Author</Text>
            <Text style={styles.value}>{params.author || "Unknown"}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{params.name || "Unknown"}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{params.category || "Unknown"}</Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>
              {params.matched_photo || "Unknown"}
            </Text>
          </View>

          {/* <Text style={styles.description}>
            This artwork shows a strong match with the reference image in our
            database. The file received from the API was analyzed and found to
            match this entry.
          </Text> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Light gray background
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    width: "100%",
  },
  closeButton: {
    // Make the touch target large but keep icon size small
    padding: 5,
  },
  closeText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width,
    height: width * 1.2, // Slightly taller than square
    backgroundColor: "#000",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  detailCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    fontSize: 20,
    color: "#EF4444",
    marginTop: 100,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 40,
    alignItems: "center",
  },
  backText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
