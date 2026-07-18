import { supabase } from "../../config/supabase";
import { AuthUser } from "../../types/auth";

// TEMPORARY: the `hod` table has no password column yet, so every HOD
// account authenticates with this shared default password for now.
const HOD_TEMP_PASSWORD = "12345678";

type HodRow = {
  id: number;
  erpid: string;
  name: string;
  is_active: boolean;
  department_id: number | null;
  departments: { name: string; short_code: string | null } | { name: string; short_code: string | null }[] | null;
};

export const authenticateHod = async (
  erpId: string,
  password: string,
): Promise<AuthUser> => {
  if (password !== HOD_TEMP_PASSWORD) {
    throw new Error("Invalid password.");
  }

  const { data, error } = await supabase
    .from("hod")
    .select("id, erpid, name, is_active, department_id, departments ( name, short_code )")
    .ilike("erpid", erpId)
    .limit(1)
    .maybeSingle<HodRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("HOD account not found.");
  }

  if (data.is_active === false) {
    throw new Error("This HOD account has been deactivated.");
  }

  if (!data.department_id) {
    // This HOD row exists but has no department assigned yet — HOD-scoped
    // endpoints (dashboard/students/staff) will not work until this is set
    // on the `hod` table in Supabase.
    throw new Error(
      "This HOD account has no department assigned yet. Please ask an admin to set a department for this account.",
    );
  }

  const departmentRelation = Array.isArray(data.departments)
    ? data.departments[0]
    : data.departments;

  return {
    id: String(data.id),
    erpId: data.erpid,
    name: data.name,
    role: "hod",
    departmentId: data.department_id,
    departmentName: departmentRelation?.name,
    departmentShortCode: departmentRelation?.short_code ?? undefined,
  };
};