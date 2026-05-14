import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Dashboard: ['speedometer', 'speedometer-outline'],
  Subscriptions: ['list', 'list-outline'],
  Add: ['add-circle', 'add-circle-outline'],
  Reports: ['pie-chart', 'pie-chart-outline'],
};

function HeaderTitle() {
  return (
    <View>
      <Text style={styles.brand}>SubTracker</Text>
      <Text style={styles.subtitle}>Subscription control center</Text>
    </View>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable accessibilityRole="button" onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
      <Ionicons name="log-out-outline" size={20} color={colors.primary} />
    </Pressable>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => <HeaderTitle />,
        headerRight: () => <LogoutButton />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerRightContainerStyle: { paddingRight: 14 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused, size }) => {
          const [filled, outline] = tabIcons[route.name] || tabIcons.Dashboard;
          return (
            <View style={[styles.iconBubble, focused && styles.iconBubbleActive]}>
              <Ionicons name={focused ? filled : outline} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Tab.Screen name="Add" component={AddSubscriptionScreen} options={{ title: 'Add' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  logout: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  pressed: {
    opacity: 0.7,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 42,
  },
  iconBubbleActive: {
    backgroundColor: colors.primarySoft,
  },
});
