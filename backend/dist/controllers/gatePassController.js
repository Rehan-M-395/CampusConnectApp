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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markGatePassOut = exports.markGatePassIn = exports.scanGatePass = exports.listGuardHistory = exports.listGatePasses = exports.createGatePass = void 0;
const gatePassService_1 = __importDefault(require("../services/gatePassService"));
const createGatePass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const teacherErpId = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId;
        const teacherName = (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.name;
        console.log("[gate-pass/create] request received", {
            teacherErpId,
            teacherName,
            role: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.role,
            parent_name: (_d = req.body) === null || _d === void 0 ? void 0 : _d.parent_name,
            visit_date: (_e = req.body) === null || _e === void 0 ? void 0 : _e.visit_date,
            visit_time: (_f = req.body) === null || _f === void 0 ? void 0 : _f.visit_time,
        });
        if (!teacherErpId || !teacherName) {
            console.log("[gate-pass/create] missing authenticated faculty context");
            res.status(400).json({ error: "Authenticated faculty context is missing." });
            return;
        }
        const record = yield gatePassService_1.default.createGatePass(teacherErpId, teacherName, req.body);
        console.log("[gate-pass/create] success", {
            id: record.id,
            teacherErpId,
            parent_name: record.parent_name,
        });
        res.status(201).json({
            success: true,
            gatePass: record,
            qrPayload: JSON.stringify({ gate_pass_id: record.id }),
        });
    }
    catch (error) {
        console.error("[gate-pass/create] failed", {
            teacherErpId: (_g = req.authUser) === null || _g === void 0 ? void 0 : _g.erpId,
            error: error.message,
        });
        res.status(500).json({ error: error.message });
    }
});
exports.createGatePass = createGatePass;
const listGatePasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log("[gate-pass/list] request received", {
            erpId: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId,
            role: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.role,
        });
        const records = yield gatePassService_1.default.listGatePasses();
        console.log("[gate-pass/list] success", {
            erpId: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.erpId,
            count: records.length,
        });
        res.json({ gatePasses: records });
    }
    catch (error) {
        console.error("[gate-pass/list] failed", {
            erpId: (_d = req.authUser) === null || _d === void 0 ? void 0 : _d.erpId,
            error: error.message,
        });
        res.status(500).json({ error: error.message });
    }
});
exports.listGatePasses = listGatePasses;
const listGuardHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const guardErpId = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId;
        console.log("[gate-pass/history] request received", {
            erpId: guardErpId,
            role: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.role,
        });
        if (!guardErpId) {
            res.status(400).json({ error: "Authenticated guard context is missing." });
            return;
        }
        const records = yield gatePassService_1.default.listGuardHistory(guardErpId);
        console.log("[gate-pass/history] success", {
            erpId: guardErpId,
            count: records.length,
        });
        res.json({ gatePasses: records });
    }
    catch (error) {
        console.error("[gate-pass/history] failed", {
            erpId: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.erpId,
            error: error.message,
        });
        res.status(500).json({ error: error.message });
    }
});
exports.listGuardHistory = listGuardHistory;
const scanGatePass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const qrValue = (_a = req.body) === null || _a === void 0 ? void 0 : _a.qrValue;
        const guardErpId = (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.erpId;
        const guardName = (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.name;
        console.log("[gate-pass/scan] request received", {
            erpId: guardErpId,
            role: (_d = req.authUser) === null || _d === void 0 ? void 0 : _d.role,
            qrValue,
        });
        if (!qrValue || typeof qrValue !== "string") {
            console.log("[gate-pass/scan] qrValue missing");
            res.status(400).json({ error: "qrValue is required." });
            return;
        }
        if (!guardErpId || !guardName) {
            res.status(400).json({ error: "Authenticated guard context is missing." });
            return;
        }
        const record = yield gatePassService_1.default.scanGatePass(qrValue, guardErpId, guardName);
        console.log("[gate-pass/scan] success", {
            id: record.id,
            parent_name: record.parent_name,
        });
        res.json({ success: true, gatePass: record });
    }
    catch (error) {
        console.error("[gate-pass/scan] failed", {
            erpId: (_e = req.authUser) === null || _e === void 0 ? void 0 : _e.erpId,
            error: error.message,
        });
        res.status(400).json({ error: error.message });
    }
});
exports.scanGatePass = scanGatePass;
const markGatePassIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("[gate-pass/mark-in] request received", {
            erpId: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId,
            role: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.role,
            gatePassId: req.params.id,
        });
        const record = yield gatePassService_1.default.markIn(req.params.id);
        console.log("[gate-pass/mark-in] success", {
            id: record.id,
            in_time: record.in_time,
        });
        res.json({ success: true, gatePass: record });
    }
    catch (error) {
        console.error("[gate-pass/mark-in] failed", {
            erpId: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.erpId,
            gatePassId: req.params.id,
            error: error.message,
        });
        res.status(400).json({ error: error.message });
    }
});
exports.markGatePassIn = markGatePassIn;
const markGatePassOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log("[gate-pass/mark-out] request received", {
            erpId: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId,
            role: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.role,
            gatePassId: req.params.id,
        });
        const record = yield gatePassService_1.default.markOut(req.params.id);
        console.log("[gate-pass/mark-out] success", {
            id: record.id,
            out_time: record.out_time,
        });
        res.json({ success: true, gatePass: record });
    }
    catch (error) {
        console.error("[gate-pass/mark-out] failed", {
            erpId: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.erpId,
            gatePassId: req.params.id,
            error: error.message,
        });
        res.status(400).json({ error: error.message });
    }
});
exports.markGatePassOut = markGatePassOut;
