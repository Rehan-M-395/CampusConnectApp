export interface Attendance {
  id: number;
  student_erpid: string;
  session_id: number;
  subject_id: number;
  division_id: string;
  department_id: number;
  session_date: string;
  status: "Present" | "Absent";
  source: string;
  confidence: number | null;
  marked_by: string | null;
  detected_at: string | null;
  updated_at: string;
}