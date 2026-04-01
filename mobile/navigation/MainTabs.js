import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import TablesScreen from "../screens/TablesScreen";
import NewOrderScreen from "../screens/NewOrderScreen";
import ActiveOrdersScreen from "../screens/ActiveOrdersScreen";
import MenuBrowseScreen from "../screens/MenuBrowseScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tables" component={TablesScreen} />
      <Tab.Screen name="NewOrder" component={NewOrderScreen} options={{ title: "New Order" }} />
      <Tab.Screen name="Orders" component={ActiveOrdersScreen} />
      <Tab.Screen name="Menu" component={MenuBrowseScreen} />
    </Tab.Navigator>
  );
}
