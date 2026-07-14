import React, { useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  StyleSheet,
  Text,
  FlatList,
  View,
} from "react-native";

import StudentRow from "./StudentRow";

import {
  studentData,
  Student,
} from "./studentData";



export default function SessionDetails() {

  const [students, setStudents] =
    useState<Student[]>(studentData);

    const presentCount = students.filter(
  student => student.status === "Present"
).length;

const absentCount = students.filter(
  student => student.status === "Absent"
).length;

const attendancePercentage =
  students.length === 0
    ? 0
    : ((presentCount / students.length) * 100).toFixed(1);

  const toggleAttendance = (id: number) => {

    /*
    ====================================================

    Prashant Bhaiya,

    present absent mechanism change ka code yaha hai.

    Backend API call yahi lagegi.

    ====================================================
    */

    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "Present"
                  ? "Absent"
                  : "Present",
            }
          : student
      )
    );
  };

  return (
    <View style={styles.container}>

    <Text style={styles.heading}>
        Student Attendance
    </Text>

    <View style={styles.summaryContainer}>

    <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
            Present
        </Text>

        <Text style={styles.summaryValue}>
            {presentCount}
        </Text>
    </View>

    <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
            Absent
        </Text>

        <Text style={styles.summaryValue}>
            {absentCount}
        </Text>
    </View>

    <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
            Attendance
        </Text>

        <Text style={styles.summaryValue}>
            {attendancePercentage}%
        </Text>
    </View>

    </View>



      <FlatList
        data={students}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            onToggle={toggleAttendance}
          />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#7f1d1d",
    marginBottom: 20,
  },
  summaryContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 20,
},

summaryCard: {
  flex: 1,

  backgroundColor: "#ffffff",

  borderRadius: 16,

  paddingVertical: 16,

  marginHorizontal: 4,

  alignItems: "center",

  borderWidth: 1,

  borderColor: "#ead9c8",

  elevation: 2,
},

summaryTitle: {
  color: "#666",
  fontSize: 14,
  fontWeight: "600",
},

summaryValue: {
  marginTop: 8,
  color: "#7f1d1d",
  fontWeight: "700",
  fontSize: 22,
},
});