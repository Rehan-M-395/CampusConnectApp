import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function StudentHomeScreen() {
  const { isSigningOut, session, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Student Portal</Text>
        <Text style={styles.title}>{session?.user.name ?? 'Student'}</Text>
        <Text style={styles.subtitle}>
          Student login is now active. This screen is ready for student-specific features.
        </Text>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>ERP ID</Text>
          <Text style={styles.metaValue}>{session?.user.erpId ?? '--'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isSigningOut && styles.buttonDisabled]}
          onPress={signOut}
          disabled={isSigningOut}
        >
          <Text style={styles.buttonText}>{isSigningOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </View>

      {isSigningOut ? (
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.overlayText}>Logging out...</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eyebrow: {
    color: '#7f1d1d',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#475569',
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  metaBlock: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff8f0',
    borderWidth: 1,
    borderColor: '#ead7c3',
  },
  metaLabel: {
    color: '#7f1d1d',
    fontWeight: '700',
    marginBottom: 4,
  },
  metaValue: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#7f1d1d',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fffaf3',
    fontSize: 15,
    fontWeight: '800',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    gap: 10,
  },
  overlayText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
});
