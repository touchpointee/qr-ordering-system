import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";
import Toast from "react-native-toast-message";
import { createApi } from "./services/api";
import { useAppStore } from "./store/appStore";
import { getSecureItem } from "./lib/secureStorage";

import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import TablesScreen from "./screens/TablesScreen";
import TableDetailScreen from "./screens/TableDetailScreen";
import NewOrderScreen from "./screens/NewOrderScreen";
import MenuBrowseScreen from "./screens/MenuBrowseScreen";
import ActiveOrdersScreen from "./screens/ActiveOrdersScreen";
import MenuManagementScreen from "./screens/MenuManagementScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { colors, radius, shadows } from "./theme";
import { navigationRef } from "./navigation/navigationRef";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Dashboard: { label: "Home", icon: "grid-outline", activeIcon: "grid" },
  Tables: { label: "Tables", icon: "restaurant-outline", activeIcon: "restaurant" },
  "New Order": { label: "Order", icon: "add-circle-outline", activeIcon: "add-circle" },
  Orders: { label: "Queue", icon: "receipt-outline", activeIcon: "receipt" },
  Menu: { label: "Menu", icon: "book-outline", activeIcon: "book" },
};

function Tabs({ api }) {
  const insets = useSafeAreaInsets();
  const bottomSpace = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TAB_CONFIG[route.name];
        return {
          headerShown: false,
          animation: "fade",
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true,
          tabBarItemStyle: styles.tabItem,
          tabBarStyle: {
            position: "absolute",
            left: 14,
            right: 14,
            bottom: bottomSpace,
            height: 76 + Math.max(insets.bottom - 8, 0),
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopWidth: 0,
            borderRadius: radius.xl,
            backgroundColor: colors.surface,
            ...shadows.lift,
          },
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Ionicons
                color={focused ? colors.onPrimary : color}
                name={focused ? tab.activeIcon : tab.icon}
                size={18}
              />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.tabLabel, focused ? styles.tabLabelActive : null, { color }]}>
              {tab.label}
            </Text>
          ),
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} initialParams={{ api }} />
      <Tab.Screen name="Tables" component={TablesScreen} initialParams={{ api }} />
      <Tab.Screen name="New Order" component={NewOrderScreen} initialParams={{ api }} />
      <Tab.Screen name="Orders" component={ActiveOrdersScreen} initialParams={{ api }} />
      <Tab.Screen name="Menu" component={MenuBrowseScreen} initialParams={{ api, restaurantId: "" }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    minHeight: 48,
    paddingTop: 2,
    justifyContent: "center",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "800",
    marginBottom: Platform.OS === "android" ? 2 : 0,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});

export default function App() {
  const { serverUrl } = useAppStore();
  const api = useMemo(() => createApi(() => serverUrl, () => {}), [serverUrl]);

  React.useEffect(() => {
    const sock = io(serverUrl, { reconnection: true });
    (async () => {
      const token = await getSecureItem("staff_jwt");
      if (token) sock.emit("join_staff", { token });
    })();
    sock.on("new_order", (payload) => {
      Toast.show({
        type: "success",
        text1: "New order received",
        text2: `Table ${payload.tableName || payload.tableId}`,
      });
    });
    return () => sock.disconnect();
  }, [serverUrl]);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            animation: "slide_from_right",
            animationDuration: 180,
            gestureEnabled: true,
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "800", color: colors.text },
            headerBackTitleVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} initialParams={{ api }} options={{ headerShown: false }} />
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <Tabs api={api} />}
          </Stack.Screen>
          <Stack.Screen name="TableDetail" component={TableDetailScreen} initialParams={{ api }} options={{ title: "Table Control" }} />
          <Stack.Screen name="MenuManagement" component={MenuManagementScreen} initialParams={{ api }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
