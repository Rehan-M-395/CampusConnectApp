import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Row = {
  Date: string;
  Day: string;
  LoginTime: string;
  LogoutTime: string;
  TotalHours: number;
};

type AttendanceApiRow = {
  login_time?: string | null;
  logout_time?: string | null;
  date?: string | null;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatTime = (value?: string | null) => {
  if (!value) return '--';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const toDayName = (dateStr?: string | null) => {
  if (!dateStr) return '--';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
};

export default function PreviousAttendance() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filterMode, setFilterMode] = useState<'date' | 'month'>('date');
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  const tableRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setRows([]);
          return;
        }

        const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://campusconnectapp-lu1d.onrender.com';
        const response = await fetch(`${apiBaseUrl}/api/attendance/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = (await response.json()) as { attendance?: AttendanceApiRow[] };
        if (!response.ok || !payload?.attendance) {
          setRows([]);
          return;
        }

        const mapped = payload.attendance.map((item) => {
          const loginTimeRaw = item.login_time ?? null;
          const logoutTimeRaw = item.logout_time ?? null;
          const loginMs = loginTimeRaw ? new Date(loginTimeRaw).getTime() : null;
          const logoutMs = logoutTimeRaw ? new Date(logoutTimeRaw).getTime() : null;

          const totalHours =
            loginMs && logoutMs && logoutMs > loginMs
              ? (logoutMs - loginMs) / (1000 * 60 * 60)
              : 0;

          return {
            Date: item.date ?? '--',
            Day: toDayName(item.date),
            LoginTime: formatTime(loginTimeRaw),
            LogoutTime: formatTime(logoutTimeRaw),
            TotalHours: totalHours,
          };
        });

        setRows(mapped);

        const firstDate = mapped.find((row) => row.Date !== '--')?.Date;
        if (firstDate) {
          setDatePickerValue(new Date(`${firstDate}T00:00:00`));
        }
      } catch (_error) {
        setRows([]);
      }
    };

    fetchHistory();
  }, []);

  const filteredRows = useMemo(() => {
    if (filterMode === 'date') {
      return rows.filter((row) => selectedDate === 'All' || row.Date === selectedDate);
    }

    return rows.filter((row) => {
      if (selectedMonth === 'All') return true;
      if (!row.Date || row.Date === '--') return false;
      return row.Date.slice(0, 7) === selectedMonth;
    });
  }, [rows, filterMode, selectedDate, selectedMonth]);

  const onDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (!date) return;

    setDatePickerValue(date);

    if (filterMode === 'date') {
      setSelectedDate(formatDate(date));
    } else {
      setSelectedMonth(formatMonth(date));
    }
  };

  const scrollTableStart = () => tableRef.current?.scrollTo({ x: 0, animated: true });
  const scrollTableEnd = () => tableRef.current?.scrollTo({ x: 10000, animated: true });

  return (
    <View style={styles.screen}>
      <View style={styles.tableWrapper}>
        <View style={styles.filterModeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, filterMode === 'date' && styles.modeBtnActive]}
            onPress={() => setFilterMode('date')}
          >
            <Text style={[styles.modeBtnText, filterMode === 'date' && styles.modeBtnTextActive]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, filterMode === 'month' && styles.modeBtnActive]}
            onPress={() => setFilterMode('month')}
          >
            <Text style={[styles.modeBtnText, filterMode === 'month' && styles.modeBtnTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateFilterRow}>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerBtnText}>
              {filterMode === 'date'
                ? selectedDate === 'All'
                  ? 'Select Date'
                  : selectedDate
                : selectedMonth === 'All'
                ? 'Select Month'
                : selectedMonth}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              (filterMode === 'date' ? selectedDate : selectedMonth) === 'All' && styles.filterChipActive,
            ]}
            onPress={() => {
              if (filterMode === 'date') setSelectedDate('All');
              else setSelectedMonth('All');
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                (filterMode === 'date' ? selectedDate : selectedMonth) === 'All' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <Text style={styles.scrollHint}>Swipe left/right to view all columns</Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={scrollTableStart}>
            <Text style={styles.controlBtnText}>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={scrollTableEnd}>
            <Text style={styles.controlBtnText}>Right</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.rowsViewport}
          contentContainerStyle={styles.rowsViewportContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          <ScrollView
            ref={tableRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator
            style={styles.tableScroll}
            nestedScrollEnabled
          >
            <View style={styles.tableContent}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell]}>Date</Text>
                <Text style={[styles.cell, styles.headerCell]}>Day</Text>
                <Text style={[styles.cell, styles.headerCell]}>Login</Text>
                <Text style={[styles.cell, styles.headerCell]}>Logout</Text>
                <Text style={[styles.cell, styles.headerCell]}>Hours</Text>
              </View>

              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <View key={`${row.Date}-${row.LoginTime}`} style={styles.row}>
                    <Text style={styles.cell}>{row.Date}</Text>
                    <Text style={styles.cell}>{row.Day}</Text>
                    <Text style={styles.cell}>{row.LoginTime}</Text>
                    <Text style={styles.cell}>{row.LogoutTime}</Text>
                    <Text style={styles.cell}>{row.TotalHours.toFixed(2)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateRow}>
                  <Text style={styles.emptyStateText}>No records found.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  tableWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
  },
  modeBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  modeBtnTextActive: {
    color: '#ffffff',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  datePickerBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  datePickerBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChip: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#60a5fa',
  },
  filterChipText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  controlBtnText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  tableScroll: {
    width: '100%',
  },
  rowsViewport: {
    flex: 1,
  },
  rowsViewportContent: {
    flexGrow: 1,
  },
  tableContent: {
    width: 575,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 9,
  },
  headerRow: {
    borderBottomColor: '#475569',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 2,
  },
  cell: {
    width: 115,
    color: '#e2e8f0',
    textAlign: 'center',
    fontSize: 12,
  },
  headerCell: {
    color: '#bfdbfe',
    fontWeight: '700',
  },
  emptyStateRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
