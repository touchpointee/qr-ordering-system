import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import {
  AppButton,
  AppInput,
  Card,
  CartItem,
  EmptyState,
  LoadingView,
  PageHeader,
  Screen,
  StickyActionBar,
  SubText,
  TableStatusChip,
} from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { useApi } from "../services/useApi";
import { getSecureItem } from "../lib/secureStorage";

export default function NewOrderScreen() {
  const api = useApi();
  const [restaurantId, setRestaurantId] = useState("");
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [openSubcategoryId, setOpenSubcategoryId] = useState("");

  async function loadData(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setMessage("");
      const userRaw = await getSecureItem("staff_user");
      const user = userRaw ? JSON.parse(userRaw) : {};
      const rid = user.restaurantId || "";
      setRestaurantId(rid);

      if (api) {
        const [tableResponse, menuResponse] = await Promise.all([
          api.get("/api/admin/tables"),
          rid ? api.get(`/api/menu/${rid}`) : Promise.resolve({ data: { categories: [] } }),
        ]);
        setTables((tableResponse.data.data || []).filter((table) => !rid || table.restaurantId === rid));
        setCategories(menuResponse.data.categories || []);
        setCurrentCategoryIndex(0);
        const firstCategory = (menuResponse.data.categories || []).find(
          (category) => (category.subcategories || []).length > 0 || (category.items || []).length > 0
        );
        const firstSubcategory = firstCategory?.subcategories?.[0];
        setOpenSubcategoryId(firstSubcategory?._id || "");
      }
    } catch (error) {
      setMessage(error?.response?.data?.error || "Failed to load ordering data");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(() => {});
  }, [api]);

  const orderedCategories = useMemo(
    () => categories.filter((category) => (category.subcategories || []).length > 0 || (category.items || []).length > 0),
    [categories]
  );
  const currentCategory = orderedCategories[currentCategoryIndex] || null;
  const currentSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    if ((currentCategory.subcategories || []).length > 0) return currentCategory.subcategories;
    return [{ _id: `${currentCategory._id}-default`, name: currentCategory.name, items: currentCategory.items || [] }];
  }, [currentCategory]);
  const filteredSubcategories = useMemo(
    () =>
      currentSubcategories
        .map((subcategory) => ({
          ...subcategory,
          filteredItems: (subcategory.items || []).filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((subcategory) => (subcategory.filteredItems || []).length > 0 || !search.trim()),
    [currentSubcategories, search]
  );
  const selectedTable = useMemo(
    () => tables.find((table) => table._id === selectedTableId) || null,
    [selectedTableId, tables]
  );

  function addToCart(item) {
    setCart((prev) => {
      const index = prev.findIndex((row) => row.menuItemId === item._id);
      if (index === -1) {
        return [...prev, { menuItemId: item._id, kitchenId: item.kitchenId, name: item.name, qty: 1 }];
      }
      const next = [...prev];
      next[index] = { ...next[index], qty: next[index].qty + 1 };
      return next;
    });
  }

  function updateQty(menuItemId, delta) {
    setCart((prev) =>
      prev
        .map((item) => (item.menuItemId === menuItemId ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function removeFromCart(menuItemId) {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }

  function onSelectTable(tableId) {
    setSelectedTableId(tableId);
    setCurrentCategoryIndex(0);
    setOpenSubcategoryId(currentSubcategories[0]?._id || "");
    setCart([]);
    setMessage("");
  }

  async function placeOrder() {
    if (!selectedTableId || cart.length === 0) {
      setMessage("Select a table and add items before placing the order");
      return;
    }
    try {
      setPlacingOrder(true);
      await api.post("/api/orders", {
        restaurantId,
        tableId: selectedTableId,
        items: cart.map((row) => ({
          menuItemId: row.menuItemId,
          kitchenId: row.kitchenId,
          qty: row.qty,
          note: "",
        })),
      });
      setCart([]);
      setCurrentCategoryIndex(0);
      setOpenSubcategoryId(currentSubcategories[0]?._id || "");
      setMessage("Order placed successfully");
    } catch (error) {
      setMessage(error?.response?.data?.error || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <Screen>
      <FlatList
        data={filteredSubcategories}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
        ListHeaderComponent={
          <>
            <PageHeader
              eyebrow="Fast entry"
              title="Build a staff order"
              subtitle="Pick a table, work through categories, and send the ticket without losing rhythm."
            />

            <Card style={styles.topCard}>
              <Text style={styles.topLabel}>Selected table</Text>
              <Text style={styles.topTitle}>{selectedTable?.name || "Choose a table to begin"}</Text>
              <SubText>{selectedTable ? "The cart will stay scoped to this table." : "Switching tables clears the current cart to avoid mistakes."}</SubText>
            </Card>

            <Text style={styles.sectionLabel}>Tables</Text>
            {loading ? <LoadingView label="Loading tables and menu..." /> : null}
            <FlatList
              horizontal
              data={tables}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tableList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onSelectTable(item._id)}
                  style={[styles.tableChip, selectedTableId === item._id ? styles.tableChipSelected : null]}
                >
                  <Text style={selectedTableId === item._id ? styles.tableChipTextSelected : styles.tableChipText}>{item.name}</Text>
                </Pressable>
              )}
            />

            {currentCategory ? (
              <Card style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressLabel}>Category</Text>
                    <Text style={styles.progressTitle}>{currentCategory.name}</Text>
                  </View>
                  <Text style={styles.progressCount}>{orderedCategories.length}</Text>
                </View>
                <SubText>Select a category, then pick the right subcategory under it.</SubText>
                <View style={styles.progressActions}>
                  {orderedCategories.map((category, index) => (
                    <Pressable
                      key={category._id}
                      onPress={() => {
                        setCurrentCategoryIndex(index);
                        const nextCategory = orderedCategories[index];
                        const nextSubcategories =
                          (nextCategory?.subcategories || []).length > 0
                            ? nextCategory.subcategories
                            : [{ _id: `${nextCategory?._id}-default`, name: nextCategory?.name, items: nextCategory?.items || [] }];
                        setOpenSubcategoryId(nextSubcategories[0]?._id || "");
                      }}
                      style={[styles.selectorChip, index === currentCategoryIndex ? styles.selectorChipActive : null]}
                    >
                      <Text style={[styles.selectorChipText, index === currentCategoryIndex ? styles.selectorChipTextActive : null]}>
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            ) : null}

            <AppInput
              value={search}
              onChangeText={setSearch}
              placeholder={currentCategory ? `Search ${currentCategory.name}` : "Search menu"}
              style={styles.search}
            />

            {!!message && <Text style={styles.message}>{message}</Text>}
          </>
        }
        renderItem={({ item: subcategory }) => {
          const isOpen = openSubcategoryId === subcategory._id;
          return (
            <Card style={styles.subcategoryCard}>
              <Pressable
                onPress={() => setOpenSubcategoryId((prev) => (prev === subcategory._id ? "" : subcategory._id))}
                style={styles.subcategoryHeader}
              >
                <View style={styles.subcategoryHeaderMain}>
                  <Text style={styles.subcategoryTitle}>{subcategory.name}</Text>
                  <SubText>{(subcategory.filteredItems || []).length} products</SubText>
                </View>
                <Text style={styles.subcategoryArrow}>{isOpen ? "-" : "+"}</Text>
              </Pressable>

              {isOpen ? (
                <View style={styles.subcategoryItems}>
                  {(subcategory.filteredItems || []).map((product) => {
                    const cartItem = cart.find((row) => row.menuItemId === product._id);
                    return (
                      <Pressable key={product._id} onPress={() => addToCart(product)} style={styles.menuRow}>
                        <View style={styles.menuRowTop}>
                          <View style={styles.menuMain}>
                            <Text style={styles.menuItemName}>{product.name}</Text>
                            <SubText numberOfLines={2}>{product.description || "Tap to add this item to the active table order."}</SubText>
                          </View>
                          <TableStatusChip label={cartItem ? `In cart x${cartItem.qty}` : "+ Add"} status={cartItem ? "occupied" : "free"} />
                        </View>
                        <Text style={styles.menuMeta}>Rs {product.price}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            orderedCategories.length === 0 ? (
              <EmptyState title="No categories available" subtitle="Please add categories, subcategories, and items first." />
            ) : (
              <EmptyState title="No items found" subtitle="Try a different search or open another subcategory." />
            )
          ) : null
        }
        ListFooterComponent={
          <>
            <Card style={styles.cart}>
              <View style={styles.cartHeader}>
                <View>
                  <Text style={styles.cartTitle}>Current cart</Text>
                  <SubText>{selectedTable ? `For ${selectedTable.name}` : "No table selected yet"}</SubText>
                </View>
                <Text style={styles.cartCount}>{cart.length}</Text>
              </View>
              {cart.length === 0 ? <SubText>No items added yet.</SubText> : null}
              {cart.map((item) => (
                <CartItem
                  key={item.menuItemId}
                  item={item}
                  onIncrease={() => updateQty(item.menuItemId, 1)}
                  onDecrease={() => updateQty(item.menuItemId, -1)}
                  onRemove={() => removeFromCart(item.menuItemId)}
                />
              ))}
            </Card>
            <View style={styles.bottomSpace} />
          </>
        }
      />

      <StickyActionBar style={styles.stickyBar}>
        <View style={styles.stickyTop}>
          <View>
            <Text style={styles.stickyTitle}>{selectedTable?.name || "Select table"}</Text>
            <Text style={styles.stickySubtitle}>{cart.length} cart lines ready to send</Text>
          </View>
          <AppButton title="Place Order" onPress={placeOrder} loading={placingOrder} style={styles.placeButton} />
        </View>
      </StickyActionBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 180,
  },
  topCard: {
    backgroundColor: colors.text,
    borderColor: colors.text,
    marginBottom: spacing.md,
  },
  topLabel: {
    color: "#D9C9B7",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  topTitle: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  sectionLabel: {
    color: colors.subtext,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    fontSize: 12,
  },
  tableList: {
    paddingBottom: spacing.sm,
  },
  tableChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  tableChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tableChipText: {
    color: colors.text,
    fontWeight: "700",
  },
  tableChipTextSelected: {
    color: colors.onPrimary,
    fontWeight: "800",
  },
  progressCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSoft,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    color: colors.subtext,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  progressTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 2,
  },
  progressCount: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 18,
  },
  progressActions: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  selectorChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  selectorChipText: {
    color: colors.text,
    fontWeight: "700",
  },
  selectorChipTextActive: {
    color: colors.onPrimary,
  },
  subcategoryWrap: {
    marginTop: spacing.sm,
  },
  search: {
    marginBottom: spacing.md,
  },
  message: {
    marginBottom: spacing.sm,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  menuRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  subcategoryCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  subcategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  subcategoryHeaderMain: {
    flex: 1,
  },
  subcategoryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 2,
  },
  subcategoryArrow: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  subcategoryItems: {
    marginTop: spacing.sm,
  },
  menuRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  menuMain: {
    flex: 1,
  },
  menuItemName: {
    color: colors.text,
    fontWeight: "900",
    marginBottom: 4,
    fontSize: 16,
  },
  menuMeta: {
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  cart: {
    marginTop: spacing.sm,
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cartTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
  },
  cartCount: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 28,
  },
  bottomSpace: {
    height: spacing.lg,
  },
  stickyBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 96,
  },
  stickyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  stickyTitle: {
    color: colors.text,
    fontWeight: "900",
  },
  stickySubtitle: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  placeButton: {
    minWidth: 132,
  },
});
