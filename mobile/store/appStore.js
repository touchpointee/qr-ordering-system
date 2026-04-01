import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_URL_KEY = "staff_server_url";
const DEPLOYED_SERVER_URL = "http://u133olebmptuq5bymoqwxnrr.103.108.220.202.sslip.io";

function getDefaultServerUrl() {
  return DEPLOYED_SERVER_URL;
}

function normalizeServerUrl(serverUrl) {
  if (!serverUrl) return DEPLOYED_SERVER_URL;
  if (serverUrl.includes("localhost:3000") || serverUrl.includes("127.0.0.1:3000")) {
    return DEPLOYED_SERVER_URL;
  }
  return serverUrl;
}

export const useAppStore = create((set, get) => ({
  token: null,
  serverUrl: getDefaultServerUrl(),
  cachedMenu: null,
  customerCart: [],
  setToken: (token) => set({ token }),
  setServerUrl: (serverUrl) => {
    const normalizedUrl = normalizeServerUrl(serverUrl);
    set({ serverUrl: normalizedUrl });
    AsyncStorage.setItem(SERVER_URL_KEY, normalizedUrl).catch(() => {});
  },
  setCachedMenu: async (cachedMenu) => {
    set({ cachedMenu });
    await AsyncStorage.setItem("cached_menu", JSON.stringify(cachedMenu));
  },
  loadCache: async () => {
    const savedUrl = await AsyncStorage.getItem(SERVER_URL_KEY);
    if (savedUrl) {
      const normalizedUrl = normalizeServerUrl(savedUrl);
      set({ serverUrl: normalizedUrl });
      if (normalizedUrl !== savedUrl) {
        AsyncStorage.setItem(SERVER_URL_KEY, normalizedUrl).catch(() => {});
      }
    }
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
