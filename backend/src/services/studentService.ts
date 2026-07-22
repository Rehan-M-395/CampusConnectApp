import { supabase } from "../config/supabase";
import {
  StudentAttendanceResponse,
  SubjectAttendance,
} from "../types/attendance";

type AttendanceSummaryRow = {
  subject_id: number;
  total_sessions: number;
 attended_sessions: number;
  subjects: {
    id: number;
    name: string;
  } | null;
};

export class StudentAttendanceService {
  static async getAttendance(
    erpId: string,
  ): Promise<StudentAttendanceResponse> {

    console.log("ERP ID =", erpId);

    console.log("Fetching attendance...");

    const { data, error } = await supabase
  .from("attendance_summary")
  .select(`
    subject_id,
    total_sessions,
    attended_sessions,
    subjects (
      id,
      name
    )
  `)
  .eq("student_erpid", erpId);

console.log("ERROR:", error);
console.log("DATA:", JSON.stringify(data, null, 2));

    if (error) {
      throw new Error(error.message);
    }

    const rows: AttendanceSummaryRow[] = (data ?? []).map((row: any) => ({
  subject_id: row.subject_id,
  total_sessions: row.total_sessions,
  attended_sessions: row.attended_sessions,
  subjects: row.subjects,
}));

    const subjects: SubjectAttendance[] = rows.map((row) => ({
  subjectId: row.subject_id,
  subjectName: row.subjects?.name ?? "Unknown Subject",
  attended: row.attended_sessions,
  total: row.total_sessions,
  percentage:
    row.total_sessions === 0
      ? 0
      : Math.round((row.attended_sessions * 100) / row.total_sessions),
}));

    const totalAttended = subjects.reduce(
      (sum, subject) => sum + subject.attended,
      0,
    );

    const totalClasses = subjects.reduce(
      (sum, subject) => sum + subject.total,
      0,
    );

    const overallAttendance =
      totalClasses === 0
        ? 0
        : Math.round((totalAttended * 100) / totalClasses);

    return {
      overallAttendance,
      subjects,
    };
  }
}