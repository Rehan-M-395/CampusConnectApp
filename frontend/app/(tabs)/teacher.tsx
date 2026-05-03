import React, { useEffect, useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GatePassRequestComponent from '../../components/Teacher/GatePassRequestComponent';

type AuthUser = {
  id: string;
  erpId: string;
  name: string;
  role: string | null;
};

export default function TeacherScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson) as AuthUser;
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1 }}>
        <GatePassRequestComponent 
          teacherId={user?.id} 
          teacherName={user?.name} 
        />
      </View>
    </SafeAreaView>
  );
}