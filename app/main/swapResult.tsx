import Icon from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MatchResult = {
  photo: string;
};

export default function SwaphResults() {
  const router = useRouter();
  const params = useLocalSearchParams<Partial<MatchResult>>();
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Saving photo</Text>
      </View>
    );
  }

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem("userId");
    axios
      .post(
        "https://unsurviving-melania-shroudlike.ngrok-free.dev/upload-photo",
        {
          UserId: userId,
          Photo_data: params.photo,
        },
        { headers: { "Content-Type": "application/json" } },
      )
      .then(() => {
        Alert.alert("Success", "Photo uploaded!");
        router.replace("/main");
      })
      .catch(() => Alert.alert("Error", "Failed to upload."))
      .finally(() => {
        setLoading(false);
      });
  };

  const photoUri = `data:image/jpeg;base64,${params.photo}`;
  //   const photoUri = `http://unsurviving-melania-shroudlike.ngrok-free.dev/image/${params.category}/${params.name}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { marginTop: 20 }]}>Match Found!</Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              gap: 25,
            }}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#b63636" }]}
              activeOpacity={0.7}
              onPress={() => {
                router.replace("/main");
              }}
            >
              <Icon name="cancel" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2c8520" }]}
              activeOpacity={0.7}
              onPress={handleSave}
            >
              <Icon name="check-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    height: width * 1.2,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
