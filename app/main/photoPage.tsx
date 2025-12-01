import Icon from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define the photo data interface
interface PhotoData {
  photo_data: string; // base64 string
  photoId: string;
  userId: string;
  uploadedAt: string; // ISO string
}

// Type guard to check if params contain required data
const hasRequiredParams = (params: any): params is PhotoData => {
  return (
    params &&
    typeof params.photo_data === "string" &&
    typeof params.photoId === "string"
  );
};

const PhotoViewerScreen: React.FC = () => {
  // Get params from URL (Expo Router uses useLocalSearchParams)
  const params = useLocalSearchParams<Partial<PhotoData>>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [photoData, setPhotoData] = useState<PhotoData>({
    photo_data: "",
    photoId: "",
    userId: "",
    uploadedAt: "",
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const loadPhotoData = () => {
      //   console.log("Received params:", params);

      // Check if we have the required parameters
      if (hasRequiredParams(params)) {
        setPhotoData({
          photo_data: params.photo_data || "",
          photoId: params.photoId || "",
          userId: params.userId || "",
          uploadedAt: params.uploadedAt || new Date().toISOString(),
        });
        setIsLoading(false);
      } else {
        // Handle missing or invalid parameters
        Alert.alert(
          "Error",
          "No photo data provided. Please go back and try again.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    // Small delay to ensure params are loaded
    const timer = setTimeout(loadPhotoData, 100);
    return () => clearTimeout(timer);
  }, [params]);

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // Handle download photo
  const handleDownload = async (): Promise<void> => {
    if (isDownloading || !photoData.photo_data) return;

    try {
      setIsDownloading(true);

      // For Expo, you can use expo-file-system and expo-sharing
      // Example implementation:
      // await downloadAndSavePhoto(photoData.photo, `photo_${photoData.photoId}.jpg`);

      Alert.alert("Success", "Photo downloaded successfully!", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download photo. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle delete photo
  const handleDelete = (): void => {
    if (!photoData.photoId || !photoData.userId) {
      Alert.alert("Error", "Cannot delete: Missing photo information");
      return;
    }

    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);

              // Implement your delete API call here
              // Example: await deletePhoto(photoData.photoId, photoData.userId);
              axios.delete(
                `https://unsurviving-melania-shroudlike.ngrok-free.dev/delete-photo/${params.photoId}`
              );

              Alert.alert("Success", "Photo deleted successfully!", [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate back after successful deletion
                    router.push("/main");
                  },
                },
              ]);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                "Failed to delete photo. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Format the uploaded date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading photo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Photo Viewer</Text>
        <View style={styles.spacer} />
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Photo Display */}
        <View style={styles.photoContainer}>
          {photoData.photo_data ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${photoData.photo_data}` }}
              style={styles.photo}
              resizeMode="contain"
              onError={(error) => {
                console.error("Image load error:", error.nativeEvent.error);
                Alert.alert("Error", "Failed to load image");
              }}
            />
          ) : (
            <View style={styles.noPhotoContainer}>
              <Icon name="broken-image" size={80} color="#666" />
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}
        </View>

        {/* Photo Info */}
        <View style={styles.infoContainer}>
          {/* <View style={styles.infoRow}>
            <Icon name="info" size={20} color="#666" />
            <Text style={styles.infoLabel}>Photo ID: </Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {photoData.photoId || "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#666" />
            <Text style={styles.infoLabel}>User ID: </Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {photoData.userId || "N/A"}
            </Text>
          </View> */}

          <View style={styles.infoRow}>
            <Icon name="schedule" size={20} color="#666" />
            <Text style={styles.infoLabel}>Uploaded At: </Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {formatDate(photoData.uploadedAt)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.downloadButton,
              (!photoData.photo_data || isDownloading) && styles.disabledButton,
            ]}
            onPress={handleDownload}
            disabled={isDownloading || !photoData.photo_data}
            activeOpacity={0.7}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon name="file-download" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.deleteButton,
              (!photoData.photo_data || isDeleting) && styles.disabledButton,
            ]}
            onPress={handleDelete}
            disabled={isDeleting || !photoData.photo_data}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon name="delete" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#FFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  spacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  photoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    marginVertical: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  noPhotoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
  },
  infoContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
    flex: 1,
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
  downloadButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default PhotoViewerScreen;
