"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.AuthService = exports.StudentAttendanceService = exports.GatePassService = exports.FacultyService = void 0;
var facultyService_1 = require("./facultyService");
Object.defineProperty(exports, "FacultyService", { enumerable: true, get: function () { return __importDefault(facultyService_1).default; } });
var gatePassService_1 = require("./gatePassService");
Object.defineProperty(exports, "GatePassService", { enumerable: true, get: function () { return __importDefault(gatePassService_1).default; } });
var studentService_1 = require("./studentService");
Object.defineProperty(exports, "StudentAttendanceService", { enumerable: true, get: function () { return studentService_1.StudentAttendanceService; } });
var authService_1 = require("./authService");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return __importDefault(authService_1).default; } });
var facultyService_2 = require("./facultyService");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(facultyService_2).default; } });
