import { ScrollView, StyleSheet } from "react-native";
import StudentDashboard from "../../../components/Student/StudentDashboard";

export default function StudentHome() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <StudentDashboard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});