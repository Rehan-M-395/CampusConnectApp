import StudentHome from '@/app/(student)/(drawer)/home';
import { AuthSession } from '../types/auth';

type MockStudent = {
  id: string;
  erpId: string;
  password: string;
  name: string;
};

const mockStudents: MockStudent[] = [
  {
    id: '1',
    erpId: '12345678',
    password: '12345678',
    name: 'Demo Student',
  },
];

export async function loginStudent(
  erpId: string,
  password: string,
): Promise<AuthSession | null> {
  const student = mockStudents.find(
    s => s.erpId === erpId && s.password === password,
  );

  console.log(student)

  if (!student) {
    return null;
  }

  return {
    token: 'mock-student-${student.erpId}',
    role: 'student',
    user: {
      id: student.id,
      erpId: student.erpId,
      name: student.name,
      role: 'student',
    },
  };
}