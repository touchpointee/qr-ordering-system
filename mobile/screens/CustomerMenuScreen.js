import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { customerColors, radius, spacing } from "../theme";
import { useAppStore } from "../store/appStore";

export default function CustomerMenuScreen({ navigation }) {
  const serverUrl = useAppStore((s) => s.serverUrl);
  const customerCart = useAppStore((s) => s.customerCart);
  const [qrToken, setQrToken] = useState("");
  const [session, setSession] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [subcategoryIndex, setSubcategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const cartCount = useMemo(() => customerCart.reduce((sum, row) => sum + Number(row.qty), 0), [customerCart]);
  const categories = useMemo(() => menu.filter((c) => (c.subcategories || []).length > 0 || (c.items || []).length > 0), [menu]);
  const currentCategory = categories[categoryIndex] || null;
  const subcategories = useMemo(() => {
    if (!currentCategory) return [];
    if ((currentCategory.subcategories || []).length > 0) return currentCategory.subcategories;
    return [{ _id: `${currentCategory._id}-default`, name: currentCategory.name, items: currentCategory.items || [] }];
  }, [currentCategory]);
  const currentSubcategory = subcategories[subcategoryIndex] || null;
  const items = currentSubcategory?.items || [];

  async function loadMenuFromToken() {
    if (!qrToken.trim()) {
      setNotice("Enter QR token first");
      return;
    }
    try {
      setLoading(true);
      setNotice("");
      const sessionRes = await fetch(`${serverUrl}/api/session/${qrToken.trim()}`);
      const sessionJson = await sessionRes.json();
      if (!sessionRes.ok) {
        setNotice(sessionJson.error || "Invalid session token");
        return;
      }
      const menuRes = await fetch(`${serverUrl}/api/menu/${sessionJson.restaurant.id}`);
      const menuJson = await menuRes.json();
      if (!menuRes.ok) {
        setNotice(menuJson.error || "Failed to load menu");
        return;
      }
      setSession(sessionJson);
      setMenu(menuJson.categories || []);
      setCategoryIndex(0);
      setSubcategoryIndex(0);
      setNotice("");
    } catch (err) {
      setNotice("Unable to load menu");
    } finally {
      setLoading(false);
    }
  }

  function openItem(item) {
    if (!session) return;
    navigation.navigate("CustomerItemDetail", { item, session });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Customer Order</Text>
      <Text style={styles.subHeading}>Enter table QR token to start ordering</Text>

      <View style={styles.tokenRow}>
        <TextInput
          value={qrToken}
          onChangeText={setQrToken}
          style={styles.input}
          placeholder="QR token"
          placeholderTextColor={customerColors.subtext}
          autoCapitalize="none"
        />
        <Pressable onPress={loadMenuFromToken} style={[styles.primaryBtn, loading && styles.disabled]} disabled={loading}>
          <Text style={styles.primaryBtnTxt}>{loading ? "Loading..." : "Load"}</Text>
        </Pressable>
      </View>

      {session ? <Text style={styles.sessionMeta}>{session.restaurant?.name} - Table {session.table?.name}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {categories.map((category, idx) => (
          <Pressable
            key={category._id}
            onPress={() => {
              setCategoryIndex(idx);
              setSubcategoryIndex(0);
            }}
            style={[styles.chip, idx === categoryIndex ? styles.chipActive : null]}
          >
            <Text style={[styles.chipTxt, idx === categoryIndex ? styles.chipTxtActive : null]}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {subcategories.map((subcategory, idx) => (
          <Pressable
            key={subcategory._id}
            onPress={() => setSubcategoryIndex(idx)}
            style={[styles.subChip, idx === subcategoryIndex ? styles.subChipActive : null]}
          >
            <Text style={[styles.subChipTxt, idx === subcategoryIndex ? styles.subChipTxtActive : null]}>{subcategory.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => openItem(item)} style={styles.card}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImageFallback}>
                <Text style={styles.cardImageFallbackTxt}>{item.name?.[0] || "F"}</Text>
              </View>
            )}
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text numberOfLines={2} style={styles.cardDesc}>{item.description || "Fresh and delicious item."}</Text>
              <Text style={styles.cardPrice}>Rs {item.price}</Text>
            </View>
            <View style={styles.addPill}>
              <Text style={styles.addPillTxt}>+ Add</Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable style={styles.cartFab} onPress={() => navigation.navigate("CustomerCart", { session })}>
        <Text style={styles.cartFabTxt}>Cart ({cartCount})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: customerColors.bg, padding: spacing.md, paddingBottom: 90 },
  heading: { fontSize: 26, fontWeight: "800", color: customerColors.text },
  subHeading: { marginTop: 4, color: customerColors.subtext },
  tokenRow: { marginTop: spacing.md, flexDirection: "row", gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: customerColors.surface,
    borderWidth: 1,
    borderColor: customerColors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: customerColors.text,
  },
  primaryBtn: {
    backgroundColor: customerColors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.7 },
  primaryBtnTxt: { color: customerColors.onPrimary, fontWeight: "700" },
  sessionMeta: { marginTop: spacing.sm, color: customerColors.text, fontWeight: "700" },
  notice: { marginTop: spacing.xs, color: "#B91C1C", fontSize: 12 },
  chipsRow: { gap: spacing.sm, marginTop: spacing.md, paddingBottom: spacing.xs },
  chip: { borderRadius: radius.pill, backgroundColor: customerColors.surface, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: customerColors.primary },
  chipTxt: { color: customerColors.text, fontSize: 12, fontWeight: "700" },
  chipTxtActive: { color: customerColors.onPrimary },
  subChip: { borderRadius: radius.pill, backgroundColor: "#FFF1EA", paddingHorizontal: 14, paddingVertical: 8 },
  subChipActive: { backgroundColor: "#1A1A1A" },
  subChipTxt: { color: customerColors.primary, fontSize: 12, fontWeight: "700" },
  subChipTxtActive: { color: customerColors.onPrimary },
  listContent: { paddingTop: spacing.sm, gap: spacing.sm },
  card: {
    backgroundColor: customerColors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardImage: { width: 62, height: 62, borderRadius: 12 },
  cardImageFallback: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#FFE8DE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImageFallbackTxt: { color: customerColors.primary, fontWeight: "800", fontSize: 18 },
  cardMain: { flex: 1 },
  cardTitle: { color: customerColors.text, fontWeight: "700", fontSize: 16 },
  cardDesc: { color: customerColors.subtext, marginTop: 2, fontSize: 12 },
  cardPrice: { color: customerColors.primary, marginTop: 4, fontWeight: "800" },
  addPill: { backgroundColor: "#FFF1EA", borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  addPillTxt: { color: customerColors.primary, fontWeight: "700", fontSize: 12 },
  cartFab: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: customerColors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  cartFabTxt: { color: customerColors.onPrimary, fontWeight: "800" },
});
