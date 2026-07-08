import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SubjectAttendance = {

  subjectId: number;

  subjectName: string;

  attended: number;

  total: number;

  percentage: number;

};

type Props = {

  subject: SubjectAttendance;

};

export default function StudentSubjectCard({
  subject,
}: Props) {

  return (

    <TouchableOpacity style={styles.card}>

      <View>

        <Text style={styles.name}>
          {subject.subjectName}
        </Text>

        <Text style={styles.subtitle}>
          {subject.attended}/{subject.total} Classes
        </Text>

      </View>

      <View style={styles.right}>

        <Text style={styles.percent}>
          {subject.percentage}%
        </Text>

      </View>

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({

  card: {

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 22,

    marginBottom: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    elevation: 3,

  },

  name: {

    fontSize: 19,

    fontWeight: "700",

    color: "#222",

  },

  subtitle: {

    marginTop: 8,

    color: "#888",

  },

  right: {

    width: 65,

    height: 65,

    borderRadius: 33,

    backgroundColor: "#F6F1EA",

    justifyContent: "center",

    alignItems: "center",

  },

  percent: {

    color: "#8A6A3D",

    fontWeight: "700",

    fontSize: 20,

  },

});