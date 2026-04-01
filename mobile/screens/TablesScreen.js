import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Card, PageHeader, Screen, StatCard, TableStatusChip } from "../components/ui";
import { colors, radius, spacing } from "../theme";

function tableStatus(table) {
  if (table.billRequested) return { label: "Bill Requested", status: "bill" };
  if (table.currentSessionId) return { label: "Occupied", status: "occupied" };
  return { label: "Free", status: "free" };
}

export default function TablesScreen({ navigation, route }) {
  const api = route.params?.api;
  const [tables, setTables] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = useCallback(async () => {
    if (!api) return;
    const res = await api.get("/api/admin/tables");
    setTables(res.data.data || []);
  }, [api]);

  useEffect(() => {
    loadTables().catch(() => {});
  }, [loadTables]);

  const occupied = useMemo(() => tables.filter((table) => table.currentSessionId && !table.billRequested).length, [tables]);
  const billRequested = useMemo(() => tables.filter((table) => table.billRequested).length, [tables]);
  const free = useMemo(() => tables.filter((table) => !table.currentSessionId && !table.billRequested).length, [tables]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Floor map"
        title="Tables at a glance"
        subtitle="Open a table to handle occupancy or billing in one tap."
      />

      <View style={styles.stats}>
        <StatCard label="All" value={tables.length} style={styles.stat} />
        <StatCard label="Free" value={free} tone="success" style={styles.stat} />
        <StatCard label="Occupied" value={occupied} tone="warning" style={styles.stat} />
        <StatCard label="Bill" value={billRequested} tone="primary" style={styles.stat} />
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await loadTables();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        renderItem={({ item }) => {
          const status = tableStatus(item);
          return (
            <Pressable
              onPress={() => navigation.navigate("TableDetail", { table: item, api })}
              style={({ pressed }) => [styles.wrap, pressed ? styles.wrapPressed : null]}
            >
              <Card style={[styles.card, item.billRequested ? styles.cardBill : item.currentSessionId ? styles.cardOccupied : styles.cardFree]}>
                <View style={styles.cardTop}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.code}>#{item._id.slice(-4).toUpperCase()}</Text>
                </View>
                <View style={styles.cardBottom}>
                  <TableStatusChip {...status} />
                  <Text style={styles.hint}>{item.currentSessionId ? "Tap to manage" : "Ready for seating"}</Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
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
    width: "48%",
  },
  list: {
    paddingBottom: 120,
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  wrap: {
    flex: 1,
  },
  wrapPressed: {
    opacity: 0.94,
  },
  card: {
    minHeight: 148,
    borderRadius: radius.lg,
    justifyContent: "space-between",
  },
  cardFree: {
    backgroundColor: colors.surface,
  },
  cardOccupied: {
    backgroundColor: colors.warningBg,
  },
  cardBill: {
    backgroundColor: colors.primarySoft,
  },
  cardTop: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  code: {
    color: colors.subtext,
    fontWeight: "700",
  },
  cardBottom: {
    gap: spacing.sm,
  },
  hint: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: "700",
  },
});
