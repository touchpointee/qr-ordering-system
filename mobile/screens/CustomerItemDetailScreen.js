import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { customerColors, radius, spacing } from "../theme";
import { useAppStore } from "../store/appStore";

export default function CustomerItemDetailScreen({ route, navigation }) {
  const { item } = route.params || {};
  const addToCustomerCart = useAppStore((s) => s.addToCustomerCart);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  if (!item) {
    return (
      <View style={styles.screen}>
        <Text style={styles.error}>Item not found.</Text>
      </View>
    );
  }

  function addToCart() {
    addToCustomerCart({
      menuItemId: item._id,
      kitchenId: item.kitchenId,
      name: item.name,
      price: item.price,
      qty,
      note,
      image: item.image || "",
    });
    navigation.goBack();
  }

  return (
    <View style={styles.screen}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.hero} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroFallbackTxt}>{item.name?.[0] || "F"}</Text>
        </View>
      )}

      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>Rs {item.price}</Text>
      <Text style={styles.desc}>{item.description || "Fresh and delicious, made to order."}</Text>

      <TextInput
        value={note}
        onChangeText={setNote}
        style={styles.note}
        placeholder="Add note (optional)"
        placeholderTextColor={customerColors.subtext}
        multiline
      />

      <View style={styles.qtyRow}>
        <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnTxt}>-</Text>
        </Pressable>
        <Text style={styles.qtyVal}>{qty}</Text>
        <Pressable onPress={() => setQty((q) => q + 1)} style={[styles.qtyBtn, styles.qtyBtnActive]}>
          <Text style={[styles.qtyBtnTxt, styles.qtyBtnTxtActive]}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={addToCart} style={styles.addBtn}>
        <Text style={styles.addBtnTxt}>Add to Cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: customerColors.bg, padding: spacing.md },
  error: { color: "#B91C1C", fontWeight: "700" },
  hero: { width: "100%", height: 260, borderRadius: radius.lg },
  heroFallback: {
    width: "100%",
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: "#FFE8DE",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFallbackTxt: { fontSize: 62, fontWeight: "800", color: customerColors.primary },
  title: { marginTop: spacing.md, color: customerColors.text, fontSize: 28, fontWeight: "800" },
  price: { marginTop: 4, color: customerColors.primary, fontSize: 24, fontWeight: "800" },
  desc: { marginTop: spacing.sm, color: "#666666", lineHeight: 22 },
  note: {
    marginTop: spacing.md,
    minHeight: 90,
    borderWidth: 1,
    borderColor: customerColors.border,
    borderRadius: radius.md,
    backgroundColor: customerColors.surface,
    padding: spacing.sm,
    color: customerColors.text,
    textAlignVertical: "top",
  },
  qtyRow: { marginTop: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: customerColors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: customerColors.border,
  },
  qtyBtnActive: { backgroundColor: "#111111", borderColor: "#111111" },
  qtyBtnTxt: { color: customerColors.text, fontSize: 20, fontWeight: "700" },
  qtyBtnTxtActive: { color: customerColors.onPrimary },
  qtyVal: { minWidth: 24, textAlign: "center", fontSize: 18, fontWeight: "700", color: customerColors.text },
  addBtn: { marginTop: spacing.lg, backgroundColor: customerColors.primary, borderRadius: radius.pill, paddingVertical: 14, alignItems: "center" },
  addBtnTxt: { color: customerColors.onPrimary, fontWeight: "800", fontSize: 16 },
});
