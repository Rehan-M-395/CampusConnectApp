import { supabase } from "../config/supabase";
import { sendNotification } from "../config/firebaseAdmin";
import {SessionCreateRequest} from "../types/facultyTypes";

class FacultyService {
  static async saveToken(erpid: string, token: string): Promise<void> {
    const { error } = await supabase
      .from("fcm_tokens")
      .upsert({ erpid, token }, { onConflict: "erpid" });

    if (error) {
      throw new Error(error.message);
    }
  }

  static async triggerNotification(erpid: string, type?: string): Promise<void> {
    await sendNotification(erpid, type);
  }

  static async sessionStart(payload: SessionCreateRequest, facultyErpId: string) {
    // console.log("this is payload",payload);
    console.log("this is insertion rotue");
    console.log("this is facultyErpId",facultyErpId);
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        ...payload,
        faculty_erpid: facultyErpId,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }

    return data.id;
  }

  static async completeSession(sessionID: number) {
    const { data, error } = await supabase
      .from("sessions")
      .update({
        status: "pending",
      })
      .eq("id", sessionID)
      .select();

      console.log("data:", data);
      console.log("error:", error);

      if (error) {
        console.log("got the error");
        throw new Error(error.message);
      }

    console.log("changed to pending");
    return data;
  }

  static async initializeAttendance(
    sessionID: number,
    payload: any
  ) {
    const {
      department_id,
      division_id,
      year,
      subject_id,
      session_date,
    } = payload;

    // Fetch all students of the class
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("erpid")
      .eq("department_id", department_id)
      .eq("division_id", division_id)
      .eq("year", year);

    if (studentError) {
      throw new Error(studentError.message);
    }

    if (!students || students.length === 0) {
      return;
    }

    // Create attendance rows with default status = Absent
    const attendanceRows = students.map((student) => ({
      student_erpid: student.erpid,
      session_id: sessionID,
      subject_id,
      division_id,
      department_id,
      session_date,
      status: "Absent",
      source: "auto",
      confidence: null,
      marked_by: null,
      detected_at: null,
    }));

    const { error: insertError } = await supabase
      .from("attendance_details")
      .insert(attendanceRows);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return attendanceRows.length;
  }

  static async getDropdownData() {
    // =======================
    // Fetch Subjects
    // =======================
    const { data: subjects, error: subjectError } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    console.log("Subjects Error:", subjectError);
    console.log("Raw Subjects:", subjects);

    if (subjectError) {
      throw new Error(subjectError.message);
    }

    // =======================
    // Fetch Divisions
    // =======================
    const { data: divisions, error: divisionError } = await supabase
      .from("divisions")
      .select("*")
      .order("div_name");

    console.log("Divisions Error:", divisionError);
    console.log("Raw Divisions:", divisions);

    if (divisionError) {
      throw new Error(divisionError.message);
    }

    // =======================
    // Format Subjects
    // =======================
    const formattedSubjects = (subjects ?? []).map((subject) => ({
      label: subject.name,
      value: subject.id,
    }));

    // =======================
    // Format Sections
    // =======================
    const formattedSections = (divisions ?? []).map((division) => ({
      label: `Section ${division.div_name}`,
      division: division.div_name,
      divisionId: division.id,
    }));

    console.log("Formatted Subjects:", formattedSubjects);
    console.log("Formatted Sections:", formattedSections);

    const response = {
      subjects: formattedSubjects,
      sections: formattedSections,
    };

    console.log("Final Response:", JSON.stringify(response, null, 2));

    return response;
  }
}



export default FacultyService;
