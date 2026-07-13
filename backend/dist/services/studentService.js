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
exports.StudentAttendanceService = void 0;
const supabase_1 = require("../config/supabase");
class StudentAttendanceService {
    static getAttendance(erpId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ERP ID =", erpId);
            const { data, error } = yield supabase_1.supabase
                .from("attendance_summary")
                .select("*")
                .eq("student_erpid", erpId);
            console.log("Error =", error);
            console.log("Data =", data);
            if (error) {
                throw new Error(error.message);
            }
            const rows = (data !== null && data !== void 0 ? data : []).map((row) => ({
                subject_id: row.subject_id,
                total_sessions: row.total_sessions,
                attended_sessions: row.attended_sessions,
                subjects: Array.isArray(row.subjects) ? row.subjects : [],
            }));
            const subjects = rows.map((row) => {
                var _a, _b;
                return ({
                    subjectId: row.subject_id,
                    subjectName: (_b = (_a = row.subjects[0]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown Subject",
                    attended: row.attended_sessions,
                    total: row.total_sessions,
                    percentage: row.total_sessions === 0
                        ? 0
                        : Math.round((row.attended_sessions * 100) / row.total_sessions),
                });
            });
            const totalAttended = subjects.reduce((sum, subject) => sum + subject.attended, 0);
            const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
            const overallAttendance = totalClasses === 0
                ? 0
                : Math.round((totalAttended * 100) / totalClasses);
            return {
                overallAttendance,
                subjects,
            };
        });
    }
}
exports.StudentAttendanceService = StudentAttendanceService;
