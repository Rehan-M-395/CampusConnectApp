import { supabase } from "../config/supabase";
import {
  AttendanceHistoryDay,
  AttendanceSummary,
  HodAttendanceResponse,
  HodDashboardResponse,
} from "../types/hodTypes";

const HISTORY_DAYS = 5;

const getTodayIst = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const getLastNDatesIst = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d));
  }
  return dates.sort(); // ascending, oldest first
};

const toPercentage = (present: number, total: number): number =>
  total > 0 ? Math.round((present / total) * 100) : 0;

const buildDeptOrFilter = (departmentName: string, departmentShortCode?: string): string => {
  const patterns = new Set<string>();

  if (departmentShortCode) {
    patterns.add(`dept.ilike.${departmentShortCode}`);
  }

  patterns.add(`dept.ilike.${departmentName}`);

  const firstWord = departmentName.split(" ")[0];
  if (firstWord && firstWord !== departmentName) {
    patterns.add(`dept.ilike.${firstWord}%`);
  }

  return Array.from(patterns).join(",");
};

class HodService {

  static async getStudentTotal(departmentId: number): Promise<number> {
    const { count, error } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId)
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  static async getStudentAttendance(departmentId: number): Promise<HodAttendanceResponse> {
    const totalStudents = await this.getStudentTotal(departmentId);
    const dates = getLastNDatesIst(HISTORY_DAYS);
    const today = getTodayIst();

    const { data, error } = await supabase
      .from("attendance_details")
      .select("student_erpid, status, session_date")
      .eq("department_id", departmentId)
      .gte("session_date", dates[0])
      .lte("session_date", dates[dates.length - 1]);

    if (error) throw new Error(error.message);

    const history: AttendanceHistoryDay[] = dates.map((date) => {
      const presentSet = new Set(
        (data ?? [])
          .filter((row) => row.session_date === date && row.status === "Present")
          .map((row) => row.student_erpid),
      );
      const present = presentSet.size;
      return {
        date,
        present,
        total: totalStudents,
        percentage: toPercentage(present, totalStudents),
      };
    });

    const todaySummary =
      history.find((h) => h.date === today) ?? { date: today, present: 0, total: totalStudents, percentage: 0 };

    return {
      today: {
        total: todaySummary.total,
        present: todaySummary.present,
        absent: Math.max(todaySummary.total - todaySummary.present, 0),
        percentage: todaySummary.percentage,
      },
      history,
    };
  }

  static async getStaffErpIds(departmentName: string, departmentShortCode?: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("users")
      .select("erpid, role")
      .ilike("role", "faculty")
      .or(buildDeptOrFilter(departmentName, departmentShortCode));

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.erpid as string);
  }

  static async getStaffAttendance(
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<HodAttendanceResponse> {
    const erpIds = await this.getStaffErpIds(departmentName, departmentShortCode);
    const totalStaff = erpIds.length;
    const dates = getLastNDatesIst(HISTORY_DAYS);
    const today = getTodayIst();

    if (totalStaff === 0) {
      return {
        today: { total: 0, present: 0, absent: 0, percentage: 0 },
        history: dates.map((date) => ({ date, present: 0, total: 0, percentage: 0 })),
      };
    }

    const { data, error } = await supabase
      .from("attendance_logs")
      .select("erpid, date, login_time")
      .in("erpid", erpIds)
      .gte("date", dates[0])
      .lte("date", dates[dates.length - 1]);

    if (error) throw new Error(error.message);

    const history: AttendanceHistoryDay[] = dates.map((date) => {
      const presentSet = new Set(
        (data ?? [])
          .filter((row) => row.date === date && row.login_time !== null)
          .map((row) => row.erpid),
      );
      const present = presentSet.size;
      return {
        date,
        present,
        total: totalStaff,
        percentage: toPercentage(present, totalStaff),
      };
    });

    const todaySummary =
      history.find((h) => h.date === today) ?? { date: today, present: 0, total: totalStaff, percentage: 0 };

    return {
      today: {
        total: todaySummary.total,
        present: todaySummary.present,
        absent: Math.max(todaySummary.total - todaySummary.present, 0),
        percentage: todaySummary.percentage,
      },
      history,
    };
  }

  static async getDashboard(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<HodDashboardResponse> {
    const [studentAttendance, staffAttendance] = await Promise.all([
      this.getStudentAttendance(departmentId),
      this.getStaffAttendance(departmentName, departmentShortCode),
    ]);

    const combinedTotal = studentAttendance.today.total + staffAttendance.today.total;
    const combinedPresent = studentAttendance.today.present + staffAttendance.today.present;

    return {
      departmentId,
      departmentName,
      overallPercentage: toPercentage(combinedPresent, combinedTotal),
      students: studentAttendance.today,
      staff: staffAttendance.today,
    };
  }
}

export default HodService;