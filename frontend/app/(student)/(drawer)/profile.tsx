import { View, Text, StyleSheet } from 'react-native';

export default function StudentProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Profile</Text>
      <Text style={styles.subtitle}>Coming Soon...</Text>
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
    marginTop: 8,
    fontSize: 18,
    color: '#666',
  },
});