import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { customerColors, radius, spacing } from "../theme";
import { useAppStore } from "../store/appStore";

export default function CustomerCartScreen({ route }) {
  const serverUrl = useAppStore((s) => s.serverUrl);
  const customerCart = useAppStore((s) => s.customerCart);
  const updateCustomerQty = useAppStore((s) => s.updateCustomerQty);
  const clearCustomerCart = useAppStore((s) => s.clearCustomerCart);
  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState("");
  const session = route.params?.session || null;

  const total = useMemo(
    () => customerCart.reduce((sum, row) => sum + Number(row.price) * Number(row.qty), 0),
    [customerCart]
  );

  async function placeOrder() {
    if (!session || customerCart.length === 0) {
      setNotice("Load a valid session and add items first");
      return;
    }
    try {
      setPlacing(true);
      setNotice("");
      const payload = {
        restaurantId: session.restaurant.id,
        tableId: session.table.id,
        sessionId: session.sessionId,
        items: customerCart.map((c) => ({
          menuItemId: c.menuItemId,
          kitchenId: c.kitchenId,
          qty: c.qty,
          note: c.note || "",
        })),
      };
      const res = await fetch(`${serverUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(json.error || "Failed to place order");
        return;
      }
      clearCustomerCart();
      setNotice("Order placed successfully");
    } catch (err) {
      setNotice("Unable to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Cart</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {customerCart.map((item) => (
          <View style={styles.row} key={item.menuItemId}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
              <View style={styles.imageFallback}>
                <Text style={styles.imageFallbackTxt}>{item.name?.[0] || "F"}</Text>
              </View>
            )}
            <View style={styles.main}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.note}>{item.note || "No note"}</Text>
              <Text style={styles.price}>Rs {item.price}</Text>
            </View>
            <View style={styles.qtyWrap}>
              <Pressable style={styles.qtyBtn} onPress={() => updateCustomerQty(item.menuItemId, -1)}>
                <Text style={styles.qtyBtnTxt}>-</Text>
              </Pressable>
              <Text style={styles.qtyVal}>{item.qty}</Text>
              <Pressable style={[styles.qtyBtn, styles.qtyPlus]} onPress={() => updateCustomerQty(item.menuItemId, 1)}>
                <Text style={[styles.qtyBtnTxt, styles.qtyPlusTxt]}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sub-Total</Text>
          <Text style={styles.summaryValue}>Rs {total}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs {total}</Text>
        </View>
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <Pressable style={[styles.checkoutBtn, (placing || !customerCart.length) && styles.disabled]} disabled={placing || !customerCart.length} onPress={placeOrder}>
        <Text style={styles.checkoutTxt}>{placing ? "Placing..." : "Checkout"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: customerColors.bg, padding: spacing.md },
  heading: { fontSize: 28, fontWeight: "800", color: customerColors.text, marginBottom: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: customerColors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  image: { width: 58, height: 58, borderRadius: 12 },
  imageFallback: { width: 58, height: 58, borderRadius: 12, backgroundColor: "#FFE8DE", alignItems: "center", justifyContent: "center" },
  imageFallbackTxt: { color: customerColors.primary, fontWeight: "800" },
  main: { flex: 1 },
  name: { color: customerColors.text, fontWeight: "700" },
  note: { color: customerColors.subtext, fontSize: 12, marginTop: 1 },
  price: { color: customerColors.primary, fontWeight: "800", marginTop: 4 },
  qtyWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: customerColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: customerColors.surface,
  },
  qtyBtnTxt: { color: customerColors.text, fontWeight: "700" },
  qtyPlus: { backgroundColor: "#111111", borderColor: "#111111" },
  qtyPlusTxt: { color: customerColors.onPrimary },
  qtyVal: { minWidth: 18, textAlign: "center", color: customerColors.text, fontWeight: "700" },
  summary: { backgroundColor: customerColors.surface, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 2 },
  summaryLabel: { color: customerColors.subtext },
  summaryValue: { color: customerColors.text, fontWeight: "700" },
  totalLabel: { color: customerColors.text, fontSize: 18, fontWeight: "800" },
  totalValue: { color: customerColors.text, fontSize: 18, fontWeight: "800" },
  notice: { marginTop: spacing.sm, color: "#166534", textAlign: "center" },
  checkoutBtn: { marginTop: spacing.sm, backgroundColor: customerColors.primary, borderRadius: radius.pill, paddingVertical: 14, alignItems: "center" },
  checkoutTxt: { color: customerColors.onPrimary, fontWeight: "800", fontSize: 16 },
  disabled: { opacity: 0.65 },
});
