import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SecurityHomepage() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const visitors = [
    { id: '1', name: 'John Doe', time: '2:30 PM', purpose: 'Meeting' },
    { id: '2', name: 'Sarah Williams', time: '2:45 PM', purpose: 'Meeting' },
    { id: '3', name: 'Michael Jackson', time: '3:15 PM', purpose: 'Meeting' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Scanner Section */}
      <View style={styles.scannerSection}>
        <View style={styles.scannerPlaceholder}>
          <Ionicons name="scan-outline" size={120} color="#e09c15" />
        </View>
        <Text style={styles.scanTitle}>SCAN VISITOR QR CODE</Text>
        <Text style={styles.scanSubtitle}>Align the code within the frame</Text>
      </View>

      {/* Top Tabs for Logs */}
      <View style={styles.logTabsContainer}>
        <TouchableOpacity 
          style={[styles.logTab, activeTab === 'PENDING' && styles.logTabActive]}
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.logTabText, activeTab === 'PENDING' && styles.logTabTextActive]}>
            PENDING
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.logTab, activeTab === 'CHECKED_IN' && styles.logTabActive]}
          onPress={() => setActiveTab('CHECKED_IN')}
        >
          <Text style={[styles.logTabText, activeTab === 'CHECKED_IN' && styles.logTabTextActive]}>
            CHECKED IN
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <View style={styles.listContainer}>
        {visitors.map(v => (
          <View style={styles.listItem} key={v.id}>
            <View style={styles.listItemLeft}>
              <Text style={styles.visitorName}>{v.name}</Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color="#64748b" style={{ marginRight: 4 }} />
                <Text style={styles.visitorTime}>{v.time}</Text>
              </View>
              <Text style={styles.visitorPurpose}>PURPOSE: {v.purpose}</Text>
            </View>
            <TouchableOpacity style={styles.optionsButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#e09c15" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Daily Goal Card */}
      <View style={styles.logCard}>
        <Text style={styles.logTitle}>Daily Log</Text>
        <Text style={styles.logText}>42 Visitors Logged Today</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  scannerSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  scannerPlaceholder: {
    width: 280,
    height: 280,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  logTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  logTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#e09c15',
  },
  logTabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  logTabTextActive: {
    color: '#e09c15',
  },
  badge: {
    backgroundColor: '#e09c15',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e09c15',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemLeft: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  visitorTime: {
    fontSize: 13,
    color: '#64748b',
  },
  visitorPurpose: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#450a0a',
    borderRadius: 12,
    padding: 24,
  },
  logTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  logText: {
    color: '#fca5a5',
    fontSize: 14,
  },
});
