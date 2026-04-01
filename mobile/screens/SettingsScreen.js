import React from "react";
import { StyleSheet, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { AppButton, AppInput, Card, PageHeader, Screen, SubText } from "../components/ui";
import { colors, spacing } from "../theme";
import { useAppStore } from "../store/appStore";

export default function SettingsScreen({ navigation }) {
  const { serverUrl, setServerUrl } = useAppStore();

  return (
    <Screen>
      <PageHeader
        eyebrow="Config"
        title="Staff settings"
        subtitle="Adjust the backend endpoint and safely end the current session."
      />

      <Card style={styles.card}>
        <Text style={styles.label}>Server URL</Text>
        <SubText style={styles.help}>Point the app at your active TouchPointe server.</SubText>
        <AppInput value={serverUrl} onChangeText={setServerUrl} style={styles.input} autoCapitalize="none" />
        <AppButton
          title="Logout"
          variant="danger"
          onPress={async () => {
            await SecureStore.deleteItemAsync("staff_jwt");
            navigation.replace("Login");
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSoft,
  },
  label: {
    color: colors.text,
    fontWeight: "900",
    marginBottom: spacing.xs,
  },
  help: {
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
  },
});
