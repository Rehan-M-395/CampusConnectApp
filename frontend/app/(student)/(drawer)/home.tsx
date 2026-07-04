import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function StudentHome() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome {session?.user.name}
      </Text>

      <Text style={styles.subtitle}>
        Student Interface
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
  },
});