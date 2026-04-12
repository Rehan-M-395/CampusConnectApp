import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFCMToken, setupTokenRefresh } from '../../services/notificationService';

type AuthUser = {
  id: string;
  erpId: string;
  name: string;
  role: string | null;
};

type LoginComponentProps = {
  apiBaseUrl: string;
  onLoginSuccess: (token: string, user: AuthUser) => void;
};

export default function LoginComponent({ apiBaseUrl, onLoginSuccess }: LoginComponentProps) {
  const [erpId, setErpId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Setup token refresh handler
    const unsubscribe = setupTokenRefresh(async (newToken) => {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('authUser');
      if (token && user) {
        const parsedUser = JSON.parse(user);
        try {
          await fetch(`${apiBaseUrl}/api/auth/store-fcm-token`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fcmToken: newToken }),
          });
        } catch (error) {
          console.error('Failed to update FCM token:', error);
        }
      }
    });

    return unsubscribe;
  }, [apiBaseUrl]);

  
  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpId: erpId.trim(),
          password,
        }),
      });

      const payload = (await response.json()) as
        | { token: string; user: AuthUser }
        | { error?: string };

      if (!response.ok || !('token' in payload) || !('user' in payload)) {
        const loginError = 'error' in payload ? payload.error : undefined;
        setErrorMessage(loginError ?? 'Login failed. Please check your ERP ID and password.');
        return;
      }

      await AsyncStorage.setItem('authToken', payload.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(payload.user));
      onLoginSuccess(payload.token, payload.user);        

      // Store FCM token
      try {
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await fetch(`${apiBaseUrl}/api/auth/store-fcm-token`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${payload.token}`
            },
            body: JSON.stringify({ fcmToken }),
          });
        }
      } catch (error) {
        console.error('Failed to store FCM token:', error);
      }

      
    } catch {
      setErrorMessage('Cannot reach server. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Connect</Text>

      <TextInput
        placeholder="Enter ERP ID"
        value={erpId}
        onChangeText={setErpId}
        autoCapitalize="characters"
        style={styles.input}
      />

      <TextInput
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',   // vertical center
    alignItems: 'center',       // horizontal center
    padding: 20,
    backgroundColor: '#0f172a', // dark modern bg
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#1e293b',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    color: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    width: '100%',
    color: '#fca5a5',
    marginBottom: 10,
    fontWeight: '600',
  },
});
