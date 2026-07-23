import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { getHodDashboard, HodDashboardData } from '@/services/hodService';

export default function HODDashboard() {
  const { session, apiBaseUrl } = useAuth();
  const hodName = session?.user?.name ?? 'HOD';
  const [dashboardData, setDashboardData] = useState<HodDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (!session?.token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getHodDashboard(apiBaseUrl, session.token);
        setDashboardData(data);
      } catch (error) {
        console.error('[HODDashboard] fetch error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiBaseUrl, session?.token]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!session) {
    return <Redirect href="/login" />;
  }

  const formatTime = (rawTime?: string | null) => {
    if (!rawTime) return '--:--';

    // 1. Try parsing full ISO timestamp
    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // 2. Try parsing "HH:MM:SS" or "HH:MM"
    const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    return rawTime;
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const inDisplay = loading ? '--:--' : formatTime(dashboardData?.loginTime);
  const outDisplay = loading ? '--:--' : formatTime(dashboardData?.logoutTime);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
          tintColor="#ae2525"
        />
      }
    >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.herowlc}>Welcome</Text>
            <Text style={styles.Hodname}>{hodName}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#f0ebe2" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <View style={styles.timeIconWrapper}>
              <Ionicons name="log-in-outline" size={18} color="#ae2525" />
            </View>
            <View style={styles.timeTextGroup}>
              <Text style={styles.timeLabel}>In Time</Text>
              <Text style={styles.timeValue}>{inDisplay}</Text>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeBox}>
            <View style={styles.timeIconWrapper}>
              <Ionicons name="log-out-outline" size={18} color="#ae2525" />
            </View>
            <View style={styles.timeTextGroup}>
              <Text style={styles.timeLabel}>Out Time</Text>
              <Text style={styles.timeValue}>{outDisplay}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Attendance Summary Cards */}
      <View style={styles.summaryRow}>
        {/* Student Attendance Summary */}
        <View style={[styles.summaryCard, styles.studentBorder]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Ionicons name="people-outline" size={18} color="#0f172a" />
              <Text style={styles.cardTitle}>Student Attendance</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardValue}>
              {loading ? '--' : `${dashboardData?.students.percentage ?? 0}%`}
            </Text>
            <Text style={styles.cardSubtext}>
              {loading
                ? '-- Students present  -- Students absent'
                : `${dashboardData?.students.present ?? 0} Students present   ${dashboardData?.students.absent ?? 0} Students absent`}
            </Text>
          </View>
        </View>

        {/* Staff Attendance Summary */}
        <View style={[styles.summaryCard, styles.staffBorder]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Ionicons name="briefcase-outline" size={18} color="#0f172a" />
              <Text style={styles.cardTitle}>Staff Attendance</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardValue}>
              {loading ? '--' : `${dashboardData?.staff.percentage ?? 0}%`}
            </Text>
            <Text style={styles.cardSubtext}>
              {loading
                ? '-- Staff present   -- Staff absent'
                : `${dashboardData?.staff.present ?? 0} Staff present   ${dashboardData?.staff.absent ?? 0} Staff absent`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#ae2525',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  herowlc: {
    fontSize: 22,
    fontFamily: 'Instrument Sans',
    fontWeight: '300',
    color: '#f0ebe2',
  },
  Hodname: {
    color: '#f8fafc',
    fontSize: 19,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  dateText: {
    color: '#f0ebe2',
    fontSize: 12,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeTextGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: 290,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  studentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#e09c15',
  },
  staffBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#e09c15',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 8,
  },
  cardBody: {
    marginTop: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
