import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, PageHeader, Screen, StatusBadge, StatCard, SubText } from "../components/ui";
import { colors, spacing } from "../theme";

function tone(status) {
  if (status === "ready") return "success";
  if (status === "preparing") return "warning";
  if (status === "pending") return "neutral";
  return "neutral";
}

export default function ActiveOrdersScreen({ route }) {
  const api = route.params?.api;
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!api) return;
    const res = await api.get("/api/orders");
    const allOrders = res.data.orders || [];
    setOrders(allOrders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)));
  }, [api]);

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  const readyCount = useMemo(() => orders.filter((order) => order.status === "ready").length, [orders]);
  const pendingCount = useMemo(() => orders.filter((order) => order.status === "pending").length, [orders]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Kitchen queue"
        title="Live order board"
        subtitle="Track pending, preparing, and ready tickets without digging."
      />

      <View style={styles.stats}>
        <StatCard label="Queue" value={orders.length} tone="primary" style={styles.stat} />
        <StatCard label="Pending" value={pendingCount} tone="warning" style={styles.stat} />
        <StatCard label="Ready" value={readyCount} tone="success" style={styles.stat} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await loadOrders();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.id}>#{item._id.slice(-6).toUpperCase()}</Text>
                <SubText>Table {item.tableName || item.tableId || "-"}</SubText>
              </View>
              <StatusBadge label={item.status} tone={tone(item.status)} />
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaBlock}>
                <Text style={styles.metaValue}>{(item.items || []).length}</Text>
                <Text style={styles.metaLabel}>Items</Text>
              </View>
              <View style={styles.metaBlock}>
                <Text style={styles.metaValue}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}</Text>
                <Text style={styles.metaLabel}>Created</Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState title="No active orders" subtitle="The queue is clear right now." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    width: "31%",
  },
  list: {
    gap: spacing.sm,
    paddingBottom: 120,
  },
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  main: {
    flex: 1,
  },
  id: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaBlock: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: spacing.sm,
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  metaLabel: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});
