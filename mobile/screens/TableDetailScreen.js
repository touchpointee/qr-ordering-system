import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton, Card, PageHeader, Screen, TableStatusChip, SubText } from "../components/ui";
import { colors, spacing } from "../theme";

export default function TableDetailScreen({ route }) {
  const { table, api } = route.params;
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const status = useMemo(() => {
    if (table.billRequested) return { label: "Bill Requested", status: "bill" };
    if (table.currentSessionId) return { label: "Occupied", status: "occupied" };
    return { label: "Free", status: "free" };
  }, [table]);

  async function requestBill() {
    try {
      setSaving(true);
      await api.patch(`/api/admin/tables/${table._id}`, { billRequested: true });
      setMsg("Bill request sent for this table");
    } catch (error) {
      setMsg(error?.response?.data?.error || "Unable to request bill");
    } finally {
      setSaving(false);
    }
  }

  async function markFree() {
    try {
      setSaving(true);
      await api.patch(`/api/admin/tables/${table._id}`, { billRequested: false, currentSessionId: null });
      setMsg("Table marked free");
    } catch (error) {
      setMsg(error?.response?.data?.error || "Unable to mark table free");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Table control"
        title={table.name}
        subtitle="Resolve billing or reset the table from one compact control panel."
      />

      <Card style={styles.hero}>
        <Text style={styles.code}>Table #{table._id.slice(-6).toUpperCase()}</Text>
        <TableStatusChip label={status.label} status={status.status} />
        <SubText style={styles.heroText}>
          {table.currentSessionId ? "There is an active session on this table." : "This table is currently available for seating."}
        </SubText>
      </Card>

      <Card style={styles.actions}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <AppButton title="Request Bill" variant="soft" onPress={requestBill} loading={saving} style={styles.btn} />
        <AppButton title="Mark Table Free" variant="success" onPress={markFree} loading={saving} />
      </Card>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  code: {
    color: colors.subtext,
    fontWeight: "800",
  },
  heroText: {
    marginTop: spacing.xs,
  },
  actions: {
    backgroundColor: colors.surfaceSoft,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  btn: {
    marginBottom: spacing.sm,
  },
  msg: {
    marginTop: spacing.md,
    color: colors.primaryDark,
    fontWeight: "700",
  },
});
