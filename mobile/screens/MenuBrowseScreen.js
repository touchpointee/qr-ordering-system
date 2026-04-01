import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppButton,
  AppInput,
  Card,
  EmptyState,
  LoadingView,
  PageHeader,
  Screen,
  SectionHeader,
  SubText,
} from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { useApi } from "../services/useApi";
import { getSecureItem } from "../lib/secureStorage";

export default function MenuBrowseScreen({ route }) {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [subcategoryIndex, setSubcategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      let rid = route.params?.restaurantId;
      if (!rid) {
        const userRaw = await getSecureItem("staff_user");
        const user = userRaw ? JSON.parse(userRaw) : {};
        rid = user.restaurantId || "";
      }
      if (!rid) throw new Error("Restaurant not found in staff profile");
      const res = await api.get(`/api/menu/${rid}`);
      setCategories(res.data.categories || []);
      setCategoryIndex(0);
      setSubcategoryIndex(0);
      await AsyncStorage.setItem("offline_menu", JSON.stringify(res.data.categories || []));
    } catch (e) {
      setError(e?.response?.data?.error || "Offline mode: showing cached menu");
      const raw = await AsyncStorage.getItem("offline_menu");
      setCategories(raw ? JSON.parse(raw) : []);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    if (api) load().catch(() => {});
  }, [api, route.params?.restaurantId]);

  const browsableCategories = useMemo(
    () => categories.filter((category) => (category.subcategories || []).length > 0 || (category.items || []).length > 0),
    [categories]
  );
  const currentCategory = browsableCategories[categoryIndex] || null;
  const currentSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    if ((currentCategory.subcategories || []).length > 0) return currentCategory.subcategories;
    return [{ _id: `${currentCategory._id}-default`, name: currentCategory.name, items: currentCategory.items || [] }];
  }, [currentCategory]);
  const currentSubcategory = currentSubcategories[subcategoryIndex] || null;
  const visibleItems = useMemo(() => {
    const items = currentSubcategory?.items || [];
    return items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  }, [currentSubcategory, query]);

  return (
    <Screen>
      <PageHeader
        eyebrow="Reference mode"
        title="Menu library"
        subtitle="Browse the full menu quickly with a cleaner sectioned view."
      />

      <Card style={styles.banner}>
        <Text style={styles.bannerTitle}>{browsableCategories.length} categories loaded</Text>
        <SubText>{error ? "Cached menu is being shown." : "Use this view to answer questions fast on the floor."}</SubText>
      </Card>

      <AppInput placeholder="Search menu items" value={query} onChangeText={setQuery} style={styles.search} />
      {loading ? <LoadingView label="Loading menu..." /> : null}
      {!loading && !!error ? <AppButton title="Retry" onPress={() => load()} variant="soft" style={styles.retry} /> : null}
      {!loading && !!error ? <SubText style={styles.error}>{error}</SubText> : null}
      {!loading && browsableCategories.length === 0 ? <EmptyState title="No menu items" subtitle="Set up categories, subcategories, and items in the portal." /> : null}

      {!loading && browsableCategories.length > 0 ? (
        <>
          <SectionHeader title="Categories" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {browsableCategories.map((category, index) => (
              <Text
                key={category._id}
                onPress={() => {
                  setCategoryIndex(index);
                  setSubcategoryIndex(0);
                }}
                style={[styles.chip, index === categoryIndex ? styles.chipActive : null]}
              >
                {category.name}
              </Text>
            ))}
          </ScrollView>

          {currentSubcategories.length > 0 ? (
            <>
              <SectionHeader title="Subcategories" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {currentSubcategories.map((subcategory, index) => (
                  <Text
                    key={subcategory._id}
                    onPress={() => setSubcategoryIndex(index)}
                    style={[styles.subChip, index === subcategoryIndex ? styles.subChipActive : null]}
                  >
                    {subcategory.name}
                  </Text>
                ))}
              </ScrollView>
            </>
          ) : null}
        </>
      ) : null}

      <SectionList
        sections={[{ title: currentSubcategory?.name || "Items", data: visibleItems }]}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        renderSectionHeader={({ section }) => section.data.length > 0 ? <SectionHeader title={section.title} /> : null}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemTop}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>Rs {item.price}</Text>
            </View>
            <Text numberOfLines={2} style={styles.itemDesc}>
              {item.description || "Menu item"}
            </Text>
          </Card>
        )}
        ListEmptyComponent={!loading ? <EmptyState title="No menu items" subtitle="Try a different search term or choose another subcategory." /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surfaceSoft,
    marginBottom: spacing.md,
  },
  bannerTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 4,
  },
  search: {
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
    fontWeight: "700",
  },
  chipActive: {
    backgroundColor: colors.text,
    color: colors.onPrimary,
  },
  subChip: {
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: "hidden",
    fontWeight: "700",
  },
  subChipActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  retry: {
    marginBottom: spacing.sm,
    alignSelf: "flex-start",
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: 120,
  },
  itemCard: {
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  itemName: {
    color: colors.text,
    fontWeight: "900",
    flex: 1,
    marginBottom: 4,
    fontSize: 16,
  },
  itemDesc: {
    color: colors.subtext,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  itemPrice: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
});
