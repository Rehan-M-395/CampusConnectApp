import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";
import { SubjectAttendance } from "../../types/attendance";

type Props = {
    overallAttendance: number;
    subjects: SubjectAttendance[];
};

const SIZE = 230;
const STROKE_WIDTH = 18;

const RADIUS = (SIZE - STROKE_WIDTH) / 2;

const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StudentAttendanceChart({
    overallAttendance,
}: Props) {

    const progress =
        CIRCUMFERENCE -
        (overallAttendance / 100) * CIRCUMFERENCE;

    return (
        <View style={styles.container}>

            <Svg
                width={SIZE}
                height={SIZE}
            >

                {/* Background */}

                <Circle
                    stroke="#E7E7E7"
                    fill="none"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                />

                {/* Progress */}

                <Circle
                    stroke="#800020"
                    fill="none"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${SIZE / 2}, ${SIZE / 2}`}
                />

            </Svg>
            <View style={styles.center}>

                <Text style={styles.percent}>
                    {overallAttendance}%
                </Text>

                <Text style={styles.label}>
                    Overall
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 30,
    },

    center: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },

    percent: {
        fontSize: 42,
        fontWeight: "700",
        color: "#800020",
    },

    label: {
        marginTop: 4,
        color: "#777",
        fontSize: 16,
    },

});