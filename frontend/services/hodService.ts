export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface HodDashboardData {
  success: boolean;
  departmentId: number;
  departmentName: string;
  loginTime: string | null;
  logoutTime: string | null;
  students: AttendanceSummary;
  staff: AttendanceSummary;
}

export async function getHodDashboard(
  apiBaseUrl: string,
  token: string
): Promise<HodDashboardData> {
  const response = await fetch(`${apiBaseUrl}/api/hod/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch HOD dashboard (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch HOD dashboard data");
  }

  return data;
}
