import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import SessionCard from './SessionCard';
import {   RefreshControl } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Session } from "../../../types/session";
import { getTeacherAttendance } from "../../../services/attendanceService";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from 'react';
import { ActivityIndicator } from "react-native";

import { useIsFocused } from "@react-navigation/native";

import { USER_KEY } from '../../../context/AuthContext';



type SessionSummary = {
  sessionId: number;
  sessionDate: string;
  subject: string;
  division: string;
  present: number;
  absent: number;
  total: number;

  // For future backend
  startTime?: string;
  endTime?: string;
};

export default function AttendanceHistory() {

const sessionSummaries = useMemo(() => {
  const grouped = new Map<number, SessionSummary>();

  attendanceData.forEach((record) => {
    if (!grouped.has(record.session_id)) {
      grouped.set(record.session_id, {
        sessionId: record.session_id,
        sessionDate: record.session_date,


const [loading, setLoading] = useState(true);

const [refreshing, setRefreshing] = useState(false);

const summary = useMemo(() => {
  const sessions = sessionSummaries.length;

  const present = sessionSummaries.reduce(
    (sum, session) => sum + session.present,
    0
  );

  const absent = sessionSummaries.reduce(
    (sum, session) => sum + session.absent,
    0
  );

  const total = present + absent;

  const percentage =
    total === 0 ? 0 : ((present / total) * 100);

  return {
    sessions,
    present,
    absent,
    percentage,
  };
}, [sessionSummaries]);


const isFocused = useIsFocused();

useEffect(() => {
  if (isFocused) {
    console.log("Attendance screen focused");
    loadAttendance();
  }
}, [isFocused]);
 
  

const loadAttendance = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
   
    const user = userJson ? JSON.parse(userJson) : null;
    const teacherId = user?.erpId;
  

    if (!teacherId) {
      throw new Error("No logged-in teacher found. Please sign in again.");
    }

    const data = await getTeacherAttendance(teacherId);
    console.log("this is data",data);
    console.log("data from backend");

setSessions(data);

    
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};



const onRefresh = async () => {
  try {
    setRefreshing(true);
   

    await loadAttendance(); // Fetch latest attendance

   
  } catch (error) {
    console.error(error);
  } finally {
    setRefreshing(false);
  }
};



const availableDates = [
  "All",
  ...new Set(attendanceData.map(item => item.session_date)),
];

const availableSubjects = [
  "All",
  ...new Set(attendanceData.map(item => item.subject_id.toString())),
];

const availableDivisions = [
  "All",
  ...new Set(attendanceData.map(item => item.division_id)),
];

const filteredSessions = sessionSummaries.filter(session => {

  const dateMatch =
    selectedDate === "All" ||
    session.sessionDate === selectedDate;

  const subjectMatch =
    selectedSubject === "All" ||
    session.subject === `Subject ${selectedSubject}`;

  const divisionMatch =
    selectedDivision === "All" ||
    session.division === selectedDivision;

  return (
    dateMatch &&
    subjectMatch &&
    divisionMatch
  );
});

  return (
    <SafeAreaView style={styles.container}>
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
    refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }

  >
    <Text style={styles.heading}>
      Attendance History
    </Text>

    {/* Today's Summary */}

    {/* <View style={styles.summaryCard}>
      <Text style={styles.summaryHeading}>
        Today's Summary
      </Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Sessions Taken
        </Text>

        <Text style={styles.summaryValue}>
          {summary.sessions}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Present
        </Text>

        <Text style={styles.summaryValue}>
          {summary.present}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Absent
        </Text>

        <Text style={styles.summaryValue}>
          {summary.absent}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Overall Attendance
        </Text>

        <Text style={styles.summaryValue}>
          {summary.percentage.toFixed(1)}%
        </Text>
      </View>
    </View> */}

    <View style={styles.summaryCard}>
  <Text style={styles.summaryHeading}>
    Today's Summary
  </Text>

  {refreshing && (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#7f1d1d" />
      <Text style={styles.loadingText}>Refreshing...</Text>
    </View>
  )}

  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>
      Sessions Taken
    </Text>

    <Text style={styles.summaryValue}>
      {summary.sessions}
    </Text>
  </View>

  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>
      Present
    </Text>

    <Text style={styles.summaryValue}>
      {summary.present}
    </Text>
  </View>

  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>
      Absent
    </Text>

    <Text style={styles.summaryValue}>
      {summary.absent}
    </Text>
  </View>

  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>
      Overall Attendance
    </Text>

    <Text style={styles.summaryValue}>
      {summary.percentage.toFixed(1)}%
    </Text>
  </View>
</View>

    {/* Filters */}

    <View style={styles.filterCard}>
      <Text style={styles.filterTitle}>
        Filters
      </Text>

      <Text style={styles.filterLabel}>
        Date
      </Text>

      <Picker
        selectedValue={selectedDate}
        onValueChange={setSelectedDate}
        style={styles.picker}
        dropdownIconColor="#7f1d1d"
        itemStyle={{ color: "#222" }}
      >
        {availableDates.map((date) => (
          <Picker.Item
            key={date}
            label={date}
            value={date}
          />
        ))}
      </Picker>

      <Text style={styles.filterLabel}>
        Subject
      </Text>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        style={styles.picker}
        dropdownIconColor="#7f1d1d"
        itemStyle={{ color: "#222" }}
      >
        {availableSubjects.map((subject) => (
          <Picker.Item
            key={subject}
            label={subject}
            value={subject}
          />
        ))}
      </Picker>

      <Text style={styles.filterLabel}>
        Division
      </Text>

      <Picker
        selectedValue={selectedDivision}
        onValueChange={setSelectedDivision}
        style={styles.picker}
        dropdownIconColor="#7f1d1d"
        itemStyle={{ color: "#222" }}
      >
        {availableDivisions.map((division) => (
          <Picker.Item
            key={division}
            label={division}
            value={division}
          />
        ))}
      </Picker>
    </View>

    {/* Session Cards */}

    {filteredSessions.map((item) => (
      <SessionCard
        key={item.sessionId}
        sessionId={item.sessionId}
        subject={item.subject}
        division={item.division}
        present={item.present}
        absent={item.absent}
        total={item.total}
        onPress={() => {
          console.log(item.sessionId);
        }}
      />
    ))}
  </ScrollView>
</SafeAreaView>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#7f1d1d",
    marginBottom: 20,
  },
  summaryCard: {
  backgroundColor: "#ffffff",
  borderRadius: 18,
  padding: 18,
  marginBottom: 20,

  borderWidth: 1,
  borderColor: "#ead9c8",

  elevation: 2,
},

summaryHeading: {
  fontSize: 18,
  fontWeight: "700",
  color: "#7f1d1d",
  marginBottom: 14,
},

summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
},

loadingContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 10,
},

loadingText: {
  marginLeft: 8,
  color: "#666",
  fontSize: 14,
},

summaryLabel: {
  color: "#666",
  fontSize: 15,
},

summaryValue: {
  color: "#7f1d1d",
  fontWeight: "700",
  fontSize: 16,
},

filterCard: {
  backgroundColor: "#ffffff",
  borderRadius: 18,
  padding: 18,
  marginBottom: 20,

  borderWidth: 1,
  borderColor: "#ead9c8",

  elevation: 2,
},

filterTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#7f1d1d",
  marginBottom: 12,
},

filterLabel: {
  marginTop: 8,
  marginBottom: 4,
  color: "#555",
  fontWeight: "600",
},
picker: {
    color: "#222",          // Selected text color
    backgroundColor: "#fff",
},
scrollContent: {
  paddingBottom: 30,
},

});