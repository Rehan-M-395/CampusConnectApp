export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface AttendanceHistoryDay {
  date: string;
  present: number;
  total: number;
  percentage: number;
}

export interface HodDashboardResponse {
  departmentId: number;
  departmentName: string;
  overallPercentage: number;
  students: AttendanceSummary;
  staff: AttendanceSummary;
}

export interface HodAttendanceResponse {
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
}