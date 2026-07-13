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
exports.getStudentAttendance = void 0;
const services_1 = require("../services");
const getStudentAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const erpId = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.erpId;
        if (!erpId) {
            res.status(401).json({
                error: "Unauthorized.",
            });
            return;
        }
        console.log(req.authUser);
        const attendance = yield services_1.StudentAttendanceService.getAttendance(erpId);
        res.status(200).json(attendance);
    }
    catch (error) {
        console.error("[student attendance]", error);
        res.status(500).json({
            error: "Failed to fetch attendance.",
        });
    }
});
exports.getStudentAttendance = getStudentAttendance;
