import React, { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../context/AuthContext';

type GatePassRecord = {
  id: string;
  parent_name: string;
  visit_time: string;
  reason: string;
  phone: string;
  qr_scanned: number;
  in_time: string | null;
  out_time: string | null;
};

export default function GuardScanScreen() {
  const { apiBaseUrl, isSigningOut, session } = useAuth();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'CHECKED_IN'>('PENDING');
  const [gatePasses, setGatePasses] = useState<GatePassRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  if (!session) {
    return <Redirect href="/login" />;
  }

  const fetchGatePasses = async (isRefresh = false) => {
    if (!session?.token) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/gate-passes`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const payload = (await response.json()) as
        | { gatePasses: GatePassRecord[] }
        | { error?: string };

      if (!response.ok || !('gatePasses' in payload)) {
        const errorMessage = 'error' in payload ? payload.error : undefined;
        throw new Error(errorMessage ?? 'Failed to load gate passes.');
      }

      setGatePasses(payload.gatePasses);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load gate passes.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGatePasses();
  }, [apiBaseUrl, session?.token]);

  const filteredVisitors = useMemo(() => {
    if (activeTab === 'CHECKED_IN') {
      return gatePasses.filter(item => item.in_time && !item.out_time);
    }

    return gatePasses.filter(item => !item.in_time || !item.out_time);
  }, [activeTab, gatePasses]);

  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
        return;
      }
    }

    setScannerOpen(true);
  };

  const handleScan = async (rawValue: string) => {
    if (!session?.token || scanning) {
      return;
    }

    setScanning(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/gate-passes/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ qrValue: rawValue }),
      });

      const payload = (await response.json()) as
        | { success: true; gatePass: GatePassRecord }
        | { error?: string };

      if (!response.ok || !('gatePass' in payload)) {
        const errorMessage = 'error' in payload ? payload.error : undefined;
        throw new Error(errorMessage ?? 'Unable to scan QR code.');
      }

      Alert.alert('Scanned', `QR verified for ${payload.gatePass.parent_name}.`);
      setScannerOpen(false);
      await fetchGatePasses(true);
    } catch (error) {
      Alert.alert('Scan Failed', error instanceof Error ? error.message : 'Unable to scan QR code.');
    } finally {
      setScanning(false);
    }
  };

  const updateGatePassTime = async (id: string, type: 'mark-in' | 'mark-out') => {
    if (!session?.token) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/gate-passes/${id}/${type}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const payload = (await response.json()) as
        | { success: true; gatePass: GatePassRecord }
        | { error?: string };

      if (!response.ok || !('gatePass' in payload)) {
        const errorMessage = 'error' in payload ? payload.error : undefined;
        throw new Error(errorMessage ?? 'Failed to update gate pass.');
      }

      await fetchGatePasses(true);
    } catch (error) {
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'Failed to update gate pass.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => fetchGatePasses(true)} />
      }
    >
      <View style={styles.scannerSection}>
        <TouchableOpacity style={styles.scannerPlaceholder} activeOpacity={0.9} onPress={handleOpenScanner}>
          <Ionicons name="scan-outline" size={120} color="#e09c15" />
        </TouchableOpacity>
        <Text style={styles.scanTitle}>SCAN VISITOR QR CODE</Text>
        <Text style={styles.scanSubtitle}>Tap the scanner area to open camera scanning</Text>
      </View>

      <View style={styles.logTabsContainer}>
        <TouchableOpacity
          style={[styles.logTab, activeTab === 'PENDING' && styles.logTabActive]}
          onPress={() => setActiveTab('PENDING')}
        >
          <Text style={[styles.logTabText, activeTab === 'PENDING' && styles.logTabTextActive]}>
            PENDING
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {gatePasses.filter(item => !item.in_time || !item.out_time).length}
            </Text>
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

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#7f1d1d" />
          </View>
        ) : filteredVisitors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No gate passes found</Text>
            <Text style={styles.emptyStateText}>New faculty-generated passes will appear here.</Text>
          </View>
        ) : filteredVisitors.map(visitor => (
          <View style={styles.listItem} key={visitor.id}>
            <View style={styles.listItemLeft}>
              <Text style={styles.visitorName}>{visitor.parent_name}</Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color="#64748b" style={styles.timeIcon} />
                <Text style={styles.visitorTime}>{visitor.visit_time}</Text>
              </View>
              <Text style={styles.visitorPurpose}>PURPOSE: {visitor.reason}</Text>
              <Text style={styles.metaText}>Phone: {visitor.phone}</Text>
              <Text style={styles.metaText}>
                QR: {visitor.qr_scanned ? 'Scanned' : 'Pending'} | IN: {visitor.in_time ? 'Marked' : 'Pending'} | OUT: {visitor.out_time ? 'Marked' : 'Pending'}
              </Text>
            </View>
            <View style={styles.actionColumn}>
              <TouchableOpacity
                style={[styles.actionButton, !visitor.qr_scanned && styles.actionButtonDisabled]}
                disabled={!visitor.qr_scanned || Boolean(visitor.in_time)}
                onPress={() => updateGatePassTime(visitor.id, 'mark-in')}
              >
                <Text style={styles.actionButtonText}>IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, !visitor.in_time && styles.actionButtonDisabled]}
                disabled={!visitor.in_time || Boolean(visitor.out_time)}
                onPress={() => updateGatePassTime(visitor.id, 'mark-out')}
              >
                <Text style={styles.actionButtonText}>OUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.logCard}>
        <Text style={styles.logTitle}>Daily Log</Text>
        <Text style={styles.logText}>{gatePasses.length} Visitors Logged Today</Text>
      </View>

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Gate Pass</Text>
            <TouchableOpacity onPress={() => setScannerOpen(false)}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {cameraPermission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleScan(data)}
            />
          ) : (
            <View style={styles.permissionState}>
              <Text style={styles.permissionText}>Camera permission is required.</Text>
            </View>
          )}
        </View>
      </Modal>

      {isSigningOut ? (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutBox}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.logoutLoadingText}>Logging out...</Text>
          </View>
        </View>
      ) : null}
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  loaderWrap: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 16,
  },
  emptyStateTitle: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateText: {
    color: '#7c2d12',
    fontSize: 13,
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
  timeIcon: {
    marginRight: 4,
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
  metaText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
  actionColumn: {
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    minWidth: 62,
    borderRadius: 10,
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
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
  modalScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#450a0a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  camera: {
    flex: 1,
  },
  permissionState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
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
