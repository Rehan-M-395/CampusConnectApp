import { AuthUser } from "../../types/auth";
import { authenticateFromTable } from "./shared";

export const authenticateGuard = async (
  erpId: string,
  password: string,
): Promise<AuthUser> =>
  authenticateFromTable(
    {
      tableName: "users",
      role: "guard",
      idColumns: ["erpid"],
      nameColumns: ["name", "full_name"],
      passwordColumns: ["password_hash", "password"],
      allowedRoleValues: ["guard", "Guard"],
    },
    erpId,
    password,
  );
