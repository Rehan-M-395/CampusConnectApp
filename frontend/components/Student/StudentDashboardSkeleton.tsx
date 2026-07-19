import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function StudentDashboardSkeleton() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});