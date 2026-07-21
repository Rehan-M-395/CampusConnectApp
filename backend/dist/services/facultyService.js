"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
class FacultyService {
    static saveToken(erpid, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield supabase_1.supabase
                .from("fcm_tokens")
                .upsert({ erpid, token }, { onConflict: "erpid" });
            if (error) {
                throw new Error(error.message);
            }
        });
    }
    static triggerNotification(erpid, type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, firebaseAdmin_1.sendNotification)(erpid, type);
        });
    }
    static sessionStart(payload, facultyErpId) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("this is payload",payload);
            console.log("this is insertion rotue");
            console.log("this is facultyErpId", facultyErpId);
            const { data, error } = yield supabase_1.supabase
                .from("sessions")
                .insert(Object.assign(Object.assign({}, payload), { faculty_erpid: facultyErpId }))
                .select()
                .single();
            if (error) {
                console.log(error);
                throw new Error(error.message);
            }
            return data.id;
        });
    }
    static completeSession(sessionID) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
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
        });
    }
    static initializeAttendance(sessionID, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { department_id, division_id, year, subject_id, session_date, } = payload;
            // Fetch all students of the class
            const { data: students, error: studentError } = yield supabase_1.supabase
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
                source: "system",
                confidence: null,
                marked_by: null,
                detected_at: null,
            }));
            const { error: insertError } = yield supabase_1.supabase
                .from("attendance_details")
                .insert(attendanceRows);
            if (insertError) {
                throw new Error(insertError.message);
            }
            return attendanceRows.length;
        });
    }
    static getDropdownData() {
        return __awaiter(this, void 0, void 0, function* () {
            // Subjects
            const { data: subjects, error: subjectError } = yield supabase_1.supabase
                .from("subjects")
                .select("id, name")
                .order("name");
            if (subjectError) {
                throw new Error(subjectError.message);
            }
            // Divisions
            const { data: divisions, error: divisionError } = yield supabase_1.supabase
                .from("divisions")
                .select("id, div_name")
                .order("div_name");
            if (divisionError) {
                throw new Error(divisionError.message);
            }
            console.log("subject", subjects, "sections", divisions);
            return {
                subjects: subjects.map((subject) => ({
                    label: subject.subject_name,
                    value: subject.id,
                })),
                sections: divisions.map((division) => ({
                    label: `Section ${division.div_name}`,
                    division: division.div_name,
                    divisionId: division.id,
                })),
            };
        });
    }
}
exports.default = FacultyService;
