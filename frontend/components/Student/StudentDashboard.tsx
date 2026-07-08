import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import StudentAttendanceChart from "./StudentAttendanceChart";
import StudentDashboardSkeleton from "./StudentDashboardSkeleton";
import StudentSubjectCard from "./StudentSubjectCard";

type SubjectAttendance = {
  subjectId: number;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
};

type AttendanceResponse = {
  overallAttendance: number;
  subjects: SubjectAttendance[];
};

export default function StudentDashboard() {
  const { apiBaseUrl, session } = useAuth();

  const [attendance, setAttendance] =
    useState<AttendanceResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setError("");

      const response = await fetch(
        `${apiBaseUrl}/api/student/attendance`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAttendance(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StudentAttendanceChart
        overallAttendance={attendance?.overallAttendance ?? 0}
        subjects={attendance?.subjects ?? []}
    />

      <Text style={styles.heading}>
        Your Subjects
      </Text>

      {attendance?.subjects.map((subject) => (
        <StudentSubjectCard
          key={subject.subjectId}
          subject={subject}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal:18,
    paddingTop:20,
    paddingBottom:60,
    backgroundColor:"#F5F3F4",
  },

  heading: {
    fontSize:24,
    fontWeight:"700",
    color:"#2B2B2B",
    marginBottom:20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});