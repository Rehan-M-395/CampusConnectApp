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
exports.createGatePassForAuthenticatedFaculty = void 0;
const services_1 = require("../../services");
const createGatePassForAuthenticatedFaculty = (req, res, logPrefix) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const teacherErpId = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId;
        const teacherName = (_b = req.authUser) === null || _b === void 0 ? void 0 : _b.name;
        console.log(`${logPrefix} request received`, {
            teacherErpId,
            teacherName,
            role: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c.role,
            parent_name: (_d = req.body) === null || _d === void 0 ? void 0 : _d.parent_name,
            visit_date: (_e = req.body) === null || _e === void 0 ? void 0 : _e.visit_date,
            visit_time: (_f = req.body) === null || _f === void 0 ? void 0 : _f.visit_time,
        });
        if (!teacherErpId || !teacherName) {
            res.status(400).json({ error: "Authenticated faculty context is missing." });
            return;
        }
        const record = yield services_1.GatePassService.createGatePass(teacherErpId, teacherName, req.body);
        console.log(`${logPrefix} success`, {
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
        console.error(`${logPrefix} failed`, {
            teacherErpId: (_g = req.authUser) === null || _g === void 0 ? void 0 : _g.erpId,
            error: error.message,
        });
        res.status(500).json({ error: error.message });
    }
});
exports.createGatePassForAuthenticatedFaculty = createGatePassForAuthenticatedFaculty;
