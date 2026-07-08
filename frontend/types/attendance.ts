export type SubjectAttendance = {
  subjectId: number;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
};

export type AttendanceResponse = {
  overallAttendance: number;
  subjects: SubjectAttendance[];
};