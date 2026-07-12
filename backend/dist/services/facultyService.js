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
    static createGatePass(teacherErpId, teacherName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from("gate_pass_requests")
                .insert({
                teacher_erpid: teacherErpId,
                teacher_name: teacherName,
                parent_name: payload.parent_name.trim(),
                num_persons: payload.num_persons,
                visit_date: payload.visit_date.trim(),
                visit_time: payload.visit_time.trim(),
                phone: payload.phone.trim(),
                email: payload.email.trim(),
                reason: payload.reason.trim(),
            })
                .select()
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        });
    }
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
            if (error) {
                throw new Error(error.message);
            }
            return data;
        });
    }
}
exports.default = FacultyService;
