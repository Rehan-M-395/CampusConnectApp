import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecurityLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 10 : 8);
  const tabBarBottomPadding = bottomInset + (Platform.OS === "android" ? 8 : 4);
  const tabBarHeight = (Platform.OS === "android" ? 65 : 60) + tabBarBottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#450a0a',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleAlign: 'left',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 32, height: 32, borderRadius: 16, 
              backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center',
              marginRight: 10
            }}>
              <Ionicons name="person" size={20} color="#94a3b8" />
            </View>
            <Text style={{ color: '#e09c15', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}>
              SECURITY HOMEPAGE
            </Text>
          </View>
        ),
        headerRight: () => (
          <Ionicons name="log-out-outline" size={24} color="#e09c15" style={{ marginRight: 16 }} />
        ),
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#e09c15',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: tabBarBottomPadding,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: 'SCANNER',
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabBarLabel, { color }]}>SCANNER</Text>
          ),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="qr-code-scanner" size={24} color={color} />
          ),
        }}
      />
      {/* We add a dummy visitor_log tab. Since it's requested to write the code for _layout and homepage only, 
          this tab might not exist yet, but we define it in the layout to match the UI */}
      <Tabs.Screen
        name="visitor_log"
        options={{
          title: 'VISITOR LOG',
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabBarLabel, { color }]}>VISITOR LOG</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="id-card-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
});
