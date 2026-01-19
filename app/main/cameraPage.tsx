import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import axios from "axios";
import * as Brightness from "expo-brightness";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { LightSensor } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraPage() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null | undefined>(null);
  const [isDark, setIsDark] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  const isMounted = useRef(true);
  const originalBrightness = useRef<number | null>(null);

  const isBackFlashOn = facing === "back" && isDark && isFocused;

  useEffect(() => {
    isMounted.current = true;

    if (Platform.OS === "ios" || Platform.OS === "android") {
      LightSensor.setUpdateInterval(500);
      const subscription = LightSensor.addListener(({ illuminance }) => {
        if (isMounted.current) {
          setIsDark(illuminance < 15);
        }
      });
      return () => subscription.remove();
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      restoreBrightness();
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      restoreBrightness();
      setFlashActive(false);
    }
  }, [isFocused]);

  const restoreBrightness = async () => {
    if (originalBrightness.current !== null) {
      await Brightness.setBrightnessAsync(originalBrightness.current);
      originalBrightness.current = null;
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Permission needed</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].base64);
    }
  };

  async function takePicture() {
    if (cameraRef.current) {
      try {
        if (facing === "front" && isDark) {
          if (!isMounted.current) return;

          setFlashActive(true);

          originalBrightness.current = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1.0);
          // console.log(originalBrightness.current);

          await new Promise((resolve) => setTimeout(resolve, 300));

          if (!isMounted.current) return;
        }

        Vibration.vibrate(100);
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });

        if (photo) {
          const result = await manipulateAsync(
            photo.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.5, format: SaveFormat.JPEG, base64: true },
          );
          if (isMounted.current) {
            setPhoto(result.base64);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        if (isMounted.current) {
          setFlashActive(false);
        }
        await restoreBrightness();
      }
    }
  }

  const handleMatch = async () => {
    setLoading(true);
    axios
      .post(
        "https://unsurviving-melania-shroudlike.ngrok-free.dev/match-photo",
        {
          photoData: String(photo),
        },
        { headers: { "Content-Type": "application/json" } },
      )
      .then((response) => {
        // Alert.alert("Success", "Photo uploaded!");
        setPhoto(null);
        router.push({
          pathname: "/main/matchResult",
          params: {
            photo: String(photo),
            author: response.data.author,
            name: response.data.name,
            category: response.data.category,
            similarityDistance: response.data.similarityDistance,
            canSwap: response.data.canSwap,
          },
        });
        console.log(response.data.matched_photo);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to upload.");
        console.log(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Analyzing match...</Text>
      </View>
    );
  }

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
            onPress={handleMatch}
          >
            <Text style={styles.saveText}>Match</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {isFocused && (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          enableTorch={isBackFlashOn}
        >
          {flashActive && (
            <View style={styles.selfieOverlay} pointerEvents="none" />
          )}

          <SafeAreaView style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/main")}
            >
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>

            {(isBackFlashOn || (facing === "front" && isDark)) && (
              <View style={styles.flashIndicator}>
                <Ionicons
                  name={facing === "front" ? "sunny" : "flash"}
                  size={16}
                  color="black"
                />
                <Text style={styles.flashText}>
                  {facing === "front" ? " Flash Ready" : " Flash On"}
                </Text>
              </View>
            )}
          </SafeAreaView>

          <View style={styles.cameraControlsContainer}>
            <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.snapButtonOuter}
              onPress={takePicture}
            >
              <View style={styles.snapButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sideButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="sync-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  selfieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 5,
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: { color: "white", fontSize: 20, fontWeight: "bold" },
  flashIndicator: {
    backgroundColor: "rgba(255, 215, 0, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flashText: { color: "black", fontWeight: "bold", fontSize: 12 },
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
  iconText: { fontSize: 24, color: "white" },
  snapButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  snapButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  previewImage: { flex: 1, width: "100%" },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    backgroundColor: "black",
    paddingBottom: 40,
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
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 120,
    alignItems: "center",
  },
  retakeButton: { backgroundColor: "#374151" },
  saveButton: { backgroundColor: "#2563EB" },
  controlText: { color: "white", fontSize: 16, fontWeight: "600" },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
