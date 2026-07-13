import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HODDashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroBody}>
          <View>
            <Text style={styles.heroPercentage}>
              -- <Text style={styles.percentSign}> %</Text>
            </Text>
            <Text style={styles.heroSubtext}>Your Attendance</Text>
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
            <Text style={styles.cardValue}>--</Text>
            <Text style={styles.cardSubtext}>-- Students present</Text>
          </View>
          <View style={styles.cardBadge}>

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
            <Text style={styles.cardValue}>--</Text>
            <Text style={styles.cardSubtext}>-- Staff present</Text>
          </View>
          <View style={styles.cardBadge}>

          </View>
        </View>
      </View>

      {/* Departmental stats */}
      <Text style={styles.sectionHeader}>Departmental Statistics</Text>
      <View style={styles.pulseContainer}>

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
  heroBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  heroPercentage: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
  },
  percentSign: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e09c15',
  },
  heroSubtext: {
    color: '#f8fafc',
    fontSize: 13,
    marginTop: 4,
  },
  btnIcon: {
    marginRight: 6,
  },
  detailedReportText: {
    color: '#ae2525',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
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
  cardBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  pulseContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  trendCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  timeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 2,
    borderRadius: 8,
  },
  timeButtonActive: {
    backgroundColor: '#ae2525',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeButtonTextActive: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  timeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeButtonText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '500',
  },
});
