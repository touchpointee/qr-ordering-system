import React, { useEffect, useState } from "react";
import { Text, FlatList, Pressable, StyleSheet, View } from "react-native";
import { Card, PageHeader, Screen, StatusBadge, SubText } from "../components/ui";
import { colors, spacing } from "../theme";

export default function MenuManagementScreen({ route }) {
  const api = route.params?.api;
  const [items, setItems] = useState([]);
  const load = () => api.get("/api/admin/menu/items").then((r) => setItems(r.data.data || []));
  useEffect(() => { if (api) load(); }, [api]);
  async function toggle(id) { await api.patch(`/api/admin/menu/items/${id}/toggle`); load(); }
  return (
    <Screen>
      <PageHeader title="Menu Management" subtitle="Tap an item to toggle availability quickly." />
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggle(item._id)}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <StatusBadge label={item.isAvailable ? "Available" : "Off"} tone={item.isAvailable ? "success" : "danger"} />
              </View>
              <Text style={styles.meta}>Rs {item.price || "-"}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  card: { marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { color: colors.text, fontWeight: "800", flex: 1, marginRight: spacing.sm },
  meta: { color: colors.subtext },
});
