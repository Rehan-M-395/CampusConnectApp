import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function GuardLayout() {
  const { isLoading, isSigningOut, session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarBottomPadding = bottomInset + 8;
  const tabBarHeight = 65 + tabBarBottomPadding;

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (session.role !== 'guard') {
    return <Redirect href={'/(faculty)/(tabs)/home' as never} />;
  }

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
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#1e293b',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name="person" size={20} color="#94a3b8" />
            </View>
            <Text style={{ color: '#e09c15', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}>
              GUARD PORTAL
            </Text>
          </View>
        ),
        headerRight: () => (
          isSigningOut ? (
            <View style={{ marginRight: 16 }}>
              <ActivityIndicator size="small" color="#e09c15" />
            </View>
          ) : (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
              <Ionicons name="log-out-outline" size={24} color="#e09c15" />
            </TouchableOpacity>
          )
        ),
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: '#e09c15',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          position: 'relative',
          backgroundColor: '#ffffff',
          borderTopWidth: 2,
          borderTopColor: '#f1f5f9',
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          paddingTop: 8,
          height: tabBarHeight,
          paddingBottom: tabBarBottomPadding,
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center', color }}>
              SCANNER
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="qr-code-scanner" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center', color }}>
              HISTORY
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
