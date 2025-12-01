import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker"; // Import Image Picker
import { useRouter } from "expo-router"; // Import Router
import { useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraPage() {
  const router = useRouter(); // Initialize router
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null | undefined>(null);
  const cameraRef = useRef<CameraView>(null);

  // 1. Loading State
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Flip Camera
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // 4. Pick Image from Gallery
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Set to true if you want cropping
      quality: 1,
      base64: true, // We need the base64 to save/display it consistently with camera flow
    });

    if (!result.canceled) {
      // If user picked an image, set it as the current photo
      // result.assets[0].base64 might be null if we don't request it, but we did.
      // However, for consistency with our "photo" state which expects a base64 string or URI...
      // Our preview logic uses `data:image/jpeg;base64,${photo}`.
      // So we should strictly set the base64 string here.

      if (result.assets[0].base64) {
        setPhoto(result.assets[0].base64);
      } else {
        // Fallback if base64 is missing (sometimes happens on large files without options),
        // but since we passed base64: true, it should be there.
        // For now we assume it works.
      }
    }
  };

  // 5. Take Picture
  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });

        if (photo) {
          const result = await manipulateAsync(
            photo.uri,
            [{ resize: { width: 1080 } }],
            {
              compress: 0.5,
              format: SaveFormat.JPEG,
              base64: true,
            }
          );
          setPhoto(result.base64);
        }
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  }

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem("userId");
    axios
      .post(
        "https://unsurviving-melania-shroudlike.ngrok-free.dev/upload-photo",
        {
          UserId: userId,
          Photo_data: photo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response.data.message);
        alert("Photo uploaded successfully!");
        // setPhoto(null); // Reset after upload
        router.push("/main");
      })
      .catch(function (error) {
        console.log(error.status);
        alert("Failed to upload photo.");
      });
  };

  // 6. Review Photo Screen
  if (photo) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${photo}` }}
          style={styles.previewImage}
          resizeMode="contain"
        />
        <View style={styles.previewControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.retakeButton]}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.controlText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Save Photo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 7. Camera View
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Top Bar: Back Button */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/main")}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.cameraControlsContainer}>
          {/* Left: Gallery Button */}
          <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          {/* Center: Snap Button */}
          <TouchableOpacity
            style={styles.snapButtonOuter}
            onPress={takePicture}
          >
            <View style={styles.snapButtonInner} />
          </TouchableOpacity>

          {/* Right: Flip Button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  // Top Bar
  topBar: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
  },
  permissionButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Camera Controls
  cameraControlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
    color: "white",
  },
  snapButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)", // Semi-transparent ring
    justifyContent: "center",
    alignItems: "center",
  },
  snapButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white", // Solid white circle
  },
  // Preview / Review Styles
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    backgroundColor: "black",
    paddingBottom: 40,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 120,
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: "#374151", // Dark gray
  },
  saveButton: {
    backgroundColor: "#2563EB", // Brand Blue
  },
  controlText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
