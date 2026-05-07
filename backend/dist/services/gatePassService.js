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
const supabase_1 = require("./supabase");
const TABLE_NAME = "gate_pass_requests";
const formatDbTimestamp = () => new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
}).format(new Date()).replace(" ", "T");
const parseGatePassId = (qrValue) => {
    var _a;
    const trimmed = qrValue.trim();
    if (!trimmed) {
        throw new Error("QR data is empty.");
    }
    try {
        const parsed = JSON.parse(trimmed);
        if ((_a = parsed.gate_pass_id) === null || _a === void 0 ? void 0 : _a.trim()) {
            return parsed.gate_pass_id.trim();
        }
    }
    catch (_b) {
        // fall through
    }
    return trimmed;
};
class GatePassService {
    static createGatePass(teacherErpId, teacherName, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
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
    static listGatePasses() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
                .select("*")
                .order("generated_at", { ascending: false });
            if (error) {
                throw new Error(error.message);
            }
            return data !== null && data !== void 0 ? data : [];
        });
    }
    static listGuardHistory(guardErpId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("guard_erpid", guardErpId)
                .order("generated_at", { ascending: false });
            if (error) {
                throw new Error(error.message);
            }
            return data !== null && data !== void 0 ? data : [];
        });
    }
    static scanGatePass(qrValue, guardErpId, guardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const gatePassId = parseGatePassId(qrValue);
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
                .update({
                qr_scanned: 1,
                guard_erpid: guardErpId,
                guard_name: guardName,
            })
                .eq("id", gatePassId)
                .eq("qr_scanned", 0)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
            if ((error === null || error === void 0 ? void 0 : error.code) === "PGRST116") {
                const { data: existing, error: existingError } = yield supabase_1.supabase
                    .from(TABLE_NAME)
                    .select("*")
                    .eq("id", gatePassId)
                    .maybeSingle();
                if (existingError) {
                    throw new Error(existingError.message);
                }
                if (!existing) {
                    throw new Error("Gate pass not found.");
                }
                if (existing.qr_scanned === 1) {
                    throw new Error("QR code has already been scanned.");
                }
            }
            if (error) {
                throw new Error(error.message);
            }
            throw new Error("Unable to scan gate pass.");
        });
    }
    static markIn(gatePassId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
                .update({ in_time: formatDbTimestamp() })
                .eq("id", gatePassId)
                .eq("qr_scanned", 1)
                .is("in_time", null)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
            if ((error === null || error === void 0 ? void 0 : error.code) === "PGRST116") {
                throw new Error("Gate pass must be scanned before marking IN, or it is already marked.");
            }
            throw new Error((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Unable to mark IN.");
        });
    }
    static markOut(gatePassId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { data, error } = yield supabase_1.supabase
                .from(TABLE_NAME)
                .update({ out_time: formatDbTimestamp() })
                .eq("id", gatePassId)
                .not("in_time", "is", null)
                .is("out_time", null)
                .select()
                .single();
            if (!error && data) {
                return data;
            }
            if ((error === null || error === void 0 ? void 0 : error.code) === "PGRST116") {
                throw new Error("Gate pass must be marked IN before marking OUT, or it is already marked.");
            }
            throw new Error((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "Unable to mark OUT.");
        });
    }
}
exports.default = GatePassService;
