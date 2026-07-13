import { Session } from "../types/session";

const API_URL = "https://campusconnectapp-lu1d.onrender.com/api";


export async function getTeacherAttendance(
  teacherId: string
): Promise<Session[]> {
  const response = await fetch(
    `${API_URL}/faculty/teacher/${teacherId}`
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.sessions;
}