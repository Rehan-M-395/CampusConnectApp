import { Attendance } from "./attendance";

export interface Session {
  id: number;
  faculty_erpid: string;

  subject_id: number;
  division: string;
  division_id: string;
  department_id: number;

  session_date: string;

  start_time: string;
  end_time: string;

  present_count: number | null;
  absent_count: number | null;

  status: string;
  location: string;

  semester: number;
  year: number;

  attendance: Attendance[];
}