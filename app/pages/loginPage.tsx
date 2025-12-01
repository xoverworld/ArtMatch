import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const loginPage = () => {
  const handlePress = async () => {
    await handleLogin();
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        }
      )
      .then(function (response) {
        console.log(response.data.message);
        if (response.data.message === "Login successful.") {
          console.log(response.data.userId);
          AsyncStorage.setItem("userId", response.data.userId);
          router.push("/main");
        }
      })
      .catch(function (error) {
        setError(error.response.data.message);
      });
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

          {error !== "" && (
            <View style={errorStyles.container}>
              <Text style={errorStyles.title}>Error: </Text>
              <Text style={errorStyles.message}>{error}</Text>
            </View>
          )}
          <View style={styles.formContainer}>
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
    marginTop: 32,
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

const errorStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2", // Soft red background
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444", // Bright red accent
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // Shadow
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
    color: "#991B1B", // Dark red title
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    color: "#B91C1C", // Slightly lighter red text
    fontSize: 13,
  },
});

export default loginPage;
