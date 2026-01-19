import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as LocalAuthentication from "expo-local-authentication";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ErrorCard = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) => {
  if (!message) return null;
  return (
    <View style={errorStyles.container}>
      <View style={errorStyles.content}>
        <Text style={errorStyles.title}>Error</Text>
        <Text style={errorStyles.message}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={errorStyles.closeButton}>
          <Text style={errorStyles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const loginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasBiometricToken, setHasBiometricToken] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(supported);

      const token = await SecureStore.getItemAsync("biometric_user_id");
      setHasBiometricToken(!!token);
    })();
  }, []);

  const handlePress = async () => {
    setErrorMessage("");
    await handleLogin();
  };

  const handleLogin = async () => {
    axios
      .post(
        "https://unsurviving-melania-shroudlike.ngrok-free.dev/login",
        {
          Email: email,
          Password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then(async function (response) {
        if (response.data.message === "Login successful.") {
          const receivedUserId = String(response.data.userId);

          await AsyncStorage.setItem("userId", receivedUserId);

          if (isBiometricSupported && !hasBiometricToken) {
            Alert.alert(
              "Enable Biometric Login?",
              "Do you want to enable fingerprint/face ID login for next time?",
              [
                { text: "No Thanks", style: "cancel" },
                {
                  text: "Enable",
                  onPress: async () => {
                    await SecureStore.setItemAsync(
                      "biometric_user_id",
                      receivedUserId,
                    );
                    setHasBiometricToken(true);
                    router.push("/main");
                  },
                },
              ],
            );
          } else {
            router.push("/main");
          }
        }
      })
      .catch(function (error) {
        if (error.response) {
          setErrorMessage(error.response.data.message || "Login failed.");
        } else {
          setErrorMessage("Network error or server unreachable.");
        }
      });
  };

  const handleBiometricAuth = async () => {
    setErrorMessage("");
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        setErrorMessage("Biometric security is not set up on your device.");
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Fingerprint / Face ID",
        cancelLabel: "Use Password",
      });

      if (authResult.success) {
        const storedUserId =
          await SecureStore.getItemAsync("biometric_user_id");

        if (storedUserId) {
          await AsyncStorage.setItem("userId", storedUserId);
          router.replace("/main");
        } else {
          setErrorMessage(
            "Secure biometric token not found. Please log in with password.",
          );
          setHasBiometricToken(false);
        }
      } else {
        setErrorMessage("Biometric authentication failed or was cancelled.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not start biometric authentication.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <ErrorCard
            message={errorMessage}
            onDismiss={() => setErrorMessage("")}
          />

          <View style={styles.formContainer}>
            {isBiometricSupported && hasBiometricToken && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
              >
                <Text style={styles.biometricButtonText}>
                  Login with Biometrics
                </Text>
              </TouchableOpacity>
            )}

            {isBiometricSupported && hasBiometricToken && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(value) => setEmail(value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(value) => setPassword(value)}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handlePress}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/pages/registerPage" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Register</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const errorStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    color: "#B91C1C",
    fontSize: 13,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeText: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  biometricButton: {
    marginTop: 0,
    backgroundColor: "#F3F4F6",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  biometricButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    width: 30,
    textAlign: "center",
    color: "#9CA3AF",
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default loginPage;
