import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SERVER_URL_KEY = "staff_server_url";

function getDefaultServerUrl() {
  if (Platform.OS === "web") {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${hostname}:3000`;
  }
  return "http://localhost:3000";
}

export const useAppStore = create((set, get) => ({
  token: null,
  serverUrl: getDefaultServerUrl(),
  cachedMenu: null,
  customerCart: [],
  setToken: (token) => set({ token }),
  setServerUrl: (serverUrl) => {
    set({ serverUrl });
    AsyncStorage.setItem(SERVER_URL_KEY, serverUrl).catch(() => {});
  },
  setCachedMenu: async (cachedMenu) => {
    set({ cachedMenu });
    await AsyncStorage.setItem("cached_menu", JSON.stringify(cachedMenu));
  },
  loadCache: async () => {
    const savedUrl = await AsyncStorage.getItem(SERVER_URL_KEY);
    if (savedUrl) set({ serverUrl: savedUrl });
    const raw = await AsyncStorage.getItem("cached_menu");
    if (raw) set({ cachedMenu: JSON.parse(raw) });
  },
  addToCustomerCart: (item) =>
    set((state) => {
      const idx = state.customerCart.findIndex((row) => row.menuItemId === item.menuItemId);
      if (idx === -1) return { customerCart: [...state.customerCart, item] };
      const next = [...state.customerCart];
      next[idx] = {
        ...next[idx],
        qty: next[idx].qty + item.qty,
        note: item.note || next[idx].note || "",
      };
      return { customerCart: next };
    }),
  updateCustomerQty: (menuItemId, delta) =>
    set((state) => ({
      customerCart: state.customerCart
        .map((row) => (row.menuItemId === menuItemId ? { ...row, qty: row.qty + delta } : row))
        .filter((row) => row.qty > 0),
    })),
  clearCustomerCart: () => set({ customerCart: [] }),
}));
