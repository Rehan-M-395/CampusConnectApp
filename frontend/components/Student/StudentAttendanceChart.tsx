import {  useState, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  createAnimatedComponent,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { SubjectAttendance } from "../../types/attendance";

type Props = {
  overallAttendance: number;
  subjects: SubjectAttendance[];
};

const { width } = Dimensions.get("window");

const SIZE = Math.min(width * 0.58, 240);
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = createAnimatedComponent(Circle);
const AnimatedView = createAnimatedComponent(View);

export default function StudentAttendanceChart({
  overallAttendance,
  subjects,
}: Props) {
  const progress = useSharedValue(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  const cardOpacity = useSharedValue(0);

  const cardTranslateY = useSharedValue(25);

  useEffect(() => {
    setDisplayPercentage(0);

    cardOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    cardTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    progress.value = withDelay(
      250,
      withTiming(overallAttendance, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [overallAttendance]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      {
        translateY: cardTranslateY.value,
      },
    ],
  }));

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset:
      CIRCUMFERENCE -
      (progress.value / 100) * CIRCUMFERENCE,
  }));

  useAnimatedReaction(
  () => progress.value,
  (value) => {
    runOnJS(setDisplayPercentage)(Math.round(value));
  }
);

  const totalPresent = subjects.reduce(
    (sum, subject) => sum + subject.attended,
    0
  );

  const totalAbsent = subjects.reduce(
    (sum, subject) => sum + (subject.total - subject.attended),
    0
  );

  return (
    <AnimatedView
      style={[styles.card, animatedCardStyle]}
    >
      <View style={styles.chartContainer}>
        <Svg
          width={SIZE}
          height={SIZE}
        >
          <Defs>
            <LinearGradient
              id="attendanceGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor="#4E0015"
              />

              <Stop
                offset="45%"
                stopColor="#7B1028"
              />

              <Stop
                offset="100%"
                stopColor="#A92D4D"
              />
            </LinearGradient>
          </Defs>

          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#ECECEC"
            strokeWidth={STROKE}
            fill="none"
          />

          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#attendanceGradient)"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedCircleProps}
            rotation="-90"
            origin={`${SIZE / 2},${SIZE / 2}`}
          />
        </Svg>

        <Animated.View
          entering={FadeInDown.delay(450).duration(500)}
          style={styles.center}
        >
          <Text style={styles.percentage}>
            {displayPercentage}%
          </Text>

          <Text style={styles.label}>
            Overall{"\n"}Attendance
          </Text>
        </Animated.View>
      </View>

      <View style={styles.divider} />

      <Animated.View
        entering={FadeInUp.delay(1200).duration(600)}
        style={styles.statsRow}
      >
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {totalPresent}
          </Text>

          <Text style={styles.statLabel}>
            Present
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {totalAbsent}
          </Text>

          <Text style={styles.statLabel}>
            Absent
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {subjects.length}
          </Text>

          <Text style={styles.statLabel}>
            Subjects
          </Text>
        </View>
      </Animated.View>
    </AnimatedView>
  );
}

  const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFCFD",
    borderRadius: 32,
    paddingVertical: 28,
    marginBottom: 28,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },

  center: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },

  percentage: {
    fontSize: 42,
    fontWeight: "800",
    color: "#5C1127",
  },

  label: {
    marginTop: 6,
    fontSize: 15,
    color: "#7A7A7A",
    textAlign: "center",
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginHorizontal: 24,
    marginTop: 18,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 22,
    paddingHorizontal: 10,
  },

  stat: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5C1127",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },
});