import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, PageHeader, QuickActionCard, Screen, StatCard, SubText } from "../components/ui";
import { ACTIVE_STATUSES, colors, radius, spacing } from "../theme";

export default function DashboardScreen({ navigation, route }) {
  const api = route.params?.api;
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, ready: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!api) return;
    const res = await api.get("/api/orders");
    const orders = res.data.orders || [];
    const active = orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const ready = orders.filter((order) => order.status === "ready").length;
    setStats({ total: orders.length, active, pending, ready });
  }, [api]);

  useEffect(() => {
    loadStats().catch(() => {});
  }, [loadStats]);

  const healthMessage = useMemo(() => {
    if (stats.pending >= 8) return "Queue is building up. Pull staff toward pending tickets first.";
    if (stats.ready >= 4) return "Several orders are ready. Push table handoff and pickup now.";
    if (stats.active === 0) return "Floor is calm right now. Good moment to reset tables and prep.";
    return "Service is moving well. Keep table turns smooth and watch the ready queue.";
  }, [stats]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await loadStats();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
      >
        <PageHeader
          eyebrow="Staff HQ"
          title="Service pulse"
          subtitle="A calmer, faster control view for live service."
        />

        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>Current focus</Text>
          <Text style={styles.heroTitle}>{stats.pending > 0 ? `${stats.pending} tickets need attention` : "Queue is under control"}</Text>
          <SubText style={styles.heroText}>{healthMessage}</SubText>
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{stats.active}</Text>
              <Text style={styles.heroMetricLabel}>Live now</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{stats.ready}</Text>
              <Text style={styles.heroMetricLabel}>Ready pickup</Text>
            </View>
          </View>
        </Card>

        <View style={styles.grid}>
          <StatCard label="All Orders" value={stats.total} style={styles.stat} />
          <StatCard label="Active" value={stats.active} tone="primary" style={styles.stat} />
          <StatCard label="Pending" value={stats.pending} tone="warning" style={styles.stat} />
          <StatCard label="Ready" value={stats.ready} tone="success" style={styles.stat} />
        </View>

        <Text style={styles.sectionTitle}>Quick moves</Text>
        <View style={styles.quickRow}>
          <QuickActionCard
            title="Open queue"
            subtitle="Jump straight into live orders and clear bottlenecks."
            tone="accent"
            onPress={() => navigation.navigate("Orders")}
          />
          <QuickActionCard
            title="Create order"
            subtitle="Start a fresh dine-in order without losing pace."
            onPress={() => navigation.navigate("New Order")}
          />
        </View>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>Shift guidance</Text>
          <Text style={styles.tipText}>
            When the kitchen backs up, prioritize pending tickets, then sweep ready pickups before opening new tables.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.text,
    borderColor: colors.text,
    marginBottom: spacing.md,
  },
  heroLabel: {
    color: "#D9C9B7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.onPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  heroText: {
    color: "#EDE3D7",
    marginTop: spacing.sm,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroMetric: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  heroMetricValue: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  heroMetricLabel: {
    color: "#D9C9B7",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  stat: {
    width: "48%",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickRow: {
    gap: spacing.sm,
  },
  tipCard: {
    marginTop: spacing.md,
    marginBottom: 120,
    backgroundColor: colors.surfaceSoft,
  },
  tipTitle: {
    color: colors.text,
    fontWeight: "900",
    marginBottom: 6,
  },
  tipText: {
    color: colors.subtext,
    lineHeight: 20,
  },
});
