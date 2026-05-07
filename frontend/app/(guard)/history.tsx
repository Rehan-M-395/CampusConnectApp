import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

type GatePassHistoryRecord = {
  id: string;
  parent_name: string;
  visit_date: string;
  visit_time: string;
  reason: string;
  phone: string;
  qr_scanned: number;
  in_time: string | null;
  out_time: string | null;
  generated_at: string;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function GuardHistoryScreen() {
  const { apiBaseUrl, isSigningOut, session } = useAuth();
  const [records, setRecords] = useState<GatePassHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (!session?.token) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/gate-passes/history`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const payload = (await response.json()) as
        | { gatePasses: GatePassHistoryRecord[] }
        | { error?: string };

      if (!response.ok || !('gatePasses' in payload)) {
        const message = 'error' in payload ? payload.error : undefined;
        throw new Error(message ?? 'Failed to load guard history.');
      }

      setRecords(payload.gatePasses);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load guard history.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [apiBaseUrl, session?.token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHistory(true)}
            colors={['#7f1d1d']}
            tintColor="#7f1d1d"
          />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>My Guard History</Text>
          <Text style={styles.subtitle}>
            Only gate passes scanned by {session.user.name} are shown here.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.helperText}>Loading history...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Unable to load history</Text>
            <Text style={styles.messageText}>{errorMessage}</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No history yet</Text>
            <Text style={styles.messageText}>
              Once you scan gate passes, they will appear here. Pull down to refresh anytime.
            </Text>
          </View>
        ) : (
          records.map(record => (
            <View key={record.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.visitorName}>{record.parent_name}</Text>
                <Text style={styles.statusText}>
                  {record.out_time ? 'Completed' : record.in_time ? 'Inside Campus' : 'Scanned'}
                </Text>
              </View>

              <Text style={styles.rowText}>Visit: {record.visit_date} at {record.visit_time}</Text>
              <Text style={styles.rowText}>Phone: {record.phone}</Text>
              <Text style={styles.rowText}>Reason: {record.reason}</Text>
              <Text style={styles.rowText}>Scanned: {record.qr_scanned ? 'Yes' : 'No'}</Text>
              <Text style={styles.rowText}>IN Time: {formatDateTime(record.in_time)}</Text>
              <Text style={styles.rowText}>OUT Time: {formatDateTime(record.out_time)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {isSigningOut ? (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutBox}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.logoutLoadingText}>Logging out...</Text>
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
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#7f1d1d',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  title: {
    color: '#fff8f0',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#f5e6d3',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  helperText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageTitle: {
    color: '#7f1d1d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  messageText: {
    color: '#475569',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  visitorName: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  statusText: {
    color: '#7f1d1d',
    fontWeight: '700',
  },
  rowText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 2,
  },
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    gap: 10,
  },
  logoutLoadingText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
});
