import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { getHodStudentAttendance, HodAttendanceData } from '@/services/hodService';

type DonutChartProps = {
  percentage: number;
  radius?: number;
  strokeWidth?: number;
};

// Custom Pie Chart Component using Svg with low-contrast dark red gradient
const DonutChart = ({ percentage, radius = 65, strokeWidth = 14 }: DonutChartProps) => {
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.chartContainer}>
      <Svg width={halfCircle * 2} height={halfCircle * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <Defs>
          <LinearGradient id="studentRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7a1616" stopOpacity="1" />
            <Stop offset="100%" stopColor="#a82323" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Background Circle */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle with Gradient */}
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="url(#studentRedGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.chartCenter]}>
        <Text style={styles.chartText}>{percentage}%</Text>
        <Text style={styles.chartSubtext}>Overall</Text>
      </View>
    </View>
  );
};

export default function StudentsTab() {
  const { session, apiBaseUrl } = useAuth();
  const [data, setData] = useState<HodAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(
    async (isRefresh = false) => {
      if (!session?.token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getHodStudentAttendance(apiBaseUrl, session.token);
        setData(res);
      } catch (error) {
        console.error('[StudentsTab] fetch error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiBaseUrl, session?.token]
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const totalStudents = data?.today.total ?? 0;
  const totalPresent = data?.today.present ?? 0;
  const totalAbsent = data?.today.absent ?? 0;
  const attendancePercentage = data?.today.percentage ?? 0;
  const history = [...(data?.history ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchAttendance(true)}
          tintColor="#ae2525"
        />
      }
    >
      {/* Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="people-outline" size={20} color="#ae2525" />
          <Text style={styles.sectionTitle}>Today's Student Attendance</Text>
        </View>

        {/* Gradient Pie Chart */}
        <DonutChart percentage={loading ? 0 : attendancePercentage} />

        {/* Interactive Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statPresentBg]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#15803d" />
            <Text style={styles.statValue}>{loading ? '--' : totalPresent}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={[styles.statBox, styles.statAbsentBg]}>
            <Ionicons name="close-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.statValue}>{loading ? '--' : totalAbsent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>

          <View style={[styles.statBox, styles.statTotalBg]}>
            <Ionicons name="people-outline" size={18} color="#475569" />
            <Text style={styles.statValue}>{loading ? '--' : totalStudents}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* History Section */}
      <View style={styles.historySectionHeader}>
        <Ionicons name="time-outline" size={18} color="#0f172a" />
        <Text style={styles.historyTitle}>Past 7 Days History</Text>
      </View>

      <View style={styles.historyCard}>
        {history.length === 0 ? (
          <Text style={styles.noDataText}>No history records found</Text>
        ) : (
          history.map((item, index) => (
            <View key={item.date} style={[styles.historyRow, index === history.length - 1 && styles.noBorder]}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyDate}>{item.date}</Text>
                {/* Visual Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.percentage}%` }]} />
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={styles.historyPresent}>{item.present} / {item.total}</Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.historyPercent}>{item.percentage}%</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  chartCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  chartSubtext: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statPresentBg: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  statAbsentBg: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  statTotalBg: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
    width: '90%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ae2525',
    borderRadius: 3,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPresent: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  percentBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  historyPercent: {
    fontSize: 13,
    color: '#ae2525',
    fontWeight: '700',
  },
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
