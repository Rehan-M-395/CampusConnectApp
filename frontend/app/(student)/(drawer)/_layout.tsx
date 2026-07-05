import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import DrawerContent from '../../../components/Navigation/DrawerContent';

export default function StudentDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: '#7f1d1d',
        },

        headerTintColor: '#FFF8F0',

        headerTitleStyle: {
          fontWeight: '700',
        },

        drawerActiveTintColor: '#dbeafe',
        drawerInactiveTintColor: '#94a3b8',
        drawerActiveBackgroundColor: '#e09c15',

        drawerStyle: styles.drawer,
        drawerItemStyle: styles.drawerItem,
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#7f1d1d',
  },

  drawerItem: {
    marginVertical: 4,
    borderRadius: 12,
  },
});