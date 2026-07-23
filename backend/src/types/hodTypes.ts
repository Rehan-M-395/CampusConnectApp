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
  loginTime: string | null;
  logoutTime: string | null;
  students: AttendanceSummary;
  staff: AttendanceSummary;
  studentHistory: AttendanceHistoryDay[];
  staffHistory: AttendanceHistoryDay[];
}

export interface HodAttendanceResponse {
  today: AttendanceSummary;
  history: AttendanceHistoryDay[];
}