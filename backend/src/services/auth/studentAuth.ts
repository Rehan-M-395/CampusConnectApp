import { AuthUser } from "../../types/auth";
import { authenticateFromTable } from "./shared";

export const authenticateStudent = async (
  erpId: string,
  password: string,
): Promise<AuthUser> =>
  authenticateFromTable(
    {
      tableName: "users",
      role: "student",
      idColumns: ["erpid"],
      nameColumns: ["name", "full_name"],
      passwordColumns: ["password_hash", "password"],
      allowedRoleValues: ["student", "Student"],
    },
    erpId,
    password,
  );
