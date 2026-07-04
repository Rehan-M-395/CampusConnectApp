import React from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function DrawerContent(
  props: DrawerContentComponentProps,
) {
  const { session, signOut, isSigningOut } = useAuth();
  const roleLabels = {
  faculty: 'Faculty',
  guard: 'Guard',
  student: 'Student',
} as const;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={34}
              color="#7f1d1d"
            />
          </View>

          <Text style={styles.name}>
            {session?.user.name}
          </Text>

          <Text style={styles.role}>
            {session ? roleLabels[session.role] : ''}
          </Text>

          <Text style={styles.erp}>
            ERP : {session?.user.erpId}
          </Text>
        </View>

        <DrawerItemList {...props} />

        <View style={styles.separator} />

        <Pressable
          style={styles.logoutButton}
          onPress={signOut}
          disabled={isSigningOut}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#ffffff"
          />

          {isSigningOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.logoutText}>
              Logout
            </Text>
          )}
        </Pressable>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7f1d1d',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff22',
    marginBottom: 10,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  role: {
    color: '#FFD580',
    marginTop: 4,
    fontWeight: '600',
    fontSize: 13,
  },

  erp: {
    color: '#ddd',
    marginTop: 4,
    fontSize: 13,
  },

  separator: {
    borderTopWidth: 1,
    borderTopColor: '#ffffff22',
    marginTop: 10,
    marginHorizontal: 16,
    paddingTop: 10,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  logoutText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});