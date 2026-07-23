import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { getHodDashboard, HodDashboardData, AttendanceHistoryDay } from '@/services/hodService';

export default function HODDashboard() {
  const { session, apiBaseUrl } = useAuth();
  const hodName = session?.user?.name ?? 'HOD';
  const [dashboardData, setDashboardData] = useState<HodDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [graphMode, setGraphMode] = useState<'student' | 'staff'>('student');

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

    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

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

  const rawHistory: AttendanceHistoryDay[] =
    graphMode === 'student'
      ? dashboardData?.studentHistory ?? []
      : dashboardData?.staffHistory ?? [];

  const activeHistory = [...rawHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return dateStr.length > 5 ? dateStr.slice(-5) : dateStr;
  };

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
      {/* Hero Card */}
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
                : `${dashboardData?.students.present ?? 0} Present   ${dashboardData?.students.absent ?? 0} Absent`}
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
                : `${dashboardData?.staff.present ?? 0} Present   ${dashboardData?.staff.absent ?? 0} Absent`}
            </Text>
          </View>
        </View>
      </View>

      {/* 7 Days Attendance Bar Graph Section */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View style={styles.graphTitleWrapper}>
            <Ionicons name="stats-chart-outline" size={18} color="#ae2525" />
            <Text style={styles.graphTitle}>Past 7 Days Attendance</Text>
          </View>

          {/* Segmented Selector for Student / Staff */}
          <View style={styles.segmentContainer}>
            <Pressable
              style={[styles.segmentBtn, graphMode === 'student' && styles.segmentBtnActive]}
              onPress={() => setGraphMode('student')}
            >
              <Text style={[styles.segmentText, graphMode === 'student' && styles.segmentTextActive]}>
                Student
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, graphMode === 'staff' && styles.segmentBtnActive]}
              onPress={() => setGraphMode('staff')}
            >
              <Text style={[styles.segmentText, graphMode === 'staff' && styles.segmentTextActive]}>
                Staff
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bar Chart Container */}
        <View style={styles.chartArea}>
          {loading ? (
            <Text style={styles.chartLoadingText}>Loading graph...</Text>
          ) : activeHistory.length === 0 ? (
            <Text style={styles.chartLoadingText}>No 7-day attendance records</Text>
          ) : (
            <View style={styles.barsRow}>
              {activeHistory.map((item) => {
                const heightPct = Math.max(item.percentage, 4); // Minimum bar height for visibility
                return (
                  <View key={item.date} style={styles.barCol}>
                    <Text style={styles.barValText}>{item.percentage}%</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPct}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{formatShortDate(item.date)}</Text>
                  </View>
                );
              })}
            </View>
          )}
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  graphCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  graphTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  graphTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#ae2525',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  chartArea: {
    height: 170,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  chartLoadingText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    alignSelf: 'center',
    margin: 'auto',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  barTrack: {
    width: 18,
    height: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#ae2525',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
    marginTop: 6,
  },
});
