import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppButton, AppInput, Card, Heading, Screen, SubText } from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { useApi } from "../services/useApi";
import { setSecureItem } from "../lib/secureStorage";

export default function LoginScreen({ navigation }) {
  const api = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }
      setLoading(true);
      setError("");
      const res = await api.post("/api/auth/login", { email, password });
      await setSecureItem("staff_jwt", res.data.token);
      await setSecureItem("staff_user", JSON.stringify(res.data.user || {}));
      await AsyncStorage.setItem("staff_user_cache", JSON.stringify(res.data.user || {}));
      navigation.replace("Main");
    } catch (e) {
      setError(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>TP</Text>
        </View>
        <Text style={styles.eyebrow}>Staff Access</Text>
        <Heading style={styles.title}>Run the floor with clarity.</Heading>
        <SubText style={styles.subtitle}>
          Sign in to manage tables, send orders, and keep service moving from one focused console.
        </SubText>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>Live</Text>
            <Text style={styles.heroStatLabel}>orders</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>Fast</Text>
            <Text style={styles.heroStatLabel}>table actions</Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <SubText style={styles.cardSubtitle}>Use your staff credentials to continue.</SubText>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <AppInput
            value={email}
            onChangeText={setEmail}
            placeholder="staff@restaurant.com"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <AppInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton title="Sign In" onPress={login} loading={loading} style={styles.signInButton} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.text,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  eyebrow: {
    color: "#D9C9B7",
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  title: {
    color: colors.onPrimary,
    maxWidth: 260,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: "#E9DDD0",
    maxWidth: 290,
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  heroStatValue: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#D9C9B7",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },
  card: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: colors.subtext,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: 0,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  signInButton: {
    marginTop: spacing.xs,
  },
});
