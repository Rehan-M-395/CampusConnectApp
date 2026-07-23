import { supabase } from "../config/supabase";
import {
  AttendanceHistoryDay,
  AttendanceSummary,
  HodAttendanceResponse,
  HodDashboardResponse,
} from "../types/hodTypes";

const HISTORY_DAYS = 7;

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

  static async getStaffErpIds(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<string[]> {
    const erpSet = new Set<string>();

    // 1. Query faculty table by department_id
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("erpid")
      .eq("department_id", departmentId)
      .eq("is_active", true);

    (facultyData ?? []).forEach((row) => row.erpid && erpSet.add(row.erpid));

    // 2. Query users table by department name / shortcode
    const { data: userData } = await supabase
      .from("users")
      .select("erpid")
      .ilike("role", "faculty")
      .or(buildDeptOrFilter(departmentName, departmentShortCode));

    (userData ?? []).forEach((row) => row.erpid && erpSet.add(row.erpid));

    return Array.from(erpSet);
  }

  static async getStaffAttendance(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
  ): Promise<HodAttendanceResponse> {
    const erpIds = await this.getStaffErpIds(departmentId, departmentName, departmentShortCode);
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

  static async getHodTodayLogs(
    hodErpId: string
  ): Promise<{ loginTime: string | null; logoutTime: string | null }> {
    if (!hodErpId) return { loginTime: null, logoutTime: null };
    const today = getTodayIst();
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("login_time, logout_time, final_logout_time")
      .ilike("erpid", hodErpId)
      .eq("date", today)
      .order("login_time", { ascending: false, nullsFirst: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      const logout = row.final_logout_time ?? row.logout_time ?? null;
      return {
        loginTime: row.login_time ?? null,
        logoutTime: logout,
      };
    }

    if (error) console.error("[hod/getHodTodayLogs] today query error:", error);

    // Fallback: Fetch most recent log if no log exists for today
    const { data: latestData, error: latestError } = await supabase
      .from("attendance_logs")
      .select("login_time, logout_time, final_logout_time")
      .ilike("erpid", hodErpId)
      .order("date", { ascending: false })
      .order("login_time", { ascending: false, nullsFirst: false })
      .limit(1);

    if (latestError) console.error("[hod/getHodTodayLogs] latest query error:", latestError);

    if (latestData && latestData.length > 0) {
      const row = latestData[0];
      const logout = row.final_logout_time ?? row.logout_time ?? null;
      return {
        loginTime: row.login_time ?? null,
        logoutTime: logout,
      };
    }

    return { loginTime: null, logoutTime: null };
  }

  static async getDashboard(
    departmentId: number,
    departmentName: string,
    departmentShortCode?: string,
    hodErpId?: string,
  ): Promise<HodDashboardResponse> {
    const [studentAttendance, staffAttendance, hodLogs] = await Promise.all([
      this.getStudentAttendance(departmentId),
      this.getStaffAttendance(departmentId, departmentName, departmentShortCode),
      hodErpId ? this.getHodTodayLogs(hodErpId) : Promise.resolve({ loginTime: null, logoutTime: null }),
    ]);

    return {
      departmentId,
      departmentName,
      loginTime: hodLogs.loginTime,
      logoutTime: hodLogs.logoutTime,
      students: studentAttendance.today,
      staff: staffAttendance.today,
      studentHistory: studentAttendance.history,
      staffHistory: staffAttendance.history,
    };
  }
}

export default HodService;