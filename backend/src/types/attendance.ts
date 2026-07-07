export interface SubjectAttendance {
  subjectId: number;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface StudentAttendanceResponse {
  overallAttendance: number;
  subjects: SubjectAttendance[];
}

export interface AttendanceHistoryItem {
  sessionId: number;
  date: string;
  status: "Present" | "Absent";
}

export interface SubjectAttendanceHistoryResponse {
  subjectId: number;
  subjectName: string;
  history: AttendanceHistoryItem[];
}