import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

type AuthUser = {
  id: string;
  erpId: string;
  name: string;
  role: string | null;
};

type Row = {
  name: string;
  erpId: string;
  loginTime: string;
  logoutTime: string;
  date: string;
  totalHours: number;
};

type Props = {
  user?: AuthUser;
  token: string;
  apiBaseUrl: string;
  onLogout?: () => void;
};

const formatTime = (value: string | null) => {
  if (!value) return '--';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function HomeComponent({
  user,
  token,
  apiBaseUrl,
  onLogout,
}: Props) {
  const [attendance, setAttendance] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json?.error ?? 'Failed to load attendance.');
        return;
      }

      const latest = json?.attendance?.[0];

      if (!latest) {
        setErrorMessage('No attendance data found.');
        return;
      }

      const loginDate = latest.login_time;
      const logoutDate = latest.logout_time;

      let totalHours = 0;
      if (loginDate && logoutDate) {
        const diff =
          new Date(logoutDate).getTime() - new Date(loginDate).getTime();
        totalHours = diff > 0 ? diff / (1000 * 60 * 60) : 0;
      }

      setAttendance({
        name: user?.name ?? latest.name ?? '',
        erpId: latest.erpid ?? user?.erpId ?? '',
        loginTime: formatTime(loginDate),
        logoutTime: formatTime(logoutDate),
        date: latest.date ?? '--',
        totalHours,
      });
    } catch {
      setErrorMessage('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token, user]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // 🔥 Loading UI
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  // 🔥 Error UI
  if (errorMessage) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={fetchAttendance}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>

        {onLogout && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 🔥 Main UI (your original design)
  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.title}>{attendance?.name}</Text>
        <Text style={styles.subtitle}>Track your campus attendance</Text>

        {onLogout && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>Date</Text>
            <Text style={styles.statValue}>{attendance?.date}</Text>
          </View>

          <View style={styles.statChip}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>
              {attendance?.totalHours.toFixed(2)}h
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <Text style={styles.sectionTitle}>Today's Attendance</Text>

        <View style={styles.detailsTable}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ERP ID</Text>
            <Text style={styles.detailValue}>{attendance?.erpId}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Login</Text>
            <Text style={styles.detailValue}>{attendance?.loginTime}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Logout</Text>
            <Text style={styles.detailValue}>{attendance?.logoutTime}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Hours</Text>
            <Text style={styles.detailValue}>
              {attendance?.totalHours.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
   // backgroundColor: '#0f172a',
    backgroundColor:'#7f1d1d',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorText: {
    color: '#fca5a5',
    marginBottom: 12,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
  },
  heroCard: {
 //   backgroundColor: '#1d4ed8',
 backgroundColor:'#7f1d1d',
    borderRadius: 16,
    padding: 16,
  },
  welcomeText: {
    color: '#dbeafe',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#e0ecff',
  },
  logoutButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    alignSelf: 'flex-start', // 🔥 FIX
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  statChip: {
    flex: 1,
  //  backgroundColor: '#1e40af',
    backgroundColor: '#7f1d1d',

    padding: 10,
    borderRadius: 10,
  },
  statLabel: {
    color: '#bfdbfe',
  },
  statValue: {
    color: '#fff',
    fontWeight: '700',
  },
  tableWrapper: {
    marginTop: 20,
  //  backgroundColor: '#1e293b',
  backgroundColor:'#7f1d1d',
    padding: 14,
    borderRadius: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  detailsTable: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailItem: {
    width: '48%',
  //  backgroundColor: '#0f172a',
  backgroundColor:'#7f1d1d',
    padding: 10,
    borderRadius: 10,
  },
  detailLabel: {
    color: '#94a3b8',
  },
  detailValue: {
    color: '#fff',
    fontWeight: '700',
  },
});